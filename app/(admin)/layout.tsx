"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    MapPin,
    Image as ImageIcon,
    Database,
    ArrowLeft,
    Plus,
} from "lucide-react";

const adminNavItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/add", icon: Plus, label: "Add Place" },
    { href: "/admin/places", icon: MapPin, label: "Places" },
    { href: "/admin/images", icon: ImageIcon, label: "Images" },
    { href: "/admin/database", icon: Database, label: "Database" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAdmin, loading, user, profile } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [waitingForProfile, setWaitingForProfile] = useState(true);

    // Give the async profile fetch up to 3 seconds
    useEffect(() => {
        if (profile) {
            setWaitingForProfile(false);
            return;
        }
        const timer = setTimeout(() => setWaitingForProfile(false), 3000);
        return () => clearTimeout(timer);
    }, [profile]);

    useEffect(() => {
        if (!loading && !waitingForProfile && !isAdmin) {
            router.push("/home");
        }
    }, [isAdmin, loading, waitingForProfile, router]);

    if (loading || (waitingForProfile && !profile)) {
        const testFetch = async () => {
            const { createClient } = await import("@/lib/supabase/client");
            const sb = createClient();
            const { data: { user: u } } = await sb.auth.getUser();
            alert("User: " + u?.id);
            const { data, error } = await sb.from("users").select("*").eq("id", u?.id).single();
            alert("Profile: " + JSON.stringify({ data, error }, null, 2));
        };
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center gap-4"
                style={{ backgroundColor: "#FEFACD" }}
            >
                <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#7445D6", borderTopColor: "transparent" }}
                />
                <pre className="text-xs" style={{ color: "#666" }}>
                    {JSON.stringify({
                        loading,
                        waitingForProfile,
                        hasUser: !!user,
                        userId: user?.id?.slice(0, 8),
                        hasProfile: !!profile,
                        profileRole: profile?.role,
                        isAdmin,
                    }, null, 2)}
                </pre>
                <button
                    onClick={testFetch}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: "#7445D6" }}
                >
                    Test Profile Fetch
                </button>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: "#FEFACD" }}>
            {/* Admin Sidebar */}
            <aside
                className="w-56 min-w-56 flex flex-col p-4 gap-1"
                style={{
                    backgroundColor: "#1a1a2e",
                }}
            >
                {/* Back */}
                <Link
                    href="/home"
                    className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg text-xs font-medium transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                >
                    <ArrowLeft size={14} />
                    Back to app
                </Link>

                {/* Title */}
                <div className="px-3 mb-4">
                    <h2
                        className="text-sm font-bold"
                        style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                        Admin Panel
                    </h2>
                    <p
                        className="text-[10px] mt-0.5"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                        Voyatri Management
                    </p>
                </div>

                {/* Nav items */}
                {adminNavItems.map(({ href, icon: Icon, label }) => {
                    const isActive =
                        href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                backgroundColor: isActive
                                    ? "rgba(116, 69, 214, 0.2)"
                                    : "transparent",
                                color: isActive
                                    ? "#a78bfa"
                                    : "rgba(255,255,255,0.55)",
                            }}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    );
                })}
            </aside>

            {/* Content */}
            <main className="flex-1 overflow-y-auto h-screen p-6">
                {children}
            </main>
        </div>
    );
}
