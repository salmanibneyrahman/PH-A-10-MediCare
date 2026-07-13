"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Input } from "@heroui/react";
import { getAllAppointments } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      try {
        const data = await getAllAppointments();
        setAppointments(data || []);
        setFiltered(data || []);
      } catch {
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  useEffect(() => {
    let result = appointments;
    if (activeFilter !== "all") {
      result = result.filter((a) => a.appointmentStatus === activeFilter);
    }
    if (search.trim()) {
      result = result.filter(
        (a) =>
          a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
          a.doctor?.doctorName?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, appointments, activeFilter]);

  const statusFilters = ["all", "pending", "confirmed", "completed", "cancelled"];

  if (loading) return <LoadingSpinner text="Loading appointments..." />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-white">
          Manage Appointments
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor all platform appointments and their statuses
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by patient or doctor name..."
          value={search}
          onValueChange={setSearch}
          classNames={{
            inputWrapper:
              "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all",
            input: "text-slate-200 placeholder:text-slate-500 text-sm",
          }}
          startContent={
            <svg
              className="w-4 h-4 text-slate-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
        <div className="flex gap-1 p-1 rounded-xl glass-card border border-white/10 overflow-x-auto shrink-0">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                activeFilter === f
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {f === "all"
                ? `All (${appointments.length})`
                : `${f} (${appointments.filter((a) => a.appointmentStatus === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="glass-card border border-white/10">
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <svg
                className="w-16 h-16 text-slate-700"
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
              <p className="text-slate-400 font-medium">No appointments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Appointment</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((apt) => (
                    <tr key={apt._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(apt.patient?.name || "P")[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {apt.patient?.name || "Unknown"}
                            </p>
                            <p className="text-slate-500 text-xs truncate">
                              {apt.patient?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {apt.doctor?.doctorName || "Unknown"}
                          </p>
                          <p className="text-cyan-400 text-xs">
                            {apt.doctor?.specialization}
                          </p>
                        </div>
                      </td>
                      <td>
                        <p className="text-slate-300 text-sm">
                          {new Date(apt.appointmentDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {apt.appointmentTime}
                        </p>
                      </td>
                      <td>
                        <StatusBadge status={apt.appointmentStatus} />
                      </td>
                      <td>
                        <StatusBadge status={apt.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}