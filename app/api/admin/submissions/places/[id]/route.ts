import { requireAdmin } from "@/lib/auth/admin-guard";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// PATCH /api/admin/submissions/places/[id] — Approve or reject a place submission
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await request.json();
    const { action, edits } = body; // action: "approve" | "reject", edits: optional overrides

    if (!["approve", "reject"].includes(action)) {
        return NextResponse.json(
            { error: "action must be 'approve' or 'reject'" },
            { status: 400 }
        );
    }

    // Fetch the submission
    const { data: submission, error: fetchError } = await supabase
        .from("place_submissions")
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
        // Insert into places table (with optional admin edits)
        const placeData = {
            name: edits?.name ?? submission.name,
            description: edits?.description ?? submission.description,
            location: edits?.location ?? submission.location,
            tags: edits?.tags ?? submission.tags,
            verified: true,
            created_by: submission.submitted_by,
        };

        const { data: newPlace, error: insertError } = await supabase
            .from("places")
            .insert(placeData)
            .select()
            .single();

        if (insertError) {
            return NextResponse.json(
                { error: insertError.message },
                { status: 500 }
            );
        }

        // Update linked user_places
        await supabase
            .from("user_places")
            .update({ linked_place_id: newPlace.id, is_verified: true })
            .eq("created_by", submission.submitted_by)
            .ilike("name", submission.name);

        // Mark submission as approved
        await supabase
            .from("place_submissions")
            .update({
                status: "approved",
                reviewed_by: auth.user.id,
            })
            .eq("id", id);

        return NextResponse.json({
            message: "Place approved",
            place: newPlace,
        });
    }

    // Reject
    await supabase
        .from("place_submissions")
        .update({
            status: "rejected",
            reviewed_by: auth.user.id,
        })
        .eq("id", id);

    return NextResponse.json({ message: "Place rejected" });
}
