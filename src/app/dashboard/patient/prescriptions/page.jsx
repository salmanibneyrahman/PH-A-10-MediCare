"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, Modal } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import {
    getPatientPrescriptions,
    getPatientAppointments,
} from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

export default function PatientPrescriptionsPage() {
    const { dbUser } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!dbUser?._id) return;
        setLoading(true);
        try {
            const patientId = dbUser._id.toString();
            const [presData, aptData] = await Promise.all([
                getPatientPrescriptions(patientId),
                getPatientAppointments(patientId),
            ]);
            setPrescriptions(presData || []);
            setAppointments(aptData || []);
        } catch {
            toast.error("Failed to load prescriptions");
        } finally {
            setLoading(false);
        }
    }, [dbUser?._id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Prescriptions only store appointmentId, so pull the doctor/date
    // details from the matching appointment.
    const getAppointment = useCallback(
        (appointmentId) =>
            appointments.find((a) => a._id?.toString() === appointmentId?.toString()),
        [appointments]
    );

    const openDetails = (pres) => {
        setSelected(pres);
        setIsOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    // Medications may be a string or an array depending on how the
    // doctor filled the form.
    const parseMeds = (meds) => {
        if (Array.isArray(meds)) return meds.filter(Boolean);
        if (typeof meds === "string" && meds.trim())
            return meds
                .split("\n")
                .map((m) => m.trim())
                .filter(Boolean);
        return [];
    };

    if (loading) return <LoadingSpinner text="Loading your prescriptions..." />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white">My Prescriptions</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Digital prescriptions issued by your doctors
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-400 text-sm font-medium">
                        {prescriptions.length} Prescription
                        {prescriptions.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {prescriptions.length === 0 ? (
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
                                No Prescriptions Yet
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                                Prescriptions appear here after a doctor completes your
                                appointment.
                            </p>
                        </div>
                    </Card.Content>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {prescriptions.map((pres) => {
                        const apt = getAppointment(pres.appointmentId);
                        const meds = parseMeds(pres.medications);
                        return (
                            <Card
                                key={pres._id}
                                className="glass-card border border-white/10 hover:border-emerald-500/25 transition-all"
                            >
                                <Card.Content className="p-5">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center shrink-0">
                                            <svg
                                                className="w-6 h-6 text-emerald-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                                <div className="min-w-0">
                                                    <p className="text-white font-bold truncate">
                                                        {apt?.doctorName || "Doctor"}
                                                    </p>
                                                    {apt?.specialization && (
                                                        <p className="text-cyan-400 text-sm">
                                                            {apt.specialization}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-slate-500 text-xs shrink-0">
                                                    {pres.createdAt
                                                        ? new Date(pres.createdAt).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            }
                                                        )
                                                        : "—"}
                                                </span>
                                            </div>

                                            <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">
                                                    Diagnosis
                                                </p>
                                                <p className="text-slate-200 text-sm">
                                                    {pres.diagnosis || "—"}
                                                </p>
                                            </div>

                                            {meds.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {meds.slice(0, 3).map((m, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                                        >
                                                            {m}
                                                        </span>
                                                    ))}
                                                    {meds.length > 3 && (
                                                        <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                                                            +{meds.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="shrink-0 flex sm:flex-col gap-2">
                                            <Button
                                                size="sm"
                                                onPress={() => openDetails(pres)}
                                                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs h-8 px-4 rounded-lg"
                                            >
                                                View Full
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Content>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Details Modal */}
            <Modal>
                <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
                    <Modal.Container size="md">
                        <Modal.Dialog className="bg-[#0d1b2a] border border-white/15">
                            <Modal.Header className="border-b border-white/10">
                                <div className="flex flex-col gap-0.5">
                                    <Modal.Heading className="text-white font-bold text-lg">
                                        Prescription
                                    </Modal.Heading>
                                    <p className="text-slate-400 text-xs">
                                        {getAppointment(selected?.appointmentId)?.doctorName ||
                                            "Doctor"}
                                        {" · "}
                                        {selected?.createdAt
                                            ? new Date(selected.createdAt).toLocaleDateString(
                                                "en-US",
                                                { year: "numeric", month: "long", day: "numeric" }
                                            )
                                            : "—"}
                                    </p>
                                </div>
                            </Modal.Header>

                            <Modal.Body>
                                <div className="flex flex-col gap-4 py-1">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1.5">
                                            Diagnosis
                                        </p>
                                        <p className="text-slate-200 text-sm leading-relaxed">
                                            {selected?.diagnosis || "—"}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                                            Medications
                                        </p>
                                        {parseMeds(selected?.medications).length === 0 ? (
                                            <p className="text-slate-500 text-sm">
                                                No medications listed.
                                            </p>
                                        ) : (
                                            <ul className="flex flex-col gap-2">
                                                {parseMeds(selected?.medications).map((m, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-2 text-slate-200 text-sm"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                        {m}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {selected?.notes && (
                                        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
                                            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wide mb-1.5">
                                                Doctor&apos;s Notes
                                            </p>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                {selected.notes}
                                            </p>
                                        </div>
                                    )}

                                    <p className="text-slate-600 text-[11px] text-center leading-relaxed">
                                        This is a digital prescription issued through MediCare
                                        Connect. Always follow your doctor&apos;s instructions.
                                    </p>
                                </div>
                            </Modal.Body>

                            <Modal.Footer className="border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 text-sm font-semibold transition-all hover:bg-white/5 active:scale-95"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                                >
                                    Print
                                </button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </div>
    );
}