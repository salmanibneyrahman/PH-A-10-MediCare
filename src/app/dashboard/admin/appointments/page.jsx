"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, TextField, Label, Input, Avatar } from "@heroui/react";
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
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          // Flat fields — there is no nested `patient` / `doctor` object,
          // so the old a.patient?.name never matched anything.
          a.patientName?.toLowerCase().includes(q) ||
          a.patientEmail?.toLowerCase().includes(q) ||
          a.doctorName?.toLowerCase().includes(q) ||
          a.specialization?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, appointments, activeFilter]);

  const handleSearchChange = useCallback((value) => setSearch(value), []);

  const statusFilters = [
    "all",
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ];

  if (loading) return <LoadingSpinner text="Loading appointments..." />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Manage Appointments
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Monitor all platform appointments and their statuses
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <TextField
          name="search"
          value={search}
          onChange={handleSearchChange}
          className="w-full"
        >
          <Label className="sr-only">Search appointments</Label>
          <div className="relative w-full">
            <svg
              className="w-4 h-4 text-slate-500 shrink-0 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
            <Input
              placeholder="Search by patient or doctor name..."
              className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
            />
          </div>
        </TextField>

        <div className="flex gap-1 p-1 rounded-xl glass-card border border-white/10 overflow-x-auto lg:shrink-0">
          {statusFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${activeFilter === f
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
            >
              {f === "all"
                ? `All (${appointments.length})`
                : `${f} (${appointments.filter((a) => a.appointmentStatus === f).length
                })`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="glass-card border border-white/10">
        <Card.Content className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
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
              <p className="text-slate-400 font-medium">
                No appointments found
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden divide-y divide-white/5">
                {filtered.map((apt) => (
                  <div key={apt._id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" className="shrink-0">
                        {apt.patientPhoto && (
                          <Avatar.Image
                            src={apt.patientPhoto}
                            alt={apt.patientName || "Patient"}
                          />
                        )}
                        <Avatar.Fallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                          {(apt.patientName || "P")[0]?.toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-semibold truncate">
                          {apt.patientName || "Unknown"}
                        </p>
                        <p className="text-slate-500 text-xs truncate">
                          {apt.patientEmail}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-slate-500 text-xs">Doctor</p>
                        <p className="text-white text-sm font-medium truncate">
                          {apt.doctorName || "Unknown"}
                        </p>
                        <p className="text-cyan-400 text-xs truncate">
                          {apt.specialization}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-slate-300 text-xs">
                          {new Date(apt.appointmentDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {apt.appointmentTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={apt.appointmentStatus} />
                      <StatusBadge status={apt.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="glass-table w-full min-w-[760px]">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date &amp; Time</th>
                      <th>Appointment</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((apt) => (
                      <tr key={apt._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Avatar size="sm" className="shrink-0">
                              {apt.patientPhoto && (
                                <Avatar.Image
                                  src={apt.patientPhoto}
                                  alt={apt.patientName || "Patient"}
                                />
                              )}
                              <Avatar.Fallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                                {(apt.patientName || "P")[0]?.toUpperCase()}
                              </Avatar.Fallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {apt.patientName || "Unknown"}
                              </p>
                              <p className="text-slate-500 text-xs truncate">
                                {apt.patientEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {apt.doctorName || "Unknown"}
                            </p>
                            <p className="text-cyan-400 text-xs">
                              {apt.specialization}
                            </p>
                          </div>
                        </td>
                        <td>
                          <p className="text-slate-300 text-sm">
                            {new Date(apt.appointmentDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
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
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}