import { requireAdmin } from "@/lib/auth/admin-guard";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// PATCH /api/admin/submissions/images/[id] — Approve or reject an image submission
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await request.json();
    const { action } = body;

    if (!["approve", "reject"].includes(action)) {
        return NextResponse.json(
            { error: "action must be 'approve' or 'reject'" },
            { status: 400 }
        );
    }

    const { data: submission, error: fetchError } = await supabase
        .from("image_submissions")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !submission) {
        return NextResponse.json(
            { error: "Submission not found" },
            { status: 404 }
        );
    }

    if (action === "approve") {
        // Insert into place_images
        const { error: insertError } = await supabase
            .from("place_images")
            .insert({
                place_id: submission.place_id,
                image_url: submission.image_url,
                verified: true,
            });

        if (insertError) {
            return NextResponse.json(
                { error: insertError.message },
                { status: 500 }
            );
        }

        await supabase
            .from("image_submissions")
            .update({ status: "approved", reviewed_by: auth.user.id })
            .eq("id", id);

        return NextResponse.json({ message: "Image approved" });
    }

    await supabase
        .from("image_submissions")
        .update({ status: "rejected", reviewed_by: auth.user.id })
        .eq("id", id);

    return NextResponse.json({ message: "Image rejected" });
}
