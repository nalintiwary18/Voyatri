"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Heart, Bookmark, Share2, User } from "lucide-react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DiscoverDeck = Record<string, any>;

export default function DiscoverPage() {
    const [decks, setDecks] = useState<DiscoverDeck[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicDecks = async () => {
            try {
                const res = await fetch("/api/decks/public?limit=30");
                const json = await res.json();
                setDecks(json.data ?? []);
            } catch (err) {
                console.error("Failed to fetch discover feed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPublicDecks();
    }, []);

    const handleLike = async (deckId: string, isLiked: boolean) => {
        const method = isLiked ? "DELETE" : "POST";
        await fetch(`/api/decks/${deckId}/like`, { method });
        setDecks((prev) =>
            prev.map((d) =>
                d.id === deckId
                    ? {
                        ...d,
                        is_liked: !isLiked,
                        likes_count: (d.likes_count ?? 0) + (isLiked ? -1 : 1),
                    }
                    : d
            )
        );
    };

    const handleSave = async (deckId: string, isSaved: boolean) => {
        const method = isSaved ? "DELETE" : "POST";
        await fetch(`/api/decks/${deckId}/save`, { method });
        setDecks((prev) =>
            prev.map((d) =>
                d.id === deckId
                    ? {
                        ...d,
                        is_saved: !isSaved,
                        saves_count: (d.saves_count ?? 0) + (isSaved ? -1 : 1),
                    }
                    : d
            )
        );
    };

    return (
        <>
            <TopBar placeholder="Explore public decks..." />

            <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-bold" style={{ color: "#333" }}>
                        Discover
                    </h1>
                    <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                        Explore curated collections from the community
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: "#7445D6", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : decks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <span className="text-4xl mb-3">🔭</span>
                        <h3 className="text-lg font-semibold" style={{ color: "#333" }}>
                            Nothing here yet
                        </h3>
                        <p className="text-sm mt-1" style={{ color: "#888" }}>
                            Public decks from the community will appear here
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 px-4">
                        {decks.map((deck) => {
                            const likes =
                                (deck.deck_likes as unknown as { count: number }[])?.[0]
                                    ?.count ?? deck.likes_count ?? 0;
                            const saves =
                                (deck.deck_saves as unknown as { count: number }[])?.[0]
                                    ?.count ?? deck.saves_count ?? 0;
                            const itemCount =
                                (deck.deck_items as unknown as { count: number }[])?.[0]
                                    ?.count ?? 0;
                            const owner = deck.owner as
                                | { display_name: string; avatar_url: string | null }
                                | undefined;

                            return (
                                <Link
                                    key={deck.id}
                                    href={`/decks/${deck.id}`}
                                    className="block rounded-2xl overflow-hidden transition-all duration-300"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.6)",
                                        border: "1.5px solid #e0dcc0",
                                        backdropFilter: "blur(8px)",
                                    }}
                                >
                                    {/* Cover area */}
                                    <div
                                        className="relative h-40 flex items-end p-4"
                                        style={{
                                            background: deck.cover_image_url
                                                ? `url(${deck.cover_image_url}) center/cover`
                                                : "linear-gradient(135deg, #7445D6 0%, #a78bfa 100%)",
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background:
                                                    "linear-gradient(transparent 30%, rgba(0,0,0,0.5))",
                                            }}
                                        />
                                        <div className="relative z-10">
                                            <h2 className="text-white font-bold text-lg leading-tight">
                                                {deck.title}
                                            </h2>
                                            <p className="text-white/70 text-xs mt-0.5">
                                                {itemCount} places
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-3 flex items-center justify-between">
                                        {/* Creator */}
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                                style={{
                                                    backgroundColor: "#7445D6",
                                                    backgroundImage: owner?.avatar_url
                                                        ? `url(${owner.avatar_url})`
                                                        : undefined,
                                                    backgroundSize: "cover",
                                                }}
                                            >
                                                {!owner?.avatar_url && (
                                                    <User size={12} className="text-white" />
                                                )}
                                            </div>
                                            <span
                                                className="text-xs font-medium"
                                                style={{ color: "#666" }}
                                            >
                                                {owner?.display_name ?? "Anonymous"}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleLike(deck.id, !!deck.is_liked);
                                                }}
                                                className="flex items-center gap-1 text-xs transition-colors"
                                                style={{
                                                    color: deck.is_liked ? "#e11d48" : "#999",
                                                }}
                                            >
                                                <Heart
                                                    size={14}
                                                    fill={deck.is_liked ? "#e11d48" : "none"}
                                                />
                                                {likes}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleSave(deck.id, !!deck.is_saved);
                                                }}
                                                className="flex items-center gap-1 text-xs transition-colors"
                                                style={{
                                                    color: deck.is_saved ? "#7445D6" : "#999",
                                                }}
                                            >
                                                <Bookmark
                                                    size={14}
                                                    fill={deck.is_saved ? "#7445D6" : "none"}
                                                />
                                                {saves}
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
