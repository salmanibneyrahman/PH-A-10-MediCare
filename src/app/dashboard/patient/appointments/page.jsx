"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import {
  getPatientAppointments,
  cancelAppointment,
  rescheduleAppointment,
} from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export default function PatientAppointmentsPage() {
  const { dbUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalType, setModalType] = useState("");
  const [rescheduleData, setRescheduleData] = useState({
    appointmentDate: "",
    appointmentTime: "",
  });
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, [dbUser]);

  async function fetchAppointments() {
    if (!dbUser?._id) return;
    setLoading(true);
    try {
      const data = await getPatientAppointments(
        dbUser._id.toString()
      );
      setAppointments(data || []);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  const openModal = (apt, type) => {
    setSelectedApt(apt);
    setModalType(type);
    if (type === "reschedule") {
      setRescheduleData({
        appointmentDate: apt.appointmentDate || "",
        appointmentTime: apt.appointmentTime || "",
      });
    }
    onOpen();
  };

  const handleCancel = async () => {
    if (!selectedApt) return;
    setActionLoading(true);
    try {
      await cancelAppointment(selectedApt._id);
      toast.success("Appointment cancelled successfully");
      onClose();
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedApt) return;
    if (
      !rescheduleData.appointmentDate ||
      !rescheduleData.appointmentTime
    ) {
      toast.error("Please select a date and time");
      return;
    }
    setActionLoading(true);
    try {
      await rescheduleAppointment(selectedApt._id, rescheduleData);
      toast.success("Appointment rescheduled successfully");
      onClose();
      fetchAppointments();
    } catch {
      toast.error("Failed to reschedule appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const statusFilters = [
    "all",
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ];

  const filtered =
    activeFilter === "all"
      ? appointments
      : appointments.filter(
          (a) => a.appointmentStatus === activeFilter
        );

  if (loading)
    return <LoadingSpinner text="Loading your appointments..." />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            My Appointments
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage and track all your appointments
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-sm font-medium">
            {appointments.length} Total
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 rounded-xl glass-card border border-white/10 overflow-x-auto">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-1 min-w-fit px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              activeFilter === f
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {f === "all"
              ? `All (${appointments.length})`
              : `${f} (${appointments.filter((a) => a.appointmentStatus === f).length})`}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                No Appointments Found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {activeFilter === "all"
                  ? "Book your first appointment with one of our verified doctors."
                  : `No ${activeFilter} appointments found.`}
              </p>
            </div>
            {activeFilter === "all" && (
              <Button
                as="a"
                href="/find-doctors"
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold"
              >
                Find a Doctor
              </Button>
            )}
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
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 flex items-center justify-center shrink-0">
                      <svg
                        className="w-6 h-6 text-cyan-400"
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
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold truncate">
                        {apt.doctorName || "Unknown Doctor"}
                      </p>
                      <p className="text-cyan-400 text-sm">
                        {apt.specialization}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
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
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <svg
                            className="w-3.5 h-3.5"
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
                        {apt.consultationFee > 0 && (
                          <span className="text-emerald-400 text-xs font-semibold">
                            ${apt.consultationFee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {apt.symptoms && (
                    <div className="hidden lg:block max-w-xs">
                      <p className="text-slate-500 text-xs mb-1">
                        Symptoms
                      </p>
                      <p className="text-slate-300 text-sm line-clamp-2">
                        {apt.symptoms}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 items-start sm:items-end shrink-0">
                    <div className="flex gap-2 flex-wrap">
                      <StatusBadge status={apt.appointmentStatus} />
                      <StatusBadge status={apt.paymentStatus} />
                    </div>
                    {(apt.appointmentStatus === "pending" ||
                      apt.appointmentStatus === "confirmed") && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="bordered"
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                          onClick={() => openModal(apt, "reschedule")}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="bordered"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                          onClick={() => openModal(apt, "cancel")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {apt.appointmentStatus === "completed" && (
                      <Button
                        size="sm"
                        as="a"
                        href="/dashboard/patient/reviews"
                        className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs"
                      >
                        Leave Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={isOpen && modalType === "cancel"}
        onClose={onClose}
        size="sm"
        classNames={{
          base: "glass-card border border-white/10",
          header: "border-b border-white/10",
          footer: "border-t border-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-white font-bold">
              Cancel Appointment
            </h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-slate-400 text-sm py-2">
              Are you sure you want to cancel your appointment with{" "}
              <span className="text-white font-semibold">
                {selectedApt?.doctorName}
              </span>{" "}
              on {selectedApt?.appointmentDate}? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={onClose}
              className="border-white/15 text-slate-300"
            >
              Keep Appointment
            </Button>
            <Button
              onPress={handleCancel}
              isLoading={actionLoading}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold"
            >
              Yes, Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isOpen && modalType === "reschedule"}
        onClose={onClose}
        size="md"
        classNames={{
          base: "glass-card border border-white/10",
          header: "border-b border-white/10",
          footer: "border-t border-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-white font-bold">
              Reschedule Appointment
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-sm font-medium">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleData.appointmentDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setRescheduleData((p) => ({
                      ...p,
                      appointmentDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 hover:border-white/20 transition-all [color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-sm font-medium">
                  New Time Slot
                </label>
                <Select
                  placeholder="Select time"
                  selectedKeys={
                    rescheduleData.appointmentTime
                      ? [rescheduleData.appointmentTime]
                      : []
                  }
                  onSelectionChange={(keys) =>
                    setRescheduleData((p) => ({
                      ...p,
                      appointmentTime: Array.from(keys)[0] || "",
                    }))
                  }
                  classNames={{
                    trigger:
                      "bg-white/5 border border-white/10 hover:border-cyan-500/40 data-[focus=true]:border-cyan-500 transition-all",
                    value: "text-slate-200 text-sm",
                    listbox: "bg-[#0d1b2a]",
                    popoverContent:
                      "bg-[#0d1b2a] border border-white/10",
                  }}
                >
                  {TIME_SLOTS.map((t) => (
                    <SelectItem
                      key={t}
                      className="text-slate-300 hover:bg-white/5 data-[hover=true]:bg-white/5"
                    >
                      {t}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={onClose}
              className="border-white/15 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onPress={handleReschedule}
              isLoading={actionLoading}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold"
            >
              Reschedule
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}