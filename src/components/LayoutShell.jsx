"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Dashboard routes render their own sidebar + top bar, so the global
 * Navbar/Footer must not appear there — otherwise you get two navbars
 * stacked on top of each other.
 */
export default function LayoutShell({ children }) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith("/dashboard");

    if (isDashboard) {
        return children;
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </>
    );
}