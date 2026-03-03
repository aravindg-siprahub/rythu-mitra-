import os, sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")

try:
    supabase: Client = create_client(url, key)
    # Just try to get session or auth state
    res = supabase.auth.get_session()
    print("SUCCESS: Supabase client initialized and connected with ANON_KEY.")
    sys.exit(0)
except Exception as e:
    print(f"FAIL: {e}")
    sys.exit(1)
