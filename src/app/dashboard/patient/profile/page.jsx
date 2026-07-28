"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  TextField,
  Label,
  Input,
  Button,
  Avatar,
  Select,
  ListBox,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/lib/api";
import { toast } from "react-toastify";

export default function PatientProfilePage() {
  const { user, dbUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    photo: "",
  });

  // Hydrate the form once per account. Depending on the `user`/`dbUser`
  // objects directly would re-run this on every session poll (they are new
  // object references each time) and wipe out whatever you were typing.
  const hydratedFor = useRef(null);

  useEffect(() => {
    const email = user?.email;
    if (!email) return;
    // Wait for the DB record so phone/gender aren't hydrated as empty.
    if (!dbUser) return;
    if (hydratedFor.current === email) return;

    hydratedFor.current = email;
    setFormData({
      name: dbUser.name || user.name || "",
      email: dbUser.email || email,
      phone: dbUser.phone || "",
      gender: dbUser.gender || "",
      photo: dbUser.photo || user.image || "",
    });
  }, [user, dbUser]);

  const handleChange = useCallback((field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
  }, []);

  const handleNameChange = useCallback(
    (v) => handleChange("name", v),
    [handleChange]
  );
  const handlePhoneChange = useCallback(
    (v) => handleChange("phone", v),
    [handleChange]
  );
  const handleGenderChange = useCallback(
    (key) => handleChange("gender", key || ""),
    [handleChange]
  );
  const handlePhotoChange = useCallback(
    (v) => handleChange("photo", v),
    [handleChange]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    setLoading(true);
    try {
      // Actually persist it — previously this only waited and showed a
      // toast, which is why phone/gender were never in the database.
      await updateUser(formData.email, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        photo: formData.photo.trim(),
      });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.message || "Could not update profile");
    } finally {
      setLoading(false);
    }
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
        <Card.Content className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 text-3xl ring-4 ring-cyan-500/20">
                <Avatar.Image
                  src={formData.photo || user?.image || ""}
                  alt={user?.name || "User"}
                />
                <Avatar.Fallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-2xl">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </Avatar.Fallback>
              </Avatar>
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
        </Card.Content>
      </Card>

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
            Personal Information
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full"
              >
                <Label className="text-slate-400 text-sm mb-1.5 block">
                  Full Name
                </Label>
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <Input className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 text-sm transition-all focus:outline-none" />
                </div>
              </TextField>

              <TextField
                name="email"
                value={formData.email}
                isReadOnly
                className="w-full"
              >
                <Label className="text-slate-400 text-sm mb-1.5 block">
                  Email Address
                </Label>
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <Input className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 opacity-60 cursor-not-allowed rounded-xl text-slate-300 text-sm focus:outline-none" />
                </div>
              </TextField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full"
              >
                <Label className="text-slate-400 text-sm mb-1.5 block">
                  Phone Number
                </Label>
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
                  />
                </div>
              </TextField>

              <Select
                className="w-full"
                placeholder="Select gender"
                value={formData.gender || null}
                onChange={handleGenderChange}
              >
                <Label className="text-slate-400 text-sm mb-1.5 block">
                  Gender
                </Label>
                <Select.Trigger className="w-full h-10 px-3 flex items-center justify-between gap-2 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 text-sm transition-all focus:outline-none">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="bg-[#0d1b2a] border border-white/10 rounded-xl p-1">
                  <ListBox>
                    {["Male", "Female", "Other", "Prefer not to say"].map(
                      (g) => (
                        <ListBox.Item
                          key={g.toLowerCase().replace(/ /g, "_")}
                          id={g.toLowerCase().replace(/ /g, "_")}
                          textValue={g}
                          className="text-slate-300 text-sm px-3 py-2 rounded-lg cursor-pointer outline-none data-[hovered]:bg-white/5 data-[focused]:bg-white/5"
                        >
                          {g}
                        </ListBox.Item>
                      )
                    )}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <TextField
              name="photo"
              value={formData.photo}
              onChange={handlePhotoChange}
              className="w-full"
            >
              <Label className="text-slate-400 text-sm mb-1.5 block">
                Profile Photo URL
              </Label>
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <Input
                  placeholder="https://example.com/photo.jpg"
                  className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
                />
              </div>
            </TextField>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isPending={loading}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold px-8 h-10 rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* Account Info */}
      <Card className="glass-card border border-white/10">
        <Card.Content className="p-6">
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
        </Card.Content>
      </Card>
    </div>
  );
}