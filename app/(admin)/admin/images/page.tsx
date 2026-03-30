"use client";

import { useState, useEffect } from "react";
import type { ImageSubmission } from "@/types";
import { Check, X } from "lucide-react";
import Image from "next/image";

export default function AdminImagesPage() {
    const [submissions, setSubmissions] = useState<ImageSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch("/api/admin/submissions/images");
            const json = await res.json();
            setSubmissions(json.data ?? []);
        } catch {
            console.error("Failed to fetch image submissions");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "approve" | "reject") => {
        try {
            const res = await fetch(`/api/admin/submissions/images/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                setSubmissions((prev) => prev.filter((s) => s.id !== id));
            }
        } catch {
            console.error("Action failed");
        }
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
                Image Submissions
            </h1>
            <p className="text-sm mb-6" style={{ color: "#888" }}>
                {submissions.length} pending images
            </p>

            {submissions.length === 0 ? (
                <div className="text-center py-16">
                    <span className="text-3xl">✅</span>
                    <p className="text-sm mt-2" style={{ color: "#888" }}>
                        No pending image submissions.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {submissions.map((sub) => (
                        <div
                            key={sub.id}
                            className="rounded-xl overflow-hidden"
                            style={{
                                backgroundColor: "rgba(255,255,255,0.6)",
                                border: "1.5px solid #e0dcc0",
                            }}
                        >
                            {/* Image preview */}
                            <div className="relative aspect-video">
                                <Image
                                    src={sub.image_url}
                                    alt="Submission"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <p className="text-xs font-medium" style={{ color: "#333" }}>
                                    For:{" "}
                                    {(sub.place as { name?: string } | undefined)?.name ??
                                        "Unknown place"}
                                </p>
                                <p className="text-[10px] mt-0.5" style={{ color: "#aaa" }}>
                                    by{" "}
                                    {(
                                        sub.submitter as
                                        | { display_name?: string }
                                        | undefined
                                    )?.display_name ?? "Unknown"}
                                </p>
                                <p className="text-[10px]" style={{ color: "#aaa" }}>
                                    {new Date(sub.created_at).toLocaleString()}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleAction(sub.id, "approve")}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-white"
                                        style={{ backgroundColor: "#22c55e" }}
                                    >
                                        <Check size={14} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(sub.id, "reject")}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium"
                                        style={{
                                            backgroundColor: "rgba(225, 29, 72, 0.08)",
                                            color: "#e11d48",
                                        }}
                                    >
                                        <X size={14} /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
