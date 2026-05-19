export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: "#220300" }}
        >
            {/* Warm radial glow behind the card */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(186,22,12,0.25) 0%, transparent 70%)",
                }}
            />
            <div className="w-full max-w-md px-4 relative z-10">
                {children}
            </div>
        </div>
    );
}
