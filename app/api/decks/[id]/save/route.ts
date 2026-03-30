import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/decks/[id]/save — Save a deck
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: deckId } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
        .from("deck_saves")
        .insert({ deck_id: deckId, user_id: user.id });

    if (error) {
        if (error.code === "23505") {
            return NextResponse.json({ message: "Already saved" });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /api/decks/[id]/save — Unsave a deck
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: deckId } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await supabase
        .from("deck_saves")
        .delete()
        .eq("deck_id", deckId)
        .eq("user_id", user.id);

    return NextResponse.json({ success: true });
}
