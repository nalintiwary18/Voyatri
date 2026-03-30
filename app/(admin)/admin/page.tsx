"use client";

import { useState, useEffect } from "react";
import type { AdminDashboardStats } from "@/types";
import { MapPin, Image as ImageIcon, Users, Layers, AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/dashboard");
                if (!res.ok) throw new Error("Failed to fetch stats");
                const data = await res.json();
                setStats(data);
            } catch (err) {
                setError("Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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

    if (error || !stats) {
        return (
            <div className="flex flex-col items-center py-20 text-center">
                <AlertCircle size={32} style={{ color: "#e11d48" }} />
                <p className="text-sm mt-2" style={{ color: "#666" }}>
                    {error}
                </p>
            </div>
        );
    }

    const cards = [
        {
            label: "Total Places",
            value: stats.total_places,
            icon: MapPin,
            color: "#7445D6",
            bg: "rgba(116, 69, 214, 0.08)",
        },
        {
            label: "Pending Places",
            value: stats.pending_place_submissions,
            icon: AlertCircle,
            color: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.08)",
        },
        {
            label: "Pending Images",
            value: stats.pending_image_submissions,
            icon: ImageIcon,
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.08)",
        },
        {
            label: "Total Users",
            value: stats.total_users,
            icon: Users,
            color: "#22c55e",
            bg: "rgba(34, 197, 94, 0.08)",
        },
        {
            label: "Total Decks",
            value: stats.total_decks,
            icon: Layers,
            color: "#e11d48",
            bg: "rgba(225, 29, 72, 0.08)",
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#333" }}>
                Dashboard
            </h1>
            <p className="text-sm mb-6" style={{ color: "#888" }}>
                Overview of your Voyatri data
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div
                        key={label}
                        className="rounded-xl p-5"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.6)",
                            border: "1.5px solid #e0dcc0",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: bg }}
                            >
                                <Icon size={20} style={{ color }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: "#333" }}>
                                    {value}
                                </p>
                                <p className="text-xs" style={{ color: "#888" }}>
                                    {label}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
