import { requireAdmin } from "@/lib/auth/admin-guard";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// PATCH /api/admin/places/[id] — Edit a place
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from("places")
        .update({
            ...(body.name !== undefined && { name: body.name }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.location !== undefined && { location: body.location }),
            ...(body.tags !== undefined && { tags: body.tags }),
            ...(body.latitude !== undefined && { latitude: body.latitude }),
            ...(body.longitude !== undefined && { longitude: body.longitude }),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE /api/admin/places/[id] — Delete a place
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createAdminClient();

    const { error } = await supabase.from("places").delete().eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
