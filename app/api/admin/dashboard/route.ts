import { requireAdmin } from "@/lib/auth/admin-guard";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/dashboard — Admin dashboard stats
export async function GET() {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = await createAdminClient();

    const [places, pendingPlaces, pendingImages, users, decks] =
        await Promise.all([
            supabase
                .from("places")
                .select("*", { count: "exact", head: true })
                .eq("verified", true),
            supabase
                .from("place_submissions")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending"),
            supabase
                .from("image_submissions")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending"),
            supabase.from("users").select("*", { count: "exact", head: true }),
            supabase.from("decks").select("*", { count: "exact", head: true }),
        ]);

    return NextResponse.json({
        total_places: places.count ?? 0,
        pending_place_submissions: pendingPlaces.count ?? 0,
        pending_image_submissions: pendingImages.count ?? 0,
        total_users: users.count ?? 0,
        total_decks: decks.count ?? 0,
    });
}
