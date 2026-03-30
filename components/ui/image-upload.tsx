"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    onUpload: (url: string) => void;
    existingUrl?: string;
    folder?: string;
}

export function ImageUpload({
    onUpload,
    existingUrl,
    folder = "uploads",
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5MB");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const supabase = createClient();
            const ext = file.name.split(".").pop();
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { data, error: uploadError } = await supabase.storage
                .from("place-images")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("place-images").getPublicUrl(data.path);

            setPreview(publicUrl);
            onUpload(publicUrl);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Upload failed"
            );
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload("");
        if (fileRef.current) fileRef.current.value = "";
    };

    return (
        <div>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
            />

            {preview ? (
                <div className="relative rounded-xl overflow-hidden" style={{ border: "1.5px solid #e0dcc0" }}>
                    <Image
                        src={preview}
                        alt="Upload preview"
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                        unoptimized
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                    >
                        <X size={14} className="text-white" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-40 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                    style={{
                        backgroundColor: "rgba(255,255,255,0.4)",
                        border: "2px dashed #d0cca0",
                        color: "#999",
                    }}
                >
                    {uploading ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            <span className="text-xs">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={24} />
                            <span className="text-xs font-medium">
                                Click to upload image
                            </span>
                            <span className="text-[10px]">PNG, JPG up to 5MB</span>
                        </>
                    )}
                </button>
            )}

            {error && (
                <p className="text-xs mt-1.5" style={{ color: "#e11d48" }}>
                    {error}
                </p>
            )}
        </div>
    );
}
