import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/submissions/places — List current user's place submissions
export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("place_submissions")
        .select("*")
        .eq("submitted_by", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
}

// POST /api/submissions/places — Submit a new place for review
export async function POST(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
        .from("place_submissions")
        .insert({
            name: body.name,
            description: body.description ?? null,
            location: body.location ?? null,
            tags: body.tags ?? [],
            submitted_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
