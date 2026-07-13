"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";
import { signUp, signIn } from "@/lib/authClient";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    photo: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return { hasMinLength, hasNumber, hasSpecial };
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    else if (formData.name.trim().length < 3)
      newErrors.name = "Name must be at least 3 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const { hasMinLength, hasNumber, hasSpecial } = validatePassword(
        formData.password
      );
      if (!hasMinLength)
        newErrors.password = "Password must be at least 6 characters";
      else if (!hasNumber)
        newErrors.password = "Password must contain at least one number";
      else if (!hasSpecial)
        newErrors.password =
          "Password must contain at least one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await signUp.email({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        image: formData.photo || "",
      });

      if (result?.error) {
        toast.error(result.error.message || "Registration failed");
      } else {
        toast.success("Account created successfully! Welcome to MediCare Connect.");
        router.push("/dashboard/patient");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard/patient",
      });
    } catch {
      toast.error("Google sign-up failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const passwordStrength = formData.password
    ? validatePassword(formData.password)
    : null;

  const getStrengthLevel = () => {
    if (!passwordStrength) return 0;
    const { hasMinLength, hasNumber, hasSpecial } = passwordStrength;
    return [hasMinLength, hasNumber, hasSpecial].filter(Boolean).length;
  };

  const strengthColors = ["bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 py-24 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/30">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black gradient-text">MediCare</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                Connect
              </span>
            </div>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-black text-white mt-2">
              Create Your Account
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Join thousands of patients managing their health smarter
            </p>
          </div>
        </div>

        <Card className="glass-card border border-white/10">
          <CardBody className="p-8 flex flex-col gap-6">
            {/* Google Register */}
            <Button
              onClick={handleGoogleRegister}
              isLoading={googleLoading}
              variant="bordered"
              className="w-full border-white/15 text-slate-300 hover:bg-white/5 hover:border-white/30 font-semibold h-12 transition-all"
              startContent={
                !googleLoading && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )
              }
            >
              Continue with Google
            </Button>

            <div className="flex items-center gap-3">
              <Divider className="flex-1 bg-white/10" />
              <span className="text-slate-500 text-xs font-medium px-2">OR</span>
              <Divider className="flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onValueChange={(val) => handleChange("name", val)}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name}
                  classNames={{
                    inputWrapper:
                      "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all data-[invalid=true]:border-red-500/60",
                    input: "text-slate-200 placeholder:text-slate-500",
                    label: "text-slate-400 text-sm",
                    errorMessage: "text-red-400 text-xs",
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
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={formData.email}
                  onValueChange={(val) => handleChange("email", val)}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                  classNames={{
                    inputWrapper:
                      "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all data-[invalid=true]:border-red-500/60",
                    input: "text-slate-200 placeholder:text-slate-500",
                    label: "text-slate-400 text-sm",
                    errorMessage: "text-red-400 text-xs",
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

              {/* Phone & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onValueChange={(val) => handleChange("phone", val)}
                  classNames={{
                    inputWrapper:
                      "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all",
                    input: "text-slate-200 placeholder:text-slate-500",
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
                    value: "text-slate-200",
                    label: "text-slate-400 text-sm",
                    listbox: "bg-[#0d1b2a] border border-white/10",
                    popoverContent: "bg-[#0d1b2a] border border-white/10",
                  }}
                >
                  {["Male", "Female", "Other", "Prefer not to say"].map(
                    (g) => (
                      <SelectItem
                        key={g.toLowerCase().replace(/ /g, "_")}
                        className="text-slate-300 hover:bg-white/5"
                      >
                        {g}
                      </SelectItem>
                    )
                  )}
                </Select>
              </div>

              {/* Photo URL */}
              <Input
                label="Profile Photo URL (Optional)"
                placeholder="https://example.com/your-photo.jpg"
                value={formData.photo}
                onValueChange={(val) => handleChange("photo", val)}
                classNames={{
                  inputWrapper:
                    "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all",
                  input: "text-slate-200 placeholder:text-slate-500",
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

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onValueChange={(val) => handleChange("password", val)}
                  isInvalid={!!errors.password}
                  errorMessage={errors.password}
                  classNames={{
                    inputWrapper:
                      "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all data-[invalid=true]:border-red-500/60",
                    input: "text-slate-200 placeholder:text-slate-500",
                    label: "text-slate-400 text-sm",
                    errorMessage: "text-red-400 text-xs",
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  }
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  }
                />

                {/* Password Strength */}
                {formData.password && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            getStrengthLevel() >= level
                              ? strengthColors[getStrengthLevel()]
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        {[
                          {
                            check: passwordStrength?.hasMinLength,
                            label: "6+ chars",
                          },
                          {
                            check: passwordStrength?.hasNumber,
                            label: "Number",
                          },
                          {
                            check: passwordStrength?.hasSpecial,
                            label: "Special char",
                          },
                        ].map((req) => (
                          <span
                            key={req.label}
                            className={`text-xs flex items-center gap-1 ${
                              req.check ? "text-emerald-400" : "text-slate-500"
                            }`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={req.check ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}
                              />
                            </svg>
                            {req.label}
                          </span>
                        ))}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          strengthColors[getStrengthLevel()]
                            ?.replace("bg-", "text-")
                            .replace("-500", "-400")
                            .replace("-400", "-400") || "text-slate-500"
                        }`}
                      >
                        {strengthLabels[getStrengthLevel()]}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <Input
                type={showConfirm ? "text" : "password"}
                label="Confirm Password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onValueChange={(val) => handleChange("confirmPassword", val)}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
                classNames={{
                  inputWrapper:
                    "bg-white/5 border border-white/10 hover:border-cyan-500/40 focus-within:border-cyan-500 transition-all data-[invalid=true]:border-red-500/60",
                  input: "text-slate-200 placeholder:text-slate-500",
                  label: "text-slate-400 text-sm",
                  errorMessage: "text-red-400 text-xs",
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                }
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showConfirm ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
              />

              <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold h-12 shadow-xl shadow-cyan-500/20 hover:opacity-90 transition-opacity mt-2"
                size="lg"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </CardBody>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          By creating an account, you agree to our{" "}
          <Link href="#" className="text-slate-500 hover:text-cyan-400 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-slate-500 hover:text-cyan-400 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}