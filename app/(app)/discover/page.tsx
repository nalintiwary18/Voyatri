"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Heart, Bookmark, Share2, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DiscoverDeck = Record<string, any>;

const generateGradient = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash % 360);
    const h2 = Math.abs((hash * 2) % 360);
    return `linear-gradient(135deg, hsl(${h1}, 80%, 60%), hsl(${h2}, 80%, 40%))`;
};

export default function DiscoverPage() {
    const [decks, setDecks] = useState<DiscoverDeck[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicDecks = async () => {
            try {
                const res = await fetch("/api/decks/public?limit=30");
                const json = await res.json();
                setDecks(json.data ?? []);
            } catch (err) {
                console.error("Failed to fetch discover feed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPublicDecks();
    }, []);

    const handleLike = async (deckId: string, isLiked: boolean) => {
        const method = isLiked ? "DELETE" : "POST";
        await fetch(`/api/decks/${deckId}/like`, { method });
        setDecks((prev) =>
            prev.map((d) =>
                d.id === deckId
                    ? {
                        ...d,
                        is_liked: !isLiked,
                        likes_count: (d.likes_count ?? 0) + (isLiked ? -1 : 1),
                    }
                    : d
            )
        );
    };

    const handleSave = async (deckId: string, isSaved: boolean) => {
        const method = isSaved ? "DELETE" : "POST";
        await fetch(`/api/decks/${deckId}/save`, { method });
        setDecks((prev) =>
            prev.map((d) =>
                d.id === deckId
                    ? {
                        ...d,
                        is_saved: !isSaved,
                        saves_count: (d.saves_count ?? 0) + (isSaved ? -1 : 1),
                    }
                    : d
            )
        );
    };

    return (
        <div
            className="h-[100dvh] w-full bg-background text-foreground relative flex flex-col snap-y snap-mandatory overflow-y-auto hide-scrollbar"
            style={{ overscrollBehaviorY: "contain" }}
        >
            

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-primary" />
                </div>
            ) : decks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <h3 className="text-xl font-bold text-foreground/90">Nothing here yet</h3>
                    <p className="text-sm mt-2 text-foreground/60">Public decks from the community will appear here</p>
                </div>
            ) : (
                decks.map((deck) => {
                    const likes = (deck.deck_likes as unknown as { count: number }[])?.[0]?.count ?? deck.likes_count ?? 0;
                    const saves = (deck.deck_saves as unknown as { count: number }[])?.[0]?.count ?? deck.saves_count ?? 0;
                    const owner = deck.owner as { display_name: string; avatar_url: string | null; id: string } | undefined;

                    // Extract all preview images for the inner carousel
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

                    const imagesToDisplay = previewUrls.length > 0 ? previewUrls : [deck.cover_image_url].filter(Boolean);
                    
                    const ownerName = owner?.display_name ?? "Anonymous";
                    const avatarSeed = owner?.id ?? deck.user_id ?? ownerName;
                    const avatarGradient = generateGradient(avatarSeed);

                    return (
                        <div key={deck.id} className="relative w-full h-[100dvh] shrink-0 snap-start bg-card border-b border-white/10 group overflow-hidden">
                            {/* Horizontal Carousel for Deck Images */}
                            <div className="absolute inset-0 w-full h-full flex snap-x snap-mandatory overflow-x-auto hide-scrollbar" style={{ touchAction: "pan-x" }}>
                                {imagesToDisplay.length > 0 ? (
                                    imagesToDisplay.map((img, i) => (
                                        <div key={i} className="min-w-full h-full snap-center relative">
                                            <Image src={img} alt={`${deck.title} slide ${i+1}`} fill className="object-cover" />
                                            {/* Top & Bottom Dark Overlay Gradients */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20 pointer-events-none" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="min-w-full h-full snap-center relative bg-secondary flex items-center justify-center">
                                        <span className="text-foreground/20">No images</span>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent pointer-events-none" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Pagination Dots */}
                            {imagesToDisplay.length > 1 && (
                                <div className="absolute top-[70px] left-0 right-0 flex justify-center gap-1.5 z-40 pointer-events-none">
                                    {imagesToDisplay.map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-sm" />
                                    ))}
                                </div>
                            )}

                            {/* Bottom UI Overlay */}
                            <div className="absolute bottom-[80px] left-0 w-full px-4 flex justify-between items-end z-30 pointer-events-none">
                                {/* Left Side: User Info & Deck Details */}
                                <div className="flex-1 pr-12 text-left pointer-events-auto">
                                    <Link href={`/profile`} className="flex items-center gap-3 mb-4 transition-transform active:scale-95">
                                        <div 
                                            className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-[2px] border-white/20 shadow-lg flex items-center justify-center bg-secondary"
                                            style={{
                                                background: owner?.avatar_url 
                                                    ? `url(${owner.avatar_url}) center/cover` 
                                                    : avatarGradient
                                            }}
                                        >
                                            {!owner?.avatar_url && (
                                                <span className="font-bold text-white text-lg mix-blend-overlay">
                                                    {ownerName.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-white drop-shadow-md">{ownerName}</h2>
                                    </Link>
                                    
                                    <Link href={`/decks/${deck.id}`} className="block transition-transform active:opacity-80">
                                        <h3 className="text-lg font-bold text-white drop-shadow-md leading-tight mb-1">{deck.title}</h3>
                                        {deck.description && (
                                            <p className="text-sm text-white/80 line-clamp-2 drop-shadow-sm font-medium">{deck.description}</p>
                                        )}
                                    </Link>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex flex-col items-center gap-6 pointer-events-auto pb-4">
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleLike(deck.id, !!deck.is_liked);
                                        }} 
                                        className="flex flex-col items-center group transition-transform active:scale-90"
                                    >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/10 text-white group-hover:bg-black/40 transition-colors shadow-lg">
                                            <Heart size={24} fill={deck.is_liked ? "#ef4444" : "none"} stroke={deck.is_liked ? "#ef4444" : "currentColor"} className="drop-shadow-sm" />
                                        </div>
                                        <span className="text-[11px] font-bold mt-1.5 text-white drop-shadow-md">{likes}</span>
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleSave(deck.id, !!deck.is_saved);
                                        }} 
                                        className="flex flex-col items-center group transition-transform active:scale-90"
                                    >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/10 text-white group-hover:bg-black/40 transition-colors shadow-lg">
                                            <Bookmark size={24} fill={deck.is_saved ? "var(--primary)" : "none"} stroke={deck.is_saved ? "var(--primary)" : "currentColor"} className="drop-shadow-sm" />
                                        </div>
                                        <span className="text-[11px] font-bold mt-1.5 text-white drop-shadow-md">{saves}</span>
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigator.share?.({ title: deck.title, url: `${window.location.origin}/decks/${deck.id}` }).catch(() => {});
                                        }}
                                        className="flex flex-col items-center group transition-transform active:scale-90"
                                    >
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/10 text-white group-hover:bg-black/40 transition-colors shadow-lg">
                                            <Share2 size={24} className="drop-shadow-sm" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
