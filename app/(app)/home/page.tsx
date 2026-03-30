"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { PlaceCard } from "@/components/places/place-card";
import { TagChips } from "@/components/places/tag-chips";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Place } from "@/types";

export default function HomePage() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState(false);

    const fetchPlaces = useCallback(async (tags: string[] = []) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (tags.length > 0) params.set("tags", tags.join(","));
            params.set("limit", "30");

            const res = await fetch(`/api/places?${params}`);
            const json = await res.json();
            setPlaces(json.data ?? []);
        } catch (err) {
            console.error("Failed to fetch places:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchMode(false);
            fetchPlaces(selectedTags);
            return;
        }

        setSearchMode(true);
        setLoading(true);
        try {
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: query, limit: 30 }),
            });
            const json = await res.json();
            setPlaces(json.places ?? []);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTagToggle = (tag: string) => {
        const newTags = selectedTags.includes(tag)
            ? selectedTags.filter((t) => t !== tag)
            : [...selectedTags, tag];
        setSelectedTags(newTags);
        setSearchMode(false);
        fetchPlaces(newTags);
    };

    useEffect(() => {
        fetchPlaces();
    }, [fetchPlaces]);

    return (
        <>
            {/* Top Bar with Search */}
            <TopBar
                onSearch={handleSearch}
                placeholder="Describe your ideal place..."
            />

            {/* Tag Filter Chips */}
            <TagChips selectedTags={selectedTags} onTagToggle={handleTagToggle} />

            {/* Results */}
            <div className="photo-grid-wrapper">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: "#7445D6", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : places.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <span className="text-4xl mb-3">🗺️</span>
                        <h3 className="text-lg font-semibold" style={{ color: "#333" }}>
                            {searchMode
                                ? "No places match your vibe"
                                : "No places yet"}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: "#888" }}>
                            {searchMode
                                ? "Try a different prompt or explore tags above"
                                : "Places will appear here once they're added to the database"}
                        </p>
                    </div>
                ) : (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-3 p-4 pt-2">
                        {places.map((place) => (
                            <PlaceCard key={place.id} place={place} />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Add Place Button */}
            <Link
                href="/add-place"
                className="fixed bottom-20 right-6 md:bottom-8 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 z-40"
                style={{ backgroundColor: "#7445D6" }}
                title="Add a place"
            >
                <Plus size={24} strokeWidth={2.5} />
            </Link>
        </>
    );
}
