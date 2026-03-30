import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/submissions/images — List current user's image submissions
export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("image_submissions")
        .select("*, place:places(name)")
        .eq("submitted_by", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
}

// POST /api/submissions/images — Submit a new image for a place
export async function POST(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.place_id || !body.image_url) {
        return NextResponse.json(
            { error: "place_id and image_url are required" },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("image_submissions")
        .insert({
            place_id: body.place_id,
            image_url: body.image_url,
            submitted_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
