import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pqyekjrzrigmsxqmicdt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxeWVranJ6cmlnbXN4cW1pY2R0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc5OTExMywiZXhwIjoyMDkwMzc1MTEzfQ.y44Yi_XeeAaDhKezZJkS0HhYS8556M1wa_IcQNloNIY'
);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: 'ALTER TABLE public.user_places ADD COLUMN image_url TEXT;'
  });
  
  // If we don't have exec_sql, we might have to use raw query or rest api, 
  // wait, supabase js doesn't support raw DDL by default unless we use exec_sql.
  // We can just use the Supabase CLI if it's available, but let's see.
  console.log("Error:", error);
}

run();
