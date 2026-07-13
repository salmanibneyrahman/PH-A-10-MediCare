"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, Button, Avatar } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import {
  getDoctorAppointments,
  getDoctorByEmail,
  getDoctorReviews,
} from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import StarRating from "@/components/StarRating";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.email) return;
      setLoading(true);
      try {
        const doc = await getDoctorByEmail(user.email);
        setDoctor(doc);
        const [apts, revs] = await Promise.all([
          getDoctorAppointments(user.email),
          getDoctorReviews(doc._id),
        ]);
        setAppointments(apts || []);
        setReviews(revs || []);
      } catch {
        setAppointments([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner text="Loading doctor dashboard..." />;

  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(
    (a) => a.appointmentDate === today
  );
  const pending = appointments.filter(
    (a) => a.appointmentStatus === "pending"
  );
  const totalPatients = new Set(appointments.map((a) => a.patientId)).size;

  const statCards = [
    {
      label: "Total Patients",
      value: totalPatients,
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      color: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
      text: "text-cyan-400",
      href: "/dashboard/doctor/appointments",
    },
    {
      label: "Today's Appointments",
      value: todaysAppointments.length,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/20",
      text: "text-indigo-400",
      href: "/dashboard/doctor/appointments",
    },
    {
      label: "Pending Requests",
      value: pending.length,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
      text: "text-amber-400",
      href: "/dashboard/doctor/appointments",
    },
    {
      label: "Reviews Received",
      value: reviews.length,
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
      color: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
      text: "text-emerald-400",
      href: "/dashboard/doctor/appointments",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div className="glass-card border border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <Avatar
          src={doctor?.profileImage || user?.image || ""}
          name={doctor?.doctorName || user?.name || "D"}
          className="w-16 h-16 ring-4 ring-cyan-500/20 shrink-0"
          classNames={{
            base: "bg-gradient-to-br from-cyan-500 to-blue-600",
            name: "text-white font-black text-xl",
          }}
        />
        <div className="flex-1 relative">
          <p className="text-slate-400 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-black text-white">
            {doctor?.doctorName || user?.name}
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {doctor?.specialization && (
              <span className="text-cyan-400 text-sm font-medium">
                {doctor.specialization}
              </span>
            )}
            <StatusBadge status={doctor?.verificationStatus || "pending"} />
          </div>
        </div>
        <Button
          as={Link}
          href="/dashboard/doctor/schedule"
          className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-lg shadow-cyan-500/20 shrink-0"
        >
          Manage Schedule
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
                  <p className="text-slate-400 text-sm mt-0.5">{stat.label}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Appointments */}
        <Card className="glass-card border border-white/10">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">
                Today&apos;s Appointments
              </h2>
              <Button
                as={Link}
                href="/dashboard/doctor/appointments"
                size="sm"
                variant="bordered"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
              >
                View All
              </Button>
            </div>
            {todaysAppointments.length === 0 ? (
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
                <p className="text-slate-400 text-sm">No appointments today</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {todaysAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
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
                        {apt.patient?.name || "Patient"}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {apt.appointmentTime}
                      </p>
                    </div>
                    <StatusBadge status={apt.appointmentStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Reviews */}
        <Card className="glass-card border border-white/10">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Recent Reviews</h2>
              <div className="flex items-center gap-2">
                <StarRating rating={doctor?.averageRating || 0} size="sm" />
                <span className="text-amber-400 font-bold text-sm">
                  {doctor?.averageRating?.toFixed(1) || "0.0"}
                </span>
              </div>
            </div>
            {reviews.length === 0 ? (
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <p className="text-slate-400 text-sm">No reviews yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.slice(0, 3).map((review) => (
                  <div
                    key={review._id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold text-sm">
                        {review.patient?.name || "Patient"}
                      </p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {review.reviewText}
                    </p>
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