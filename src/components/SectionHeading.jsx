export default function SectionHeading({
    badge,
    title,
    highlight,
    subtitle,
    center = true,
}) {
    return (
        <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : "items-start"}`}>
            {badge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {badge}
                </div>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {title}{" "}
                {highlight && <span className="gradient-text">{highlight}</span>}
            </h2>
            {subtitle && (
                <p
                    className={`text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl ${center ? "text-center" : ""
                        }`}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}