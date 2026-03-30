"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: authError } = await signIn(email, password);

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            router.push("/home");
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-3">
                <Image
                    src="/img.png"
                    alt="Voyatri"
                    width={48}
                    height={54}
                    priority
                />
                <h1
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: "#333" }}
                >
                    Welcome back
                </h1>
                <p className="text-sm" style={{ color: "#888" }}>
                    Sign in to continue exploring Delhi
                </p>
            </div>

            {/* Form Card */}
            <form
                onSubmit={handleSubmit}
                className="w-full rounded-2xl p-8 space-y-5"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    border: "1.5px solid #e0dcc0",
                    backdropFilter: "blur(16px)",
                }}
            >
                {error && (
                    <div
                        className="text-sm rounded-lg px-4 py-3"
                        style={{
                            backgroundColor: "rgba(220, 38, 38, 0.08)",
                            color: "#dc2626",
                            border: "1px solid rgba(220, 38, 38, 0.2)",
                        }}
                    >
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label
                        className="text-sm font-medium"
                        style={{ color: "#555" }}
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                        style={{
                            backgroundColor: "#FEFACD",
                            border: "1.5px solid #c4c4a0",
                            color: "#333",
                        }}
                        onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#7445D6")
                        }
                        onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "#c4c4a0")
                        }
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        className="text-sm font-medium"
                        style={{ color: "#555" }}
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                        style={{
                            backgroundColor: "#FEFACD",
                            border: "1.5px solid #c4c4a0",
                            color: "#333",
                        }}
                        onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#7445D6")
                        }
                        onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "#c4c4a0")
                        }
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all"
                    style={{
                        backgroundColor: loading ? "#9b7bdf" : "#7445D6",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = "#5c32b3";
                    }}
                    onMouseLeave={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = "#7445D6";
                    }}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>

                <p className="text-center text-sm" style={{ color: "#888" }}>
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-medium transition-colors"
                        style={{ color: "#7445D6" }}
                    >
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    );
}
