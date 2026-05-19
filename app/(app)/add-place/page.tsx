"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Plus, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

const AVAILABLE_TAGS = [
    "cafe", "restaurant", "bar", "rooftop", "romantic", "aesthetic",
    "heritage", "street_food", "nature", "nightlife", "budget", "luxury",
    "books", "art", "shopping", "hidden_gem", "study", "breakfast",
    "dessert", "photography",
];

export default function AddPlacePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/user-places", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    location: location.trim() || null,
                    tags: selectedTags,
                    image_url: imageUrl || null,
                }),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to add place");
            }

            setSuccess(true);
            setTimeout(() => router.push("/profile"), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                    style={{ color: "var(--muted-foreground)" }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
                    Add a Place
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-20">
                {success ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                            Place added!
                        </h3>
                        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                            You can find it in your Profile → My Places
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                        {error && (
                            <div
                                className="px-4 py-3 rounded-lg text-sm"
                                style={{
                                    backgroundColor: "var(--destructive)",
                                    color: "var(--destructive-foreground)",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label
                                className="block text-xs font-medium mb-1.5"
                                style={{ color: "var(--foreground)" }}
                            >
                                Place Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Blue Tokai Coffee, Champa Gali"
                                required
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                                style={{
                                    backgroundColor: "transparent",
                                    border: "1px solid var(--border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label
                                className="block text-xs font-medium mb-1.5"
                                style={{ color: "var(--foreground)" }}
                            >
                                Location
                            </label>
                            <div className="relative">
                                <MapPin
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--muted-foreground)" }}
                                />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Saket, South Delhi"
                                    className="w-full rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all"
                                    style={{
                                        backgroundColor: "transparent",
                                        border: "1px solid var(--border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                className="block text-xs font-medium mb-1.5"
                                style={{ color: "var(--foreground)" }}
                            >
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What makes this place special?"
                                rows={3}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                                style={{
                                    backgroundColor: "transparent",
                                    border: "1px solid var(--border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label
                                className="block text-xs font-medium mb-2"
                                style={{ color: "var(--foreground)" }}
                            >
                                Tags (select all that apply)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_TAGS.map((tag) => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                                            style={{
                                                backgroundColor: isSelected
                                                    ? "var(--primary)"
                                                    : "transparent",
                                                color: isSelected ? "var(--primary-foreground)" : "var(--foreground)",
                                                border: isSelected
                                                    ? "1px solid var(--primary)"
                                                    : "1px solid var(--border)",
                                            }}
                                        >
                                            {tag.replace("_", " ")}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Image */}
                        <div>
                            <label
                                className="block text-xs font-medium mb-1.5"
                                style={{ color: "var(--foreground)" }}
                            >
                                Photo
                            </label>
                            <ImageUpload onUpload={setImageUrl} />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                        >
                            {submitting ? "Adding..." : "Add Place"}
                        </button>

                        <p className="text-[11px] text-center" style={{ color: "var(--muted-foreground)" }}>
                            Your place will appear in your profile. It can be added to decks
                            but won't be publicly listed until verified by an admin.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
