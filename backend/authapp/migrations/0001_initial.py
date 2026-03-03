from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='FarmerProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('supabase_uid', models.CharField(max_length=255, unique=True)),
                ('username', models.CharField(max_length=50, unique=True)),
                ('full_name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('state', models.CharField(blank=True, max_length=100, null=True)),
                ('district', models.CharField(blank=True, max_length=100, null=True)),
                ('farm_size', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('primary_crop', models.CharField(blank=True, max_length=100, null=True)),
                ('profile_complete', models.BooleanField(default=False)),
                ('total_predictions', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'farmer_profiles',
            },
        ),
    ]
