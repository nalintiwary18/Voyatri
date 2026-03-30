"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

const AVAILABLE_TAGS = [
    "cafe", "restaurant", "bar", "rooftop", "romantic", "aesthetic",
    "heritage", "street_food", "nature", "nightlife", "budget", "luxury",
    "books", "art", "shopping", "hidden_gem", "study", "breakfast",
    "dessert", "photography",
];

export default function AdminAddPlacePage() {
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
            const res = await fetch("/api/admin/places", {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setName("");
        setDescription("");
        setLocation("");
        setSelectedTags([]);
        setImageUrl("");
        setSuccess(false);
        setError(null);
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: "#666" }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#333" }}>
                        Add Place
                    </h1>
                    <p className="text-sm" style={{ color: "#888" }}>
                        This place will be immediately visible to all users
                    </p>
                </div>
            </div>

            {success ? (
                <div
                    className="rounded-xl p-8 text-center"
                    style={{
                        backgroundColor: "rgba(255,255,255,0.6)",
                        border: "1.5px solid #e0dcc0",
                    }}
                >
                    <span className="text-4xl">✅</span>
                    <h3
                        className="text-lg font-semibold mt-3"
                        style={{ color: "#333" }}
                    >
                        Place added successfully!
                    </h3>
                    <p className="text-sm mt-1" style={{ color: "#888" }}>
                        The place is now live and visible to all users.
                    </p>
                    <div className="flex gap-3 justify-center mt-5">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                            style={{ backgroundColor: "#7445D6" }}
                        >
                            Add Another
                        </button>
                        <button
                            onClick={() => router.push("/admin/database")}
                            className="px-4 py-2 rounded-lg text-sm font-medium"
                            style={{
                                backgroundColor: "rgba(0,0,0,0.05)",
                                color: "#666",
                            }}
                        >
                            View All Places
                        </button>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 max-w-2xl"
                >
                    {error && (
                        <div
                            className="px-4 py-3 rounded-lg text-sm"
                            style={{
                                backgroundColor: "rgba(225, 29, 72, 0.08)",
                                color: "#e11d48",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Left column */}
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label
                                    className="block text-xs font-medium mb-1.5"
                                    style={{ color: "#555" }}
                                >
                                    Place Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Blue Tokai Coffee"
                                    required
                                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.6)",
                                        border: "1.5px solid #e0dcc0",
                                        color: "#333",
                                    }}
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label
                                    className="block text-xs font-medium mb-1.5"
                                    style={{ color: "#555" }}
                                >
                                    Location
                                </label>
                                <div className="relative">
                                    <MapPin
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2"
                                        style={{ color: "#999" }}
                                    />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Saket, South Delhi"
                                        className="w-full rounded-xl pl-9 pr-4 py-3 text-sm outline-none"
                                        style={{
                                            backgroundColor: "rgba(255,255,255,0.6)",
                                            border: "1.5px solid #e0dcc0",
                                            color: "#333",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    className="block text-xs font-medium mb-1.5"
                                    style={{ color: "#555" }}
                                >
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What makes this place special?"
                                    rows={4}
                                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.6)",
                                        border: "1.5px solid #e0dcc0",
                                        color: "#333",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-4">
                            {/* Image */}
                            <div>
                                <label
                                    className="block text-xs font-medium mb-1.5"
                                    style={{ color: "#555" }}
                                >
                                    Photo
                                </label>
                                <ImageUpload onUpload={setImageUrl} folder="admin" />
                            </div>

                            {/* Tags */}
                            <div>
                                <label
                                    className="block text-xs font-medium mb-2"
                                    style={{ color: "#555" }}
                                >
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_TAGS.map((tag) => {
                                        const isSelected = selectedTags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                                style={{
                                                    backgroundColor: isSelected
                                                        ? "#7445D6"
                                                        : "rgba(116, 69, 214, 0.06)",
                                                    color: isSelected ? "white" : "#666",
                                                    border: isSelected
                                                        ? "1.5px solid #7445D6"
                                                        : "1.5px solid #e0dcc0",
                                                }}
                                            >
                                                {tag.replace("_", " ")}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || !name.trim()}
                        className="w-full md:w-auto px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                        style={{ backgroundColor: "#7445D6" }}
                    >
                        {submitting ? "Adding..." : "Add Place (Verified)"}
                    </button>
                </form>
            )}
        </div>
    );
}
