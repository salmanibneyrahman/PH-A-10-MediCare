"use client";

import { useState, useEffect } from "react";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@heroui/react";
import { getStripe, stripeAppearance } from "@/lib/stripe";
import { createPaymentIntent, confirmPayment } from "@/lib/api";
import { toast } from "react-toastify";

const stripePromise = getStripe();

/** The actual form. Must live inside <Elements> to use the hooks. */
function CheckoutForm({ appointment, clientSecret, paymentIntentId, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setErrorMessage("");

        // redirect: "if_required" keeps the user on this page for card
        // payments; only 3D Secure flows will navigate away.
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/patient/appointments`,
            },
            redirect: "if_required",
        });

        if (error) {
            setErrorMessage(error.message || "Payment failed. Please try again.");
            setProcessing(false);
            return;
        }

        if (paymentIntent?.status === "succeeded") {
            try {
                // Record it server-side. The backend re-checks the intent
                // with Stripe, so a spoofed call can't mark it paid.
                await confirmPayment({
                    paymentIntentId: paymentIntent.id || paymentIntentId,
                    appointmentId: appointment._id,
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                    amount: appointment.consultationFee,
                });
                toast.success("Payment successful! Your appointment is confirmed.");
                onSuccess?.();
            } catch (err) {
                // Money was taken but our record failed — tell them clearly.
                toast.error(
                    "Payment went through but we could not save the record. Please contact support."
                );
                setErrorMessage(err?.message || "Could not record payment.");
            }
        } else {
            setErrorMessage(`Payment status: ${paymentIntent?.status}`);
        }
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <PaymentElement options={{ layout: "tabs" }} />

            {errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25">
                    <svg
                        className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-red-400 text-xs leading-relaxed">{errorMessage}</p>
                </div>
            )}

            <div className="flex items-center gap-3 pt-1">
                <Button
                    type="button"
                    onPress={onCancel}
                    isDisabled={processing}
                    className="flex-1 bg-transparent border border-white/15 text-slate-300 hover:bg-white/5 h-11 rounded-xl font-semibold"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    isDisabled={!stripe || processing}
                    isPending={processing}
                    className="flex-[2] bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity"
                >
                    {processing
                        ? "Processing..."
                        : `Pay $${appointment.consultationFee}`}
                </Button>
            </div>

            <p className="text-slate-500 text-[11px] text-center leading-relaxed">
                Payments are processed securely by Stripe. We never see or store
                your card details.
            </p>
        </form>
    );
}

export default function PaymentModal({ appointment, isOpen, onClose, onSuccess }) {
    const [clientSecret, setClientSecret] = useState("");
    const [paymentIntentId, setPaymentIntentId] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        if (!isOpen || !appointment?._id) return;

        let cancelled = false;
        async function createIntent() {
            setLoading(true);
            setLoadError("");
            try {
                const data = await createPaymentIntent({
                    amount: appointment.consultationFee,
                    appointmentId: appointment._id,
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                });
                if (cancelled) return;
                setClientSecret(data.clientSecret);
                setPaymentIntentId(data.paymentIntentId);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err?.message || "Could not start payment.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        createIntent();

        return () => {
            cancelled = true;
        };
    }, [isOpen, appointment?._id, appointment?.consultationFee, appointment?.patientId, appointment?.doctorId]);

    if (!isOpen) return null;

    return (
        // Plain overlay instead of HeroUI Modal: the Stripe iframe needs a
        // stable container, and this keeps the backdrop properly opaque.
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d1b2a] border border-white/15 shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10">
                    <div>
                        <h3 className="text-white font-bold text-lg">
                            Complete Payment
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                            {appointment?.doctorName} &middot;{" "}
                            {appointment?.appointmentDate} at{" "}
                            {appointment?.appointmentTime}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/10">
                    <span className="text-slate-400 text-sm">Consultation fee</span>
                    <span className="text-emerald-400 font-black text-2xl">
                        ${appointment?.consultationFee}
                    </span>
                </div>

                {/* Body */}
                <div className="p-5">
                    {loading && (
                        <div className="flex flex-col items-center gap-3 py-10">
                            <div className="spinner" />
                            <p className="text-slate-400 text-sm">
                                Setting up secure payment...
                            </p>
                        </div>
                    )}

                    {loadError && (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <svg
                                className="w-10 h-10 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-red-400 text-sm">{loadError}</p>
                            <Button
                                onPress={onClose}
                                className="bg-transparent border border-white/15 text-slate-300 h-9 px-4 rounded-lg"
                            >
                                Close
                            </Button>
                        </div>
                    )}

                    {!loading && !loadError && clientSecret && stripePromise && (
                        <Elements
                            stripe={stripePromise}
                            options={{ clientSecret, appearance: stripeAppearance }}
                        >
                            <CheckoutForm
                                appointment={appointment}
                                clientSecret={clientSecret}
                                paymentIntentId={paymentIntentId}
                                onSuccess={onSuccess}
                                onCancel={onClose}
                            />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    );
}