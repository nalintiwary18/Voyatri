import { requireAdmin } from "@/lib/auth/admin-guard";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/submissions/places — List pending place submissions
export async function GET() {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from("place_submissions")
        .select("*, submitter:users!place_submissions_submitted_by_fkey(id, display_name, email)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
}
