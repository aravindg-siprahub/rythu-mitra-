import psycopg2

tests = [
    # IPv4 direct proxy (Supabase 5432 proxy)
    "postgresql://postgres:AIengineer%409915@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
    "postgresql://postgres.imnuxsdpxwiafpnuhedt:AIengineer%409915@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
    # IPv4 session pooler (5432)
    "postgresql://postgres.imnuxsdpxwiafpnuhedt:AIengineer%409915@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require",
    "postgresql://postgres:AIengineer%409915@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&options=project%3Dimnuxsdpxwiafpnuhedt",
    # IPv4 transaction pooler (6543)
    "postgresql://postgres.imnuxsdpxwiafpnuhedt:AIengineer%409915@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require",
    "postgresql://postgres:AIengineer%409915@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&options=project%3Dimnuxsdpxwiafpnuhedt",
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
