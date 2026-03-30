import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { RecommendRequest } from "@/types";

// Tag extraction: rule-based keyword matching (v1)
const TAG_KEYWORDS: Record<string, string[]> = {
    cafe: ["cafe", "coffee", "chai", "latte", "cappuccino", "brew"],
    restaurant: ["restaurant", "food", "eat", "dinner", "lunch", "dine", "biryani", "butter chicken"],
    bar: ["bar", "pub", "drinks", "cocktail", "beer", "nightlife"],
    rooftop: ["rooftop", "terrace", "sky", "view", "open air"],
    romantic: ["romantic", "date", "couple", "cozy", "candlelight", "intimate"],
    aesthetic: ["aesthetic", "instagram", "pretty", "beautiful", "cute", "vibe", "vibes"],
    heritage: ["heritage", "historical", "old", "ancient", "monument", "mughal"],
    street_food: ["street food", "chaat", "golgappa", "momos", "kulfi", "jalebi"],
    nature: ["nature", "park", "garden", "green", "trees", "lake"],
    nightlife: ["nightlife", "club", "dance", "dj", "party", "lounge"],
    budget: ["budget", "cheap", "affordable", "pocket friendly", "free"],
    luxury: ["luxury", "premium", "upscale", "fine dining", "expensive", "5 star"],
    books: ["books", "bookstore", "library", "reading"],
    art: ["art", "gallery", "museum", "exhibition", "painting"],
    shopping: ["shopping", "market", "bazaar", "mall", "shop"],
    hidden_gem: ["hidden", "secret", "underrated", "unknown", "offbeat"],
    study: ["study", "work", "laptop", "wifi", "coworking"],
    breakfast: ["breakfast", "brunch", "morning"],
    dessert: ["dessert", "sweet", "ice cream", "cake", "pastry"],
    photography: ["photography", "photo", "photoshoot", "shoot"],
};

function extractTags(prompt: string): string[] {
    const lower = prompt.toLowerCase();
    const matched = new Set<string>();

    for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                matched.add(tag);
                break;
            }
        }
    }

    return Array.from(matched);
}

// POST /api/recommend — Recommendation engine
export async function POST(request: Request) {
    const supabase = await createClient();

    let body: RecommendRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { prompt, user_preferences, limit = 20 } = body;

    if (!prompt || typeof prompt !== "string") {
        return NextResponse.json(
            { error: "prompt is required" },
            { status: 400 }
        );
    }

    // Step 1: Extract tags from prompt
    const promptTags = extractTags(prompt);

    // Step 2: Query all verified places
    const { data: places, error } = await supabase
        .from("places")
        .select("*, place_images(*)")
        .eq("verified", true);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!places || places.length === 0) {
        return NextResponse.json({ places: [] });
    }

    // Step 3: Score each place
    const userPrefTags: string[] =
        (user_preferences?.preferred_tags as string[]) ?? [];

    const scored = places.map((place) => {
        const placeTags: string[] = place.tags ?? [];

        // Tag match score (0–1): how many prompt tags overlap
        const tagOverlap = promptTags.filter((t) => placeTags.includes(t)).length;
        const tagMatchScore =
            promptTags.length > 0 ? tagOverlap / promptTags.length : 0;

        // Preference match score (0–1): how many user pref tags overlap
        const prefOverlap = userPrefTags.filter((t) =>
            placeTags.includes(t)
        ).length;
        const prefScore =
            userPrefTags.length > 0 ? prefOverlap / userPrefTags.length : 0;

        // Popularity score: placeholder (0.5 for all, will be computed from likes/saves later)
        const popularityScore = 0.5;

        // Final weighted score
        const score =
            tagMatchScore * 0.5 + prefScore * 0.3 + popularityScore * 0.2;

        return { ...place, images: place.place_images, score };
    });

    // Step 4: Sort by score descending and limit
    scored.sort((a, b) => b.score - a.score);

    // If no tags matched, return diverse results sorted by recency
    const results =
        promptTags.length === 0
            ? scored.slice(0, limit)
            : scored.filter((p) => p.score > 0).slice(0, limit);

    return NextResponse.json({ places: results });
}
