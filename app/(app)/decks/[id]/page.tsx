"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, Lock, Heart, Bookmark, Trash2, Share2, MapPin } from "lucide-react";
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
                    style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
                />
            </div>
        );
    }

    if (!deck) return null;

    const isOwner = user?.id === deck.user_id;
    const items = (deck.items ?? []) as DeckItem[];

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border shadow-sm bg-card/50">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full transition-colors hover:bg-muted"
                    style={{ color: "var(--muted-foreground)" }}
                >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                </button>
                <div className="flex-1 min-w-0 py-1">
                    <h1 className="font-bold text-lg truncate tracking-tight" style={{ color: "var(--foreground)" }}>
                        {deck.title}
                    </h1>
                    {deck.description && (
                        <p className="text-sm truncate" style={{ color: "var(--muted-foreground)" }}>
                            {deck.description}
                        </p>
                    )}
                </div>
                {isOwner && (
                    <button
                        onClick={handleTogglePublic}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all shadow-sm"
                        style={{
                            backgroundColor: deck.is_public ? "var(--primary)" : "var(--secondary)",
                            color: deck.is_public ? "var(--primary-foreground)" : "var(--secondary-foreground)",
                        }}
                    >
                        {deck.is_public ? (
                            <>
                                <Globe size={12} strokeWidth={2.5} /> PUBLIC
                            </>
                        ) : (
                            <>
                                <Lock size={12} strokeWidth={2.5} /> PRIVATE
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 px-4 py-3 flex-shrink-0">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-destructive"
                    style={{ color: deck.is_liked ? "var(--destructive)" : "var(--muted-foreground)" }}
                >
                    <Heart size={18} fill={deck.is_liked ? "var(--destructive)" : "none"} />
                    <span>{deck.likes_count ?? 0}</span>
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-primary"
                    style={{ color: deck.is_saved ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                    <Bookmark size={18} fill={deck.is_saved ? "var(--primary)" : "none"} />
                    <span>{deck.saves_count ?? 0}</span>
                </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-20">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
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

                                let image: string | undefined;
                                if ("place_images" in (place as any)) {
                                    const imgs = (place as any).place_images ?? [];
                                    const primary = imgs.find((im: any) => im.is_primary)?.image_url;
                                    image = primary ?? imgs[0]?.image_url;
                                } else if ("image_url" in (place as any)) {
                                    image = (place as any).image_url ?? undefined;
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 p-3.5 rounded-2xl transition-all shadow-sm hover:shadow-md"
                                        style={{
                                            backgroundColor: "var(--card)",
                                            border: "1px solid var(--border)",
                                        }}
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden"
                                            style={{ backgroundColor: "var(--secondary)" }}
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
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <MapPin size={24} style={{ color: "var(--muted-foreground)" }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3
                                                className="font-bold text-sm truncate"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                {place.name}
                                            </h3>
                                            {place.location && (
                                                <p
                                                    className="text-xs truncate mt-0.5"
                                                    style={{ color: "var(--muted-foreground)" }}
                                                >
                                                    {place.location}
                                                </p>
                                            )}
                                            {item.user_place_id && (
                                                <div>
                                                    <span
                                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block uppercase tracking-wider"
                                                        style={{
                                                            backgroundColor: "rgba(245, 158, 11, 0.15)",
                                                            color: "#d97706",
                                                        }}
                                                    >
                                                        User Place
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove */}
                                        {isOwner && (
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-2 rounded-full transition-colors hover:bg-destructive/10"
                                                style={{ color: "var(--muted-foreground)" }}
                                                title="Remove place"
                                            >
                                                <Trash2 size={16} className="hover:text-destructive transition-colors" />
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
