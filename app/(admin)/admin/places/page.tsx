"use client";

import { useState, useEffect } from "react";
import type { PlaceSubmission } from "@/types";
import { Check, X, Edit3, ChevronDown } from "lucide-react";

export default function AdminPlacesPage() {
    const [submissions, setSubmissions] = useState<PlaceSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{
        name: string;
        description: string;
        location: string;
        tags: string;
    }>({ name: "", description: "", location: "", tags: "" });

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch("/api/admin/submissions/places");
            const json = await res.json();
            setSubmissions(json.data ?? []);
        } catch {
            console.error("Failed to fetch submissions");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (
        id: string,
        action: "approve" | "reject",
        edits?: Record<string, unknown>
    ) => {
        try {
            const res = await fetch(`/api/admin/submissions/places/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, edits }),
            });

            if (res.ok) {
                setSubmissions((prev) => prev.filter((s) => s.id !== id));
                setEditingId(null);
            }
        } catch {
            console.error("Action failed");
        }
    };

    const startEdit = (sub: PlaceSubmission) => {
        setEditingId(sub.id);
        setEditForm({
            name: sub.name,
            description: sub.description ?? "",
            location: sub.location ?? "",
            tags: (sub.tags ?? []).join(", "),
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#7445D6", borderTopColor: "transparent" }}
                />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#333" }}>
                Place Submissions
            </h1>
            <p className="text-sm mb-6" style={{ color: "#888" }}>
                {submissions.length} pending submissions
            </p>

            {submissions.length === 0 ? (
                <div className="text-center py-16">
                    <span className="text-3xl">✅</span>
                    <p className="text-sm mt-2" style={{ color: "#888" }}>
                        All caught up! No pending submissions.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {submissions.map((sub) => (
                        <div
                            key={sub.id}
                            className="rounded-xl p-5"
                            style={{
                                backgroundColor: "rgba(255,255,255,0.6)",
                                border: "1.5px solid #e0dcc0",
                            }}
                        >
                            {editingId === sub.id ? (
                                /* Edit mode */
                                <div className="space-y-3">
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
                                        placeholder="Name"
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
                                        placeholder="Description"
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
                                        placeholder="Location"
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
                                            onClick={() =>
                                                handleAction(sub.id, "approve", {
                                                    name: editForm.name,
                                                    description: editForm.description || null,
                                                    location: editForm.location || null,
                                                    tags: editForm.tags
                                                        .split(",")
                                                        .map((t) => t.trim())
                                                        .filter(Boolean),
                                                })
                                            }
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                            style={{ backgroundColor: "#22c55e" }}
                                        >
                                            <Check size={14} /> Approve with edits
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
                                /* View mode */
                                <>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3
                                                className="font-semibold text-sm"
                                                style={{ color: "#333" }}
                                            >
                                                {sub.name}
                                            </h3>
                                            {sub.description && (
                                                <p className="text-xs mt-1" style={{ color: "#888" }}>
                                                    {sub.description}
                                                </p>
                                            )}
                                            {sub.location && (
                                                <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>
                                                    📍 {sub.location}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            className="text-[10px] px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: "rgba(245, 158, 11, 0.1)",
                                                color: "#f59e0b",
                                            }}
                                        >
                                            pending
                                        </span>
                                    </div>

                                    {sub.tags && sub.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {sub.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] px-2 py-0.5 rounded-full"
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

                                    <div className="flex items-center gap-2 mt-3 text-[10px]" style={{ color: "#aaa" }}>
                                        <span>
                                            by{" "}
                                            {(sub.submitter as { display_name?: string } | undefined)
                                                ?.display_name ?? "Unknown"}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(sub.created_at).toLocaleString()}</span>
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleAction(sub.id, "approve")}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                            style={{ backgroundColor: "#22c55e" }}
                                        >
                                            <Check size={14} /> Approve
                                        </button>
                                        <button
                                            onClick={() => startEdit(sub)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                                            style={{
                                                backgroundColor: "rgba(116, 69, 214, 0.08)",
                                                color: "#7445D6",
                                            }}
                                        >
                                            <Edit3 size={14} /> Edit & Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(sub.id, "reject")}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                                            style={{
                                                backgroundColor: "rgba(225, 29, 72, 0.08)",
                                                color: "#e11d48",
                                            }}
                                        >
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
