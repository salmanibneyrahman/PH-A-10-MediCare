"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  Avatar,
  Chip,
  Select,
  SelectItem,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  getDoctorById,
  getDoctorReviews,
  createAppointment,
  createPaymentIntent,
  confirmPayment,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StarRating from "@/components/StarRating";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

export default function DoctorDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, dbUser, isAuthenticated } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [createdAppointmentId, setCreatedAppointmentId] =
    useState(null);
  const [bookingData, setBookingData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
  });
  const [bookingErrors, setBookingErrors] = useState({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [docData, reviewData] = await Promise.all([
          getDoctorById(id),
          getDoctorReviews(id),
        ]);
        setDoctor(docData);
        setReviews(reviewData);
      } catch {
        toast.error("Failed to load doctor details");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const validateBooking = () => {
    const errs = {};
    if (!bookingData.appointmentDate)
      errs.appointmentDate = "Please select a date";
    else {
      const selected = new Date(bookingData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today)
        errs.appointmentDate = "Date cannot be in the past";
    }
    if (!bookingData.appointmentTime)
      errs.appointmentTime = "Please select a time slot";
    if (!bookingData.symptoms.trim())
      errs.symptoms = "Please describe your symptoms";
    setBookingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book an appointment");
      router.push("/login");
      return;
    }
    if (!dbUser?._id) {
      toast.error("User data not loaded. Please try again.");
      return;
    }
    if (!validateBooking()) return;
    setBookingLoading(true);
    try {
      const result = await createAppointment({
        patientId: dbUser._id.toString(),
        patientName: user.name || "",
        patientEmail: user.email || "",
        doctorId: id,
        doctorName: doctor.doctorName,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee,
        appointmentDate: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        symptoms: bookingData.symptoms,
      });
      setCreatedAppointmentId(result.insertedId);
      onOpen();
    } catch (err) {
      toast.error(err.message || "Failed to create appointment");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleStripePayment = async () => {
    if (!createdAppointmentId || !dbUser?._id) return;
    setPaymentLoading(true);
    try {
      const intentData = await createPaymentIntent({
        amount: doctor.consultationFee,
        appointmentId: createdAppointmentId,
        patientId: dbUser._id.toString(),
        doctorId: id,
      });

      const confirmed = await confirmPayment({
        paymentIntentId: intentData.paymentIntentId,
        appointmentId: createdAppointmentId,
        patientId: dbUser._id.toString(),
        doctorId: id,
        amount: doctor.consultationFee,
      });

      toast.success(
        "Appointment booked and payment successful!"
      );
      onClose();
      router.push("/dashboard/patient/appointments");
    } catch (err) {
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "schedule", label: "Schedule" },
    { key: "reviews", label: `Reviews (${reviews.length})` },
    { key: "book", label: "Book Appointment" },
  ];

  if (loading)
    return (
      <LoadingSpinner
        fullScreen
        text="Loading doctor profile..."
      />
    );

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="text-white text-xl font-bold mb-4">
            Doctor not found
          </h2>
          <Button
            as={Link}
            href="/find-doctors"
            className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold"
          >
            Back to Doctors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link
            href="/"
            className="hover:text-cyan-400 transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/find-doctors"
            className="hover:text-cyan-400 transition-colors"
          >
            Find Doctors
          </Link>
          <span>/</span>
          <span className="text-slate-300">{doctor.doctorName}</span>
        </div>

        {/* Doctor Hero Card */}
        <Card className="glass-card border border-white/10 mb-8 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500" />
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative shrink-0">
                <Avatar
                  src={doctor.profileImage}
                  name={doctor.doctorName}
                  className="w-32 h-32 text-4xl ring-4 ring-cyan-500/30"
                  classNames={{
                    base: "bg-gradient-to-br from-cyan-500 to-indigo-600",
                    name: "text-white font-bold text-3xl",
                  }}
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0a0f1e] flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-white">
                      {doctor.doctorName}
                    </h1>
                    <Chip
                      className="mt-2 bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                      variant="flat"
                    >
                      {doctor.specialization}
                    </Chip>
                  </div>
                  <StatusBadge
                    status={doctor.verificationStatus}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Experience",
                      value: `${doctor.experience} Years`,
                      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                      color: "text-indigo-400",
                      bg: "bg-indigo-500/10",
                    },
                    {
                      label: "Consultation Fee",
                      value: `$${doctor.consultationFee}`,
                      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      label: "Rating",
                      value: doctor.averageRating
                        ? `${doctor.averageRating.toFixed(1)}/5`
                        : "New",
                      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                    },
                    {
                      label: "Reviews",
                      value: doctor.totalReviews || 0,
                      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                      color: "text-cyan-400",
                      bg: "bg-cyan-500/10",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`flex flex-col gap-2 p-4 rounded-xl ${stat.bg} border border-white/5`}
                    >
                      <svg
                        className={`w-5 h-5 ${stat.color}`}
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
                      <div>
                        <p
                          className={`text-lg font-black ${stat.color}`}
                        >
                          {stat.value}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {doctor.hospitalName && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="text-sm">
                      {doctor.hospitalName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl glass-card border border-white/10 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                {doctor.qualifications?.length > 0 && (
                  <Card className="glass-card border border-white/10">
                    <CardBody className="p-6">
                      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
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
                              d="M12 14l9-5-9-5-9 5 9 5z"
                            />
                          </svg>
                        </div>
                        Qualifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(doctor.qualifications)
                          ? doctor.qualifications
                          : doctor.qualifications
                              ?.split(",")
                              .map((q) => q.trim()) || []
                        ).map((q, i) => (
                          <Chip
                            key={i}
                            className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                            variant="flat"
                          >
                            {q}
                          </Chip>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                <Card className="glass-card border border-white/10">
                  <CardBody className="p-6">
                    <h3 className="text-white font-bold text-lg mb-4">
                      About Doctor
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {doctor.doctorName} is a highly qualified{" "}
                      {doctor.specialization} specialist with{" "}
                      {doctor.experience} years of experience.
                      {doctor.hospitalName
                        ? ` Currently practicing at ${doctor.hospitalName}.`
                        : ""}{" "}
                      Dedicated to providing compassionate,
                      evidence-based healthcare to all patients.
                    </p>
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
              <Card className="glass-card border border-white/10">
                <CardBody className="p-6">
                  <h3 className="text-white font-bold text-lg mb-6">
                    Available Schedule
                  </h3>
                  {doctor.availableDays?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-slate-400 text-sm mb-3 font-medium">
                        Available Days
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => {
                          const isAvailable =
                            doctor.availableDays.includes(day);
                          return (
                            <div
                              key={day}
                              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                isAvailable
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : "bg-white/5 text-slate-600 border-white/5"
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {doctor.availableSlots?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-sm mb-3 font-medium">
                        Time Slots
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {doctor.availableSlots.map((slot, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium"
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!doctor.availableDays?.length &&
                    !doctor.availableSlots?.length && (
                      <p className="text-slate-500 text-sm text-center py-8">
                        No schedule information available yet.
                      </p>
                    )}
                </CardBody>
              </Card>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="flex flex-col gap-4">
                {reviews.length === 0 ? (
                  <Card className="glass-card border border-white/10">
                    <CardBody className="p-12 text-center">
                      <p className="text-slate-400">
                        No reviews yet. Be the first to review after
                        your appointment.
                      </p>
                    </CardBody>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card
                      key={review._id}
                      className="glass-card border border-white/10"
                    >
                      <CardBody className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-sm">
                              {(review.patientName || "P")[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="text-white font-semibold text-sm">
                                  {review.patientName || "Patient"}
                                </p>
                                <p className="text-slate-500 text-xs">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <StarRating
                                rating={review.rating}
                                size="sm"
                              />
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {review.reviewText}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Book Appointment Tab */}
            {activeTab === "book" && (
              <Card className="glass-card border border-white/10">
                <CardBody className="p-6">
                  <h3 className="text-white font-bold text-lg mb-6">
                    Book an Appointment
                  </h3>

                  {!isAuthenticated ? (
                    <div className="text-center py-8 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-amber-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">
                          Login Required
                        </p>
                        <p className="text-slate-400 text-sm">
                          Please sign in to book an appointment.
                        </p>
                      </div>
                      <Button
                        as={Link}
                        href="/login"
                        className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold"
                      >
                        Sign In to Book
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 text-sm font-medium">
                          Appointment Date
                        </label>
                        <input
                          type="date"
                          value={bookingData.appointmentDate}
                          min={
                            new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) => {
                            setBookingData((p) => ({
                              ...p,
                              appointmentDate: e.target.value,
                            }));
                            if (bookingErrors.appointmentDate)
                              setBookingErrors((p) => ({
                                ...p,
                                appointmentDate: "",
                              }));
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 hover:border-white/20 transition-all [color-scheme:dark]"
                        />
                        {bookingErrors.appointmentDate && (
                          <p className="text-red-400 text-xs">
                            {bookingErrors.appointmentDate}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 text-sm font-medium">
                          Time Slot
                        </label>
                        {doctor.availableSlots?.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {doctor.availableSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  setBookingData((p) => ({
                                    ...p,
                                    appointmentTime: slot,
                                  }));
                                  if (bookingErrors.appointmentTime)
                                    setBookingErrors((p) => ({
                                      ...p,
                                      appointmentTime: "",
                                    }));
                                }}
                                className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                  bookingData.appointmentTime ===
                                  slot
                                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                                    : "bg-white/5 text-slate-400 border-white/10 hover:border-cyan-500/30 hover:text-cyan-400"
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <Select
                            placeholder="Select a time slot"
                            selectedKeys={
                              bookingData.appointmentTime
                                ? [bookingData.appointmentTime]
                                : []
                            }
                            onSelectionChange={(keys) => {
                              setBookingData((p) => ({
                                ...p,
                                appointmentTime:
                                  Array.from(keys)[0] || "",
                              }));
                              if (bookingErrors.appointmentTime)
                                setBookingErrors((p) => ({
                                  ...p,
                                  appointmentTime: "",
                                }));
                            }}
                            classNames={{
                              trigger:
                                "bg-white/5 border border-white/10 hover:border-cyan-500/40 data-[focus=true]:border-cyan-500 transition-all",
                              value: "text-slate-200 text-sm",
                              listbox: "bg-[#0d1b2a]",
                              popoverContent:
                                "bg-[#0d1b2a] border border-white/10",
                            }}
                          >
                            {[
                              "9:00 AM",
                              "10:00 AM",
                              "11:00 AM",
                              "2:00 PM",
                              "3:00 PM",
                              "4:00 PM",
                              "5:00 PM",
                            ].map((t) => (
                              <SelectItem
                                key={t}
                                className="text-slate-300 hover:bg-white/5"
                              >
                                {t}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                        {bookingErrors.appointmentTime && (
                          <p className="text-red-400 text-xs">
                            {bookingErrors.appointmentTime}
                          </p>
                        )}
                      </div>

                      <Textarea
                        label="Symptoms / Reason for Visit"
                        placeholder="Describe your symptoms or reason for the appointment..."
                        value={bookingData.symptoms}
                        onValueChange={(val) => {
                          setBookingData((p) => ({
                            ...p,
                            symptoms: val,
                          }));
                          if (bookingErrors.symptoms)
                            setBookingErrors((p) => ({
                              ...p,
                              symptoms: "",
                            }));
                        }}
                        isInvalid={!!bookingErrors.symptoms}
                        errorMessage={bookingErrors.symptoms}
                        minRows={3}
                        classNames={{
                          inputWrapper:
                            "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all data-[invalid=true]:border-red-500/60",
                          input:
                            "text-slate-200 placeholder:text-slate-500 text-sm",
                          label: "text-slate-400 text-sm",
                          errorMessage: "text-red-400 text-xs",
                        }}
                      />

                      <Button
                        onClick={handleBookAppointment}
                        isLoading={bookingLoading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold h-12 shadow-xl shadow-cyan-500/20 hover:opacity-90 transition-opacity"
                        size="lg"
                      >
                        {bookingLoading
                          ? "Processing..."
                          : "Proceed to Payment"}
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <Card className="glass-card border border-emerald-500/20">
              <CardBody className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">
                      Consultation Fee
                    </p>
                    <p className="text-3xl font-black text-emerald-400">
                      ${doctor.consultationFee}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveTab("book")}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:opacity-90"
                >
                  Book Appointment
                </Button>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg
                    className="w-3.5 h-3.5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Secure payment via Stripe
                </div>
              </CardBody>
            </Card>

            <Card className="glass-card border border-white/10">
              <CardBody className="p-6 flex flex-col gap-4">
                <h4 className="text-white font-bold">
                  Patient Ratings
                </h4>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-black gradient-text">
                      {doctor.averageRating
                        ? doctor.averageRating.toFixed(1)
                        : "0.0"}
                    </p>
                    <StarRating
                      rating={doctor.averageRating || 0}
                      size="sm"
                    />
                    <p className="text-slate-500 text-xs mt-1">
                      {doctor.totalReviews || 0} reviews
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(
                        (r) => Math.round(r.rating) === star
                      ).length;
                      const pct =
                        reviews.length > 0
                          ? (count / reviews.length) * 100
                          : 0;
                      return (
                        <div
                          key={star}
                          className="flex items-center gap-2"
                        >
                          <span className="text-xs text-slate-500 w-3">
                            {star}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-4">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        classNames={{
          base: "glass-card border border-white/10",
          header: "border-b border-white/10",
          body: "py-6",
          footer: "border-t border-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-white font-bold text-lg">
              Confirm & Pay
            </h3>
            <p className="text-slate-400 text-sm font-normal">
              Complete your appointment booking
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                {[
                  {
                    label: "Doctor",
                    value: doctor.doctorName,
                  },
                  {
                    label: "Specialization",
                    value: doctor.specialization,
                  },
                  {
                    label: "Date",
                    value: bookingData.appointmentDate
                      ? new Date(
                          bookingData.appointmentDate
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—",
                  },
                  {
                    label: "Time",
                    value: bookingData.appointmentTime || "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-slate-400 text-sm">
                      {item.label}
                    </span>
                    <span className="text-white text-sm font-medium">
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    ${doctor.consultationFee}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-cyan-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <p className="text-slate-300 text-xs">
                  Your payment is secured by Stripe. All transactions
                  are encrypted and protected.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex gap-3">
            <Button
              variant="bordered"
              onPress={onClose}
              className="flex-1 border-white/15 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onPress={handleStripePayment}
              isLoading={paymentLoading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20"
            >
              {paymentLoading
                ? "Processing..."
                : `Pay $${doctor.consultationFee}`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}