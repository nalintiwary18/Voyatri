"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { TopBar } from "@/components/layout/top-bar";
import { Plus, Lock, Globe, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Deck } from "@/types";

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
                    <h1 className="text-xl font-bold" style={{ color: "#333" }}>
                        My Decks
                    </h1>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all"
                        style={{ backgroundColor: "#7445D6" }}
                    >
                        <Plus size={16} />
                        New Deck
                    </button>
                </div>

                {/* Create deck form */}
                {showCreate && (
                    <form
                        onSubmit={handleCreate}
                        className="mx-4 mb-4 p-4 rounded-xl space-y-3"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.6)",
                            border: "1.5px solid #e0dcc0",
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
                                backgroundColor: "#FEFACD",
                                border: "1.5px solid #c4c4a0",
                                color: "#333",
                            }}
                        />
                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                            style={{
                                backgroundColor: "#FEFACD",
                                border: "1.5px solid #c4c4a0",
                                color: "#333",
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                                style={{ backgroundColor: "#7445D6" }}
                            >
                                {creating ? "Creating..." : "Create"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium"
                                style={{ color: "#888" }}
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
                            style={{ borderColor: "#7445D6", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : decks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <span className="text-4xl mb-3">📦</span>
                        <h3 className="text-lg font-semibold" style={{ color: "#333" }}>
                            No decks yet
                        </h3>
                        <p className="text-sm mt-1" style={{ color: "#888" }}>
                            Create your first deck to start collecting places
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 px-4">
                        {decks.map((deck) => (
                            <Link
                                key={deck.id}
                                href={`/decks/${deck.id}`}
                                className="block rounded-xl p-4 transition-all duration-200"
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.5)",
                                    border: "1.5px solid #e0dcc0",
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className="font-semibold text-sm truncate"
                                                style={{ color: "#333" }}
                                            >
                                                {deck.title}
                                            </h3>
                                            {deck.is_public ? (
                                                <Globe size={14} style={{ color: "#7445D6" }} />
                                            ) : (
                                                <Lock size={14} style={{ color: "#999" }} />
                                            )}
                                        </div>
                                        {deck.description && (
                                            <p
                                                className="text-xs mt-1 truncate"
                                                style={{ color: "#888" }}
                                            >
                                                {deck.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "#aaa" }}>
                                            <span>
                                                {(deck as unknown as Record<string, unknown>).deck_items
                                                    ? `${((deck as unknown as Record<string, unknown>).deck_items as { count: number }[])?.[0]?.count ?? 0} places`
                                                    : "0 places"}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {new Date(deck.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDelete(deck.id);
                                        }}
                                        className="p-2 rounded-lg transition-colors"
                                        style={{ color: "#ccc" }}
                                        title="Delete deck"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
