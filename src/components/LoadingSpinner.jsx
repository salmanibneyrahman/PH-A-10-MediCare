export default function LoadingSpinner({ fullScreen = false, text = "Loading..." }) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1e]/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                        <div className="absolute inset-2 rounded-full border-4 border-indigo-500/20 border-b-indigo-500 animate-spin animation-reverse" />
                    </div>
                    <p className="text-slate-400 text-sm animate-pulse">{text}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-3 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                <div className="absolute inset-1.5 rounded-full border-3 border-indigo-500/20 border-b-indigo-500 animate-spin" style={{ animationDirection: "reverse" }} />
            </div>
            <p className="text-slate-400 text-sm animate-pulse">{text}</p>
        </div>
    );
}