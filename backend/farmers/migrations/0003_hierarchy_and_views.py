from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('farmers', '0002_security_performance'),
    ]

    operations = [
        # 1. Add Mandal Field (ORM reflection)
        migrations.AddField(
            model_name='farmer',
            name='mandal',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),

        # 2. Indexes for Hierarchy
        migrations.AddIndex(
            model_name='farmer',
            index=models.Index(fields=['state', 'district', 'mandal'], name='idx_farmer_hierarchy'),
        ),

        # 3. Materialized View for High-Performance Aggregation
        # Safe: wrapped in DO block to skip if table doesn't exist yet
        migrations.RunSQL(
            sql="""
            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_farmer') THEN
                    EXECUTE $q$
                        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_mandal_kpi AS
                        SELECT
                            state, district, mandal,
                            COUNT(id) as total_farmers,
                            COUNT(id) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_farmers_30d
                        FROM farmers_farmer
                        GROUP BY state, district, mandal
                    $q$;
                    BEGIN
                        CREATE UNIQUE INDEX idx_mv_mandal_kpi ON mv_mandal_kpi (state, district, mandal);
                    EXCEPTION WHEN duplicate_table THEN NULL;
                    END;
                END IF;
            END $$;
            """,
            reverse_sql="DROP MATERIALIZED VIEW IF EXISTS mv_mandal_kpi;",
        ),

        # 4. District Forecast View (Phase 2 Prep)
        # Safe: only created when both farmer + aicroprecommendation tables exist
        migrations.RunSQL(
            sql="""
            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_aicroprecommendation')
                   AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_farmer')
                THEN
                    EXECUTE $q$
                        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_district_forecast AS
                        SELECT
                            f.district,
                            MAX(acr.model_version) as model_ver,
                            COUNT(acr.id) as predictions_count
                        FROM farmers_aicroprecommendation acr
                        JOIN farmers_farmer f ON acr.farmer_id = f.id
                        WHERE acr.created_at > NOW() - INTERVAL '30 days'
                        GROUP BY f.district
                    $q$;
                    BEGIN
                        CREATE UNIQUE INDEX idx_mv_dist_forecast ON mv_district_forecast (district);
                    EXCEPTION WHEN duplicate_table THEN NULL;
                    END;
                END IF;
            END $$;
            """,
            reverse_sql="DROP MATERIALIZED VIEW IF EXISTS mv_district_forecast;",
        ),
    ]
