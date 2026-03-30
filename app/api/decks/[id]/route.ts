import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/decks/[id] — Get a single deck with items
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: deck, error } = await supabase
        .from("decks")
        .select(
            "*, deck_items(*, place:places(*, place_images(*)), user_place:user_places(*)), deck_likes(count), deck_saves(count), owner:users!decks_user_id_fkey(id, display_name, avatar_url)"
        )
        .eq("id", id)
        .single();

    if (error || !deck) {
        return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // If deck is private, only the owner can view
    if (!deck.is_public && deck.user_id !== user?.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if current user has liked/saved
    let is_liked = false;
    let is_saved = false;

    if (user) {
        const { data: like } = await supabase
            .from("deck_likes")
            .select("id")
            .eq("deck_id", id)
            .eq("user_id", user.id)
            .maybeSingle();

        const { data: save } = await supabase
            .from("deck_saves")
            .select("id")
            .eq("deck_id", id)
            .eq("user_id", user.id)
            .maybeSingle();

        is_liked = !!like;
        is_saved = !!save;
    }

    return NextResponse.json({ ...deck, is_liked, is_saved });
}

// PATCH /api/decks/[id] — Update a deck
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Enforce: if deck contains user_places, cannot be public
    if (body.is_public === true) {
        const { data: items } = await supabase
            .from("deck_items")
            .select("user_place_id")
            .eq("deck_id", id)
            .not("user_place_id", "is", null);

        if (items && items.length > 0) {
            return NextResponse.json(
                { error: "Deck contains unverified places and cannot be made public" },
                { status: 400 }
            );
        }
    }

    const { data, error } = await supabase
        .from("decks")
        .update({
            ...(body.title !== undefined && { title: body.title }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.cover_image_url !== undefined && {
                cover_image_url: body.cover_image_url,
            }),
            ...(body.is_public !== undefined && { is_public: body.is_public }),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE /api/decks/[id] — Delete a deck
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
