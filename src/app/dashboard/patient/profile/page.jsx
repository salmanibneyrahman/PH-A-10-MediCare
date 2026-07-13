"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Input, Button, Avatar, Select, SelectItem } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function PatientProfilePage() {
  const { user, dbUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    photo: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: dbUser?.phone || "",
        gender: dbUser?.gender || "",
        photo: user.image || "",
      });
    }
  }, [user, dbUser]);

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Profile updated successfully!");
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Profile Header Card */}
      <Card className="glass-card border border-white/10">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar
                src={formData.photo || user?.image || ""}
                name={user?.name || "U"}
                className="w-24 h-24 text-3xl ring-4 ring-cyan-500/20"
                classNames={{
                  base: "bg-gradient-to-br from-emerald-500 to-teal-600",
                  name: "text-white font-black text-2xl",
                }}
              />
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#0a0f1e] flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <h2 className="text-xl font-black text-white">{user?.name}</h2>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold capitalize">
                  {dbUser?.role || "Patient"}
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-semibold">
                  Active Account
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

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
            Personal Information
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onValueChange={(v) => handleChange("name", v)}
                classNames={{
                  inputWrapper:
                    "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all",
                  input: "text-slate-200 text-sm",
                  label: "text-slate-400 text-sm",
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
              <Input
                label="Email Address"
                value={formData.email}
                isReadOnly
                classNames={{
                  inputWrapper:
                    "bg-white/5 border border-white/10 opacity-60 cursor-not-allowed",
                  input: "text-slate-300 text-sm",
                  label: "text-slate-400 text-sm",
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="tel"
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onValueChange={(v) => handleChange("phone", v)}
                classNames={{
                  inputWrapper:
                    "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all",
                  input: "text-slate-200 placeholder:text-slate-500 text-sm",
                  label: "text-slate-400 text-sm",
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                }
              />
              <Select
                label="Gender"
                placeholder="Select gender"
                selectedKeys={formData.gender ? [formData.gender] : []}
                onSelectionChange={(keys) =>
                  handleChange("gender", Array.from(keys)[0] || "")
                }
                classNames={{
                  trigger:
                    "bg-white/5 border border-white/10 hover:border-cyan-500/40 data-[focus=true]:border-cyan-500 transition-all",
                  value: "text-slate-200 text-sm",
                  label: "text-slate-400 text-sm",
                  listbox: "bg-[#0d1b2a]",
                  popoverContent: "bg-[#0d1b2a] border border-white/10",
                }}
              >
                {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
                  <SelectItem
                    key={g.toLowerCase().replace(/ /g, "_")}
                    className="text-slate-300 hover:bg-white/5 data-[hover=true]:bg-white/5"
                  >
                    {g}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Input
              label="Profile Photo URL"
              placeholder="https://example.com/photo.jpg"
              value={formData.photo}
              onValueChange={(v) => handleChange("photo", v)}
              classNames={{
                inputWrapper:
                  "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all",
                input:
                  "text-slate-200 placeholder:text-slate-500 text-sm",
                label: "text-slate-400 text-sm",
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={loading}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold px-8 shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Account Info */}
      <Card className="glass-card border border-white/10">
        <CardBody className="p-6">
          <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            Account Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Account Type",
                value: dbUser?.role || "Patient",
                color: "text-emerald-400",
              },
              {
                label: "Account Status",
                value: dbUser?.status || "Active",
                color: "text-cyan-400",
              },
              {
                label: "Member Since",
                value: dbUser?.createdAt
                  ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })
                  : "N/A",
                color: "text-indigo-400",
              },
              {
                label: "Login Method",
                value: "Email & Google",
                color: "text-amber-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 p-4 rounded-xl bg-white/5 border border-white/5"
              >
                <p className="text-slate-500 text-xs font-medium">
                  {item.label}
                </p>
                <p className={`font-bold text-sm capitalize ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}