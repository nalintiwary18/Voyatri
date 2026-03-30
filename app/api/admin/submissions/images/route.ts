import { requireAdmin } from "@/lib/auth/admin-guard";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/submissions/images — List pending image submissions
export async function GET() {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from("image_submissions")
        .select(
            "*, submitter:users!image_submissions_submitted_by_fkey(id, display_name, email), place:places!image_submissions_place_id_fkey(id, name)"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
}
