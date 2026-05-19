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
        <div className="top-bar gap-3">
            {/* Mobile V Logo */}
            <Link href="/home" className="md:hidden flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl font-[family-name:var(--font-pacifico)] text-primary -mt-1 mr-3">V</span>
            </Link>

            <form onSubmit={handleSubmit} className="search-container">
                <Search size={16} />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>
        </div>
    );
}
