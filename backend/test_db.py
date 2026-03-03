import psycopg2
import urllib.parse

print("Testing direct DB connection...")
# Direct with kwargs
try:
    conn = psycopg2.connect(
        host='db.imnuxsdpxwiafpnuhedt.supabase.co',
        port=5432,
        user='postgres',
        password='AIengineer@9915',
        dbname='postgres',
        connect_timeout=5
    )
    print("Direct kwargs success!")
    conn.close()
except Exception as e:
    print(f"Direct kwargs error: {e}")

print("Testing direct URL with %40...")
try:
    conn = psycopg2.connect('postgresql://postgres:AIengineer%409915@db.imnuxsdpxwiafpnuhedt.supabase.co:5432/postgres', connect_timeout=5)
    print("Direct URL success!")
    conn.close()
except Exception as e:
    print(f"Direct URL error: {e}")

print("Testing pooler URL...")
try:
    conn = psycopg2.connect('postgresql://postgres.imnuxsdpxwiafpnuhedt:AIengineer%409915@aws-0-ap-south-1.pooler.supabase.com:6543/postgres', connect_timeout=5)
    print("Pooler URL success!")
    conn.close()
except Exception as e:
    print(f"Pooler URL error: {e}")
