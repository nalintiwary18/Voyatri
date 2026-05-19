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
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
                        style={{
                            backgroundColor: isSelected
                                ? "var(--primary)"
                                : "transparent",
                            color: isSelected ? "var(--primary-foreground)" : "var(--foreground)",
                            border: isSelected
                                ? "1px solid var(--primary)"
                                : "1px solid var(--border)",
                            scrollSnapAlign: "start",
                        }}
                    >
                        <span>{tag.replace("_", " ")}</span>
                    </button>
                );
            })}
        </div>
    );
}
