"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { LogOut, Layers, Bookmark, MapPin, Shield } from "lucide-react";
import type { Deck, UserPlace } from "@/types";
import Link from "next/link";

type Tab = "decks" | "saved" | "places";

export default function ProfilePage() {
    const { profile, user, signOut, isAdmin } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("decks");
    const [decks, setDecks] = useState<Deck[]>([]);
    const [userPlaces, setUserPlaces] = useState<UserPlace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === "decks" || activeTab === "saved") {
                    const res = await fetch("/api/decks");
                    const json = await res.json();
                    setDecks(json.data ?? []);
                } else if (activeTab === "places") {
                    const res = await fetch("/api/user-places");
                    const json = await res.json();
                    setUserPlaces(json.data ?? []);
                }
            } catch (err) {
                console.error("Failed to fetch profile data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    const tabs: { key: Tab; label: string; icon: typeof Layers }[] = [
        { key: "decks", label: "My Decks", icon: Layers },
        { key: "saved", label: "Saved", icon: Bookmark },
        { key: "places", label: "My Places", icon: MapPin },
    ];

    const initials = profile?.display_name
        ? profile.display_name
            .split(" ")
            .map((s) => s[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";

    return (
        <div className="flex flex-col h-full">
            {/* Profile Header */}
            <div className="flex flex-col items-center pt-8 pb-4 px-4 flex-shrink-0">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3"
                    style={{
                        backgroundColor: "#7445D6",
                        backgroundImage: profile?.avatar_url
                            ? `url(${profile.avatar_url})`
                            : undefined,
                        backgroundSize: "cover",
                    }}
                >
                    {!profile?.avatar_url && initials}
                </div>
                <h1 className="text-lg font-bold" style={{ color: "#333" }}>
                    {profile?.display_name ?? "User"}
                </h1>
                <p className="text-xs" style={{ color: "#888" }}>
                    {profile?.email}
                </p>

                {/* Admin badge + link */}
                <div className="flex items-center gap-2 mt-3">
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                            style={{ backgroundColor: "#7445D6" }}
                        >
                            <Shield size={12} />
                            Admin Panel
                        </Link>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                            backgroundColor: "rgba(0,0,0,0.05)",
                            color: "#666",
                        }}
                    >
                        <LogOut size={12} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div
                className="flex border-b flex-shrink-0"
                style={{ borderColor: "#e0dcc0" }}
            >
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all"
                        style={{
                            color: activeTab === key ? "#7445D6" : "#999",
                            borderBottom:
                                activeTab === key ? "2px solid #7445D6" : "2px solid transparent",
                        }}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 px-4 pt-3">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: "#7445D6", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : activeTab === "decks" ? (
                    decks.length === 0 ? (
                        <EmptyState emoji="📦" title="No decks" subtitle="Create your first deck!" />
                    ) : (
                        <div className="grid gap-3">
                            {decks.map((deck) => (
                                <DeckListItem key={deck.id} deck={deck} />
                            ))}
                        </div>
                    )
                ) : activeTab === "saved" ? (
                    <EmptyState
                        emoji="🔖"
                        title="No saved decks"
                        subtitle="Save decks you like from the Discover page"
                    />
                ) : userPlaces.length === 0 ? (
                    <EmptyState
                        emoji="📍"
                        title="No places added"
                        subtitle="Add your own places to see them here"
                    />
                ) : (
                    <div className="grid gap-3">
                        {userPlaces.map((place) => (
                            <div
                                key={place.id}
                                className="p-3 rounded-xl"
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.5)",
                                    border: "1.5px solid #e0dcc0",
                                }}
                            >
                                <h3 className="font-medium text-sm" style={{ color: "#333" }}>
                                    {place.name}
                                </h3>
                                {place.location && (
                                    <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                                        {place.location}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: place.is_verified
                                                ? "rgba(34, 197, 94, 0.1)"
                                                : "rgba(245, 158, 11, 0.1)",
                                            color: place.is_verified ? "#22c55e" : "#f59e0b",
                                        }}
                                    >
                                        {place.is_verified ? "Verified" : "Unverified"}
                                    </span>
                                    {place.tags.slice(0, 3).map((tag) => (
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function DeckListItem({ deck }: { deck: Deck }) {
    return (
        <Link
            href={`/decks/${deck.id}`}
            className="block p-3 rounded-xl transition-all"
            style={{
                backgroundColor: "rgba(255,255,255,0.5)",
                border: "1.5px solid #e0dcc0",
            }}
        >
            <h3 className="font-medium text-sm" style={{ color: "#333" }}>
                {deck.title}
            </h3>
            {deck.description && (
                <p className="text-xs mt-0.5 truncate" style={{ color: "#888" }}>
                    {deck.description}
                </p>
            )}
            <p className="text-[10px] mt-1.5" style={{ color: "#aaa" }}>
                {new Date(deck.created_at).toLocaleDateString()}
            </p>
        </Link>
    );
}

function EmptyState({
    emoji,
    title,
    subtitle,
}: {
    emoji: string;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-3xl mb-2">{emoji}</span>
            <h3 className="text-sm font-semibold" style={{ color: "#333" }}>
                {title}
            </h3>
            <p className="text-xs mt-1" style={{ color: "#888" }}>
                {subtitle}
            </p>
        </div>
    );
}
