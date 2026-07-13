import Link from "next/link";
import { Button } from "@heroui/react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] animated-bg px-4">
            <div className="text-center max-w-lg mx-auto">
                <div className="glass-card p-12 flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="text-[120px] font-black gradient-text leading-none select-none">
                            404
                        </div>
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl" />
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl" />
                    </div>

                    <svg
                        className="w-32 h-32 text-cyan-500/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>

                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold text-white">
                            Oops! Page Not Found
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            The page you are looking for might have been removed, had its name
                            changed, or is temporarily unavailable.
                        </p>
                    </div>

                    <div className="flex gap-3 flex-wrap justify-center">
                        <Button
                            as={Link}
                            href="/"
                            className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold px-8"
                            size="lg"
                        >
                            Back to Home
                        </Button>
                        <Button
                            as={Link}
                            href="/find-doctors"
                            variant="bordered"
                            className="border-cyan-500/50 text-cyan-400 font-semibold px-8"
                            size="lg"
                        >
                            Find Doctors
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}