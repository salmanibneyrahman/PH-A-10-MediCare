"use client";

import { Card, Button, Chip, Avatar } from "@heroui/react";
import StarRating from "./StarRating";
import { useRouter } from "next/navigation";

export default function DoctorCard({ doctor }) {
    const {
        _id,
        doctorName,
        specialization,
        experience,
        consultationFee,
        profileImage,
        hospitalName,
        averageRating,
        totalReviews,
        availableDays,
        qualifications,
        verificationStatus,
    } = doctor;
    const router = useRouter();

    const isPending = verificationStatus === "pending";

    // The API stores qualifications as an array, but older records may
    // still hold a plain comma-separated string.
    const qualificationList = Array.isArray(qualifications)
        ? qualifications.filter(Boolean)
        : typeof qualifications === "string" && qualifications.trim()
            ? qualifications.split(",").map((q) => q.trim()).filter(Boolean)
            : [];

    return (
        <Card className="glass-card border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover-lift overflow-hidden group">
            <Card.Content className="p-0">
                {/* Top gradient bar */}
                <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500" />

                <div className="p-5 flex flex-col gap-4">
                    {/* Doctor Header */}
                    <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                            <Avatar className="w-16 h-16 text-lg ring-2 ring-cyan-500/30 group-hover:ring-cyan-500/60 transition-all">
                                {/* Only render the image when there is a real URL —
                                    an empty src makes the browser refetch the page. */}
                                {profileImage ? (
                                    <Avatar.Image
                                        src={profileImage}
                                        alt={doctorName || "Doctor"}
                                    />
                                ) : null}
                                <Avatar.Fallback className="bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-bold text-lg">
                                    {doctorName?.[0]?.toUpperCase() || "D"}
                                </Avatar.Fallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0f1e]" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-base truncate leading-tight">
                                {doctorName}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <Chip
                                    size="sm"
                                    className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 text-xs"
                                >
                                    {specialization}
                                </Chip>
                                {isPending && (
                                    <Chip
                                        size="sm"
                                        className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs"
                                    >
                                        Pending
                                    </Chip>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Qualifications */}
                    {qualificationList.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <svg
                                className="w-3.5 h-3.5 text-slate-500 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                />
                            </svg>
                            {qualificationList.slice(0, 3).map((q) => (
                                <span
                                    key={q}
                                    className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                >
                                    {q}
                                </span>
                            ))}
                            {qualificationList.length > 3 && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                                    +{qualificationList.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            {
                                label: "Experience",
                                value: `${experience}y`,
                                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                                color: "text-indigo-400",
                            },
                            {
                                label: "Fee",
                                value: `$${consultationFee}`,
                                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                                color: "text-emerald-400",
                            },
                            {
                                label: "Reviews",
                                value: totalReviews || 0,
                                icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
                                color: "text-amber-400",
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-white/5"
                            >
                                <svg
                                    className={`w-4 h-4 ${stat.color}`}
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
                                <span className="text-white font-bold text-sm">
                                    {stat.value}
                                </span>
                                <span className="text-slate-500 text-xs">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between">
                        <StarRating rating={averageRating || 0} size="sm" />
                        <span className="text-slate-400 text-xs">
                            {averageRating ? averageRating.toFixed(1) : "0.0"} / 5.0
                        </span>
                    </div>

                    {/* Hospital */}
                    {hospitalName && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <svg
                                className="w-3.5 h-3.5 text-slate-500 shrink-0"
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
                            <span className="truncate">{hospitalName}</span>
                        </div>
                    )}

                    {/* Available Days */}
                    {availableDays && availableDays.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {availableDays.slice(0, 4).map((day) => (
                                <span
                                    key={day}
                                    className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                >
                                    {day.slice(0, 3)}
                                </span>
                            ))}
                            {availableDays.length > 4 && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                                    +{availableDays.length - 4}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Action Button */}
                    {isPending ? (
                        <div className="w-full text-center py-2 rounded-lg bg-white/5 border border-amber-500/20">
                            <p className="text-amber-400 text-xs font-semibold">
                                Awaiting verification
                            </p>
                            <p className="text-slate-500 text-[11px]">
                                Booking opens once an admin approves
                            </p>
                        </div>
                    ) : (
                        <Button
                            onPress={() => router.push(`/find-doctors/${_id}`)}
                            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity h-9 rounded-lg"
                            size="sm"
                        >
                            View Profile &amp; Book
                        </Button>
                    )}
                </div>
            </Card.Content>
        </Card>
    );
}