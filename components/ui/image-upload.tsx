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

const compressImage = async (file: File, maxDimension = 1080): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(file); // fallback
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                // Default to webp or jpeg to ensure compression takes place
                const type = file.type === "image/png" ? "image/jpeg" : file.type;
                
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file); // fallback
                            return;
                        }
                        const newFileName = file.name.replace(/\.[^/.]+$/, "") + (type === "image/jpeg" ? ".jpg" : ".webp");
                        const newFile = new File([blob], newFileName, {
                            type: type,
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    },
                    type,
                    0.8 // 80% quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

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
        if (file.size > 50 * 1024 * 1024) {
            setError("Image must be under 50MB");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Compress the image to max 1080p
            const compressedFile = await compressImage(file, 1080);
            
            const supabase = createClient();
            const ext = compressedFile.name.split(".").pop();
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { data, error: uploadError } = await supabase.storage
                .from("place-images")
                .upload(fileName, compressedFile, {
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
                <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
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
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-background/60 hover:bg-background/90"
                        style={{ backgroundColor: "var(--card)" }}
                    >
                        <X size={14} className="text-foreground" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-40 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-muted/50"
                    style={{
                        backgroundColor: "transparent",
                        border: "1px dashed var(--border)",
                        color: "var(--muted-foreground)",
                    }}
                >
                    {uploading ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            <span className="text-xs">Compressing & Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={24} />
                            <span className="text-xs font-medium">
                                Click to upload image
                            </span>
                            <span className="text-[10px]">Auto-compresses to 1080p</span>
                        </>
                    )}
                </button>
            )}

            {error && (
                <p className="text-xs mt-1.5" style={{ color: "var(--destructive)" }}>
                    {error}
                </p>
            )}
        </div>
    );
}
