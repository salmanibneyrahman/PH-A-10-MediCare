"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  Button,
  TextField,
  Label,
  Input,
  TextArea,
  FieldError,
  Modal,
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

  const [isOpen, setIsOpen] = useState(false);
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

  // THE REOPEN BUG: ?appointmentId=... stays in the URL, so every
  // fetchData() after saving re-opened the modal. Only honour it once.
  const prefillHandled = useRef(false);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalType("");
    setSelectedApt(null);
    setFormData({ diagnosis: "", medications: "", notes: "" });
    setFormErrors({});
  }, []);

  const openCreateModal = useCallback((apt) => {
    setSelectedApt(apt);
    setModalType("create");
    setFormData({ diagnosis: "", medications: "", notes: "" });
    setFormErrors({});
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback(
    (apt) => {
      const pres = prescriptions[apt._id];
      setSelectedApt(apt);
      setModalType("edit");
      setFormData({
        diagnosis: pres?.diagnosis || "",
        medications: pres?.medications || "",
        notes: pres?.notes || "",
      });
      setFormErrors({});
      setIsOpen(true);
    },
    [prescriptions]
  );

  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const doc = await getDoctorByEmail(user.email);
      setDoctor(doc);

      const apts = await getDoctorAppointments(doc._id.toString());
      const completed = (apts || []).filter(
        (a) => a.appointmentStatus === "completed"
      );
      setAppointments(completed);

      const presMap = {};
      await Promise.all(
        completed.map(async (apt) => {
          try {
            presMap[apt._id] = await getPrescriptionByAppointment(apt._id);
          } catch {
            presMap[apt._id] = null;
          }
        })
      );
      setPrescriptions(presMap);

      // Open the prefilled appointment only on the very first load.
      if (prefilledId && !prefillHandled.current) {
        prefillHandled.current = true;
        const apt = completed.find(
          (a) => a._id?.toString() === prefilledId.toString()
        );
        if (apt && !presMap[apt._id]) {
          openCreateModal(apt);
        }
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user?.email, prefilledId, openCreateModal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validate = () => {
    const errs = {};
    if (!formData.diagnosis.trim()) errs.diagnosis = "Diagnosis is required";
    if (!formData.medications.trim())
      errs.medications = "Medications are required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
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
      closeModal();
      await fetchData();
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
      // Must reset modalType too — leaving it set let the modal
      // re-trigger on the next state change.
      closeModal();
      await fetchData();
    } catch {
      toast.error("Failed to update prescription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiagnosisChange = useCallback((value) => {
    setFormData((p) => ({ ...p, diagnosis: value }));
    setFormErrors((p) => (p.diagnosis ? { ...p, diagnosis: "" } : p));
  }, []);

  const handleMedicationsChange = useCallback((value) => {
    setFormData((p) => ({ ...p, medications: value }));
    setFormErrors((p) => (p.medications ? { ...p, medications: "" } : p));
  }, []);

  const handleNotesChange = useCallback((value) => {
    setFormData((p) => ({ ...p, notes: value }));
  }, []);

  const inputClass =
    "w-full px-3 py-2 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none";

  if (loading) return <LoadingSpinner text="Loading prescriptions..." />;

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
          <Card.Content className="p-16 flex flex-col items-center gap-4 text-center">
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
                Prescriptions can only be created for completed appointments.
              </p>
            </div>
          </Card.Content>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((apt) => {
            const prescription = prescriptions[apt._id];
            return (
              <Card
                key={apt._id}
                className={`glass-card border transition-all ${prescription
                    ? "border-emerald-500/20"
                    : "border-white/10 hover:border-cyan-500/20"
                  }`}
              >
                <Card.Content className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-lg">
                            {(apt.patientName || "P")[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-bold">
                            {apt.patientName || "Patient"}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {new Date(apt.appointmentDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}{" "}
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
                                  className={`text-sm leading-relaxed whitespace-pre-line ${item.color}`}
                                >
                                  {item.value}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 items-start lg:items-end shrink-0">
                      <StatusBadge status={apt.appointmentStatus} />
                      {!prescription ? (
                        <Button
                          size="sm"
                          onPress={() => openCreateModal(apt)}
                          className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 h-8 px-3 rounded-lg flex items-center gap-1.5"
                        >
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
                          Create Prescription
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onPress={() => openEditModal(apt)}
                          className="bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs h-8 px-3 rounded-lg"
                        >
                          Edit Prescription
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen}
          onOpenChange={(open) => {
            // Route every close through closeModal so modalType,
            // selectedApt and the form all reset together.
            if (!open) closeModal();
            else setIsOpen(true);
          }}
        >
          <Modal.Container size="lg">
            <Modal.Dialog className="bg-[#0d1b2a] border border-white/15">
              <Modal.Header className="border-b border-white/10 py-6">
                <div className="flex flex-col gap-1">
                  <Modal.Heading className="text-white font-bold text-lg">
                    {modalType === "create"
                      ? "Create Prescription"
                      : "Update Prescription"}
                  </Modal.Heading>
                  {selectedApt && (
                    <p className="text-slate-400 text-sm font-normal">
                      For {selectedApt.patientName || "Patient"} •{" "}
                      {selectedApt.appointmentDate}
                    </p>
                  )}
                </div>
              </Modal.Header>

              <Modal.Body className="py-6">
                <div className="flex flex-col gap-4">
                  <TextField
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleDiagnosisChange}
                    isInvalid={!!formErrors.diagnosis}
                    className="w-full"
                  >
                    <Label className="text-slate-400 text-sm mb-1.5 block">
                      Diagnosis
                    </Label>
                    <Input
                      placeholder="Enter the diagnosis..."
                      className={inputClass}
                    />
                    {formErrors.diagnosis && (
                      <FieldError className="text-red-400 text-xs mt-1">
                        {formErrors.diagnosis}
                      </FieldError>
                    )}
                  </TextField>

                  <TextField
                    name="medications"
                    value={formData.medications}
                    onChange={handleMedicationsChange}
                    isInvalid={!!formErrors.medications}
                    className="w-full"
                  >
                    <Label className="text-slate-400 text-sm mb-1.5 block">
                      Medications
                    </Label>
                    <TextArea
                      placeholder="One per line, e.g.&#10;Paracetamol 500mg — twice daily after meals&#10;Amoxicillin 250mg — three times daily for 7 days"
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                    {formErrors.medications && (
                      <FieldError className="text-red-400 text-xs mt-1">
                        {formErrors.medications}
                      </FieldError>
                    )}
                    <p className="text-slate-600 text-xs mt-1">
                      Put each medication on its own line.
                    </p>
                  </TextField>

                  <TextField
                    name="notes"
                    value={formData.notes}
                    onChange={handleNotesChange}
                    className="w-full"
                  >
                    <Label className="text-slate-400 text-sm mb-1.5 block">
                      Additional Notes (Optional)
                    </Label>
                    <TextArea
                      placeholder="Any additional instructions or follow-up advice..."
                      rows={3}
                      className={`${inputClass} resize-none`}
                    />
                  </TextField>
                </div>
              </Modal.Body>

              <Modal.Footer className="border-t border-white/10">
                <Button
                  onPress={closeModal}
                  className="bg-transparent border border-white/15 text-slate-300 hover:bg-white/5 h-9 px-4 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onPress={modalType === "create" ? handleCreate : handleUpdate}
                  isPending={actionLoading}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20 h-9 px-4 rounded-lg"
                >
                  {actionLoading
                    ? "Saving..."
                    : modalType === "create"
                      ? "Create Prescription"
                      : "Update Prescription"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}