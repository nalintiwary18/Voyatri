"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, Lock, Heart, Bookmark, Trash2, Share2 } from "lucide-react";
import type { Deck, DeckItem } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function DeckDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const res = await fetch(`/api/decks/${id}`);
                if (!res.ok) {
                    router.push("/decks");
                    return;
                }
                const data = await res.json();
                setDeck(data);
            } catch {
                router.push("/decks");
            } finally {
                setLoading(false);
            }
        };
        fetchDeck();
    }, [id, router]);

    const handleLike = async () => {
        if (!deck) return;
        const method = deck.is_liked ? "DELETE" : "POST";
        await fetch(`/api/decks/${id}/like`, { method });
        setDeck((prev) =>
            prev
                ? {
                    ...prev,
                    is_liked: !prev.is_liked,
                    likes_count: (prev.likes_count ?? 0) + (prev.is_liked ? -1 : 1),
                }
                : prev
        );
    };

    const handleSave = async () => {
        if (!deck) return;
        const method = deck.is_saved ? "DELETE" : "POST";
        await fetch(`/api/decks/${id}/save`, { method });
        setDeck((prev) =>
            prev
                ? {
                    ...prev,
                    is_saved: !prev.is_saved,
                    saves_count: (prev.saves_count ?? 0) + (prev.is_saved ? -1 : 1),
                }
                : prev
        );
    };

    const handleTogglePublic = async () => {
        if (!deck) return;
        const res = await fetch(`/api/decks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_public: !deck.is_public }),
        });
        if (res.ok) {
            const data = await res.json();
            setDeck((prev) => (prev ? { ...prev, is_public: data.is_public } : prev));
        } else {
            const err = await res.json();
            alert(err.error || "Failed to update visibility");
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        await fetch(`/api/decks/${id}/items?item_id=${itemId}`, {
            method: "DELETE",
        });
        setDeck((prev) =>
            prev
                ? {
                    ...prev,
                    items: prev.items?.filter((i) => i.id !== itemId),
                }
                : prev
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#7445D6", borderTopColor: "transparent" }}
                />
            </div>
        );
    }

    if (!deck) return null;

    const isOwner = user?.id === deck.user_id;
    const items = (deck.items ?? []) as DeckItem[];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: "#666" }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-lg truncate" style={{ color: "#333" }}>
                        {deck.title}
                    </h1>
                    {deck.description && (
                        <p className="text-xs truncate" style={{ color: "#888" }}>
                            {deck.description}
                        </p>
                    )}
                </div>
                {isOwner && (
                    <button
                        onClick={handleTogglePublic}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                            backgroundColor: deck.is_public
                                ? "rgba(116, 69, 214, 0.1)"
                                : "rgba(0,0,0,0.05)",
                            color: deck.is_public ? "#7445D6" : "#999",
                        }}
                    >
                        {deck.is_public ? (
                            <>
                                <Globe size={12} /> Public
                            </>
                        ) : (
                            <>
                                <Lock size={12} /> Private
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 px-4 py-2 flex-shrink-0">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-1 text-sm transition-colors"
                    style={{ color: deck.is_liked ? "#e11d48" : "#999" }}
                >
                    <Heart size={18} fill={deck.is_liked ? "#e11d48" : "none"} />
                    <span>{deck.likes_count ?? 0}</span>
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-1 text-sm transition-colors"
                    style={{ color: deck.is_saved ? "#7445D6" : "#999" }}
                >
                    <Bookmark size={18} fill={deck.is_saved ? "#7445D6" : "none"} />
                    <span>{deck.saves_count ?? 0}</span>
                </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-20">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="text-3xl mb-2">🏗️</span>
                        <p className="text-sm" style={{ color: "#888" }}>
                            This deck is empty. Add places from the home page!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {items
                            .sort((a, b) => a.position - b.position)
                            .map((item) => {
                                const place = item.place ?? item.user_place;
                                if (!place) return null;

                                const image =
                                    "images" in place
                                        ? (place as { images?: { image_url: string }[] })?.images?.[0]
                                            ?.image_url
                                        : undefined;

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 p-3 rounded-xl transition-all"
                                        style={{
                                            backgroundColor: "rgba(255,255,255,0.5)",
                                            border: "1.5px solid #e0dcc0",
                                        }}
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
                                            style={{ backgroundColor: "#e8e4c0" }}
                                        >
                                            {image ? (
                                                <Image
                                                    src={image}
                                                    alt={place.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">
                                                    📍
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className="font-medium text-sm truncate"
                                                style={{ color: "#333" }}
                                            >
                                                {place.name}
                                            </h3>
                                            {place.location && (
                                                <p
                                                    className="text-xs truncate mt-0.5"
                                                    style={{ color: "#888" }}
                                                >
                                                    {place.location}
                                                </p>
                                            )}
                                            {item.user_place_id && (
                                                <span
                                                    className="text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block"
                                                    style={{
                                                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                                                        color: "#f59e0b",
                                                    }}
                                                >
                                                    User Place
                                                </span>
                                            )}
                                        </div>

                                        {/* Remove */}
                                        {isOwner && (
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-1.5 rounded-lg transition-colors"
                                                style={{ color: "#ccc" }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
}
