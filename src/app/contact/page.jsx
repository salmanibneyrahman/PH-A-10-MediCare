"use client";

import { useState } from "react";
import { TextField, Label, Input, TextArea, Button, Card, FieldError } from "@heroui/react";
import SectionHeading from "@/components/SectionHeading";
import { toast } from "react-toastify";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Enter a valid email";
    if (!formData.subject.trim()) errs.subject = "Subject is required";
    if (!formData.message.trim()) errs.message = "Message is required";
    else if (formData.message.trim().length < 20)
      errs.message = "Message must be at least 20 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Message sent! We will get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
      label: "Address",
      value: "123 Health Street, Medical City, MC 10001",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      label: "Email",
      value: "support@medicareconnect.com",
      color: "from-indigo-500 to-purple-600",
    },
    {
      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      label: "Phone",
      value: "+1 (800) 123-4567",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      label: "Working Hours",
      value: "Mon–Sat, 9:00 AM – 8:00 PM",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-24 pb-16">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <SectionHeading
            badge="Get In Touch"
            title="We Are Here"
            highlight="To Help You"
            subtitle="Have questions about our platform, need support, or want to partner with us? Reach out and our team will respond within 24 hours."
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {contactInfo.map((info) => (
            <Card
              key={info.label}
              className="glass-card border border-white/10 hover:border-white/20 transition-all hover-lift"
            >
              <Card.Content className="p-6 flex flex-col gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center shadow-lg`}
                >
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
                      d={info.icon}
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                    {info.label}
                  </p>
                  <p className="text-white text-sm font-semibold leading-relaxed">
                    {info.value}
                  </p>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Form & Emergency */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
  <div className="lg:col-span-2">
    <Card className="glass-card border border-white/10 p-8">
      <h2 className="text-white font-bold text-xl mb-6">
        Send Us a Message
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Full Name */}
          <TextField isInvalid={!!errors.name} className="w-full">
            <Label className="text-slate-400 text-sm mb-1.5 block">Full Name</Label>
            <Input
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
            />
            {errors.name && <FieldError className="text-red-400 text-xs mt-1">{errors.name}</FieldError>}
          </TextField>

          {/* Email Address */}
          <TextField isInvalid={!!errors.email} className="w-full">
            <Label className="text-slate-400 text-sm mb-1.5 block">Email Address</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
            />
            {errors.email && <FieldError className="text-red-400 text-xs mt-1">{errors.email}</FieldError>}
          </TextField>

        </div>

        {/* Subject */}
        <TextField isInvalid={!!errors.subject} className="w-full">
          <Label className="text-slate-400 text-sm mb-1.5 block">Subject</Label>
          <Input
            placeholder="How can we help?"
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            className="w-full h-10 px-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none"
          />
          {errors.subject && <FieldError className="text-red-400 text-xs mt-1">{errors.subject}</FieldError>}
        </TextField>

        {/* Message */}
        <TextField isInvalid={!!errors.message} className="w-full">
          <Label className="text-slate-400 text-sm mb-1.5 block">Message</Label>
          <TextArea
            placeholder="Write your message here..."
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            rows={5} /* Swapped v2 minRows out for standard HTML rows */
            className="w-full p-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-500 rounded-xl text-slate-200 placeholder:text-slate-500 text-sm transition-all focus:outline-none resize-none"
          />
          {errors.message && <FieldError className="text-red-400 text-xs mt-1">{errors.message}</FieldError>}
        </TextField>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold h-12 shadow-xl shadow-cyan-500/20 hover:opacity-90 transition-opacity rounded-xl"
          size="lg"
        >
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Card>
  </div>
);

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Emergency */}
            <Card className="glass-card border border-red-500/30 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />
              <Card.Content className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider">
                      Emergency Hotline
                    </p>
                    <p className="text-white font-black text-xl">
                      911
                    </p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  For life-threatening emergencies, call 911 immediately. Our
                  platform is not intended for emergency medical situations.
                </p>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-300 text-sm font-semibold text-center">
                    24/7 Emergency Line
                  </p>
                  <p className="text-white font-black text-center text-lg">
                    +1 (800) 911-0000
                  </p>
                </div>
              </Card.Content>
            </Card>

            {/* FAQ */}
            <Card className="glass-card border border-white/10">
              <Card.Content className="p-6 flex flex-col gap-4">
                <h3 className="text-white font-bold">Quick Answers</h3>
                {[
                  {
                    q: "How do I book an appointment?",
                    a: "Find a doctor, click Book, and complete the payment.",
                  },
                  {
                    q: "Are all doctors verified?",
                    a: "Yes, every doctor is manually verified by our admin team.",
                  },
                  {
                    q: "Can I cancel an appointment?",
                    a: "Yes, from your dashboard up to 2 hours before the appointment.",
                  },
                ].map((faq, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <p className="text-white text-sm font-semibold mb-1">
                      {faq.q}
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}