import psycopg

PROJECT = 'imnuxsdpxwiafpnuhedt'
PASSWORD = 'AIengineer@9915'

regions = [
    ('aws-0-ap-northeast-1', 6543),
    ('aws-0-ap-northeast-1', 5432),
    ('aws-0-ap-south-1', 6543),
    ('aws-0-ap-south-1', 5432),
    ('aws-0-ap-southeast-1', 6543),
    ('aws-0-ap-southeast-1', 5432),
]

working = None
for region, port in regions:
    host = f'{region}.pooler.supabase.com'
    try:
        conn = psycopg.connect(
            host=host,
            port=port,
            user=f'postgres.{PROJECT}',
            password=PASSWORD,
            dbname='postgres',
            sslmode='require',
            connect_timeout=5
        )
        print(f'SUCCESS: {host}:{port}')
        working = (host, port)
        conn.close()
        break
    except Exception as e:
        err = str(e)[:60]
        print(f'FAIL: {region}:{port} -> {err}')

if working:
    print(f'USE THIS: {working[0]}:{working[1]}')
else:
    print('ALL FAILED - check password')
