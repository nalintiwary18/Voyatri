"use client";

import { useState } from "react";

const ALL_TAGS = [
    "cafe",
    "restaurant",
    "bar",
    "rooftop",
    "romantic",
    "aesthetic",
    "heritage",
    "street_food",
    "nature",
    "nightlife",
    "budget",
    "luxury",
    "books",
    "art",
    "shopping",
    "hidden_gem",
    "study",
    "breakfast",
    "dessert",
    "photography",
];

const TAG_EMOJIS: Record<string, string> = {
    cafe: "☕",
    restaurant: "🍽️",
    bar: "🍸",
    rooftop: "🌇",
    romantic: "💕",
    aesthetic: "✨",
    heritage: "🏛️",
    street_food: "🥘",
    nature: "🌿",
    nightlife: "🌙",
    budget: "💰",
    luxury: "💎",
    books: "📚",
    art: "🎨",
    shopping: "🛍️",
    hidden_gem: "💎",
    study: "💻",
    breakfast: "🥞",
    dessert: "🍰",
    photography: "📸",
};

interface TagChipsProps {
    selectedTags: string[];
    onTagToggle: (tag: string) => void;
}

export function TagChips({ selectedTags, onTagToggle }: TagChipsProps) {
    return (
        <div
            className="flex gap-2 overflow-x-auto px-4 py-2 hide-scrollbar"
            style={{ scrollSnapType: "x mandatory" }}
        >
            {ALL_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                    <button
                        key={tag}
                        onClick={() => onTagToggle(tag)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
                        style={{
                            backgroundColor: isSelected
                                ? "#7445D6"
                                : "rgba(116, 69, 214, 0.06)",
                            color: isSelected ? "white" : "#666",
                            border: isSelected
                                ? "1.5px solid #7445D6"
                                : "1.5px solid #e0dcc0",
                            scrollSnapAlign: "start",
                        }}
                    >
                        <span>{TAG_EMOJIS[tag] ?? "🏷️"}</span>
                        <span>{tag.replace("_", " ")}</span>
                    </button>
                );
            })}
        </div>
    );
}
