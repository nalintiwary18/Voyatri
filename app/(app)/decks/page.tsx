"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { TopBar } from "@/components/layout/top-bar";
import { Plus, Lock, Globe, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Deck } from "@/types";
import Image from "next/image";

export default function DecksPage() {
    const { user } = useAuth();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [creating, setCreating] = useState(false);

    const fetchDecks = async () => {
        try {
            const res = await fetch("/api/decks");
            const json = await res.json();
            setDecks(json.data ?? []);
        } catch (err) {
            console.error("Failed to fetch decks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDecks();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setCreating(true);

        try {
            const res = await fetch("/api/decks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDescription || null,
                }),
            });

            if (res.ok) {
                setNewTitle("");
                setNewDescription("");
                setShowCreate(false);
                fetchDecks();
            }
        } catch (err) {
            console.error("Failed to create deck:", err);
        } finally {
            setCreating(false);
        }
    };

    const handleTogglePrivacy = async (deckId: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/decks/${deckId}`, { 
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_public: !currentStatus })
            });
            setDecks((prev) => 
                prev.map((d) => d.id === deckId ? { ...d, is_public: !currentStatus } : d)
            );
        } catch (err) {
            console.error("Failed to toggle privacy:", err);
        }
    };

    const handleDelete = async (deckId: string) => {
        if (!confirm("Delete this deck?")) return;
        try {
            await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
            setDecks((prev) => prev.filter((d) => d.id !== deckId));
        } catch (err) {
            console.error("Failed to delete deck:", err);
        }
    };

    return (
        <>
            <TopBar placeholder="Search your decks..." />

            <div className="flex-1 overflow-y-auto pb-20 hide-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                        My Decks
                    </h1>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-primary-foreground transition-all hover:scale-105"
                        style={{ backgroundColor: "var(--primary)" }}
                    >
                        <Plus size={16} />
                        New Deck
                    </button>
                </div>

                {/* Create deck form */}
                {showCreate && (
                    <form
                        onSubmit={handleCreate}
                        className="mx-4 mb-4 p-4 rounded-xl space-y-3 shadow-md"
                        style={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Deck title"
                            required
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                            style={{
                                backgroundColor: "var(--secondary)",
                                border: "1px solid var(--border)",
                                color: "var(--foreground)",
                            }}
                        />
                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                            style={{
                                backgroundColor: "var(--secondary)",
                                border: "1px solid var(--border)",
                                color: "var(--foreground)",
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-4 py-2 rounded-full text-sm font-medium text-primary-foreground transition-all hover:scale-105"
                                style={{ backgroundColor: "var(--primary)" }}
                            >
                                {creating ? "Creating..." : "Create"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 rounded-full text-sm font-medium"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Decks list */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : decks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                            No decks yet
                        </h3>
                        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                            Create your first deck to start collecting places
                        </p>
                    </div>
                ) : (
                    <div className="columns-2 gap-3 px-4">
                        {decks.map((deck) => (
                            <div
                                key={deck.id}
                                className="relative rounded-2xl overflow-hidden mb-3 break-inside-avoid shadow-sm group transition-transform hover:-translate-y-1"
                                style={{
                                    backgroundColor: "var(--card)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <Link href={`/decks/${deck.id}`} className="block">
                                    {/* Dynamic 1–3 image collage based on actual item count */}
                                    <div className="h-48 sm:h-56 p-1">
                                        {(() => {
                                            const preview = (deck as any).preview ?? [];
                                            const previewUrls = (preview as any[])
                                                .map((it) => {
                                                    const p = (it as any).place ?? (it as any).user_place;
                                                    if (!p) return undefined;
                                                    if ("place_images" in p) {
                                                        const imgs = (p as any).place_images ?? [];
                                                        const primary = imgs.find((im: any) => im.is_primary)?.image_url;
                                                        return primary ?? imgs[0]?.image_url;
                                                    }
                                                    return (p as any).image_url ?? undefined;
                                                })
                                                .filter(Boolean) as string[];

                                            const totalCount = Math.min(((deck as any).deck_items?.[0]?.count ?? 0), 3);
                                            if (totalCount === 0) return null;
                                            const tiles = Array.from({ length: totalCount }).map((_, idx) => previewUrls[idx]);

                                            const Tile = (src?: string) => (
                                                <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}>
                                                    {src ? (
                                                        <Image src={src} alt={deck.title} fill className="object-cover" />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                                    )}
                                                </div>
                                            );

                                            if (totalCount === 1) {
                                                return (
                                                    <div className="h-full">{Tile(tiles[0])}</div>
                                                );
                                            }
                                            if (totalCount === 2) {
                                                return (
                                                    <div className="flex h-full gap-1">
                                                        <div className="flex-1 relative">{Tile(tiles[0])}</div>
                                                        <div className="flex-1 relative">{Tile(tiles[1])}</div>
                                                    </div>
                                                );
                                            }
                                            // totalCount === 3
                                            return (
                                                <div className="flex h-full gap-1">
                                                    <div className="w-1/2 relative">{Tile(tiles[0])}</div>
                                                    <div className="w-1/2 flex flex-col gap-1">
                                                        <div className="flex-1 relative">{Tile(tiles[1])}</div>
                                                        <div className="flex-1 relative">{Tile(tiles[2])}</div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </Link>

                                <div className="px-3 pt-2 pb-3">
                                    <div className="flex items-center justify-between">
                                        <Link href={`/decks/${deck.id}`} className="flex-1 min-w-0">
                                            <h3
                                                className="font-bold text-sm tracking-tight truncate hover:underline"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                {deck.title}
                                            </h3>
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(deck.id);
                                            }}
                                            className="p-1.5 rounded-full transition-colors hover:bg-destructive/10 hover:text-destructive"
                                            style={{ color: "var(--muted-foreground)" }}
                                            title="Delete deck"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleTogglePrivacy(deck.id, !!deck.is_public);
                                            }}
                                            className="flex items-center gap-1 hover:bg-muted p-1 -ml-1 rounded transition-colors"
                                        >
                                            {deck.is_public ? (
                                                <Globe size={10} style={{ color: "var(--primary)" }} />
                                            ) : (
                                                <Lock size={10} style={{ color: "var(--muted-foreground)" }} />
                                            )}
                                            <span
                                                className="text-[10px] font-bold tracking-wider uppercase drop-shadow-sm"
                                                style={{ color: deck.is_public ? "var(--primary)" : "var(--muted-foreground)" }}
                                            >
                                                {deck.is_public ? 'PUBLIC' : 'PRIVATE'}
                                            </span>
                                        </button>
                                        <span className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>
                                            {(deck as any).deck_items ? `${(deck as any).deck_items?.[0]?.count ?? 0} places` : "0 places"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
