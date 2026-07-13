"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, Avatar, Chip } from "@heroui/react";
import { getFeaturedDoctors, getStats, getAllReviews } from "@/lib/api";
import DoctorCard from "@/components/DoctorCard";
import StarRating from "@/components/StarRating";
import SectionHeading from "@/components/SectionHeading";
import LoadingSpinner from "@/components/LoadingSpinner";

// Simple animation hook
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// Animated counter component
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Specialization data
const specializations = [
  {
    name: "Cardiology",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    color: "from-red-500 to-pink-600",
    glow: "shadow-red-500/20",
    count: "120+ Doctors",
  },
  {
    name: "Neurology",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
    count: "85+ Doctors",
  },
  {
    name: "Orthopedics",
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    color: "from-blue-500 to-cyan-600",
    glow: "shadow-blue-500/20",
    count: "95+ Doctors",
  },
  {
    name: "Pediatrics",
    icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    count: "110+ Doctors",
  },
  {
    name: "Dermatology",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    color: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
    count: "75+ Doctors",
  },
  {
    name: "Oncology",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    color: "from-rose-500 to-red-600",
    glow: "shadow-rose-500/20",
    count: "60+ Doctors",
  },
  {
    name: "Psychiatry",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    color: "from-indigo-500 to-blue-600",
    glow: "shadow-indigo-500/20",
    count: "70+ Doctors",
  },
  {
    name: "Gynecology",
    icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/20",
    count: "88+ Doctors",
  },
];

// Why Choose Us data
const whyChooseUs = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Verified Doctors",
    description:
      "Every doctor on our platform is thoroughly verified with credentials, licenses, and hospital affiliations checked.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Instant Appointments",
    description:
      "Book appointments in under 60 seconds. Choose your preferred doctor, time slot, and confirm instantly.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    title: "Secure Payments",
    description:
      "Pay consultation fees securely via Stripe. All transactions are encrypted and fully protected.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Digital Prescriptions",
    description:
      "Receive and store digital prescriptions from your doctors, accessible anytime from your dashboard.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    title: "24/7 Support",
    description:
      "Round-the-clock customer support to help you with any queries, appointments, or medical emergencies.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Health Analytics",
    description:
      "Track your health journey with detailed analytics, appointment history, and medical records all in one place.",
    color: "from-indigo-500 to-cyan-600",
  },
];

export default function HomePage() {
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [heroRef, heroInView] = useInView(0.1);
  const [statsRef, statsInView] = useInView(0.1);
  const [doctorsRef, doctorsInView] = useInView(0.1);
  const [specsRef, specsInView] = useInView(0.1);
  const [whyRef, whyInView] = useInView(0.1);
  const [reviewsRef, reviewsInView] = useInView(0.1);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getFeaturedDoctors();
        setDoctors(data);
      } catch {
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getStats();
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await getAllReviews();
        setReviews(data);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    }
    fetchReviews();
  }, []);

  return (
    <div className="bg-[#0a0f1e] overflow-x-hidden">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div
              ref={heroRef}
              className="flex flex-col gap-8"
              style={{
                opacity: heroInView ? 1 : 0,
                transform: heroInView ? "translateX(0)" : "translateX(-40px)",
                transition: "all 0.8s ease",
              }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/20 text-cyan-400 text-sm font-medium w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                Trusted by 50,000+ Patients Nationwide
              </div>

              {/* Headline */}
              <div className="flex flex-col gap-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight">
                  <span className="text-white">Your Health,</span>
                  <br />
                  <span className="gradient-text">Our Priority</span>
                </h1>
                <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-xl">
                  Connect with India&apos;s best doctors, book appointments
                  instantly, and manage your entire healthcare journey from one
                  powerful platform.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  as={Link}
                  href="/find-doctors"
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold px-8 shadow-xl shadow-cyan-500/25 hover:opacity-90 transition-opacity"
                  startContent={
                    <svg
                      className="w-5 h-5"
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
                >
                  Find a Doctor
                </Button>
                <Button
                  as={Link}
                  href="/about"
                  size="lg"
                  variant="bordered"
                  className="border-white/20 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 font-semibold px-8 transition-all"
                  startContent={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                >
                  How It Works
                </Button>
              </div>

              {/* Quick Stats Row */}
              <div className="flex flex-wrap gap-6 pt-2">
                {[
                  { label: "Verified Doctors", value: "500+" },
                  { label: "Happy Patients", value: "50K+" },
                  { label: "Specializations", value: "30+" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <span className="text-2xl font-black gradient-text">
                      {item.value}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Hero Visual */}
            <div
              className="hidden lg:flex items-center justify-center relative"
              style={{
                opacity: heroInView ? 1 : 0,
                transform: heroInView ? "translateX(0)" : "translateX(40px)",
                transition: "all 0.8s ease 0.2s",
              }}
            >
              <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="glass-card p-8 flex flex-col gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        Book Appointment
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Available 24/7 online
                      </p>
                    </div>
                  </div>

                  {/* Mock doctor list */}
                  {[
                    {
                      name: "Dr. Sarah Johnson",
                      spec: "Cardiologist",
                      time: "10:00 AM",
                      available: true,
                    },
                    {
                      name: "Dr. Mark Williams",
                      spec: "Neurologist",
                      time: "2:30 PM",
                      available: true,
                    },
                    {
                      name: "Dr. Emily Chen",
                      spec: "Pediatrician",
                      time: "4:00 PM",
                      available: false,
                    },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-indigo-600/30 flex items-center justify-center text-white font-bold text-sm">
                        {doc.name.split(" ")[1][0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {doc.name}
                        </p>
                        <p className="text-slate-500 text-xs">{doc.spec}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 text-xs font-medium">
                          {doc.time}
                        </p>
                        <span
                          className={`text-xs ${
                            doc.available
                              ? "text-emerald-400"
                              : "text-slate-500"
                          }`}
                        >
                          {doc.available ? "Available" : "Booked"}
                        </span>
                      </div>
                    </div>
                  ))}

                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20"
                    as={Link}
                    href="/find-doctors"
                  >
                    Book Now
                  </Button>
                </div>

                {/* Floating badges */}
                <div
                  className="absolute -top-4 -right-4 glass-card px-4 py-2 flex items-center gap-2 z-20"
                  style={{ animation: "float 3s ease-in-out infinite" }}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">Verified</p>
                    <p className="text-slate-400 text-xs">500+ Doctors</p>
                  </div>
                </div>

                <div
                  className="absolute -bottom-4 -left-4 glass-card px-4 py-2 flex items-center gap-2 z-20"
                  style={{
                    animation: "float 3s ease-in-out infinite",
                    animationDelay: "1.5s",
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">4.9 Rating</p>
                    <p className="text-slate-400 text-xs">50K+ Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section
        ref={statsRef}
        className="py-16 relative"
        style={{
          opacity: statsInView ? 1 : 0,
          transform: statsInView ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.8s ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card border border-cyan-500/10 p-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y lg:divide-y-0 divide-white/5">
              {[
                {
                  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                  label: "Verified Doctors",
                  value: stats?.totalDoctors || 500,
                  suffix: "+",
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10",
                },
                {
                  icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                  label: "Happy Patients",
                  value: stats?.totalPatients || 50000,
                  suffix: "+",
                  color: "text-indigo-400",
                  bg: "bg-indigo-500/10",
                },
                {
                  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                  label: "Appointments",
                  value: stats?.totalAppointments || 120000,
                  suffix: "+",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
                  label: "5-Star Reviews",
                  value: stats?.totalReviews || 75000,
                  suffix: "+",
                  color: "text-amber-400",
                  bg: "bg-amber-500/10",
                },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-3 p-8"
                  style={{
                    opacity: statsInView ? 1 : 0,
                    transform: statsInView ? "scale(1)" : "scale(0.9)",
                    transition: `all 0.6s ease ${index * 0.1}s`,
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <svg
                      className={`w-6 h-6 ${stat.color}`}
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
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl sm:text-4xl font-black ${stat.color}`}
                    >
                      {statsInView && (
                        <AnimatedCounter
                          target={stat.value}
                          suffix={stat.suffix}
                        />
                      )}
                    </div>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURED DOCTORS ==================== */}
      <section ref={doctorsRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-14"
            style={{
              opacity: doctorsInView ? 1 : 0,
              transform: doctorsInView ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.7s ease",
            }}
          >
            <SectionHeading
              badge="Top Specialists"
              title="Featured"
              highlight="Doctors"
              subtitle="Handpicked specialists with proven track records and outstanding patient reviews."
              center={false}
            />
            <Button
              as={Link}
              href="/find-doctors"
              variant="bordered"
              className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 font-semibold shrink-0"
              endContent={
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              }
            >
              View All Doctors
            </Button>
          </div>

          {doctorsLoading ? (
            <LoadingSpinner text="Loading featured doctors..." />
          ) : doctors.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-lg font-medium">No doctors available yet</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor, index) => (
                <div
                  key={doctor._id}
                  style={{
                    opacity: doctorsInView ? 1 : 0,
                    transform: doctorsInView
                      ? "translateY(0)"
                      : "translateY(40px)",
                    transition: `all 0.6s ease ${index * 0.1}s`,
                  }}
                >
                  <DoctorCard doctor={doctor} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== SPECIALIZATIONS SECTION ==================== */}
      <section ref={specsRef} className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="mb-14 text-center"
            style={{
              opacity: specsInView ? 1 : 0,
              transform: specsInView ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.7s ease",
            }}
          >
            <SectionHeading
              badge="Medical Specialties"
              title="Find Doctors by"
              highlight="Specialization"
              subtitle="Browse our comprehensive list of medical specializations and find the right specialist for your needs."
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {specializations.map((spec, index) => (
              <Link
                key={spec.name}
                href={`/find-doctors?specialization=${spec.name.toLowerCase()}`}
                style={{
                  opacity: specsInView ? 1 : 0,
                  transform: specsInView
                    ? "translateY(0) scale(1)"
                    : "translateY(20px) scale(0.95)",
                  transition: `all 0.5s ease ${index * 0.07}s`,
                }}
              >
                <Card className="glass-card border border-white/5 hover:border-white/20 transition-all duration-300 hover-lift cursor-pointer group overflow-hidden">
                  <Card.Body className="p-5 flex flex-col items-center gap-3 text-center">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${spec.color} flex items-center justify-center shadow-lg ${spec.glow} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={spec.icon}
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors">
                        {spec.name}
                      </h3>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {spec.count}
                      </p>
                    </div>
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section ref={whyRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="mb-14 text-center"
            style={{
              opacity: whyInView ? 1 : 0,
              transform: whyInView ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.7s ease",
            }}
          >
            <SectionHeading
              badge="Why Choose Us"
              title="Healthcare Made"
              highlight="Simple & Secure"
              subtitle="We combine cutting-edge technology with compassionate care to deliver an unparalleled healthcare experience."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
              <div
                key={item.title}
                style={{
                  opacity: whyInView ? 1 : 0,
                  transform: whyInView ? "translateY(0)" : "translateY(40px)",
                  transition: `all 0.6s ease ${index * 0.1}s`,
                }}
              >
                <Card className="glass-card border border-white/5 hover:border-white/15 transition-all duration-300 hover-lift h-full">
                  <Card.Body className="p-6 flex flex-col gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={item.icon}
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-white font-bold text-base">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PATIENT TESTIMONIALS ==================== */}
      <section ref={reviewsRef} className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="mb-14 text-center"
            style={{
              opacity: reviewsInView ? 1 : 0,
              transform: reviewsInView ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.7s ease",
            }}
          >
            <SectionHeading
              badge="Patient Stories"
              title="Real Stories,"
              highlight="Real Impact"
              subtitle="Hear from thousands of patients who have transformed their healthcare experience with MediCare Connect."
            />
          </div>

          {reviewsLoading ? (
            <LoadingSpinner text="Loading testimonials..." />
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, index) => (
                <div
                  key={review._id}
                  style={{
                    opacity: reviewsInView ? 1 : 0,
                    transform: reviewsInView
                      ? "translateY(0)"
                      : "translateY(40px)",
                    transition: `all 0.6s ease ${index * 0.1}s`,
                  }}
                >
                  <Card className="glass-card border border-white/5 hover:border-cyan-500/20 transition-all duration-300 hover-lift h-full">
                    <Card.Body className="p-6 flex flex-col gap-4">
                      {/* Quote Icon */}
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-cyan-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>

                      {/* Review Text */}
                      <p className="text-slate-300 text-sm leading-relaxed flex-1 line-clamp-4">
                        {review.reviewText}
                      </p>

                      {/* Rating */}
                      <StarRating rating={review.rating} size="sm" />

                      {/* Patient Info */}
                      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                        <Avatar
                          src={review.patient?.image || ""}
                          name={review.patient?.name || "P"}
                          size="sm"
                          classNames={{
                            base: "bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0",
                            name: "text-white font-semibold text-xs",
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {review.patient?.name || "Anonymous Patient"}
                          </p>
                          <p className="text-slate-500 text-xs truncate">
                            Patient of{" "}
                            {review.doctor?.doctorName || "MediCare Doctor"}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          className="ml-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs shrink-0"
                          variant="flat"
                        >
                          Verified
                        </Chip>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative glass-card border border-cyan-500/20 p-12 text-center overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/30">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-3xl sm:text-4xl font-black text-white">
                  Ready to Take Control of{" "}
                  <span className="gradient-text">Your Health?</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                  Join over 50,000 patients who trust MediCare Connect for their
                  healthcare needs. Sign up free today.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  as={Link}
                  href="/register"
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold px-10 shadow-xl shadow-cyan-500/25 hover:opacity-90 transition-opacity"
                >
                  Get Started Free
                </Button>
                <Button
                  as={Link}
                  href="/find-doctors"
                  size="lg"
                  variant="bordered"
                  className="border-white/20 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 font-semibold px-10 transition-all"
                >
                  Browse Doctors
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}