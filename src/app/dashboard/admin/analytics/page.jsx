"use client";

import { useEffect, useState } from "react";
import { Card } from "@heroui/react";
import { getAnalytics } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import StarRating from "@/components/StarRating";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1b2a] border border-white/15 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-xl">
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

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  // window doesn't exist during SSR — read it once after mount instead of
  // inline in JSX, which crashes the build.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics data..." />;

  const tickSize = isMobile ? 9 : 11;
  const smallTick = isMobile ? 8 : 10;

  const monthlyData = (analytics?.monthlyAppointments || []).map((m) => ({
    name: MONTH_NAMES[(m._id?.month || 1) - 1],
    appointments: m.count,
  }));

  const doctorPerformance = (analytics?.doctorPerformance || []).map((d) => ({
    name: d.doctorName?.split(" ").slice(-1)[0] || "Dr",
    fullName: d.doctorName,
    rating: Number((d.averageRating || 0).toFixed(1)),
    reviews: d.totalReviews || 0,
    specialization: d.specialization,
  }));

  const radarData = doctorPerformance.slice(0, 6).map((d) => ({
    subject: d.name,
    rating: d.rating,
    reviews: d.reviews,
  }));

  const summaryCards = [
    {
      label: "Total Doctors",
      value: analytics?.totalDoctors || 0,
      color: "from-cyan-500 to-blue-600",
      text: "text-cyan-400",
      icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      label: "Total Patients",
      value: analytics?.totalPatients || 0,
      color: "from-indigo-500 to-purple-600",
      text: "text-indigo-400",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      label: "Total Appointments",
      value: analytics?.totalAppointments || 0,
      color: "from-emerald-500 to-teal-600",
      text: "text-emerald-400",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "Total Revenue",
      value: `$${analytics?.totalRevenue || 0}`,
      color: "from-amber-500 to-orange-600",
      text: "text-amber-400",
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Analytics Dashboard
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Comprehensive platform insights and performance metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {summaryCards.map((card) => (
          <Card key={card.label} className="glass-card border border-white/10">
            <Card.Content className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
              <div>
                <p className={`text-2xl sm:text-3xl font-black ${card.text}`}>
                  {card.value}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  {card.label}
                </p>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Area Chart — Monthly Trend */}
      <Card className="glass-card border border-white/10">
        <Card.Content className="p-4 sm:p-6">
          <h3 className="text-white font-bold text-sm sm:text-base mb-4 sm:mb-6">
            Monthly Appointment Trend
          </h3>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-40 sm:h-48 text-slate-500 text-xs sm:text-sm">
              No monthly data available yet
            </div>
          ) : (
            // Fixed-height wrapper + height="100%" is what makes
            // ResponsiveContainer actually resize on mobile.
            <div className="w-full h-[220px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 5, right: 5, left: isMobile ? -20 : -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="appointmentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: tickSize }}
                    axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: tickSize }}
                    axisLine={false}
                    tickLine={false}
                    width={isMobile ? 28 : 40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#appointmentGradient)"
                    name="Appointments"
                    dot={{ fill: "#06b6d4", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#06b6d4" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Doctor Performance Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Rating Bar Chart */}
        <Card className="glass-card border border-white/10">
          <Card.Content className="p-4 sm:p-6">
            <h3 className="text-white font-bold text-sm sm:text-base mb-4 sm:mb-6">
              Doctor Ratings
            </h3>
            {doctorPerformance.length === 0 ? (
              <div className="flex items-center justify-center h-40 sm:h-48 text-slate-500 text-xs sm:text-sm">
                No doctor data available
              </div>
            ) : (
              <div className="w-full h-[220px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={doctorPerformance}
                    margin={{
                      top: 5,
                      right: 5,
                      left: isMobile ? -20 : -10,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b", fontSize: smallTick }}
                      axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                      tickLine={false}
                      interval={0}
                      angle={isMobile ? -35 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 50 : 30}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fill: "#64748b", fontSize: smallTick }}
                      axisLine={false}
                      tickLine={false}
                      width={isMobile ? 24 : 34}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="rating"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      name="Rating"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Radar Chart */}
        <Card className="glass-card border border-white/10">
          <Card.Content className="p-4 sm:p-6">
            <h3 className="text-white font-bold text-sm sm:text-base mb-4 sm:mb-6">
              Performance Overview
            </h3>
            {radarData.length === 0 ? (
              <div className="flex items-center justify-center h-40 sm:h-48 text-slate-500 text-xs sm:text-sm">
                No data available
              </div>
            ) : (
              <div className="w-full h-[220px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={radarData}
                    outerRadius={isMobile ? "65%" : "75%"}
                  >
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#64748b", fontSize: smallTick }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 5]}
                      tick={{ fill: "#64748b", fontSize: isMobile ? 7 : 9 }}
                    />
                    <Radar
                      name="Rating"
                      dataKey="rating"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Top Doctor Performance */}
      <Card className="glass-card border border-white/10">
        <Card.Content className="p-4 sm:p-6">
          <h3 className="text-white font-bold text-sm sm:text-base mb-4 sm:mb-6">
            Top Performing Doctors
          </h3>
          {doctorPerformance.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs sm:text-sm">
              No doctor performance data available
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden flex flex-col gap-3">
                {doctorPerformance.map((doc, index) => (
                  <div
                    key={doc.fullName}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${index === 0
                          ? "bg-amber-500/20 text-amber-400"
                          : index === 1
                            ? "bg-slate-400/20 text-slate-300"
                            : index === 2
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-white/5 text-slate-500"
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold text-sm truncate">
                        {doc.fullName}
                      </p>
                      <p className="text-cyan-400 text-xs truncate">
                        {doc.specialization}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <svg
                          className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-amber-400 font-bold text-sm">
                          {doc.rating}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">
                        {doc.reviews} reviews
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="glass-table w-full min-w-[640px]">
                  <thead>
                    <tr>
                      <th className="text-xs sm:text-sm">Rank</th>
                      <th className="text-xs sm:text-sm">Doctor</th>
                      <th className="text-xs sm:text-sm">Specialization</th>
                      <th className="text-xs sm:text-sm">Rating</th>
                      <th className="text-xs sm:text-sm">Reviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorPerformance.map((doc, index) => (
                      <tr key={doc.fullName}>
                        <td>
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm ${index === 0
                                ? "bg-amber-500/20 text-amber-400"
                                : index === 1
                                  ? "bg-slate-400/20 text-slate-300"
                                  : index === 2
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-white/5 text-slate-500"
                              }`}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td>
                          <p className="text-white font-semibold text-xs sm:text-sm">
                            {doc.fullName}
                          </p>
                        </td>
                        <td>
                          <span className="text-cyan-400 text-xs font-medium">
                            {doc.specialization}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <StarRating rating={doc.rating} size="sm" />
                            <span className="text-amber-400 font-bold text-xs sm:text-sm">
                              {doc.rating}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-slate-300 text-xs sm:text-sm">
                            {doc.reviews}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}