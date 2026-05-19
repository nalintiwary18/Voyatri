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
    Menu,
    X,
} from "lucide-react";

const adminNavItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/add", icon: Plus, label: "Add Place" },
    { href: "/admin/places", icon: MapPin, label: "Places" },
    { href: "/admin/images", icon: ImageIcon, label: "Images" },
    { href: "/admin/database", icon: Database, label: "Database" },
];

const SIDEBAR_BG = "var(--sidebar)";
const PRIMARY = "var(--primary)";
const PRIMARY_ALPHA = "var(--primary)"; // using var instead of rgba for primary active bg
const PRIMARY_TEXT = "var(--primary-foreground)";

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
    return (
        <>
            <Link
                href="/home"
                onClick={onNavigate}
                className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg text-xs font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.5)" }}
            >
                <ArrowLeft size={14} />
                Back to app
            </Link>

            <div className="px-3 mb-4">
                <h2 className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
                    Admin Panel
                </h2>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Voyatri Management
                </p>
            </div>

            {adminNavItems.map(({ href, icon: Icon, label }) => {
                const isActive =
                    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            backgroundColor: isActive ? PRIMARY_ALPHA : "transparent",
                            color: isActive ? PRIMARY_TEXT : "rgba(255,255,255,0.55)",
                        }}
                    >
                        <Icon size={16} />
                        {label}
                    </Link>
                );
            })}
        </>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading, user, profile } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [waitingForProfile, setWaitingForProfile] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (profile) { setWaitingForProfile(false); return; }
        const timer = setTimeout(() => setWaitingForProfile(false), 3000);
        return () => clearTimeout(timer);
    }, [profile]);

    useEffect(() => {
        if (!loading && !waitingForProfile && !isAdmin) {
            router.push("/home");
        }
    }, [isAdmin, loading, waitingForProfile, router]);

    // Close drawer when route changes
    useEffect(() => { setDrawerOpen(false); }, [pathname]);

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
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: PRIMARY, borderTopColor: "transparent" }} />
                <pre className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {JSON.stringify({ loading, waitingForProfile, hasUser: !!user, userId: user?.id?.slice(0, 8), hasProfile: !!profile, profileRole: profile?.role, isAdmin }, null, 2)}
                </pre>
                <button onClick={testFetch} className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: PRIMARY }}>
                    Test Profile Fetch
                </button>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="flex min-h-screen bg-background">

            {/* ── Desktop Sidebar ── */}
            <aside
                className="hidden md:flex w-56 min-w-56 flex-col p-4 gap-1"
                style={{ backgroundColor: SIDEBAR_BG }}
            >
                <NavItems pathname={pathname} />
            </aside>

            {/* ── Mobile Top Bar ── */}
            <div
                className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: SIDEBAR_BG, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
                <div>
                    <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>Admin Panel</p>
                </div>
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* ── Mobile Drawer Backdrop ── */}
            {drawerOpen && (
                <div
                    className="md:hidden fixed inset-0 z-50"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* ── Mobile Drawer ── */}
            <aside
                className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col p-4 gap-1 transition-transform duration-300"
                style={{
                    backgroundColor: SIDEBAR_BG,
                    transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
                    boxShadow: drawerOpen ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
                }}
            >
                {/* Close button */}
                <button
                    onClick={() => setDrawerOpen(false)}
                    className="self-end mb-2 p-2 rounded-lg transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    aria-label="Close menu"
                >
                    <X size={18} />
                </button>
                <NavItems pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-y-auto h-screen p-4 md:p-6 pt-16 md:pt-6">
                {children}
            </main>
        </div>
    );
}
