"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Compass, Plus, User } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export function BottomNav() {
    const pathname = usePathname();
    const { profile } = useAuth();

    const navItems = [
        { href: "/home", icon: Home, label: "Home" },
        { href: "/decks", icon: Layers, label: "Decks" },
        { href: "/add-place", icon: Plus, label: "Add" },
        { href: "/discover", icon: Compass, label: "Explore" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-3 px-2 md:hidden"
            style={{
                backgroundColor: "var(--background)",
                borderTop: "1px solid var(--border)",
            }}
        >
            {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname.startsWith(href);
                
                // Special render for profile
                if (href === "/profile") {
                    const initials = profile?.display_name
                        ? profile.display_name.charAt(0).toUpperCase()
                        : "?";

                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200"
                        >
                            <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200"
                                style={{
                                    border: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                                    backgroundColor: profile?.avatar_url ? "transparent" : "var(--primary)",
                                    color: "var(--primary-foreground)",
                                    fontSize: "10px",
                                    fontWeight: "bold"
                                }}
                            >
                                {profile?.avatar_url ? (
                                    <img 
                                        src={profile.avatar_url} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <span
                                className="text-[10px] font-medium"
                                style={{
                                    color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                                }}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                }

                // Special render for Add Place button
                if (href === "/add-place") {
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center justify-center -mt-6 transition-all duration-200"
                        >
                            <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                                style={{
                                    backgroundColor: "var(--primary)",
                                    color: "var(--primary-foreground)",
                                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)"
                                }}
                            >
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                            <span
                                className="text-[10px] font-medium mt-1"
                                style={{
                                    color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                                }}
                            >
                                {label}
                            </span>
                        </Link>
                    )
                }

                return (
                    <Link
                        key={href}
                        href={href}
                        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200"
                    >
                        <Icon
                            size={20}
                            strokeWidth={isActive ? 2.5 : 1.8}
                            style={{
                                color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                            }}
                        />
                        <span
                            className="text-[10px] font-medium"
                            style={{
                                color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                            }}
                        >
                            {label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
