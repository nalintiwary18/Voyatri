import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider defaultTheme="light" storageKey="voyatri-theme-v2">
            <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
    );
}
