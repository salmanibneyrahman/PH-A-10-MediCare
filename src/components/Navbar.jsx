"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    Button,
    Avatar,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Chip,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function AppNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, dbUser, isAuthenticated, logout, loading } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
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
        if (dbUser?.role === "admin") return "danger";
        if (dbUser?.role === "doctor") return "primary";
        return "success";
    };

    return (
        <Navbar
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            maxWidth="xl"
            className={`fixed top-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
                    : "bg-transparent"
                }`}
            classNames={{
                wrapper: "px-4 sm:px-6",
            }}
        >
            {/* Brand */}
            <NavbarContent justify="start">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden text-slate-300"
                />
                <NavbarBrand as={Link} href="/" className="gap-2 cursor-pointer">
                    <div className="flex items-center gap-2">
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
                    </div>
                </NavbarBrand>
            </NavbarContent>

            {/* Desktop Nav Links */}
            <NavbarContent className="hidden sm:flex gap-1" justify="center">
                {navLinks.map((link) => (
                    <NavbarItem key={link.href}>
                        <Link
                            href={link.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href
                                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                                    : "text-slate-300 hover:text-cyan-400 hover:bg-white/5"
                                }`}
                        >
                            {link.label}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            {/* Right Side */}
            <NavbarContent justify="end" className="gap-2">
                {!loading && (
                    <>
                        {isAuthenticated ? (
                            <>
                                <NavbarItem className="hidden sm:flex">
                                    <Button
                                        as={Link}
                                        href={getDashboardLink()}
                                        size="sm"
                                        variant="bordered"
                                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-medium"
                                    >
                                        Dashboard
                                    </Button>
                                </NavbarItem>
                                <NavbarItem>
                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                            <Avatar
                                                src={user?.image || ""}
                                                name={user?.name || "U"}
                                                size="sm"
                                                className="cursor-pointer ring-2 ring-cyan-500/50 hover:ring-cyan-500 transition-all"
                                                classNames={{
                                                    base: "bg-gradient-to-br from-cyan-500 to-indigo-600",
                                                    name: "text-white font-semibold",
                                                }}
                                            />
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            aria-label="User menu"
                                            className="w-56"
                                            classNames={{
                                                base: "glass-card border border-white/10",
                                            }}
                                        >
                                            <DropdownItem
                                                key="profile-info"
                                                isReadOnly
                                                className="opacity-100 cursor-default"
                                                textValue="profile"
                                            >
                                                <div className="flex flex-col gap-1 py-1">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {user?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {user?.email}
                                                    </p>
                                                    <Chip
                                                        size="sm"
                                                        color={getRoleBadgeColor()}
                                                        variant="flat"
                                                        className="mt-1 w-fit capitalize"
                                                    >
                                                        {dbUser?.role || "patient"}
                                                    </Chip>
                                                </div>
                                            </DropdownItem>
                                            <DropdownItem
                                                key="dashboard"
                                                as={Link}
                                                href={getDashboardLink()}
                                                startContent={
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
                                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                                        />
                                                    </svg>
                                                }
                                                className="text-slate-300"
                                            >
                                                Dashboard
                                            </DropdownItem>
                                            <DropdownItem
                                                key="profile"
                                                as={Link}
                                                href="/dashboard/patient/profile"
                                                startContent={
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
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                }
                                                className="text-slate-300"
                                            >
                                                My Profile
                                            </DropdownItem>
                                            <DropdownItem
                                                key="logout"
                                                color="danger"
                                                startContent={
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
                                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                        />
                                                    </svg>
                                                }
                                                onClick={handleLogout}
                                                className="text-red-400"
                                            >
                                                Sign Out
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </NavbarItem>
                            </>
                        ) : (
                            <>
                                <NavbarItem>
                                    <Button
                                        as={Link}
                                        href="/login"
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-300 hover:text-white hover:bg-white/10 font-medium"
                                    >
                                        Login
                                    </Button>
                                </NavbarItem>
                                <NavbarItem>
                                    <Button
                                        as={Link}
                                        href="/register"
                                        size="sm"
                                        className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:opacity-90"
                                    >
                                        Register
                                    </Button>
                                </NavbarItem>
                            </>
                        )}
                    </>
                )}
            </NavbarContent>

            {/* Mobile Menu */}
            <NavbarMenu className="bg-[#0a0f1e]/95 backdrop-blur-xl pt-6 gap-2">
                {navLinks.map((link) => (
                    <NavbarMenuItem key={link.href}>
                        <Link
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${pathname === link.href
                                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                                    : "text-slate-300 hover:text-cyan-400 hover:bg-white/5"
                                }`}
                        >
                            {link.label}
                        </Link>
                    </NavbarMenuItem>
                ))}
                {isAuthenticated ? (
                    <>
                        <NavbarMenuItem>
                            <Link
                                href={getDashboardLink()}
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all"
                            >
                                Dashboard
                            </Link>
                        </NavbarMenuItem>
                        <NavbarMenuItem>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                Sign Out
                            </button>
                        </NavbarMenuItem>
                    </>
                ) : (
                    <>
                        <NavbarMenuItem>
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                            >
                                Login
                            </Link>
                        </NavbarMenuItem>
                        <NavbarMenuItem>
                            <Link
                                href="/register"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white transition-all"
                            >
                                Register
                            </Link>
                        </NavbarMenuItem>
                    </>
                )}
            </NavbarMenu>
        </Navbar>
    );
}