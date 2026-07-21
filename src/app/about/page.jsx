import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

export const metadata = { title: "About Us" };

const team = [
  {
    name: "Dr. James Carter",
    role: "Chief Medical Officer",
    specialty: "Cardiology",
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Dr. Priya Sharma",
    role: "Head of Operations",
    specialty: "Internal Medicine",
    color: "from-indigo-500 to-purple-600",
  },
  {
    name: "Dr. Michael Lee",
    role: "Chief Technology Advisor",
    specialty: "Health Informatics",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Dr. Amara Osei",
    role: "Patient Experience Lead",
    specialty: "Family Medicine",
    color: "from-amber-500 to-orange-600",
  },
];

const milestones = [
  { year: "2020", title: "Founded", desc: "MediCare Connect was established with a vision to digitize healthcare." },
  { year: "2021", title: "100 Doctors", desc: "Reached our first milestone of 100 verified doctors on the platform." },
  { year: "2022", title: "10K Patients", desc: "Served over 10,000 patients across multiple specializations." },
  { year: "2023", title: "National Expansion", desc: "Expanded to cover all major cities with 300+ verified specialists." },
  { year: "2024", title: "500+ Doctors", desc: "Today, we proudly host 500+ verified doctors and 50K+ patients." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-24 pb-16">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <SectionHeading
              badge="Our Story"
              title="Transforming Healthcare"
              highlight="Since 2020"
              subtitle="MediCare Connect was born from a simple belief — quality healthcare should be accessible to everyone, everywhere, at any time."
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                label: "Our Mission",
                title: "Connecting People with Care",
                desc: "Our mission is to bridge the gap between patients and healthcare professionals by leveraging technology to make quality medical care accessible, affordable, and efficient for everyone.",
                color: "from-cyan-500 to-blue-600",
                glow: "shadow-cyan-500/20",
              },
              {
                icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
                label: "Our Vision",
                title: "Healthcare Without Boundaries",
                desc: "We envision a world where geography, time, and resources are never barriers to receiving the best medical care. A future where every patient is empowered with information and access.",
                color: "from-indigo-500 to-purple-600",
                glow: "shadow-indigo-500/20",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="glass-card border border-white/10 p-8 flex flex-col gap-5 hover-lift"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl ${item.glow}`}
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                    {item.label}
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <SectionHeading
              badge="Core Values"
              title="What Drives"
              highlight="Everything We Do"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
                title: "Patient First",
                desc: "Every decision we make is centered around improving patient outcomes and experiences.",
                color: "from-red-500 to-pink-600",
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Trust & Safety",
                desc: "We verify every doctor and protect every patient's data with the highest security standards.",
                color: "from-emerald-500 to-teal-600",
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Innovation",
                desc: "We continuously evolve our platform to stay ahead of healthcare technology trends.",
                color: "from-amber-500 to-orange-600",
              },
              {
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                title: "Accessibility",
                desc: "Healthcare for all — regardless of location, language, or economic status.",
                color: "from-violet-500 to-purple-600",
              },
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                title: "Privacy",
                desc: "Your medical information is sacred. We use bank-level encryption to protect it.",
                color: "from-cyan-500 to-blue-600",
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Transparency",
                desc: "Clear pricing, honest reviews, and full visibility into doctor credentials and availability.",
                color: "from-indigo-500 to-blue-600",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="glass-card border border-white/5 hover:border-white/15 p-6 flex flex-col gap-4 transition-all duration-300 hover-lift"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center shadow-lg`}
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
                      d={value.icon}
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{value.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <SectionHeading
              badge="Our Journey"
              title="Growing"
              highlight="Together"
            />
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-indigo-500 to-emerald-500 rounded-full" />
            <div className="flex flex-col gap-8">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-6 items-start pl-4">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                  <div className="glass-card border border-white/10 p-5 flex-1 hover-lift">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-cyan-400 font-black text-lg">
                        {m.year}
                      </span>
                      <h3 className="text-white font-bold">{m.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <SectionHeading
              badge="Leadership"
              title="Meet Our"
              highlight="Expert Team"
              subtitle="The visionaries behind MediCare Connect, dedicated to revolutionizing healthcare."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="glass-card border border-white/10 hover:border-white/20 p-6 flex flex-col items-center gap-4 text-center transition-all duration-300 hover-lift"
              >
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center shadow-xl`}
                >
                  <span className="text-white font-black text-2xl">
                    {member.name.split(" ")[1][0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-bold">{member.name}</h3>
                  <p className="text-cyan-400 text-sm font-medium">
                    {member.role}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {member.specialty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card border border-cyan-500/20 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="relative flex flex-col items-center gap-6">
              <h2 className="text-3xl font-black text-white">
                Join the{" "}
                <span className="gradient-text">MediCare Family</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-md">
                Whether you are a patient seeking care or a doctor wanting to
                expand your practice, MediCare Connect is here for you.
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-xl shadow-cyan-500/20 hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-3 rounded-xl border border-white/20 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 font-semibold transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}