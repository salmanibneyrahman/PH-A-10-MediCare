"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Avatar,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { getDoctorByEmail, updateDoctor, createDoctor } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

const SPECIALIZATIONS = [
  "Cardiology","Neurology","Orthopedics","Pediatrics","Dermatology",
  "Oncology","Psychiatry","Gynecology","Ophthalmology","ENT",
  "Gastroenterology","Urology","General Medicine","Radiology","Anesthesiology",
];

export default function DoctorProfilePage() {
  const { user, dbUser } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: "",
    specialization: "",
    qualifications: "",
    experience: "",
    consultationFee: "",
    hospitalName: "",
    profileImage: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDoctor();
  }, [user]);

  async function fetchDoctor() {
    if (!user?.email) return;
    setLoading(true);
    try {
      const doc = await getDoctorByEmail(user.email);
      setDoctor(doc);
      setIsNew(false);
      setFormData({
        doctorName: doc.doctorName || "",
        specialization: doc.specialization || "",
        qualifications: Array.isArray(doc.qualifications)
          ? doc.qualifications.join(", ")
          : doc.qualifications || "",
        experience: doc.experience?.toString() || "",
        consultationFee: doc.consultationFee?.toString() || "",
        hospitalName: doc.hospitalName || "",
        profileImage: doc.profileImage || "",
        email: user.email,
      });
    } catch {
      setIsNew(true);
      setFormData((p) => ({ ...p, email: user.email, doctorName: user.name || "" }));
    } finally {
      setLoading(false);
    }
  }

  const validate = () => {
    const errs = {};
    if (!formData.doctorName.trim()) errs.doctorName = "Name is required";
    if (!formData.specialization) errs.specialization = "Specialization is required";
    if (!formData.experience) errs.experience = "Experience is required";
    else if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0)
      errs.experience = "Enter a valid number";
    if (!formData.consultationFee) errs.consultationFee = "Fee is required";
    else if (isNaN(Number(formData.consultationFee)) || Number(formData.consultationFee) < 0)
      errs.consultationFee = "Enter a valid amount";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (formErrors[field]) setFormErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaveLoading(true);
    try {
      const payload = {
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        qualifications: formData.qualifications
          ? formData.qualifications.split(",").map((q) => q.trim()).filter(Boolean)
          : [],
      };

      if (isNew) {
        await createDoctor(payload);
        toast.success("Doctor profile created! Awaiting admin verification.");
      } else {
        await updateDoctor(doctor._id, payload);
        toast.success("Profile updated successfully!");
      }
      fetchDoctor();
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaveLoading(false);
    }
  };

  const inputClass = {
    inputWrapper:
      "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all data-[invalid=true]:border-red-500/60",
    input: "text-slate-200 placeholder:text-slate-500 text-sm",
    label: "text-slate-400 text-sm",
    errorMessage: "text-red-400 text-xs",
  };

  if (loading) return <LoadingSpinner text="Loading doctor profile..." />;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">
          {isNew ? "Create Doctor Profile" : "Doctor Profile"}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isNew
            ? "Set up your professional profile to start receiving appointments"
            : "Manage your professional information and credentials"}
        </p>
      </div>

      {/* Profile Header */}
      {!isNew && doctor && (
        <Card className="glass-card border border-white/10">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar
                src={doctor.profileImage || ""}
                name={doctor.doctorName || "D"}
                className="w-24 h-24 text-3xl ring-4 ring-cyan-500/20"
                classNames={{
                  base: "bg-gradient-to-br from-cyan-500 to-blue-600",
                  name: "text-white font-black text-2xl",
                }}
              />
              <div className="flex flex-col gap-2 text-center sm:text-left flex-1">
                <h2 className="text-xl font-black text-white">
                  {doctor.doctorName}
                </h2>
                <p className="text-cyan-400 font-medium text-sm">
                  {doctor.specialization}
                </p>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <StatusBadge status={doctor.verificationStatus} />
                  {doctor.verificationStatus === "pending" && (
                    <span className="text-amber-400 text-xs">
                      Awaiting admin verification
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-center sm:items-end">
                <div className="text-center sm:text-right">
                  <p className="text-2xl font-black text-emerald-400">
                    ${doctor.consultationFee}
                  </p>
                  <p className="text-slate-500 text-xs">per session</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-lg font-bold text-indigo-400">
                    {doctor.experience} years
                  </p>
                  <p className="text-slate-500 text-xs">experience</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Edit Form */}
      <Card className="glass-card border border-white/10">
        <CardBody className="p-6">
          <h3 className="text-white font-bold text-base mb-6 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            Professional Information
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Dr. John Smith"
                value={formData.doctorName}
                onValueChange={(v) => handleChange("doctorName", v)}
                isInvalid={!!formErrors.doctorName}
                errorMessage={formErrors.doctorName}
                classNames={inputClass}
              />
              <Select
                label="Specialization"
                placeholder="Select specialization"
                selectedKeys={
                  formData.specialization ? [formData.specialization] : []
                }
                onSelectionChange={(keys) =>
                  handleChange("specialization", Array.from(keys)[0] || "")
                }
                isInvalid={!!formErrors.specialization}
                errorMessage={formErrors.specialization}
                classNames={{
                  trigger:
                    "bg-white/5 border border-white/10 hover:border-cyan-500/40 data-[focus=true]:border-cyan-500 transition-all data-[invalid=true]:border-red-500/60",
                  value: "text-slate-200 text-sm",
                  label: "text-slate-400 text-sm",
                  listbox: "bg-[#0d1b2a]",
                  popoverContent: "bg-[#0d1b2a] border border-white/10",
                  errorMessage: "text-red-400 text-xs",
                }}
              >
                {SPECIALIZATIONS.map((s) => (
                  <SelectItem
                    key={s}
                    className="text-slate-300 hover:bg-white/5 data-[hover=true]:bg-white/5"
                  >
                    {s}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Input
              label="Qualifications (comma separated)"
              placeholder="MBBS, MD, FRCS"
              value={formData.qualifications}
              onValueChange={(v) => handleChange("qualifications", v)}
              classNames={inputClass}
              description="Separate multiple qualifications with commas"
              classNames={{
                ...inputClass,
                description: "text-slate-600 text-xs",
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Years of Experience"
                placeholder="10"
                value={formData.experience}
                onValueChange={(v) => handleChange("experience", v)}
                isInvalid={!!formErrors.experience}
                errorMessage={formErrors.experience}
                min="0"
                classNames={inputClass}
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <Input
                type="number"
                label="Consultation Fee ($)"
                placeholder="150"
                value={formData.consultationFee}
                onValueChange={(v) => handleChange("consultationFee", v)}
                isInvalid={!!formErrors.consultationFee}
                errorMessage={formErrors.consultationFee}
                min="0"
                classNames={inputClass}
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
            </div>

            <Input
              label="Hospital / Clinic Name"
              placeholder="City General Hospital"
              value={formData.hospitalName}
              onValueChange={(v) => handleChange("hospitalName", v)}
              classNames={inputClass}
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
            />

            <Input
              label="Profile Image URL"
              placeholder="https://example.com/photo.jpg"
              value={formData.profileImage}
              onValueChange={(v) => handleChange("profileImage", v)}
              classNames={inputClass}
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={saveLoading}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold px-8 shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity"
              >
                {saveLoading
                  ? "Saving..."
                  : isNew
                  ? "Create Profile"
                  : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}