import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Verifies that the current request is from an admin user.
 * Returns the admin user profile or a 403 response.
 */
export async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            authorized: false as const,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        return {
            authorized: false as const,
            response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
    }

    return {
        authorized: true as const,
        user,
        profile,
        supabase,
    };
}
