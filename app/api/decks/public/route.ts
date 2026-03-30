import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// GET /api/decks/public — Discover feed: public decks ranked by engagement
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
        .from("decks")
        .select(
            "*, deck_items(count), deck_likes(count), deck_saves(count), owner:users!decks_user_id_fkey(id, display_name, avatar_url)",
            { count: "exact" }
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Client-side ranking: score = likes + saves + recency bonus
    const now = Date.now();
    const ranked =
        data?.map((deck) => {
            const likes =
                (deck.deck_likes as unknown as { count: number }[])?.[0]?.count ?? 0;
            const saves =
                (deck.deck_saves as unknown as { count: number }[])?.[0]?.count ?? 0;
            const ageHours =
                (now - new Date(deck.created_at).getTime()) / (1000 * 60 * 60);
            const recencyBonus = Math.max(0, 48 - ageHours) / 48; // Bonus for first 48 hours

            const score = likes * 2 + saves * 3 + recencyBonus * 10;
            return { ...deck, engagement_score: score };
        }) ?? [];

    ranked.sort((a, b) => b.engagement_score - a.engagement_score);

    return NextResponse.json({
        data: ranked,
        total: count ?? 0,
        page,
        limit,
    });
}
