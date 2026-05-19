"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Compass, Plus} from "lucide-react";
import {useAuth} from "@/lib/auth/auth-context";


const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/decks", icon: Layers, label: "Decks" },
    { href: "/discover", icon: Compass, label: "Discover" },
    {href: "/add-place", icon: Plus, label: "Add Place"}
];

export function SideNav() {
    const { profile } = useAuth();
    const pathname = usePathname();
    const initials = profile?.display_name
        ? profile.display_name.charAt(0).toUpperCase()
        : "?";
    return (
        <nav className="side-nav pb-8">
            {/* Logo */}
            <div>
                <Link href="/home" className="flex items-center justify-center pt-2">
                    <span className="text-4xl font-[family-name:var(--font-pacifico)] text-primary">V</span>
                </Link>
            </div>

            {/* Navigation Icons */}
            <div className="flex flex-col items-center gap-6">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
                            style={{
                                color: isActive
                                    ? "var(--primary)"
                                    : "var(--muted-foreground)",
                            }}
                            title={label}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                            {isActive && (
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                                    style={{ backgroundColor: "var(--primary)" }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Actions */}
            <Link href="/profile" className="flex flex-col items-center gap-6">
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
        </nav>
    );
}
