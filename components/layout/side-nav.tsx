"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Layers, Compass, User, Settings } from "lucide-react";

const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/decks", icon: Layers, label: "Decks" },
    { href: "/discover", icon: Compass, label: "Discover" },
    { href: "/profile", icon: User, label: "Profile" },
];

export function SideNav() {
    const pathname = usePathname();

    return (
        <nav className="side-nav rounded-r-lg">
            {/* Logo */}
            <div>
                <Link href="/home">
                    <Image
                        src="/img.png"
                        alt="Voyatri logo"
                        width={36}
                        height={40}
                        className="logo"
                        priority
                    />
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
                                backgroundColor: isActive
                                    ? "rgba(255, 255, 255, 0.2)"
                                    : "transparent",
                                color: isActive
                                    ? "rgba(255, 255, 255, 1)"
                                    : "rgba(255, 255, 255, 0.5)",
                            }}
                            title={label}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                            {isActive && (
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                                    style={{ backgroundColor: "white" }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Settings */}
            <div>
                <Link
                    href="/profile"
                    className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
                    style={{ color: "rgba(255, 255, 255, 0.5)" }}
                    title="Settings"
                >
                    <Settings size={20} strokeWidth={1.8} />
                </Link>
            </div>
        </nav>
    );
}
