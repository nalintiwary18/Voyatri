import { requireAdmin } from "@/lib/auth/admin-guard";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/admin/places — Admin creates a verified place directly
export async function POST(request: Request) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = await createAdminClient();
    const body = await request.json();

    if (!body.name?.trim()) {
        return NextResponse.json(
            { error: "name is required" },
            { status: 400 }
        );
    }

    // Insert the place
    const { data: place, error: placeError } = await supabase
        .from("places")
        .insert({
            name: body.name.trim(),
            description: body.description?.trim() || null,
            location: body.location?.trim() || null,
            tags: body.tags ?? [],
            verified: true,
            created_by: auth.user.id,
        })
        .select()
        .single();

    if (placeError) {
        return NextResponse.json({ error: placeError.message }, { status: 500 });
    }

    // Insert image if provided
    if (body.image_url) {
        await supabase.from("place_images").insert({
            place_id: place.id,
            image_url: body.image_url,
            is_primary: true,
            verified: true,
        });
    }

    return NextResponse.json(place, { status: 201 });
}
