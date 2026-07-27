"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  TextField,
  Label,
  Input,
  FieldError,
  Button,
  Separator,
} from "@heroui/react";
import { signIn } from "@/lib/authClient";
import { getUserByEmail } from "@/lib/api";
import { toast } from "react-toastify";

// export const metadata = {
//   title: "Login",
// };

// Demo administrator account shown on the login page for reviewers.
// Create it once: register normally with this email, then in mongosh run
//   db.users.updateOne({ email: "admin@medicare.com" }, { $set: { role: "admin" } })
const DEMO_ADMIN = {
  email: "admin@medicare.com",
  password: "Admin@123",
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
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
      const result = await signIn.email({
        email: formData.email,
        password: formData.password,
      });
      if (result?.error) {
        toast.error(result.error.message || "Invalid email or password");
      } else {
        toast.success("Welcome back!");
        // Look up the role so each user lands on their own dashboard.
        let dest = "/dashboard/patient";
        try {
          const dbUser = await getUserByEmail(formData.email.trim());
          if (dbUser?.role === "admin") dest = "/dashboard/admin";
          else if (dbUser?.role === "doctor") dest = "/dashboard/doctor";
        } catch {
          // Fall back to the patient dashboard.
        }
        router.push(dest);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setFormData({ email: DEMO_ADMIN.email, password: DEMO_ADMIN.password });
    setErrors({});
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard/patient",
      });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 py-24 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="w-full max-w-md relative">
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
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Sign in to your healthcare account
            </p>
          </div>
        </div>

        <Card className="glass-card border border-white/10">
          <Card.Content className="p-8 flex flex-col gap-6">
            {/* Google Login */}
            <Button
              onPress={handleGoogleLogin}
              isPending={googleLoading}
              className="w-full border border-white/15 bg-transparent text-slate-300 hover:bg-white/5 hover:border-white/30 font-semibold h-12 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {!googleLoading && (
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
              )}
              Continue with Google
            </Button>

            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-white/10" />
              <span className="text-slate-500 text-xs font-medium px-2">
                OR
              </span>
              <Separator className="flex-1 bg-white/10" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <TextField isInvalid={!!errors.email} className="w-full">
                  <Label className="text-slate-400 text-sm mb-1.5 block">Email Address</Label>
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
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
                    />
                  </div>
                  {errors.email && <FieldError className="text-red-400 text-xs mt-1">{errors.email}</FieldError>}
                </TextField>
              </div>

              <div className="flex flex-col gap-1.5">
                <TextField isInvalid={!!errors.password} className="w-full">
                  <Label className="text-slate-400 text-sm mb-1.5 block">Password</Label>
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="w-full h-10 pl-9 pr-9 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <FieldError className="text-red-400 text-xs mt-1">{errors.password}</FieldError>}
                </TextField>
              </div>

              <Button
                type="submit"
                isPending={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold h-12 shadow-xl shadow-cyan-500/20 hover:opacity-90 transition-opacity mt-2 rounded-xl"
                size="lg"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* Demo credentials for reviewers / testers */}
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 text-amber-400 shrink-0"
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
                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Demo Admin Access
                </p>
              </div>
              <p className="text-slate-400 text-xs mb-3 leading-relaxed">
                For reviewers: sign in as an administrator to verify doctors
                and manage the platform.
              </p>
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500">Email</span>
                  <code className="text-slate-200 font-mono">
                    {DEMO_ADMIN.email}
                  </code>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500">Password</span>
                  <code className="text-slate-200 font-mono">
                    {DEMO_ADMIN.password}
                  </code>
                </div>
              </div>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="w-full h-9 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold transition-colors"
              >
                Click here to fill admin credentials
              </button>
            </div>

            <p className="text-center text-slate-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Create Account
              </Link>
            </p>
          </Card.Content>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          By signing in, you agree to our{" "}
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
