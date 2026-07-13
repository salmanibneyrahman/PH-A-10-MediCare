"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { getDoctorByEmail, updateDoctor } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PRESET_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [modalType, setModalType] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [newSlotError, setNewSlotError] = useState("");
  const [selectedSlotToRemove, setSelectedSlotToRemove] = useState("");

  const [availableDays, setAvailableDays] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchDoctor();
  }, [user]);

  async function fetchDoctor() {
    if (!user?.email) return;
    setLoading(true);
    try {
      const doc = await getDoctorByEmail(user.email);
      setDoctor(doc);
      setAvailableDays(doc.availableDays || []);
      setAvailableSlots(doc.availableSlots || []);
    } catch {
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }

  const handleDayToggle = (day) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveDays = async () => {
    setSaveLoading(true);
    try {
      await updateDoctor(doctor._id, { availableDays });
      toast.success("Available days updated successfully!");
      fetchDoctor();
    } catch {
      toast.error("Failed to update days");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.trim()) {
      setNewSlotError("Please enter a time slot");
      return;
    }
    if (availableSlots.includes(newSlot.trim())) {
      setNewSlotError("This slot already exists");
      return;
    }
    setSaveLoading(true);
    try {
      const updatedSlots = [...availableSlots, newSlot.trim()];
      await updateDoctor(doctor._id, { availableSlots: updatedSlots });
      toast.success("Time slot added!");
      setNewSlot("");
      setNewSlotError("");
      onClose();
      fetchDoctor();
    } catch {
      toast.error("Failed to add slot");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddPresetSlot = async (slot) => {
    if (availableSlots.includes(slot)) {
      toast.error("This slot is already added");
      return;
    }
    setSaveLoading(true);
    try {
      const updatedSlots = [...availableSlots, slot];
      await updateDoctor(doctor._id, { availableSlots: updatedSlots });
      toast.success(`${slot} slot added!`);
      fetchDoctor();
    } catch {
      toast.error("Failed to add slot");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRemoveSlot = async () => {
    if (!selectedSlotToRemove) return;
    setSaveLoading(true);
    try {
      const updatedSlots = availableSlots.filter(
        (s) => s !== selectedSlotToRemove
      );
      await updateDoctor(doctor._id, { availableSlots: updatedSlots });
      toast.success("Time slot removed!");
      setSelectedSlotToRemove("");
      onClose();
      fetchDoctor();
    } catch {
      toast.error("Failed to remove slot");
    } finally {
      setSaveLoading(false);
    }
  };

  const openAddModal = () => {
    setModalType("add");
    setNewSlot("");
    setNewSlotError("");
    onOpen();
  };

  const openRemoveModal = (slot) => {
    setSelectedSlotToRemove(slot);
    setModalType("remove");
    onOpen();
  };

  if (loading) return <LoadingSpinner text="Loading schedule..." />;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Manage Schedule</h1>
          <p className="text-slate-400 text-sm mt-1">
            Set your available days and time slots for patient appointments
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-lg shadow-cyan-500/20"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
        >
          Add Custom Slot
        </Button>
      </div>

      {/* Available Days */}
      <Card className="glass-card border border-white/10">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-indigo-400"
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
              </div>
              Available Days
            </h2>
            <Button
              onClick={handleSaveDays}
              isLoading={saveLoading}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold"
            >
              Save Days
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {ALL_DAYS.map((day) => {
              const isSelected = availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/10"
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-cyan-500/20"
                        : "bg-white/5"
                    }`}
                  >
                    {isSelected ? (
                      <svg
                        className="w-4 h-4 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-center">
                    {day.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {availableDays.length} day{availableDays.length !== 1 ? "s" : ""}{" "}
            selected. Click days to toggle, then save.
          </div>
        </CardBody>
      </Card>

      {/* Time Slots */}
      <Card className="glass-card border border-white/10">
        <CardBody className="p-6">
          <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-cyan-400"
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
            </div>
            Active Time Slots
          </h2>

          {availableSlots.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">No Time Slots Added</p>
                <p className="text-slate-400 text-sm mt-1">
                  Add preset slots below or create a custom one.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {availableSlots.map((slot) => (
                <div
                  key={slot}
                  className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-cyan-400"
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
                    <span className="text-cyan-400 text-sm font-semibold">
                      {slot}
                    </span>
                  </div>
                  <button
                    onClick={() => openRemoveModal(slot)}
                    className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Preset Slots */}
          <div className="border-t border-white/5 pt-6">
            <p className="text-slate-400 text-sm font-medium mb-4">
              Quick Add Preset Slots
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {PRESET_SLOTS.map((slot) => {
                const isAdded = availableSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => !isAdded && handleAddPresetSlot(slot)}
                    disabled={isAdded}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isAdded
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                        : "bg-white/5 border-white/10 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-cyan-500/5"
                    }`}
                  >
                    {isAdded ? (
                      <span className="flex items-center gap-1 justify-center">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {slot}
                      </span>
                    ) : (
                      slot
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Add Custom Slot Modal */}
      <Modal
        isOpen={isOpen && modalType === "add"}
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
            <h3 className="text-white font-bold">Add Custom Time Slot</h3>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-3 py-2">
              <Input
                label="Time Slot"
                placeholder="e.g. 7:30 AM or 8:00 PM"
                value={newSlot}
                onValueChange={(v) => {
                  setNewSlot(v);
                  if (newSlotError) setNewSlotError("");
                }}
                isInvalid={!!newSlotError}
                errorMessage={newSlotError}
                classNames={{
                  inputWrapper:
                    "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all data-[invalid=true]:border-red-500/60",
                  input: "text-slate-200 placeholder:text-slate-500 text-sm",
                  label: "text-slate-400 text-sm",
                  errorMessage: "text-red-400 text-xs",
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <p className="text-slate-500 text-xs">
                Enter time in format like &quot;9:30 AM&quot; or &quot;4:30 PM&quot;
              </p>
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
              onPress={handleAddSlot}
              isLoading={saveLoading}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold"
            >
              Add Slot
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Remove Slot Modal */}
      <Modal
        isOpen={isOpen && modalType === "remove"}
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
            <h3 className="text-white font-bold">Remove Time Slot</h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-slate-400 text-sm py-2">
              Are you sure you want to remove the{" "}
              <span className="text-cyan-400 font-semibold">
                {selectedSlotToRemove}
              </span>{" "}
              time slot from your schedule?
            </p>
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
              onPress={handleRemoveSlot}
              isLoading={saveLoading}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold"
            >
              Remove Slot
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}