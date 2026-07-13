"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { getAllDoctorsAdmin, verifyDoctor } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import StarRating from "@/components/StarRating";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

export default function AdminDoctorsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalType, setModalType] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let result = doctors;
    if (activeFilter !== "all") {
      result = result.filter((d) => d.verificationStatus === activeFilter);
    }
    if (search.trim()) {
      result = result.filter(
        (d) =>
          d.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
          d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
          d.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, doctors, activeFilter]);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const data = await getAllDoctorsAdmin();
      setDoctors(data || []);
      setFiltered(data || []);
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }

  const openModal = (doctor, type) => {
    setSelectedDoctor(doctor);
    setModalType(type);
    onOpen();
  };

  const handleVerify = async (status) => {
    setActionLoading(true);
    try {
      await verifyDoctor(selectedDoctor._id, status);
      const messages = {
        verified: "Doctor verified successfully!",
        rejected: "Doctor verification rejected",
        pending: "Doctor verification cancelled",
      };
      toast.success(messages[status] || "Status updated");
      onClose();
      fetchDoctors();
    } catch {
      toast.error("Failed to update doctor status");
    } finally {
      setActionLoading(false);
    }
  };

  const filterOptions = ["all", "pending", "verified", "rejected"];

  if (loading) return <LoadingSpinner text="Loading doctors..." />;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Manage Doctors</h1>
          <p className="text-slate-400 text-sm mt-1">
            Verify, reject or manage doctor profiles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 text-sm font-medium">
              {doctors.filter((d) => d.verificationStatus === "pending").length}{" "}
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by name, specialization or email..."
          value={search}
          onValueChange={setSearch}
          classNames={{
            inputWrapper:
              "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all",
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
        />
        <div className="flex gap-1 p-1 rounded-xl glass-card border border-white/10 shrink-0">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeFilter === f
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {filtered.length === 0 ? (
        <Card className="glass-card border border-white/10">
          <CardBody className="p-16 text-center">
            <svg
              className="w-16 h-16 mx-auto text-slate-700 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-slate-400 font-medium">No doctors found</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((doc) => (
            <Card
              key={doc._id}
              className={`glass-card border transition-all ${
                doc.verificationStatus === "pending"
                  ? "border-amber-500/20 hover:border-amber-500/40"
                  : doc.verificationStatus === "verified"
                  ? "border-emerald-500/20 hover:border-emerald-500/30"
                  : "border-white/10 hover:border-white/15"
              }`}
            >
              <CardBody className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={doc.profileImage || ""}
                    name={doc.doctorName || "D"}
                    size="lg"
                    classNames={{
                      base: "bg-gradient-to-br from-cyan-500 to-indigo-600 shrink-0",
                      name: "text-white font-bold",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-white font-bold truncate">
                          {doc.doctorName}
                        </p>
                        <p className="text-cyan-400 text-sm">
                          {doc.specialization}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {doc.email}
                        </p>
                      </div>
                      <StatusBadge status={doc.verificationStatus} />
                    </div>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-slate-400 text-xs">
                        {doc.experience} yrs exp
                      </span>
                      <span className="text-emerald-400 text-xs font-semibold">
                        ${doc.consultationFee}
                      </span>
                      {doc.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <StarRating rating={doc.averageRating} size="sm" />
                          <span className="text-amber-400 text-xs">
                            {doc.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {doc.hospitalName && (
                        <span className="text-slate-500 text-xs truncate">
                          {doc.hospitalName}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 flex-wrap">
                      {doc.verificationStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openModal(doc, "verify")}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20"
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            }
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openModal(doc, "reject")}
                            variant="bordered"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {doc.verificationStatus === "verified" && (
                        <Button
                          size="sm"
                          onClick={() => openModal(doc, "cancel")}
                          variant="bordered"
                          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs"
                        >
                          Cancel Verification
                        </Button>
                      )}
                      {doc.verificationStatus === "rejected" && (
                        <Button
                          size="sm"
                          onClick={() => openModal(doc, "verify")}
                          variant="bordered"
                          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                        >
                          Re-verify
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={isOpen}
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
            <h3 className="text-white font-bold capitalize">
              {modalType === "verify"
                ? "Verify Doctor"
                : modalType === "reject"
                ? "Reject Doctor"
                : "Cancel Verification"}
            </h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-slate-400 text-sm py-2">
              {modalType === "verify" &&
                `Are you sure you want to verify Dr. ${selectedDoctor?.doctorName}? They will be able to receive patient appointments.`}
              {modalType === "reject" &&
                `Are you sure you want to reject Dr. ${selectedDoctor?.doctorName}'s profile? They will need to reapply.`}
              {modalType === "cancel" &&
                `Are you sure you want to cancel verification for Dr. ${selectedDoctor?.doctorName}? They will no longer appear in search results.`}
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
              onPress={() =>
                handleVerify(
                  modalType === "verify"
                    ? "verified"
                    : modalType === "reject"
                    ? "rejected"
                    : "pending"
                )
              }
              isLoading={actionLoading}
              className={`text-white font-semibold ${
                modalType === "verify"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                  : modalType === "reject"
                  ? "bg-gradient-to-r from-red-500 to-rose-600"
                  : "bg-gradient-to-r from-amber-500 to-orange-600"
              }`}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}