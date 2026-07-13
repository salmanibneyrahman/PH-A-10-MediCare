import Link from "next/link";

export default function Footer() {
    const quickLinks = [
        { href: "/", label: "Home" },
        { href: "/find-doctors", label: "Find Doctors" },
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Us" },
        { href: "/login", label: "Login" },
        { href: "/register", label: "Register" },
    ];

    const specializations = [
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "Dermatology",
        "Oncology",
    ];

    return (
        <footer className="relative bg-[#060c1a] border-t border-white/5 overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/4 w-96 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1 flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-3 w-fit">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                <svg
                                    className="w-5 h-5 text-white"
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
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black gradient-text">
                                    MediCare
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                                    Connect
                                </span>
                            </div>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Connecting patients with world-class doctors. Experience seamless
                            healthcare management at your fingertips.
                        </p>
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {[
                                {
                                    label: "Facebook",
                                    path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
                                },
                                {
                                    label: "Twitter",
                                    path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
                                },
                                {
                                    label: "LinkedIn",
                                    path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
                                },
                                {
                                    label: "Instagram",
                                    path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z",
                                },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href="#"
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d={social.path}
                                        />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col gap-5">
                        <h3 className="text-white font-bold text-base relative">
                            Quick Links
                            <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent rounded-full" />
                        </h3>
                        <ul className="flex flex-col gap-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-400 hover:text-cyan-400 text-sm transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Specializations */}
                    <div className="flex flex-col gap-5">
                        <h3 className="text-white font-bold text-base relative">
                            Specializations
                            <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent rounded-full" />
                        </h3>
                        <ul className="flex flex-col gap-2.5">
                            {specializations.map((spec) => (
                                <li key={spec}>
                                    <Link
                                        href={`/find-doctors?specialization=${spec.toLowerCase()}`}
                                        className="text-slate-400 hover:text-cyan-400 text-sm transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-indigo-500/50 group-hover:bg-indigo-400 transition-colors" />
                                        {spec}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Emergency */}
                    <div className="flex flex-col gap-5">
                        <h3 className="text-white font-bold text-base relative">
                            Contact Us
                            <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent rounded-full" />
                        </h3>
                        <div className="flex flex-col gap-3">
                            {[
                                {
                                    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                                    text: "123 Health Street, Medical City, MC 10001",
                                },
                                {
                                    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                                    text: "support@medicareconnect.com",
                                },
                                {
                                    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                                    text: "+1 (800) 123-4567",
                                },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <svg
                                        className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d={item.icon}
                                        />
                                    </svg>
                                    <span className="text-slate-400 text-sm leading-relaxed">
                                        {item.text}
                                    </span>
                                </div>
                            ))}

                            {/* Emergency Hotline */}
                            <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                                    <svg
                                        className="w-4 h-4 text-red-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 17h5l-5 5-5-5h5V3h0M9 7H4l5-5 5 5H9v14"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-red-400 font-semibold uppercase tracking-wide">
                                        Emergency Hotline
                                    </p>
                                    <p className="text-white font-bold text-sm">
                                        911 / +1 (800) 911-0000
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm text-center">
                        © {new Date().getFullYear()} MediCare Connect. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                            (item) => (
                                <Link
                                    key={item}
                                    href="#"
                                    className="text-slate-500 hover:text-cyan-400 text-xs transition-colors"
                                >
                                    {item}
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}