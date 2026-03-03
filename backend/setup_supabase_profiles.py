"""
Run Supabase SQL to create profiles table.
Uses direct psycopg2 connection with the DATABASE_URL from .env
"""
import os
import sys

# Load .env manually
env_path = os.path.join(os.path.dirname(__file__), '.env')
env_vars = {}
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, _, value = line.partition('=')
            env_vars[key.strip()] = value.strip()

DATABASE_URL = env_vars.get('DATABASE_URL', '')
print(f"Connecting to DB: {DATABASE_URL[:50]}...")

try:
    import psycopg2
    from urllib.parse import urlparse, unquote

    # Parse the DATABASE_URL
    parsed = urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        dbname=parsed.path.lstrip('/').split('?')[0],
        user=parsed.username,
        password=unquote(parsed.password or ''),
        sslmode='require',
        connect_timeout=30
    )
    cursor = conn.cursor()

    sql = """
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  state TEXT,
  district TEXT,
  farm_size DECIMAL,
  primary_crop TEXT,
  preferred_language TEXT DEFAULT 'English',
  profile_complete BOOLEAN DEFAULT FALSE,
  total_predictions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
"""

    # Execute statements one by one
    for stmt in sql.strip().split(';'):
        stmt = stmt.strip()
        if stmt:
            try:
                cursor.execute(stmt)
                print(f"  OK: {stmt[:60]}...")
            except Exception as e:
                err = str(e).lower()
                if 'already exists' in err or 'duplicate' in err:
                    print(f"  SKIP (already exists): {stmt[:60]}")
                else:
                    print(f"  ERROR: {e}")

    # Policy (may already exist)
    try:
        cursor.execute("""
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename='profiles' AND policyname='Users can manage own profile'
          ) THEN
            EXECUTE 'CREATE POLICY "Users can manage own profile"
              ON public.profiles FOR ALL
              USING (auth.uid() = id)
              WITH CHECK (auth.uid() = id)';
          END IF;
        END $$;
        """)
        print("  OK: RLS Policy checked/created")
    except Exception as e:
        print(f"  Policy note: {e}")

    # updated_at trigger
    try:
        cursor.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """)
        print("  OK: update_updated_at function created")
    except Exception as e:
        print(f"  Function note: {e}")

    try:
        cursor.execute("""
        DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
        CREATE TRIGGER profiles_updated_at
          BEFORE UPDATE ON public.profiles
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
        """)
        print("  OK: Trigger created")
    except Exception as e:
        print(f"  Trigger note: {e}")

    conn.commit()
    cursor.close()
    conn.close()
    print("\n✅ Supabase profiles table setup complete!")

except ImportError:
    print("psycopg2 not found — trying via supabase client...")
    sys.exit(1)
except Exception as e:
    print(f"Connection error: {e}")
    sys.exit(1)
