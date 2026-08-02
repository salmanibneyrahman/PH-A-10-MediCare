"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Input,
  Select,
  ListBox,
  Button,
  Chip,
  Avatar,
  Pagination,
} from "@heroui/react";
import { getDoctors } from "@/lib/api";
import DoctorCard from "@/components/DoctorCard";
import SectionHeading from "@/components/SectionHeading";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSearchParams, useRouter } from "next/navigation";

const specializations = [
  "All",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Oncology",
  "Psychiatry",
  "Gynecology",
  "Ophthalmology",
  "ENT",
  "Gastroenterology",
  "Urology",
];

const sortOptions = [
  { key: "default", label: "Default" },
  { key: "fee_asc", label: "Fee: Low to High" },
  { key: "fee_desc", label: "Fee: High to Low" },
  { key: "experience", label: "Most Experienced" },
  { key: "rating", label: "Highest Rated" },
];

export default function FindDoctorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [specialization, setSpecialization] = useState(
    searchParams.get("specialization") || "all"
  );
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("card");
  const limit = 9;

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (specialization && specialization !== "all")
        params.specialization = specialization;
      if (sortBy !== "default") params.sortBy = sortBy;

      const data = await getDoctors(params);
      setDoctors(data.doctors || []);
      setTotal(data.total || 0);
    } catch {
      setDoctors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, specialization, sortBy, page]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleSpecialization = (val) => {
    setSpecialization(val);
    setPage(1);
  };

  const handleSort = (val) => {
    setSortBy(val);
    setPage(1);
  };

  const handleClear = () => {
    setSearch("");
    setSpecialization("all");
    setSortBy("default");
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);
  const hasFilters =
    search || (specialization && specialization !== "all") || sortBy !== "default";

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-24 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-64 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <SectionHeading
              badge="Find Specialists"
              title="Discover the Right"
              highlight="Doctor for You"
              subtitle="Search from our network of 500+ verified specialists across 30+ medical fields."
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Filter Bar */}
        <div className="glass-card border border-white/10 p-6 mb-10 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
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
                  placeholder="Search doctors by name or specialization..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full h-12 pl-9 pr-9 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearch("")}
                    className="text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Specialization Filter */}
            <Select
              className="w-full"
              placeholder="Specialization"
              value={specialization || "all"}
              onChange={(key) => handleSpecialization(key || "all")}
            >
              <Select.Trigger className="w-full h-12 px-3 flex items-center justify-between gap-2 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 text-sm transition-all focus:outline-none">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="bg-[#0d1b2a] border border-white/10 rounded-xl p-1">
                <ListBox>
                  {specializations.map((spec) => (
                    <ListBox.Item
                      key={spec.toLowerCase()}
                      id={spec.toLowerCase()}
                      textValue={spec}
                      className="text-slate-300 text-sm px-3 py-2 rounded-lg cursor-pointer outline-none data-[hovered]:bg-white/5 data-[focused]:bg-white/5"
                    >
                      {spec}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            {/* Sort */}
            <Select
              className="w-full"
              placeholder="Sort By"
              value={sortBy || "default"}
              onChange={(key) => handleSort(key || "default")}
            >
              <Select.Trigger className="w-full h-12 px-3 flex items-center justify-between gap-2 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 text-sm transition-all focus:outline-none">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover className="bg-[#0d1b2a] border border-white/10 rounded-xl p-1">
                <ListBox>
                  {sortOptions.map((opt) => (
                    <ListBox.Item
                      key={opt.key}
                      id={opt.key}
                      textValue={opt.label}
                      className="text-slate-300 text-sm px-3 py-2 rounded-lg cursor-pointer outline-none data-[hovered]:bg-white/5 data-[focused]:bg-white/5"
                    >
                      {opt.label}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* Active Filters & Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {hasFilters && (
                <>
                  <span className="text-slate-500 text-xs">Active filters:</span>
                  {search && (
                    <Chip
                      size="sm"
                      className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    >
                      Search: {search}
                      <button
                        type="button"
                        aria-label="Remove search filter"
                        onClick={() => handleSearch("")}
                        className="ml-1 opacity-70 hover:opacity-100"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </Chip>
                  )}
                  {specialization && specialization !== "all" && (
                    <Chip
                      size="sm"
                      className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    >
                      {specialization}
                      <button
                        type="button"
                        aria-label="Remove specialization filter"
                        onClick={() => handleSpecialization("all")}
                        className="ml-1 opacity-70 hover:opacity-100"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </Chip>
                  )}
                  {sortBy !== "default" && (
                    <Chip
                      size="sm"
                      className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      {sortOptions.find((o) => o.key === sortBy)?.label}
                      <button
                        type="button"
                        aria-label="Remove sort filter"
                        onClick={() => handleSort("default")}
                        className="ml-1 opacity-70 hover:opacity-100"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </Chip>
                  )}
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors ml-1"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-xs">
                {total} doctor{total !== 1 ? "s" : ""} found
              </span>
              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
                {[
                  {
                    mode: "card",
                    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
                  },
                  {
                    mode: "table",
                    icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
                  },
                ].map(({ mode, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-1.5 rounded-md transition-all ${viewMode === mode
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-slate-500 hover:text-slate-300"
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner text="Finding the best doctors for you..." />
        ) : doctors.length === 0 ? (
          <div className="glass-card border border-white/10 p-16 text-center">
            <svg
              className="w-20 h-20 mx-auto text-slate-600 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-white text-xl font-bold mb-2">
              No Doctors Found
            </h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your search filters or browse all available doctors.
            </p>
            <Button
              onPress={handleClear}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold rounded-xl px-5 h-11"
            >
              Clear Filters
            </Button>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="glass-card border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>Rating</th>
                    <th>Hospital</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" className="shrink-0">
                            {doctor.profileImage && (
                              <Avatar.Image
                                src={doctor.profileImage}
                                alt={doctor.doctorName || "Doctor"}
                              />
                            )}
                            <Avatar.Fallback className="bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-bold text-sm">
                              {doctor.doctorName?.[0]?.toUpperCase() || "D"}
                            </Avatar.Fallback>
                          </Avatar>
                          <span className="font-medium text-white">
                            {doctor.doctorName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Chip
                          size="sm"
                          className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        >
                          {doctor.specialization}
                        </Chip>
                      </td>
                      <td className="text-slate-300">
                        {doctor.experience} yrs
                      </td>
                      <td className="text-emerald-400 font-semibold">
                        ${doctor.consultationFee}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-slate-300 text-sm">
                            {doctor.averageRating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      </td>
                      <td className="text-slate-400 text-sm">
                        {doctor.hospitalName || "—"}
                      </td>
                      <td>
                        <a
                          href={`/find-doctors/${doctor._id}`}
                          className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                        >
                          Book
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <Pagination>
              <Pagination.Content className="gap-1">
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={page === 1}
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                    className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded-lg"
                  >
                    <Pagination.PreviousIcon />
                  </Pagination.Previous>
                </Pagination.Item>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Pagination.Item key={p}>
                    <Pagination.Link
                      isActive={page === p}
                      onPress={() => setPage(p)}
                      className={
                        page === p
                          ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20 rounded-lg"
                          : "bg-white/5 border border-white/10 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all rounded-lg"
                      }
                    >
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                ))}
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={page === totalPages}
                    onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded-lg"
                  >
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}