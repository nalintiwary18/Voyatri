"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { LogOut, Layers, Bookmark, MapPin, Shield } from "lucide-react";
import type { Deck, UserPlace } from "@/types";
import Link from "next/link";

type Tab = "decks" | "saved" | "places";

export default function ProfilePage() {
    const { profile, signOut, isAdmin } = useAuth();
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
        <div className="flex flex-col h-full bg-background">
            {/* Profile Header */}
            <div className="flex flex-col items-center pt-10 pb-6 px-4 flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-primary-foreground mb-4 shadow-lg ring-4 ring-background"
                    style={{
                        backgroundColor: "var(--primary)",
                        backgroundImage: profile?.avatar_url
                            ? `url(${profile.avatar_url})`
                            : undefined,
                        backgroundSize: "cover",
                    }}
                >
                    {!profile?.avatar_url && initials}
                </div>
                <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                    {profile?.display_name ?? "User"}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {profile?.email}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-5">
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-primary-foreground transition-transform hover:scale-105"
                            style={{ backgroundColor: "var(--primary)" }}
                        >
                            <Shield size={14} />
                            Admin Panel
                        </Link>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors hover:bg-destructive/10 hover:text-destructive"
                        style={{
                            backgroundColor: "var(--secondary)",
                            color: "var(--foreground)",
                        }}
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div
                className="flex border-b flex-shrink-0 px-2 gap-2"
                style={{ borderColor: "var(--border)" }}
            >
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition-all"
                        style={{
                            color: activeTab === key ? "var(--primary)" : "var(--muted-foreground)",
                            borderBottom: activeTab === key ? "2.5px solid var(--primary)" : "2.5px solid transparent",
                        }}
                    >
                        <Icon size={16} />
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
                            style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : activeTab === "decks" ? (
                    decks.length === 0 ? (
                        <EmptyState title="No decks" subtitle="Create your first deck!" />
                    ) : (
                        <div className="columns-2 gap-3">
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
                                        <div className="flex h-40 sm:h-48 p-1 gap-1">
                                            <div 
                                                className="w-1/2 h-full rounded-xl overflow-hidden flex items-end justify-start p-2 relative" 
                                                style={{ 
                                                    backgroundColor: deck.cover_image_url ? 'transparent' : "var(--primary)",
                                                    backgroundImage: deck.cover_image_url ? `url(${deck.cover_image_url})` : "linear-gradient(135deg, var(--primary) 0%, oklch(0.4 0.1 285) 100%)",
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                            </div>
                                            <div className="w-1/2 h-full flex flex-col gap-1">
                                                <div 
                                                    className="flex-1 rounded-xl overflow-hidden relative" 
                                                    style={{ 
                                                        background: "linear-gradient(135deg, var(--primary) 0%, var(--background) 100%)",
                                                        opacity: 0.2
                                                    }}
                                                />
                                                <div 
                                                    className="flex-1 rounded-xl overflow-hidden relative" 
                                                    style={{ 
                                                        background: "linear-gradient(135deg, var(--secondary) 0%, var(--muted) 100%)",
                                                        opacity: 0.4
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="px-3 pt-2 pb-3 flex flex-col">
                                        <Link href={`/decks/${deck.id}`}>
                                            <h3 className="font-bold text-sm tracking-tight truncate hover:underline" style={{ color: "var(--foreground)" }}>
                                                {deck.title}
                                            </h3>
                                        </Link>
                                        <span className="text-[10px] font-medium mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                            {(deck as any).deck_items ? `${(deck as any).deck_items?.[0]?.count ?? 0} places` : "0 places"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === "saved" ? (
                    <EmptyState
                        title="No saved decks"
                        subtitle="Save decks you like from the Discover page"
                    />
                ) : userPlaces.length === 0 ? (
                    <EmptyState
                        title="No places added"
                        subtitle="Add your own places to see them here"
                    />
                ) : (
                    <div className="grid gap-3">
                        {userPlaces.map((place) => (
                            <div
                                key={place.id}
                                className="p-3.5 rounded-2xl shadow-sm transition-all hover:shadow-md"
                                style={{
                                    backgroundColor: "var(--card)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                                    {place.name}
                                </h3>
                                {place.location && (
                                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                        {place.location}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-2.5">
                                    <span
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                        style={{
                                            backgroundColor: place.is_verified
                                                ? "rgba(34, 197, 94, 0.15)"
                                                : "rgba(245, 158, 11, 0.15)",
                                            color: place.is_verified ? "#16a34a" : "#d97706",
                                        }}
                                    >
                                        {place.is_verified ? "Verified" : "Unverified"}
                                    </span>
                                    {place.tags && place.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                            style={{
                                                backgroundColor: "var(--secondary)",
                                                color: "var(--secondary-foreground)",
                                                border: "1px solid var(--border)",
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

function EmptyState({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {title}
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {subtitle}
            </p>
        </div>
    );
}
