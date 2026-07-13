"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import {
  getDoctorAppointments,
  getPrescriptionByAppointment,
  createPrescription,
  updatePrescription,
  getDoctorByEmail,
} from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "react-toastify";

export default function DoctorPrescriptionsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const prefilledId = searchParams.get("appointmentId");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({
    diagnosis: "",
    medications: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    if (!user?.email) return;
    setLoading(true);
    try {
      const doc = await getDoctorByEmail(user.email);
      setDoctor(doc);

      const apts = await getDoctorAppointments(
        doc._id.toString()
      );
      const completed = (apts || []).filter(
        (a) => a.appointmentStatus === "completed"
      );
      setAppointments(completed);

      const presMap = {};
      await Promise.all(
        completed.map(async (apt) => {
          try {
            const pres = await getPrescriptionByAppointment(
              apt._id
            );
            presMap[apt._id] = pres;
          } catch {
            presMap[apt._id] = null;
          }
        })
      );
      setPrescriptions(presMap);

      if (prefilledId) {
        const apt = completed.find((a) => a._id === prefilledId);
        if (apt) {
          openCreateModal(apt, doc);
        }
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const validate = () => {
    const errs = {};
    if (!formData.diagnosis.trim())
      errs.diagnosis = "Diagnosis is required";
    if (!formData.medications.trim())
      errs.medications = "Medications are required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreateModal = (apt, doc = doctor) => {
    setSelectedApt(apt);
    setModalType("create");
    setFormData({ diagnosis: "", medications: "", notes: "" });
    setFormErrors({});
    onOpen();
  };

  const openEditModal = (apt) => {
    const pres = prescriptions[apt._id];
    setSelectedApt(apt);
    setModalType("edit");
    setFormData({
      diagnosis: pres?.diagnosis || "",
      medications: pres?.medications || "",
      notes: pres?.notes || "",
    });
    setFormErrors({});
    onOpen();
  };

  const handleCreate = async () => {
    if (!validate() || !doctor || !selectedApt) return;
    setActionLoading(true);
    try {
      await createPrescription({
        doctorId: doctor._id.toString(),
        patientId: selectedApt.patientId,
        appointmentId: selectedApt._id,
        diagnosis: formData.diagnosis.trim(),
        medications: formData.medications.trim(),
        notes: formData.notes.trim(),
      });
      toast.success("Prescription created successfully!");
      onClose();
      fetchData();
    } catch {
      toast.error("Failed to create prescription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validate() || !selectedApt) return;
    setActionLoading(true);
    try {
      const pres = prescriptions[selectedApt._id];
      await updatePrescription(pres._id, {
        diagnosis: formData.diagnosis.trim(),
        medications: formData.medications.trim(),
        notes: formData.notes.trim(),
      });
      toast.success("Prescription updated successfully!");
      onClose();
      fetchData();
    } catch {
      toast.error("Failed to update prescription");
    } finally {
      setActionLoading(false);
    }
  };

  const inputClass = {
    inputWrapper:
      "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all data-[invalid=true]:border-red-500/60",
    input: "text-slate-200 placeholder:text-slate-500 text-sm",
    label: "text-slate-400 text-sm",
    errorMessage: "text-red-400 text-xs",
  };

  if (loading)
    return <LoadingSpinner text="Loading prescriptions..." />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-white">
          Prescription Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Create and manage prescriptions for completed appointments
        </p>
      </div>

      {appointments.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                No Completed Appointments
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Prescriptions can only be created for completed
                appointments.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((apt) => {
            const prescription = prescriptions[apt._id];
            return (
              <Card
                key={apt._id}
                className={`glass-card border transition-all ${
                  prescription
                    ? "border-emerald-500/20"
                    : "border-white/10 hover:border-cyan-500/20"
                }`}
              >
                <CardBody className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-lg">
                            {(apt.patientName || "P")[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-bold">
                            {apt.patientName || "Patient"}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {new Date(
                              apt.appointmentDate
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            • {apt.appointmentTime}
                          </p>
                        </div>
                      </div>

                      {apt.symptoms && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-slate-500 text-xs font-medium mb-1">
                            Reported Symptoms
                          </p>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {apt.symptoms}
                          </p>
                        </div>
                      )}

                      {prescription && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-emerald-400"
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
                            </div>
                            <span className="text-emerald-400 text-xs font-semibold">
                              Prescription Created
                            </span>
                          </div>
                          {[
                            {
                              label: "Diagnosis",
                              value: prescription.diagnosis,
                              color: "text-cyan-300",
                            },
                            {
                              label: "Medications",
                              value: prescription.medications,
                              color: "text-indigo-300",
                            },
                            prescription.notes && {
                              label: "Notes",
                              value: prescription.notes,
                              color: "text-slate-300",
                            },
                          ]
                            .filter(Boolean)
                            .map((item) => (
                              <div
                                key={item.label}
                                className="p-3 rounded-xl bg-white/5 border border-white/5"
                              >
                                <p className="text-slate-500 text-xs font-medium mb-1">
                                  {item.label}
                                </p>
                                <p
                                  className={`text-sm leading-relaxed ${item.color}`}
                                >
                                  {item.value}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 items-start lg:items-end shrink-0">
                      <StatusBadge
                        status={apt.appointmentStatus}
                      />
                      {!prescription ? (
                        <Button
                          size="sm"
                          onClick={() => openCreateModal(apt)}
                          className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20"
                          startContent={
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          }
                        >
                          Create Prescription
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openEditModal(apt)}
                          variant="bordered"
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                        >
                          Edit Prescription
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        classNames={{
          base: "glass-card border border-white/10",
          header: "border-b border-white/10",
          body: "py-6",
          footer: "border-t border-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex flex-col gap-1">
              <h3 className="text-white font-bold text-lg">
                {modalType === "create"
                  ? "Create Prescription"
                  : "Update Prescription"}
              </h3>
              {selectedApt && (
                <p className="text-slate-400 text-sm font-normal">
                  For {selectedApt.patientName || "Patient"} •{" "}
                  {selectedApt.appointmentDate}
                </p>
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Diagnosis"
                placeholder="Enter the diagnosis..."
                value={formData.diagnosis}
                onValueChange={(v) => {
                  setFormData((p) => ({ ...p, diagnosis: v }));
                  if (formErrors.diagnosis)
                    setFormErrors((p) => ({
                      ...p,
                      diagnosis: "",
                    }));
                }}
                isInvalid={!!formErrors.diagnosis}
                errorMessage={formErrors.diagnosis}
                classNames={inputClass}
              />
              <Textarea
                label="Medications"
                placeholder="List medications, dosages and instructions..."
                value={formData.medications}
                onValueChange={(v) => {
                  setFormData((p) => ({ ...p, medications: v }));
                  if (formErrors.medications)
                    setFormErrors((p) => ({
                      ...p,
                      medications: "",
                    }));
                }}
                isInvalid={!!formErrors.medications}
                errorMessage={formErrors.medications}
                minRows={3}
                classNames={inputClass}
              />
              <Textarea
                label="Additional Notes (Optional)"
                placeholder="Any additional instructions or follow-up advice..."
                value={formData.notes}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, notes: v }))
                }
                minRows={2}
                classNames={inputClass}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={onClose}
              className="border-white/15 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onPress={
                modalType === "create" ? handleCreate : handleUpdate
              }
              isLoading={actionLoading}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20"
            >
              {modalType === "create"
                ? "Create Prescription"
                : "Update Prescription"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}