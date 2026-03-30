"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Compass, User } from "lucide-react";

const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/decks", icon: Layers, label: "Decks" },
    { href: "/discover", icon: Compass, label: "Discover" },
    { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2 px-4 md:hidden"
            style={{
                backgroundColor: "rgba(254, 250, 205, 0.95)",
                borderTop: "1px solid #e0dcc0",
                backdropFilter: "blur(12px)",
            }}
        >
            {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname.startsWith(href);
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
                                color: isActive ? "#7445D6" : "#999",
                            }}
                        />
                        <span
                            className="text-[10px] font-medium"
                            style={{
                                color: isActive ? "#7445D6" : "#999",
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
