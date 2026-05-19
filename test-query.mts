import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pqyekjrzrigmsxqmicdt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxeWVranJ6cmlnbXN4cW1pY2R0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc5OTExMywiZXhwIjoyMDkwMzc1MTEzfQ.y44Yi_XeeAaDhKezZJkS0HhYS8556M1wa_IcQNloNIY'
);

async function run() {
  const { data, error } = await supabase
    .from("decks")
    .select("*, deck_items(count), preview:deck_items(position, place:places(id, name, place_images(image_url, is_primary)), user_place:user_places(id, name, image_url)), deck_likes(count), deck_saves(count)")
    .order("position", { foreignTable: "preview", ascending: true })
    .limit(3, { foreignTable: "preview" })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success! Fetched", data?.length, "decks.");
  }
}

run();
