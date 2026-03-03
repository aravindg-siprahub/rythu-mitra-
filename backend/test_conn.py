import os, sys
from dotenv import load_dotenv
load_dotenv()

host = os.getenv('DB_HOST')
port = os.getenv('DB_PORT')
user = os.getenv('DB_USER')
password = os.getenv('DB_PASSWORD')
dbname = os.getenv('DB_NAME', 'postgres')

print(f'Host: {host}')
print(f'Port: {port}')
print(f'User: {user}')
print(f'DB: {dbname}')
print('Testing connection...')

try:
    import psycopg
    conn = psycopg.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        dbname=dbname,
        sslmode='require',
        connect_timeout=10
    )
    cur = conn.cursor()
    cur.execute('SELECT version()')
    v = cur.fetchone()
    print(f'SUCCESS! PostgreSQL connected!')
    print(f'Version: {v[0][:40]}')
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f'FAIL: {e}')
    sys.exit(1)
