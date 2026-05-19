"use client";

import Image from "next/image";
import type { Place } from "@/types";
import { Heart, Plus, MapPin, Loader2, X, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface PlaceCardProps {
    place: Place;
    onAddToDeck?: (place: Place) => void;
    onClick?: (place: Place) => void;
}

export function PlaceCard({ place, onAddToDeck, onClick }: PlaceCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showDeckModal, setShowDeckModal] = useState(false);
    const [decks, setDecks] = useState<any[]>([]);
    const [loadingDecks, setLoadingDecks] = useState(false);
    const [addingToDeckId, setAddingToDeckId] = useState<string | null>(null);
    const [addedDeckIds, setAddedDeckIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const openDeckModal = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAddToDeck) {
            onAddToDeck(place);
            return;
        }
        setShowDeckModal(true);
        setLoadingDecks(true);
        setError(null);
        try {
            const res = await fetch("/api/decks");
            const json = await res.json();
            setDecks(json.data ?? []);
        } catch (err) {
            setError("Failed to load decks.");
        } finally {
            setLoadingDecks(false);
        }
    };

    const handleAddToDeck = async (e: React.MouseEvent, deckId: string) => {
        e.stopPropagation();
        if (addedDeckIds.includes(deckId)) return;
        
        setAddingToDeckId(deckId);
        setError(null);
        try {
            const res = await fetch(`/api/decks/${deckId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ place_id: place.id }),
            });
            if (!res.ok) throw new Error("Failed to add");
            setAddedDeckIds((prev) => [...prev, deckId]);
        } catch (err) {
            setError("Error adding to deck.");
        } finally {
            setAddingToDeckId(null);
        }
    };
    const primaryImage =
        place.images?.find((img) => img.is_primary)?.image_url ??
        place.images?.[0]?.image_url;

    return (
        <div
            className="break-inside-avoid mb-3 group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick?.(place)}
        >
            <div
                className="relative rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    boxShadow: isHovered
                        ? "0 10px 30px rgba(0, 0, 0, 0.08)"
                        : "0 2px 8px rgba(0, 0, 0, 0.02)",
                    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                }}
            >
                {/* Image */}
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={place.name}
                        width={400}
                        height={0} // 0 allows automatic height scaling via CSS
                        className="w-full h-auto block object-cover"
                        loading="lazy"
                        unoptimized
                    />
                ) : (
                    <div
                        className="w-full flex items-center justify-center bg-muted"
                        style={{
                            aspectRatio: "3/4", // distinct missing image ratio
                            backgroundColor: "var(--secondary)",
                            color: "var(--muted-foreground)"
                        }}
                    >
                        <MapPin size={32} strokeWidth={1.5} opacity={0.5} />
                    </div>
                )}

                {/* Overlay on hover */}
                <div
                    className="absolute inset-0 transition-opacity duration-300 flex flex-col justify-end p-3"
                    style={{
                        background:
                            "linear-gradient(transparent 40%, rgba(0,0,0,0.6) 100%)",
                        opacity: isHovered ? 1 : 0,
                    }}
                >
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            onClick={openDeckModal}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-background/90 text-primary hover:bg-background"
                            style={{
                                backgroundColor: "var(--card)",
                                color: "var(--primary)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                            }}
                            title="Add to deck"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                        </button>
                    </div>

                    <h3 className="text-white font-semibold text-sm leading-tight">
                        {place.name}
                    </h3>
                    {place.location && (
                        <p className="text-white/70 text-xs mt-0.5">{place.location}</p>
                    )}
                </div>
            </div>

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                    {place.tags.slice(0, 2).map((tag) => (
                        <span
                            key={tag}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: "var(--secondary)",
                                color: "lightslategray",
                                border: "1px solid var(--border)"
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Add to Deck Modal */}
            {showDeckModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeckModal(false);
                    }}
                >
                    <div 
                        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", maxHeight: "80vh" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
                            <h3 className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Add to Deck</h3>
                            <button onClick={() => setShowDeckModal(false)} className="p-1 rounded-full hover:bg-muted" style={{ color: "var(--muted-foreground)" }}>
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="p-4 overflow-y-auto hide-scrollbar flex flex-col gap-2">
                            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                            
                            {loadingDecks ? (
                                <div className="flex justify-center p-6">
                                    <Loader2 className="animate-spin" style={{ color: "var(--primary)" }} />
                                </div>
                            ) : decks.length === 0 ? (
                                <p className="text-sm text-center py-4" style={{ color: "var(--muted-foreground)" }}>
                                    You don't have any decks yet. Create one from the Decks page!
                                </p>
                            ) : (
                                decks.map(deck => {
                                    const isAdded = addedDeckIds.includes(deck.id);
                                    const isAdding = addingToDeckId === deck.id;
                                    
                                    return (
                                        <button
                                            key={deck.id}
                                            onClick={(e) => handleAddToDeck(e, deck.id)}
                                            disabled={isAdded || isAdding}
                                            className="flex items-center justify-between p-3 rounded-xl text-left transition-colors"
                                            style={{ 
                                                border: "1px solid var(--border)",
                                                backgroundColor: isAdded ? "var(--secondary)" : "transparent"
                                            }}
                                        >
                                            <span className="font-medium text-sm truncate" style={{ color: "var(--foreground)" }}>
                                                {deck.title}
                                            </span>
                                            {isAdding ? (
                                                <Loader2 size={16} className="animate-spin" style={{ color: "var(--primary)" }} />
                                            ) : isAdded ? (
                                                <Check size={16} style={{ color: "var(--primary)" }} />
                                            ) : (
                                                <Plus size={16} style={{ color: "var(--muted-foreground)" }} />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
