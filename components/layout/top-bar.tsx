"use client";

import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
}

export function TopBar({
    onSearch,
    placeholder = "Search places...",
}: TopBarProps) {
    const { profile } = useAuth();
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(query);
    };

    const initials = profile?.display_name
        ? profile.display_name.charAt(0).toUpperCase()
        : "?";

    return (
        <div className="top-bar">
            <form onSubmit={handleSubmit} className="search-container">
                <Search size={16} />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>
            <Link href="/profile">
                <div
                    className="profile-icon flex items-center justify-center"
                    style={{
                        backgroundImage: profile?.avatar_url
                            ? `url(${profile.avatar_url})`
                            : undefined,
                        backgroundSize: "cover",
                    }}
                >
                    {!profile?.avatar_url && (
                        <span className="text-white text-sm font-semibold">{initials}</span>
                    )}
                </div>
            </Link>
        </div>
    );
}
