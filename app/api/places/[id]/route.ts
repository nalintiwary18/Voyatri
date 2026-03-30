import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/places/[id] — Fetch a single place with images
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("places")
        .select("*, place_images(*)")
        .eq("id", id)
        .eq("verified", true)
        .single();

    if (error || !data) {
        return NextResponse.json(
            { error: "Place not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(data);
}
