"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, Button, Avatar } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { getPatientAppointments, getPatientPayments } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PatientDashboardPage() {
  const { user, dbUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!dbUser?._id) return;
      setLoading(true);
      try {
        const [appts, pays] = await Promise.all([
          getPatientAppointments(dbUser._id.toString()),
          getPatientPayments(dbUser._id.toString()),
        ]);
        setAppointments(appts || []);
        setPayments(pays || []);
      } catch {
        setAppointments([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dbUser]);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const upcoming = appointments.filter(
    (a) =>
      a.appointmentStatus === "confirmed" ||
      a.appointmentStatus === "pending"
  );
  const completed = appointments.filter(
    (a) => a.appointmentStatus === "completed"
  );
  const totalPaid = payments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  const statCards = [
    {
      label: "Upcoming Appointments",
      value: upcoming.length,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
      text: "text-cyan-400",
      href: "/dashboard/patient/appointments",
    },
    {
      label: "Completed Sessions",
      value: completed.length,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
      text: "text-emerald-400",
      href: "/dashboard/patient/appointments",
    },
    {
      label: "Total Payments",
      value: `$${totalPaid}`,
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
      color: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/20",
      text: "text-indigo-400",
      href: "/dashboard/patient/payments",
    },
    {
      label: "Total Appointments",
      value: appointments.length,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      color: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
      text: "text-amber-400",
      href: "/dashboard/patient/appointments",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div className="glass-card border border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <Avatar
          src={user?.image || ""}
          name={user?.name || "P"}
          className="w-16 h-16 ring-4 ring-cyan-500/20 shrink-0"
          classNames={{
            base: "bg-gradient-to-br from-emerald-500 to-teal-600",
            name: "text-white font-black text-xl",
          }}
        />
        <div className="flex-1 relative">
          <p className="text-slate-400 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-black text-white">
            {user?.name}
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
        <Button
          as={Link}
          href="/find-doctors"
          className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-lg shadow-cyan-500/20 shrink-0"
        >
          Book Appointment
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="glass-card border border-white/10 hover:border-white/20 transition-all duration-300 hover-lift cursor-pointer">
              <CardBody className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.glow}`}
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
                        d={stat.icon}
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
                  <p className={`text-3xl font-black ${stat.text}`}>
                    {stat.value}
                  </p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border border-white/10">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">
                Upcoming Appointments
              </h2>
              <Button
                as={Link}
                href="/dashboard/patient/appointments"
                size="sm"
                variant="bordered"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
              >
                View All
              </Button>
            </div>

            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-400 font-medium text-sm">
                    No upcoming appointments
                  </p>
                  <p className="text-slate-600 text-xs">
                    Book your first appointment today
                  </p>
                </div>
                <Button
                  as={Link}
                  href="/find-doctors"
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold"
                >
                  Find a Doctor
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.slice(0, 4).map((apt) => (
                  <div
                    key={apt._id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-cyan-400"
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {apt.doctorName || "Doctor"}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {apt.appointmentDate} • {apt.appointmentTime}
                      </p>
                    </div>
                    <StatusBadge status={apt.appointmentStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="glass-card border border-white/10">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">
                Recent History
              </h2>
              <Button
                as={Link}
                href="/dashboard/patient/appointments"
                size="sm"
                variant="bordered"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
              >
                View All
              </Button>
            </div>

            {appointments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <svg
                  className="w-14 h-14 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-slate-400 text-sm">
                  No appointment history
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {appointments.slice(0, 4).map((apt) => (
                  <div
                    key={apt._id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {apt.doctorName || "Doctor"}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {apt.specialization} •{" "}
                        {new Date(
                          apt.appointmentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={apt.appointmentStatus} />
                      <StatusBadge status={apt.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}