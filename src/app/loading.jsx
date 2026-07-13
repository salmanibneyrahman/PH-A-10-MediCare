'use client'
export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1e]">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-cyan-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl font-bold gradient-text">MediCare Connect</h2>
                    <p className="text-slate-400 text-sm animate-pulse">
                        Loading your healthcare experience...
                    </p>
                </div>
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-cyan-500"
                            style={{
                                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                            }}
                        />
                    ))}
                </div>
            </div>
            <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}