"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as AppUser } from "@/types";
import type { User as SupabaseUser, Session, SupabaseClient } from "@supabase/supabase-js";

interface AuthContextType {
    user: SupabaseUser | null;
    profile: AppUser | null;
    session: Session | null;
    isAdmin: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (
        email: string,
        password: string,
        displayName?: string
    ) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(supabase: SupabaseClient, userId: string): Promise<AppUser | null> {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.warn("Failed to fetch profile:", error.message);
            return null;
        }

        return data as AppUser;
    } catch (err) {
        console.warn("Profile fetch error:", err);
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<AppUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const supabaseRef = useRef<SupabaseClient>(createClient());

    useEffect(() => {
        const supabase = supabaseRef.current;
        let mounted = true;

        const initialize = async () => {
            try {
                const {
                    data: { session: currentSession },
                } = await supabase.auth.getSession();

                if (!mounted) return;

                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setLoading(false);

                // Fetch profile in background (non-blocking)
                if (currentSession?.user) {
                    fetchUserProfile(supabase, currentSession.user.id).then(
                        (userProfile) => {
                            if (mounted) setProfile(userProfile);
                        }
                    );
                }
            } catch (err) {
                console.warn("Auth initialization error:", err);
                if (mounted) setLoading(false);
            }
        };

        initialize();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!mounted) return;

            setSession(newSession);
            setUser(newSession?.user ?? null);
            setLoading(false);

            if (newSession?.user) {
                fetchUserProfile(supabase, newSession.user.id).then(
                    (userProfile) => {
                        if (mounted) setProfile(userProfile);
                    }
                );
            } else {
                setProfile(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabaseRef.current.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error as Error | null };
    };

    const signUp = async (
        email: string,
        password: string,
        displayName?: string
    ) => {
        const { error } = await supabaseRef.current.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: displayName },
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        await supabaseRef.current.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                isAdmin: profile?.role === "admin",
                loading,
                signIn,
                signUp,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
