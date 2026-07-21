"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Input,
  Select,
  ListBox,
  Button,
  Chip,
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
              <Input
                placeholder="Search doctors by name or specialization..."
                value={search}
                onValueChange={handleSearch}
                classNames={{
                  inputWrapper:
                    "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all h-12",
                  input: "text-slate-200 placeholder:text-slate-500 text-sm",
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                endContent={
                  search && (
                    <button
                      onClick={() => handleSearch("")}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )
                }
              />
            </div>

            {/* Specialization Filter */}
            <Select
              selectedKeys={specialization ? [specialization] : ["all"]}
              onSelectionChange={(keys) =>
                handleSpecialization(Array.from(keys)[0] || "all")
              }
              classNames={{
                trigger:
                  "bg-white/5 border border-white/10 hover:border-cyan-500/40 data-[focus=true]:border-cyan-500 transition-all h-12",
                value: "text-slate-200 text-sm",
                popoverContent: "bg-[#0d1b2a] border border-white/10",
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Specialization" />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {specializations.map((spec) => (
                    <ListBox.Item
                      key={spec.toLowerCase()}
                      className="text-slate-300 hover:bg-white/5 data-[hover=true]:bg-white/5"
                    >
                      {spec}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            {/* Sort */}
            <Select
              selectedKeys={sortBy ? [sortBy] : ["default"]}
              onSelectionChange={(keys) =>
                handleSort(Array.from(keys)[0] || "default")
              }
              classNames={{
                trigger:
                  "bg-white/5 border border-white/10 hover:border-cyan-500/40 data-[focus=true]:border-cyan-500 transition-all h-12",
                value: "text-slate-200 text-sm",
                popoverContent: "bg-[#0d1b2a] border border-white/10",
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Sort By" />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {sortOptions.map((opt) => (
                    <ListBox.Item
                      key={opt.key}
                      className="text-slate-300 hover:bg-white/5 data-[hover=true]:bg-white/5"
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
                      onClose={() => handleSearch("")}
                      className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      variant="flat"
                    >
                      Search: {search}
                    </Chip>
                  )}
                  {specialization && specialization !== "all" && (
                    <Chip
                      size="sm"
                      onClose={() => handleSpecialization("all")}
                      className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      variant="flat"
                    >
                      {specialization}
                    </Chip>
                  )}
                  {sortBy !== "default" && (
                    <Chip
                      size="sm"
                      onClose={() => handleSort("default")}
                      className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      variant="flat"
                    >
                      {sortOptions.find((o) => o.key === sortBy)?.label}
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
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === mode
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
              onClick={handleClear}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold"
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
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {doctor.doctorName?.[0] || "D"}
                          </div>
                          <span className="font-medium text-white">
                            {doctor.doctorName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Chip
                          size="sm"
                          className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          variant="flat"
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
                        <Button
                          as="a"
                          href={`/find-doctors/${doctor._id}`}
                          size="sm"
                          className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold"
                        >
                          Book
                        </Button>
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
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              showControls
              classNames={{
                wrapper: "gap-1",
                item: "bg-white/5 border border-white/10 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all",
                cursor: "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20",
                prev: "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10",
                next: "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}