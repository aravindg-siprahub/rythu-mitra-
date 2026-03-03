import psycopg2

tests = [
    # IPv4 / dual-stack pooler with db subdomain
    "postgresql://postgres:AIengineer%409915@db.imnuxsdpxwiafpnuhedt.supabase.co:6543/postgres?sslmode=require",
    "postgresql://postgres.imnuxsdpxwiafpnuhedt:AIengineer%409915@db.imnuxsdpxwiafpnuhedt.supabase.co:6543/postgres?sslmode=require",
]

for url in tests:
    print(f"Testing URL: {url.replace('AIengineer%409915', 'PASSWORD')}")
    try:
        conn = psycopg2.connect(url, connect_timeout=5)
        print("-> SUCCESS")
        conn.close()
    except Exception as e:
        print(f"-> FAILED: {str(e).strip()}")
    print("-" * 50)
