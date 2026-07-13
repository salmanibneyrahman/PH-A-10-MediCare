"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Chip } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

function SidebarLink({ href, icon, label, badge }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
        isActive
          ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
      }`}
    >
      <svg
        className={`w-5 h-5 shrink-0 transition-colors ${
          isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={icon}
        />
      </svg>
      <span className="flex-1">{label}</span>
      {badge && (
        <Chip
          size="sm"
          className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs h-5 min-w-5"
        >
          {badge}
        </Chip>
      )}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyan-400 rounded-full" />
      )}
    </Link>
  );
}

const patientLinks = [
  {
    href: "/dashboard/patient",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    label: "Overview",
  },
  {
    href: "/dashboard/patient/appointments",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    label: "My Appointments",
  },
  {
    href: "/dashboard/patient/payments",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    label: "Payment History",
  },
  {
    href: "/dashboard/patient/reviews",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    label: "My Reviews",
  },
  {
    href: "/dashboard/patient/profile",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    label: "My Profile",
  },
];

const doctorLinks = [
  {
    href: "/dashboard/doctor",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    label: "Overview",
  },
  {
    href: "/dashboard/doctor/schedule",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    label: "Manage Schedule",
  },
  {
    href: "/dashboard/doctor/appointments",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    label: "Appointment Requests",
  },
  {
    href: "/dashboard/doctor/prescriptions",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    label: "Prescriptions",
  },
  {
    href: "/dashboard/doctor/profile",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    label: "Profile",
  },
];

const adminLinks = [
  {
    href: "/dashboard/admin",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    label: "Overview",
  },
  {
    href: "/dashboard/admin/users",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    label: "Manage Users",
  },
  {
    href: "/dashboard/admin/doctors",
    icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z",
    label: "Manage Doctors",
  },
  {
    href: "/dashboard/admin/appointments",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    label: "Manage Appointments",
  },
  {
    href: "/dashboard/admin/payments",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    label: "Payment Management",
  },
  {
    href: "/dashboard/admin/analytics",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    label: "Analytics",
  },
];

export default function DashboardLayout({ children }) {
  const { user, dbUser, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  if (!isAuthenticated) return null;

  const role = dbUser?.role || "patient";
  const links =
    role === "admin"
      ? adminLinks
      : role === "doctor"
      ? doctorLinks
      : patientLinks;

  const roleColors = {
    admin: "from-red-500 to-pink-600",
    doctor: "from-cyan-500 to-blue-600",
    patient: "from-emerald-500 to-teal-600",
  };

  const roleBadgeColors = {
    admin: "bg-red-500/15 text-red-400 border-red-500/30",
    doctor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    patient: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 flex flex-col bg-[#060c1a] border-r border-white/5 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
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
            <div className="flex flex-col leading-none">
              <span className="text-base font-black gradient-text">
                MediCare
              </span>
              <span className="text-[9px] text-slate-500 font-medium tracking-widest uppercase">
                Connect
              </span>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <Avatar
              src={user?.image || ""}
              name={user?.name || "U"}
              size="md"
              classNames={{
                base: `bg-gradient-to-br ${roleColors[role]}`,
                name: "text-white font-bold",
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {user?.name}
              </p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-center">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${roleBadgeColors[role]}`}
            >
              {role} Dashboard
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto flex flex-col gap-1">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-4 mb-2">
            Navigation
          </p>
          {links.map((link) => (
            <SidebarLink key={link.href} {...link} />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full text-left"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <span className="text-slate-400 capitalize">
                {role} Dashboard
              </span>
              <span>/</span>
              <span className="text-slate-300">
                {pathname.split("/").pop().replace(/-/g, " ") || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              as={Link}
              href="/find-doctors"
              size="sm"
              variant="bordered"
              className="hidden sm:flex border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-medium text-xs"
            >
              Find Doctors
            </Button>
            <Avatar
              src={user?.image || ""}
              name={user?.name || "U"}
              size="sm"
              className="ring-2 ring-cyan-500/30"
              classNames={{
                base: `bg-gradient-to-br ${roleColors[role]}`,
                name: "text-white font-bold text-xs",
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}