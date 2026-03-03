from django.db import migrations


class Migration(migrations.Migration):
    """
    Security and performance migration.
    Uses safe PL/pgSQL blocks so it never crashes if a table doesn't exist yet.
    """

    dependencies = [
        ('farmers', '0001_enhanced_schema'),
        ('farmers', '0002_initial'),
    ]

    operations = [
        # 1. Performance Indexes — safe: only created if table + columns exist
        migrations.RunSQL(
            sql="""
            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_farmer') THEN
                    CREATE INDEX IF NOT EXISTS idx_farmers_district ON farmers_farmer(district);
                END IF;
            END $$;

            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_aicroprecommendation') THEN
                    CREATE INDEX IF NOT EXISTS idx_ai_rec_timestamp ON farmers_aicroprecommendation(timestamp);
                END IF;
            END $$;

            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_riskalert') THEN
                    CREATE INDEX IF NOT EXISTS idx_risk_alert_severity ON farmers_riskalert(severity);
                END IF;
            END $$;

            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_diseasedetection') THEN
                    CREATE INDEX IF NOT EXISTS idx_disease_location ON farmers_diseasedetection(location_lat, location_lng);
                END IF;
            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),

        # 2. Row Level Security — safe: skips if table doesn't exist
        migrations.RunSQL(
            sql="""
            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_farmer') THEN
                    ALTER TABLE farmers_farmer ENABLE ROW LEVEL SECURITY;
                END IF;
            END $$;

            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_landholding') THEN
                    ALTER TABLE farmers_landholding ENABLE ROW LEVEL SECURITY;
                END IF;
            END $$;

            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'farmers_farmer') THEN
                    DROP POLICY IF EXISTS "Farmers view own data" ON farmers_farmer;
                    CREATE POLICY "Farmers view own data" ON farmers_farmer
                        FOR SELECT USING (auth.uid()::text = user_id::text);
                END IF;
            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
