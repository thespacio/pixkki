// app/test.tsx
"use client";

import Link from "next/link";
import { PawPrint, ArrowRight, BarChart2, Heart, Stethoscope, DollarSign, CheckCircle, Star, ChevronRight, HandCoins } from "lucide-react";
import { useRouter } from "next/navigation";
const logo = "/images/logo.png";


const features = [
  {
    icon: <PawPrint size={20} />,
    title: "Animal Management",
    desc: "Complete profiles for every dog and cat — photos, health records, intake history, and kennel assignment, all in one place.",
    color: "#43AE6D",
    bg: "#EBF7F1",
  },
  {
    icon: <Heart size={20} />,
    title: "Adoption Pipeline",
    desc: "Track applications from first contact to signed agreement. Manage home visits, approvals, and follow-ups effortlessly.",
    color: "#E8A87C",
    bg: "#FDF2EA",
  },
  {
    icon: <DollarSign size={20} />,
    title: "Donation Tracking",
    desc: "Log one-time gifts, recurring donors, corporate sponsors, and grants. Generate reports for your board in seconds.",
    color: "#6B9FAE",
    bg: "#EAF3F6",
  },
  {
    icon: <Stethoscope size={20} />,
    title: "Medical Records",
    desc: "Vaccines, treatments, surgeries, and vet notes — organized per animal and accessible to your entire care team.",
    color: "#D8C4A5",
    bg: "#F6F1E9",
  },
  {
    icon: <BarChart2 size={20} />,
    title: "Operational Metrics",
    desc: "Live dashboards for occupancy, monthly adoptions, revenue trends, and staff efficiency. Know your shelter at a glance.",
    color: "#43AE6D",
    bg: "#EBF7F1",
  },
  {
    icon: <CheckCircle size={20} />,
    title: "Staff Coordination",
    desc: "Role-based access for managers, volunteers, and vets. Everyone sees exactly what they need — nothing more.",
    color: "#E8A87C",
    bg: "#FDF2EA",
  },
];

const testimonials = [
  {
    quote: "Pixkki cut our intake paperwork from 45 minutes to under 10. Our team finally has time to focus on the animals.",
    author: "Sofia Brennan",
    role: "Director, Riverside Animal Rescue",
    initials: "SB",
    color: "#43AE6D",
  },
  {
    quote: "We went from spreadsheets to a real system overnight. Donor reporting alone saved us 6 hours a month.",
    author: "Marcus Holt",
    role: "Operations Lead, Northside Humane Society",
    initials: "MH",
    color: "#6B9FAE",
  },
  {
    quote: "The registro pipeline view is exactly what we needed. We haven't missed a follow-up since we started using Pixkki.",
    author: "Yemi Adeyemi",
    role: "Shelter Manager, Suncoast Pet Haven",
    initials: "YA",
    color: "#E8A87C",
  },
];

const stats = [
  { value: "340+", label: "Shelters using Pixkki" },
  { value: "28,000", label: "Animals managed monthly" },
  { value: "94%", label: "Faster intake processing" },
  { value: "$2.4M", label: "Donations tracked this year" },
];

export default function Landing() {
  const router = useRouter();
  return (
      <div className="min-h-screen bg-background"

      >
        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/*Logo*/}
              <div className="w-10 h-10 px-1 py-1 rounded-md flex items-center justify-center" style={{ backgroundColor: "#43AE6D" }}>
                <img src={logo} alt="Logo" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">Pixkki</span>
            </div>
            <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
              <a href="../page.tsx#features" className="hover:text-foreground transition-colors">Misión</a>
              <a href="../page.tsx#testimonials" className="hover:text-foreground transition-colors">Albergues</a>
              <a href="../page.tsx#pricing" className="hover:text-foreground transition-colors">Mascotas</a>
            </div>
            <div className="flex items-center gap-3">
              <button
                  onClick={() => router.push("/login")}
                  className="flex cursor-pointer
                            items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#43AE6D" }}
              >
                <HandCoins size={14} /> Quiero donar
              </button>
              <button
                  onClick={() => router.push("/")}
                  className="flex cursor-pointer items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#43AE6D" }}
              >
                <PawPrint size={14} /> Quiero adoptar
              </button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-8 pt-20 pb-16">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ backgroundColor: "#EBF7F1", color: "#43AE6D" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                Built for animal welfare organizations
              </div>
              <h1 className="text-5xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
                Every animal<br />deserves a<br />
                <span style={{ color: "#43AE6D" }}>organized shelter.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                Pixkki brings your entire shelter operation into one calm, clear platform — from intake to adoption, medical care to donor management.
              </p>
              <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push("/login")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#43AE6D" }}
                >
                  Start free trial <ArrowRight size={15} />
                </button>
                <button
                    onClick={() => router.push("/login")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-foreground bg-card border border-border hover:bg-secondary transition-colors"
                >
                  View demo
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">No credit card required · 30-day free trial · Cancel anytime</p>
            </div>

            {/* Hero image collage */}
            <div className="relative h-[480px]">
              <div className="absolute top-0 right-0 w-72 h-52 rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: "#EBF7F1" }}>
                <img
                    src="https://images.unsplash.com/photo-1655306963086-a34411c0915b?w=580&h=420&fit=crop&auto=format"
                    alt="A dog and cat resting together"
                    className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-64 h-48 rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: "#FDF2EA" }}>
                <img
                    src="https://images.unsplash.com/photo-1594004844563-536a03a6e532?w=520&h=390&fit=crop&auto=format"
                    alt="Person holding a rescued dog"
                    className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-48 left-8 w-52 h-44 rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: "#EAF3F6" }}>
                <img
                    src="https://images.unsplash.com/photo-1553688738-a278b9f063e0?w=420&h=360&fit=crop&auto=format"
                    alt="Puppy at shelter"
                    className="w-full h-full object-cover"
                />
              </div>
              {/* Floating stat card */}
              <div className="absolute bottom-16 right-0 bg-card border border-border rounded-2xl px-4 py-3 shadow-md flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EBF7F1" }}>
                  <Heart size={16} style={{ color: "#43AE6D" }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">This month</p>
                  <p className="text-sm font-semibold text-foreground">41 animals adopted</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-border bg-card">
          <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-semibold text-foreground tracking-tight mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-3">Everything your shelter needs</h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">One platform to replace the spreadsheets, paper forms, and disconnected tools. Designed specifically for animal welfare teams.</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {features.map(({ icon, title, desc, color, bg }) => (
                <div key={title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: bg, color }}>
                    {icon}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
            ))}
          </div>
        </section>

        {/* Dashboard preview */}
        <section className="bg-card border-y border-border py-20">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ backgroundColor: "#EAF3F6", color: "#6B9FAE" }}>
                  Real-time visibility
                </div>
                <h2 className="text-3xl font-semibold text-foreground tracking-tight leading-tight mb-4">
                  See your whole shelter in a single view
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  Live occupancy rates, adoption pipeline status, incoming donations, and medical alerts — all surfaced on one calm dashboard your whole team can trust.
                </p>
                <ul className="space-y-3">
                  {[
                    "Real-time kennel occupancy tracking",
                    "Adoption funnel with stage-by-stage visibility",
                    "Donation revenue charts and donor history",
                    "Medical hold alerts and vaccine schedules",
                  ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                        <CheckCircle size={15} style={{ color: "#43AE6D", flexShrink: 0 }} />
                        {item}
                      </li>
                  ))}
                </ul>
                <button
                    onClick={() => router.push("/login")}
                    className="flex items-center gap-2 mt-8 text-sm font-semibold text-primary hover:opacity-75 transition-opacity"
                >
                  See it live <ChevronRight size={15} />
                </button>
              </div>
              {/* Mini dashboard mockup */}
              <div className="rounded-2xl border border-border overflow-hidden shadow-lg bg-background">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-card">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#D94F4F" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#E8A87C" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#43AE6D" }} />
                  <div className="flex-1 mx-3 h-4 rounded bg-secondary flex items-center px-2">
                    <span className="text-[9px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono" }}>app.pixkki.io/dashboard</span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Animals in Shelter", value: "147", color: "#43AE6D", bg: "#EBF7F1" },
                    { label: "Monthly Adoptions", value: "41", color: "#E8A87C", bg: "#FDF2EA" },
                    { label: "Donations Dec", value: "$11.2k", color: "#6B9FAE", bg: "#EAF3F6" },
                    { label: "Occupancy", value: "78%", color: "#D8C4A5", bg: "#F6F1E9" },
                  ].map(({ label, value, color, bg }) => (
                      <div key={label} className="bg-card border border-border rounded-xl p-3">
                        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
                        <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace", color }}>{value}</p>
                      </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <div className="bg-card border border-border rounded-xl p-3">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Intakes</p>
                    {["Mango · Golden Retriever · Available", "Luna · Domestic Shorthair · Medical Hold", "Biscuit · Beagle Mix · Pending"].map((row) => (
                        <div key={row} className="text-[9px] text-muted-foreground py-1 border-b border-border last:border-0">{row}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="max-w-6xl mx-auto px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-3">Trusted by shelters everywhere</h2>
            <p className="text-base text-muted-foreground">From small rescues to large municipal facilities</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {testimonials.map(({ quote, author, role, initials, color }) => (
                <div key={author} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="#43AE6D" stroke="none" />)}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: color }}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{author}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-card border-y border-border py-20">
          <div className="max-w-4xl mx-auto px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-3">Simple, transparent pricing</h2>
              <p className="text-base text-muted-foreground">For organizations of every size. No hidden fees.</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  plan: "Rescue",
                  price: "$0",
                  period: "forever",
                  desc: "For small rescues just getting started.",
                  features: ["Up to 30 animals", "Basic intake & registro", "2 staff accounts", "Email support"],
                  cta: "Start free",
                  highlight: false,
                },
                {
                  plan: "Shelter",
                  price: "$79",
                  period: "per month",
                  desc: "For established shelters ready to scale.",
                  features: ["Unlimited animals", "Full registro pipeline", "Medical records", "Donation tracking", "10 staff accounts", "Priority support"],
                  cta: "Start 30-day trial",
                  highlight: true,
                },
                {
                  plan: "Network",
                  price: "Custom",
                  period: "contact us",
                  desc: "For multi-location organizations and municipalities.",
                  features: ["Multiple locations", "Custom integrations", "Dedicated onboarding", "SLA & compliance", "Unlimited staff"],
                  cta: "Talk to us",
                  highlight: false,
                },
              ].map(({ plan, price, period, desc, features, cta, highlight }) => (
                  <div
                      key={plan}
                      className="rounded-2xl border p-6 flex flex-col gap-5"
                      style={{
                        backgroundColor: highlight ? "#43AE6D" : "#FFFFFF",
                        borderColor: highlight ? "#43AE6D" : "rgba(46,46,46,0.08)",
                      }}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: highlight ? "rgba(255,255,255,0.7)" : "#7A7670" }}>{plan}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold tracking-tight" style={{ color: highlight ? "#fff" : "#2E2E2E", fontFamily: "'JetBrains Mono', monospace" }}>{price}</span>
                        <span className="text-xs" style={{ color: highlight ? "rgba(255,255,255,0.65)" : "#7A7670" }}>/{period}</span>
                      </div>
                      <p className="text-xs mt-2" style={{ color: highlight ? "rgba(255,255,255,0.8)" : "#7A7670" }}>{desc}</p>
                    </div>
                    <ul className="space-y-2 flex-1">
                      {features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs" style={{ color: highlight ? "rgba(255,255,255,0.9)" : "#2E2E2E" }}>
                            <CheckCircle size={13} style={{ color: highlight ? "rgba(255,255,255,0.7)" : "#43AE6D", flexShrink: 0 }} />
                            {f}
                          </li>
                      ))}
                    </ul>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                        style={{
                          backgroundColor: highlight ? "rgba(255,255,255,0.18)" : "#43AE6D",
                          color: "#fff",
                          border: highlight ? "1px solid rgba(255,255,255,0.3)" : "none",
                        }}
                    >
                      {cta}
                    </button>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="max-w-6xl mx-auto px-8 py-20">
          <div className="rounded-3xl p-12 text-center" style={{ backgroundColor: "#EBF7F1" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#43AE6D" }}>
              <PawPrint size={26} color="#fff" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-3">Ready to give your shelter a better system?</h2>
            <p className="text-base text-muted-foreground max-w-lg mx-auto mb-8">Join 340+ shelters using Pixkki to save time, reduce paperwork, and focus on what matters — the animals.</p>
            <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#43AE6D" }}
            >
              Get started for free <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card">
          <div className="max-w-6xl mx-auto px-8 py-8 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "#43AE6D" }}>
                <PawPrint size={12} color="#fff" strokeWidth={2.2} />
              </div>
              <span className="text-sm font-semibold text-foreground">Pixkki</span>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Pixkki. Albergando huellas.</p>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a href="../page.tsx#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="../page.tsx#" className="hover:text-foreground transition-colors">Terminos</a>
              <a href="../page.tsx#" className="hover:text-foreground transition-colors">Contacto</a>
              <a href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</a>
            </div>
          </div>
        </footer>
      </div>
  );
}