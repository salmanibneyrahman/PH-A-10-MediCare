"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button, Avatar } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  getDoctorByEmail,
} from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

const STATUS_FILTERS = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
];

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    if (!user?.email) return;
    setLoading(true);
    try {
      const doc = await getDoctorByEmail(user.email);
      setDoctorId(doc._id.toString());
      const data = await getDoctorAppointments(doc._id.toString());
      setAppointments(data || []);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id + status);
    try {
      await updateAppointmentStatus(id, status);
      toast.success(
        `Appointment ${
          status === "confirmed" ? "accepted" : status
        } successfully!`
      );
      if (status === "completed") {
        router.push(
          `/dashboard/doctor/prescriptions?appointmentId=${id}`
        );
        return;
      }
      fetchData();
    } catch {
      toast.error("Failed to update appointment status");
    } finally {
      setActionLoading("");
    }
  };

  const filtered =
    activeFilter === "all"
      ? appointments
      : appointments.filter(
          (a) => a.appointmentStatus === activeFilter
        );

  if (loading)
    return (
      <LoadingSpinner text="Loading appointment requests..." />
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Appointment Requests
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review and manage patient appointment requests
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-sm font-medium">
            {
              appointments.filter(
                (a) => a.appointmentStatus === "pending"
              ).length
            }{" "}
            Pending
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 rounded-xl glass-card border border-white/10 overflow-x-auto">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap ${
              activeFilter === filter
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {filter === "all"
              ? `All (${appointments.length})`
              : `${filter} (${appointments.filter((a) => a.appointmentStatus === filter).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="glass-card border border-white/10">
          <CardBody className="p-16 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-slate-600"
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
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                No{" "}
                {activeFilter === "all" ? "" : activeFilter}{" "}
                appointments
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {activeFilter === "pending"
                  ? "No pending requests at this time."
                  : "No appointments found for this filter."}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((apt) => (
            <Card
              key={apt._id}
              className="glass-card border border-white/10 hover:border-white/15 transition-all"
            >
              <CardBody className="p-5">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center shrink-0">
                      <span className="text-indigo-400 font-bold text-lg">
                        {(apt.patientName || "P")[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold truncate">
                        {apt.patientName || "Patient"}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {apt.patientEmail}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5 text-cyan-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(
                            apt.appointmentDate
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5 text-indigo-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {apt.appointmentTime}
                        </span>
                        <StatusBadge status={apt.paymentStatus} />
                      </div>
                    </div>
                  </div>

                  {apt.symptoms && (
                    <div className="flex-1 min-w-0 hidden md:block">
                      <p className="text-slate-500 text-xs mb-1 font-medium">
                        Symptoms
                      </p>
                      <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                        {apt.symptoms}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 items-start lg:items-end shrink-0">
                    <StatusBadge status={apt.appointmentStatus} />

                    {apt.appointmentStatus === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          isLoading={
                            actionLoading === apt._id + "confirmed"
                          }
                          onClick={() =>
                            handleStatusUpdate(apt._id, "confirmed")
                          }
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          isLoading={
                            actionLoading === apt._id + "rejected"
                          }
                          onClick={() =>
                            handleStatusUpdate(apt._id, "rejected")
                          }
                          variant="bordered"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {apt.appointmentStatus === "confirmed" && (
                      <Button
                        size="sm"
                        isLoading={
                          actionLoading === apt._id + "completed"
                        }
                        onClick={() =>
                          handleStatusUpdate(apt._id, "completed")
                        }
                        className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20"
                      >
                        Mark Complete & Prescribe
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}