import { SideNav } from "@/components/layout/side-nav";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Side Navigation — hidden on mobile */}
            <div className="hidden md:block">
                <SideNav />
            </div>

            {/* Content Area */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden bg-background md:ml-[70px]">
                {children}
                {/* Bottom Navigation — visible on mobile only */}
                <BottomNav />
            </main>
        </div>
    );
}
