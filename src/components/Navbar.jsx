"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function AppNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, dbUser, isAuthenticated, logout, loading } = useAuth();
    const pathname = usePathname();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/find-doctors", label: "Find Doctors" },
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Us" },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
        } catch {
            toast.error("Failed to logout");
        }
    };

    const getDashboardLink = () => {
        if (dbUser?.role === "admin") return "/dashboard/admin";
        if (dbUser?.role === "doctor") return "/dashboard/doctor";
        return "/dashboard/patient";
    };

    const getRoleBadgeColor = () => {
        if (dbUser?.role === "admin") return "bg-red-500/15 text-red-400 border border-red-500/20";
        if (dbUser?.role === "doctor") return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Mobile Toggle + Brand */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            className="sm:hidden text-slate-300 p-1"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* Brand */}
                        <Link href="/" className="flex items-center gap-2 cursor-pointer">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
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
                            <div className="hidden sm:flex flex-col leading-none">
                                <span className="text-lg font-black gradient-text">MediCare</span>
                                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                                    Connect
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden sm:flex gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    pathname === link.href
                                        ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                                        : "text-slate-300 hover:text-cyan-400 hover:bg-white/5"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {!loading && (
                            <>
                                {isAuthenticated ? (
                                    <>
                                        {/* Dashboard Button */}
                                        <Link
                                            href={getDashboardLink()}
                                            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                        >
                                            Dashboard
                                        </Link>

                                        {/* Avatar Dropdown */}
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="flex items-center"
                                            >
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-cyan-500/50 hover:ring-cyan-500 transition-all cursor-pointer overflow-hidden">
                                                    {user?.image ? (
                                                        <img src={user.image} alt={user?.name || "U"} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (user?.name || "U").charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                            </button>

                                            {/* Dropdown Menu */}
                                            {isDropdownOpen && (
                                                <div className="absolute right-0 top-full mt-2 w-56 glass-card border border-white/10 rounded-xl shadow-xl shadow-black/30 py-2 z-50">
                                                    {/* Profile Info */}
                                                    <div className="flex flex-col gap-1 py-2 px-4 border-b border-white/5">
                                                        <p className="text-sm font-semibold text-white truncate">
                                                            {user?.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 truncate">
                                                            {user?.email}
                                                        </p>
                                                        <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize w-fit ${getRoleBadgeColor()}`}>
                                                            {dbUser?.role || "patient"}
                                                        </span>
                                                    </div>

                                                    {/* Dashboard */}
                                                    <Link
                                                        href={getDashboardLink()}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                        Dashboard
                                                    </Link>

                                                    {/* My Profile */}
                                                    <Link
                                                        href="/dashboard/patient/profile"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        My Profile
                                                    </Link>

                                                    {/* Sign Out */}
                                                    <button
                                                        onClick={() => {
                                                            handleLogout();
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Sign Out
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Login */}
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            Login
                                        </Link>
                                        {/* Register */}
                                        <Link
                                            href="/register"
                                            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-opacity"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-white/5">
                    <div className="px-4 pt-4 pb-6 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    pathname === link.href
                                        ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                                        : "text-slate-300 hover:text-cyan-400 hover:bg-white/5"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <>
                                <Link
                                    href={getDashboardLink()}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white transition-all"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}