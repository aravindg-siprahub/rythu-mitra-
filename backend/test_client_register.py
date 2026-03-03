import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from django.test import Client

c = Client()
res = c.post('/api/v1/auth/register/', {
    'username': 'aravind9915',
    'full_name': 'Aravind Test',
    'email': 'aravind.test9915@gmail.com',
    'password': 'Password123!',
    'confirm_password': 'Password123!',
    'state': 'AP',
    'district': 'Madanapalle'
}, content_type='application/json', HTTP_HOST='localhost')

with open('test_out2.txt', 'w', encoding='utf-8') as f:
    f.write(f"Status: {res.status_code}\n")
    f.write(f"Content: {res.content.decode('utf-8')}\n")
