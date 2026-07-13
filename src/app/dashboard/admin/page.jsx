"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, Button } from "@heroui/react";
import { getAnalytics } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const COLORS = ["#06b6d4","#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-white/10 px-4 py-3 text-sm">
        <p className="text-slate-300 font-medium mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-bold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch {
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin analytics..." />;

  const monthlyData = (analytics?.monthlyAppointments || []).map((m) => ({
    name: MONTH_NAMES[(m._id?.month || 1) - 1],
    appointments: m.count,
  }));

  const doctorPerformance = (analytics?.doctorPerformance || []).map((d) => ({
    name: d.doctorName?.split(" ").slice(-1)[0] || "Dr",
    rating: d.averageRating || 0,
    reviews: d.totalReviews || 0,
  }));

  const pieData = [
    { name: "Doctors", value: analytics?.totalDoctors || 0 },
    { name: "Patients", value: analytics?.totalPatients || 0 },
    { name: "Appointments", value: analytics?.totalAppointments || 0 },
  ];

  const overviewCards = [
    {
      label: "Total Doctors",
      value: analytics?.totalDoctors || 0,
      icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z",
      color: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
      text: "text-cyan-400",
      href: "/dashboard/admin/doctors",
    },
    {
      label: "Total Patients",
      value: analytics?.totalPatients || 0,
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      color: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/20",
      text: "text-indigo-400",
      href: "/dashboard/admin/users",
    },
    {
      label: "Total Appointments",
      value: analytics?.totalAppointments || 0,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
      text: "text-emerald-400",
      href: "/dashboard/admin/appointments",
    },
    {
      label: "Total Revenue",
      value: `$${analytics?.totalRevenue || 0}`,
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
      color: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
      text: "text-amber-400",
      href: "/dashboard/admin/payments",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div className="glass-card border border-white/10 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm">Admin Control Center</p>
            <h1 className="text-2xl font-black text-white mt-1">
              Platform Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              as={Link}
              href="/dashboard/admin/doctors"
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-lg shadow-cyan-500/20"
            >
              Verify Doctors
            </Button>
            <Button
              as={Link}
              href="/dashboard/admin/analytics"
              size="sm"
              variant="bordered"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              Full Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewCards.map((card, index) => (
          <Link key={card.label} href={card.href}>
            <Card className="glass-card border border-white/10 hover:border-white/20 transition-all duration-300 hover-lift cursor-pointer">
              <CardBody className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.glow}`}
                  >
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
                        d={card.icon}
                      />
                    </svg>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
                <div>
                  <p className={`text-3xl font-black ${card.text}`}>
                    {card.value}
                  </p>
                  <p className="text-slate-400 text-sm mt-0.5">{card.label}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Appointments Line Chart */}
        <Card className="glass-card border border-white/10">
          <CardBody className="p-6">
            <h3 className="text-white font-bold text-base mb-6">
              Monthly Appointments
            </h3>
            {monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                No monthly data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ fill: "#06b6d4", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#06b6d4" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        {/* Platform Distribution Pie Chart */}
        <Card className="glass-card border border-white/10">
          <CardBody className="p-6">
            <h3 className="text-white font-bold text-base mb-6">
              Platform Distribution
            </h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3 flex-1">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-xs">{entry.name}</p>
                      <p
                        className="font-bold text-sm"
                        style={{ color: COLORS[index % COLORS.length] }}
                      >
                        {entry.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Doctor Performance Bar Chart */}
      <Card className="glass-card border border-white/10">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-base">
              Doctor Performance (Rating Based)
            </h3>
            <Button
              as={Link}
              href="/dashboard/admin/analytics"
              size="sm"
              variant="bordered"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
            >
              Full Report
            </Button>
          </div>
          {doctorPerformance.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              No doctor performance data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={doctorPerformance}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="rating"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                  name="Rating"
                />
                <Bar
                  dataKey="reviews"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  name="Reviews"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Manage Users",
            desc: "View, suspend or delete users",
            href: "/dashboard/admin/users",
            icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
            color: "from-cyan-500 to-blue-600",
          },
          {
            label: "Verify Doctors",
            desc: "Review and verify doctor profiles",
            href: "/dashboard/admin/doctors",
            icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
            color: "from-emerald-500 to-teal-600",
          },
          {
            label: "View Appointments",
            desc: "Monitor all platform appointments",
            href: "/dashboard/admin/appointments",
            icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
            color: "from-indigo-500 to-purple-600",
          },
          {
            label: "Payment Records",
            desc: "Track all financial transactions",
            href: "/dashboard/admin/payments",
            icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
            color: "from-amber-500 to-orange-600",
          },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="glass-card border border-white/10 hover:border-white/20 transition-all duration-300 hover-lift cursor-pointer h-full">
              <CardBody className="p-5 flex flex-col gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}
                >
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
                      d={action.icon}
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{action.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{action.desc}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}