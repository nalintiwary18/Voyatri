"use client";

import { useState, useEffect } from "react";
import type { Place } from "@/types";
import { Trash2, Save, Search } from "lucide-react";

export default function AdminDatabasePage() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        location: "",
        tags: "",
    });

    useEffect(() => {
        fetchPlaces();
    }, []);

    const fetchPlaces = async (searchQuery?: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: "100" });
            if (searchQuery) params.set("search", searchQuery);
            const res = await fetch(`/api/places?${params}`);
            const json = await res.json();
            setPlaces(json.data ?? []);
        } catch {
            console.error("Failed to fetch places");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPlaces(search);
    };

    const startEdit = (place: Place) => {
        setEditingId(place.id);
        setEditForm({
            name: place.name,
            description: place.description ?? "",
            location: place.location ?? "",
            tags: (place.tags ?? []).join(", "),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            const res = await fetch(`/api/admin/places/${editingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editForm.name,
                    description: editForm.description || null,
                    location: editForm.location || null,
                    tags: editForm.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                }),
            });

            if (res.ok) {
                const updated = await res.json();
                setPlaces((prev) =>
                    prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p))
                );
                setEditingId(null);
            }
        } catch {
            console.error("Save failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this place? This cannot be undone."))
            return;
        try {
            const res = await fetch(`/api/admin/places/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setPlaces((prev) => prev.filter((p) => p.id !== id));
            }
        } catch {
            console.error("Delete failed");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#333" }}>
                Database Management
            </h1>
            <p className="text-sm mb-4" style={{ color: "#888" }}>
                Edit, delete, and manage places directly
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                        backgroundColor: "#FEFACD",
                        border: "1.5px solid #c4c4a0",
                    }}
                >
                    <Search size={14} style={{ color: "#999" }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search places..."
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: "#333" }}
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: "#7445D6" }}
                >
                    Search
                </button>
            </form>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div
                        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: "#7445D6", borderTopColor: "transparent" }}
                    />
                </div>
            ) : places.length === 0 ? (
                <div className="text-center py-16">
                    <span className="text-3xl">📭</span>
                    <p className="text-sm mt-2" style={{ color: "#888" }}>
                        No places found
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {places.map((place) => (
                        <div
                            key={place.id}
                            className="rounded-xl p-4"
                            style={{
                                backgroundColor: "rgba(255,255,255,0.6)",
                                border: "1.5px solid #e0dcc0",
                            }}
                        >
                            {editingId === place.id ? (
                                <div className="space-y-2">
                                    <input
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                                        style={{
                                            backgroundColor: "#FEFACD",
                                            border: "1.5px solid #c4c4a0",
                                        }}
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm((f) => ({ ...f, name: e.target.value }))
                                        }
                                    />
                                    <textarea
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                                        style={{
                                            backgroundColor: "#FEFACD",
                                            border: "1.5px solid #c4c4a0",
                                        }}
                                        value={editForm.description}
                                        onChange={(e) =>
                                            setEditForm((f) => ({
                                                ...f,
                                                description: e.target.value,
                                            }))
                                        }
                                        rows={2}
                                    />
                                    <input
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                                        style={{
                                            backgroundColor: "#FEFACD",
                                            border: "1.5px solid #c4c4a0",
                                        }}
                                        value={editForm.location}
                                        onChange={(e) =>
                                            setEditForm((f) => ({ ...f, location: e.target.value }))
                                        }
                                    />
                                    <input
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                                        style={{
                                            backgroundColor: "#FEFACD",
                                            border: "1.5px solid #c4c4a0",
                                        }}
                                        value={editForm.tags}
                                        onChange={(e) =>
                                            setEditForm((f) => ({ ...f, tags: e.target.value }))
                                        }
                                        placeholder="Tags (comma separated)"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={saveEdit}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                            style={{ backgroundColor: "#22c55e" }}
                                        >
                                            <Save size={14} /> Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                            style={{ color: "#888" }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between">
                                    <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => startEdit(place)}
                                    >
                                        <h3
                                            className="font-semibold text-sm"
                                            style={{ color: "#333" }}
                                        >
                                            {place.name}
                                        </h3>
                                        {place.location && (
                                            <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                                                📍 {place.location}
                                            </p>
                                        )}
                                        {place.tags && place.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {place.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                                                        style={{
                                                            backgroundColor: "rgba(116, 69, 214, 0.08)",
                                                            color: "#7445D6",
                                                        }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p
                                            className="text-[10px] mt-1"
                                            style={{ color: "#bbb" }}
                                        >
                                            Click to edit
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(place.id)}
                                        className="p-2 rounded-lg transition-colors"
                                        style={{ color: "#ccc" }}
                                        title="Delete place"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
