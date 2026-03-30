"use client";

import Image from "next/image";
import type { Place } from "@/types";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";

interface PlaceCardProps {
    place: Place;
    onAddToDeck?: (place: Place) => void;
    onClick?: (place: Place) => void;
}

export function PlaceCard({ place, onAddToDeck, onClick }: PlaceCardProps) {
    const [isHovered, setIsHovered] = useState(false);
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
                className="relative rounded-xl overflow-hidden transition-all duration-300"
                style={{
                    boxShadow: isHovered
                        ? "0 8px 24px rgba(116, 69, 214, 0.15)"
                        : "0 2px 8px rgba(0, 0, 0, 0.06)",
                    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                }}
            >
                {/* Image */}
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={place.name}
                        width={400}
                        height={300}
                        className="w-full block object-cover"
                        style={{ aspectRatio: "4/3" }}
                        loading="lazy"
                        unoptimized
                    />
                ) : (
                    <div
                        className="w-full flex items-center justify-center"
                        style={{
                            aspectRatio: "4/3",
                            backgroundColor: "#e8e4c0",
                        }}
                    >
                        <span className="text-3xl">📍</span>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToDeck?.(place);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                            style={{
                                backgroundColor: "rgba(255,255,255,0.9)",
                                color: "#7445D6",
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
                    {place.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
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
        </div>
    );
}
