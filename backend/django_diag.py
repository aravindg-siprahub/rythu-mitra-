import sys
import os
import traceback

# Write to a log file to capture output regardless of console encoding
log_path = os.path.join(os.path.dirname(__file__), 'django_debug.log')

with open(log_path, 'w') as log:
    log.write("Starting Django diagnostic...\n")
    
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
        log.write("Env set\n")
        
        import django
        log.write("Django imported\n")
        
        django.setup()
        log.write("Django setup OK\n")
        
        from django.core.management import call_command
        log.write("Calling makemigrations...\n")
        call_command('makemigrations', 'authapp', verbosity=2)
        log.write("makemigrations complete\n")
        
    except SystemExit as e:
        log.write(f"SystemExit: {e}\n")
        log.write(traceback.format_exc())
    except Exception as e:
        log.write(f"Exception: {e}\n")
        log.write(traceback.format_exc())

print(f"Done! Check {log_path}")
