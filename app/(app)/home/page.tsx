"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { PlaceCard } from "@/components/places/place-card";
import type { Place } from "@/types";

export default function HomePage() {
    const [places, setPlaces] = useState<Place[]>([]);

    const [searchMode, setSearchMode] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    /** Sort: places with at least one image come first */
    const sortByPhoto = (list: Place[]) =>
        [...list].sort((a, b) => {
            const aHas = (a.images?.length ?? 0) > 0 ? 0 : 1;
            const bHas = (b.images?.length ?? 0) > 0 ? 0 : 1;
            return aHas - bHas;
        });

    const fetchPlaces = useCallback(async (tags: string[] = []) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (tags.length > 0) params.set("tags", tags.join(","));
            params.set("limit", "30");

            const res = await fetch(`/api/places?${params}`);
            const json = await res.json();
            setPlaces(sortByPhoto(json.data ?? []));
        } catch (err) {
            console.error("Failed to fetch places:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchMode(false);
            await fetchPlaces(selectedTags);
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
            setPlaces(sortByPhoto(json.places ?? []));
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
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

            {/* Results */}
            <div className="photo-grid-wrapper">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : places.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                            {searchMode
                                ? "No places match your vibe"
                                : "No places yet"}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
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
        </>
    );
}
