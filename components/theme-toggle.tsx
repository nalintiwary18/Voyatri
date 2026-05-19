"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/50 border border-border">
            <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-full transition-all ${
                    theme === "light" 
                        ? "bg-background text-primary shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                }`}
                title="Light mode"
            >
                <Sun size={14} strokeWidth={2.5} />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-full transition-all ${
                    theme === "dark" 
                        ? "bg-background text-primary shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                }`}
                title="Dark mode"
            >
                <Moon size={14} strokeWidth={2.5} />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-full transition-all ${
                    theme === "system" 
                        ? "bg-background text-primary shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                }`}
                title="System theme"
            >
                <Monitor size={14} strokeWidth={2.5} />
            </button>
        </div>
    );
}
