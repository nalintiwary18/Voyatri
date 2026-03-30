import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/decks/[id]/items — Add an item to a deck
export async function POST(
    request: Request,
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

    // Verify deck ownership
    const { data: deck } = await supabase
        .from("decks")
        .select("id, user_id")
        .eq("id", deckId)
        .eq("user_id", user.id)
        .single();

    if (!deck) {
        return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const body = await request.json();

    // Get next position
    const { count } = await supabase
        .from("deck_items")
        .select("*", { count: "exact", head: true })
        .eq("deck_id", deckId);

    const { data, error } = await supabase
        .from("deck_items")
        .insert({
            deck_id: deckId,
            place_id: body.place_id ?? null,
            user_place_id: body.user_place_id ?? null,
            position: (count ?? 0) + 1,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If a user_place was added, ensure deck is private
    if (body.user_place_id) {
        await supabase
            .from("decks")
            .update({ is_public: false })
            .eq("id", deckId);
    }

    return NextResponse.json(data, { status: 201 });
}

// DELETE /api/decks/[id]/items — Remove an item from a deck
export async function DELETE(
    request: Request,
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

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("item_id");

    if (!itemId) {
        return NextResponse.json(
            { error: "item_id is required" },
            { status: 400 }
        );
    }

    // Verify ownership via deck
    const { error } = await supabase
        .from("deck_items")
        .delete()
        .eq("id", itemId)
        .eq("deck_id", deckId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
