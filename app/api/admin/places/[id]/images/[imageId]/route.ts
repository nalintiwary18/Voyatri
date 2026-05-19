import { requireAdmin } from "@/lib/auth/admin-guard";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// DELETE /api/admin/places/[id]/images/[imageId] — Delete an image from a place
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id, imageId } = await params;
    const supabase = await createAdminClient();

    // Try to get the image_url to delete it from storage
    const { data: image } = await supabase
        .from("place_images")
        .select("image_url")
        .eq("id", imageId)
        .eq("place_id", id)
        .single();

    if (image?.image_url) {
        try {
            // Extract file path from public URL
            // The URL looks like: https://[project].supabase.co/storage/v1/object/public/place-images/[path]
            const urlParts = image.image_url.split("/place-images/");
            if (urlParts.length > 1) {
                const path = urlParts[1];
                await supabase.storage.from("place-images").remove([path]);
            }
        } catch (e) {
            console.error("Failed to delete image from storage", e);
        }
    }

    const { error } = await supabase
        .from("place_images")
        .delete()
        .eq("id", imageId)
        .eq("place_id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
