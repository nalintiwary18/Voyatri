import { requireAdmin } from "@/lib/auth/admin-guard";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/admin/places/[id]/images — Add an image to a place
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await request.json();

    if (!body.image_url) {
        return NextResponse.json({ error: "image_url is required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("place_images")
        .insert({
            place_id: id,
            image_url: body.image_url,
            is_primary: body.is_primary ?? false,
            verified: true,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
