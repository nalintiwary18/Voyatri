"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import Image from "next/image";

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4"/>
        <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
        <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4068 3.78409 7.8299 3.96409 7.2899V4.9581H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4522 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
        <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9254L15.0218 2.3441C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9581L3.96409 7.2899C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
    </svg>
);

export default function SignupPage() {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { signUp, signInWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const { error: authError } = await signUp(email, password, displayName);
        if (authError) { setError(authError.message); setLoading(false); }
        else { setSuccess(true); setLoading(false); }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        await signInWithGoogle();
    };

    const inputStyle = {
        backgroundColor: "rgba(255,255,255,0.08)",
        border: "1.5px solid rgba(255,255,255,0.15)",
    };

    if (success) {
        return (
            <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                    <Image src="/img.png" alt="Voyatri" width={48} height={54} priority />
                </div>
                <h1 className="text-2xl font-bold mb-3 text-white">Check your email</h1>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                    We&apos;ve sent a confirmation link to <strong className="text-white">{email}</strong>.
                </p>
                <Link href="/login" className="text-sm font-medium hover:text-white" style={{ color: "#E7A859" }}>
                    Back to sign in
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <div className="mb-8 flex flex-col items-center gap-3">
                <Image src="/img.png" alt="Voyatri" width={48} height={54} priority />
                <h1 className="text-3xl font-bold tracking-tight text-white">Create account</h1>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>Start discovering hidden gems</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full rounded-2xl p-8 space-y-5"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}>

                {error && (
                    <div className="text-sm rounded-lg px-4 py-3"
                        style={{ backgroundColor: "rgba(220,38,38,0.15)", color: "#fca5a5", border: "1px solid rgba(220,38,38,0.3)" }}>
                        {error}
                    </div>
                )}

                {/* Google — top for discoverability */}
                <button type="button" onClick={handleGoogle} disabled={loading || googleLoading}
                    className="w-full rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-3 transition-all"
                    style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#1a1a1a", cursor: googleLoading ? "not-allowed" : "pointer", opacity: googleLoading ? 0.7 : 1 }}
                    onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.backgroundColor = "#ffffff"; }}
                    onMouseLeave={(e) => { if (!googleLoading) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)"; }}>
                    <GoogleIcon />
                    {googleLoading ? "Redirecting..." : "Sign up with Google"}
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>or with email</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
                </div>

                {[
                    { id: "displayName", label: "Display Name", type: "text", value: displayName, setter: setDisplayName, placeholder: "Your name", required: true },
                    { id: "email", label: "Email", type: "email", value: email, setter: setEmail, placeholder: "you@example.com", required: true },
                    { id: "password", label: "Password", type: "password", value: password, setter: setPassword, placeholder: "••••••••", required: true, minLength: 6 },
                ].map(({ id, label, type, value, setter, placeholder, required, minLength }) => (
                    <div key={id} className="space-y-2">
                        <label className="text-sm font-medium text-white/80" htmlFor={id}>{label}</label>
                        <input id={id} type={type} value={value} onChange={(e) => setter(e.target.value)}
                            required={required} minLength={minLength} placeholder={placeholder}
                            className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all text-white"
                            style={inputStyle}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#BA160C")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")} />
                    </div>
                ))}

                <button type="submit" disabled={loading || googleLoading}
                    className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all"
                    style={{ backgroundColor: loading ? "rgba(186,22,12,0.6)" : "#BA160C", cursor: loading ? "not-allowed" : "pointer" }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#8A0E08"; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#BA160C"; }}>
                    {loading ? "Creating account..." : "Create Account"}
                </button>

                <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium hover:text-white" style={{ color: "#E7A859" }}>Sign in</Link>
                </p>
            </form>
        </div>
    );
}
