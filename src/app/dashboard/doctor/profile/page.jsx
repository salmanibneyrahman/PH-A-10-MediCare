"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Input,
  Button,
  Avatar,
  Select,
  ListBox,
  TextField,
  Label,
  FieldError,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { getDoctorByEmail, updateDoctor, createDoctor } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";

const SPECIALIZATIONS = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology",
  "Oncology", "Psychiatry", "Gynecology", "Ophthalmology", "ENT",
  "Gastroenterology", "Urology", "General Medicine", "Radiology", "Anesthesiology",
];

export default function DoctorProfilePage() {
  const { user, dbUser, avatarUrl } = useAuth();
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

  const fetchDoctor = useCallback(async () => {
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
        // Fall back to the photo saved at registration so the field is
        // never blank just because the doctor profile was made later.
        profileImage: doc.profileImage || dbUser?.photo || user.image || "",
        email: user.email,
      });
    } catch {
      // 404 — no doctor profile yet. Prefill from the account so the
      // registration name/photo carry over instead of starting empty.
      setIsNew(true);
      setFormData((p) => ({
        ...p,
        email: user.email,
        doctorName: dbUser?.name || user.name || "",
        profileImage: dbUser?.photo || user.image || "",
      }));
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.name, user?.image, dbUser?.name, dbUser?.photo]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

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

  const handleChange = useCallback((field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setFormErrors((p) => (p[field] ? { ...p, [field]: "" } : p));
  }, []);

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

  const inputClass = "w-full h-10 px-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none";

  const handleDoctorNameChange = useCallback((value) => handleChange("doctorName", value), [handleChange]);
  const handleSpecializationChange = useCallback((key) => handleChange("specialization", key || ""), [handleChange]);
  const handleQualificationsChange = useCallback((value) => handleChange("qualifications", value), [handleChange]);
  const handleExperienceChange = useCallback((value) => handleChange("experience", value), [handleChange]);
  const handleConsultationFeeChange = useCallback((value) => handleChange("consultationFee", value), [handleChange]);
  const handleHospitalNameChange = useCallback((value) => handleChange("hospitalName", value), [handleChange]);
  const handleProfileImageChange = useCallback((value) => handleChange("profileImage", value), [handleChange]);

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
          <Card.Content className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="w-24 h-24 ring-4 ring-cyan-500/20">
                <Avatar.Image
                  src={doctor.profileImage || avatarUrl || ""}
                  alt={doctor.doctorName || "Doctor"}
                />
                <Avatar.Fallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-black text-2xl">
                  {(doctor.doctorName || "D")[0]?.toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
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
          </Card.Content>
        </Card>
      )}

      {/* Edit Form */}
      <Card className="glass-card border border-white/10">
        <Card.Content className="p-6">
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
              <TextField
                name="doctorName"
                value={formData.doctorName}
                onChange={handleDoctorNameChange}
                isInvalid={!!formErrors.doctorName}
                className="w-full"
              >
                <Label className="text-slate-400 text-sm mb-1.5 block">Full Name</Label>
                <Input
                  placeholder="Dr. John Smith"
                  className={inputClass}
                />
                {formErrors.doctorName && (
                  <FieldError className="text-red-400 text-xs mt-1">
                    {formErrors.doctorName}
                  </FieldError>
                )}
              </TextField>

              <Select
                className="w-full"
                placeholder="Select specialization"
                value={formData.specialization || null}
                onChange={handleSpecializationChange}
              >
                <Label className="text-slate-400 text-sm mb-1.5 block">Specialization</Label>
                <Select.Trigger className="w-full h-10 px-3 flex items-center justify-between gap-2 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 text-sm transition-all focus:outline-none">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="bg-[#0d1b2a] border border-white/10 rounded-xl p-1 max-h-64 overflow-y-auto">
                  <ListBox>
                    {SPECIALIZATIONS.map((s) => (
                      <ListBox.Item
                        key={s}
                        id={s}
                        textValue={s}
                        className="text-slate-300 text-sm px-3 py-2 rounded-lg cursor-pointer outline-none data-[hovered]:bg-white/5 data-[focused]:bg-white/5"
                      >
                        {s}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
                {formErrors.specialization && (
                  <p className="text-red-400 text-xs mt-1">
                    {formErrors.specialization}
                  </p>
                )}
              </Select>
            </div>

            <TextField
              name="qualifications"
              value={formData.qualifications}
              onChange={handleQualificationsChange}
              className="w-full"
            >
              <Label className="text-slate-400 text-sm mb-1.5 block">Qualifications (comma separated)</Label>
              <Input
                placeholder="MBBS, MD, FRCS"
                className={inputClass}
              />
              <p className="text-slate-600 text-xs mt-1">Separate multiple qualifications with commas</p>
            </TextField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleExperienceChange}
                isInvalid={!!formErrors.experience}
                className="w-full"
              >
                <Label className="text-slate-400 text-sm mb-1.5 block">Years of Experience</Label>
                <div className="relative">
                  <svg
                    className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
                  <Input
                    placeholder="10"
                    min="0"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {formErrors.experience && (
                  <FieldError className="text-red-400 text-xs mt-1">
                    {formErrors.experience}
                  </FieldError>
                )}
              </TextField>

              <TextField
                name="consultationFee"
                type="number"
                value={formData.consultationFee}
                onChange={handleConsultationFeeChange}
                isInvalid={!!formErrors.consultationFee}
                className="w-full"
              >
                <Label className="text-slate-400 text-sm mb-1.5 block">Consultation Fee ($)</Label>
                <div className="relative">
                  <svg
                    className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
                  <Input
                    placeholder="150"
                    min="0"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {formErrors.consultationFee && (
                  <FieldError className="text-red-400 text-xs mt-1">
                    {formErrors.consultationFee}
                  </FieldError>
                )}
              </TextField>
            </div>

            <TextField
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleHospitalNameChange}
              className="w-full"
            >
              <Label className="text-slate-400 text-sm mb-1.5 block">Hospital / Clinic Name</Label>
              <div className="relative">
                <svg
                  className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
                <Input
                  placeholder="City General Hospital"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </TextField>

            <TextField
              name="profileImage"
              value={formData.profileImage}
              onChange={handleProfileImageChange}
              className="w-full"
            >
              <Label className="text-slate-400 text-sm mb-1.5 block">Profile Image URL</Label>
              <div className="relative">
                <svg
                  className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
                <Input
                  placeholder="https://example.com/photo.jpg"
                  className={`${inputClass} pl-9`}
                />
              </div>
              {formData.profileImage && (
                <div className="flex items-center gap-3 mt-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Avatar size="sm" className="shrink-0">
                    <Avatar.Image
                      src={formData.profileImage}
                      alt="Profile preview"
                    />
                    <Avatar.Fallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold">
                      {(formData.doctorName || "D")[0]?.toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  <p className="text-slate-400 text-xs">
                    This image appears on your Find Doctors listing.
                  </p>
                </div>
              )}
            </TextField>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isPending={saveLoading}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold px-8 shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity h-10 rounded-lg"
              >
                {saveLoading
                  ? "Saving..."
                  : isNew
                    ? "Update Profile"
                    : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}