import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// GET /api/places — List verified places with optional tag filtering
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const tags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const search = searchParams.get("search") ?? "";
    const offset = (page - 1) * limit;

    let query = supabase
        .from("places")
        .select("*, place_images(*)", { count: "exact" })
        .eq("verified", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    // Tag filtering: match any of the provided tags
    if (tags.length > 0) {
        query = query.overlaps("tags", tags);
    }

    // Text search on name
    if (search) {
        query = query.ilike("name", `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data: data ? data.map((place) => ({
            ...place,
            images: place.place_images,
        })) : [],
        total: count ?? 0,
        page,
        limit,
    });
}
