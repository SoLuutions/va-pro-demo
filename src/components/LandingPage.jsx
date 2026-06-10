import React, { useEffect, useRef, useState } from "react";
import {
  Clock, Users, CheckCircle, BarChart3, DollarSign, FileText,
  Zap, Shield, Globe, ArrowRight, ChevronDown, Maximize2,
} from "lucide-react";

// ── Mini animated background (matches ShaderBackground palette) ────────────
function LandingBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: "linear-gradient(135deg, #0b1214 0%, #0f3f3a 45%, #128C7E 100%)",
        backgroundSize: "200% 200%",
        animation: "lp-bg-shift 18s ease infinite",
      }}
    />
  );
}

const features = [
  {
    icon: Clock,
    title: "Smart Time Tracking",
    desc: "Start/stop timers per task with automatic time entries. Persistent across refreshes. Time-window validation keeps you within your designated working hours.",
    color: "#39d0c3",
  },
  {
    icon: Users,
    title: "Client Management",
    desc: "Store client profiles with hourly rates, timezones, and contact info. Filter tasks and billing history per client at a glance.",
    color: "#1F6FEB",
  },
  {
    icon: CheckCircle,
    title: "Task Management",
    desc: "Create tasks with time estimates, priorities, and deadlines. Assign to clients and track status from To-Do → In Progress → Done.",
    color: "#2ea043",
  },
  {
    icon: BarChart3,
    title: "Dashboard & Analytics",
    desc: "Live overview of active timers, client count, task progress, and recent activity — all in one beautiful, glanceable dashboard.",
    color: "#f0883e",
  },
  {
    icon: DollarSign,
    title: "Billing & Invoicing",
    desc: "Generate professional invoices, auto-calculate billable hours, and track paid vs. unpaid status per client.",
    color: "#60A5FA",
  },
  {
    icon: FileText,
    title: "Reports & PDF Export",
    desc: "Daily, weekly, and monthly time reports with client breakdowns. Export to PDF for client submission in one click.",
    color: "#a78bfa",
  },
  {
    icon: Maximize2,
    title: "Focus Mode",
    desc: "Distraction-free fullscreen workspace that keeps your timer and task details front-and-center for deep work sessions.",
    color: "#fb7185",
  },
  {
    icon: Zap,
    title: "Command Palette",
    desc: "Power-user shortcuts via Ctrl+K command palette. Instantly navigate, create tasks, or toggle timers without lifting your hands from the keyboard.",
    color: "#fbbf24",
  },
  {
    icon: Shield,
    title: "Supabase Auth + Local Fallback",
    desc: "Secure login via Supabase with email/password. Works offline with localStorage fallback when Supabase isn't configured.",
    color: "#34d399",
  },
  {
    icon: Globe,
    title: "Multi-Theme & Timezone",
    desc: "6 themes (Blue, Dark, Green, Green Dark, Red, Red Dark) switchable at runtime. Timezone-aware time display per user profile.",
    color: "#e879f9",
  },
];

const stats = [
  { label: "Tabs & Views", value: "6" },
  { label: "Themes", value: "6" },
  { label: "PDF Export", value: "✓" },
  { label: "Regex Search", value: "✓" },
];

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @keyframes lp-bg-shift {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-fade-up { animation: lp-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .lp-delay-1 { animation-delay: 0.1s; }
        .lp-delay-2 { animation-delay: 0.22s; }
        .lp-delay-3 { animation-delay: 0.34s; }
        .lp-delay-4 { animation-delay: 0.46s; }
        .lp-float   { animation: lp-float 4s ease-in-out infinite; }

        .lp-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 40px;
          transition: background 0.3s ease, border-bottom 0.3s ease;
        }
        .lp-nav.scrolled {
          background: rgba(11, 18, 20, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(57, 208, 195, 0.12);
        }
        .lp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 20px;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .lp-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #39d0c3, #128C7E);
          box-shadow: 0 0 0 2px rgba(57,208,195,0.3);
          flex-shrink: 0;
        }
        .lp-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lp-btn-ghost {
          padding: 9px 20px;
          border-radius: 10px;
          border: 1px solid rgba(57, 208, 195, 0.3);
          background: transparent;
          color: #e7f1f1;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .lp-btn-ghost:hover {
          background: rgba(57, 208, 195, 0.1);
          border-color: rgba(57, 208, 195, 0.5);
        }
        .lp-btn-primary {
          padding: 10px 22px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #39d0c3, #128C7E);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
          box-shadow: 0 4px 20px rgba(57, 208, 195, 0.35);
        }
        .lp-btn-primary:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .lp-btn-primary-lg {
          padding: 16px 36px;
          font-size: 16px;
          border-radius: 14px;
          box-shadow: 0 8px 30px rgba(57, 208, 195, 0.4);
        }
        .lp-btn-outline-lg {
          padding: 15px 36px;
          border-radius: 14px;
          border: 1px solid rgba(57, 208, 195, 0.4);
          background: rgba(57, 208, 195, 0.08);
          color: #e7f1f1;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .lp-btn-outline-lg:hover {
          background: rgba(57, 208, 195, 0.15);
          border-color: rgba(57, 208, 195, 0.6);
        }
        .lp-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 24px 80px;
          position: relative;
          z-index: 1;
        }
        .lp-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 999px;
          border: 1px solid rgba(57, 208, 195, 0.35);
          background: rgba(57, 208, 195, 0.1);
          color: #39d0c3;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 28px;
          letter-spacing: 0.02em;
        }
        .lp-hero-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #39d0c3;
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .lp-hero-title {
          font-size: clamp(40px, 7vw, 80px);
          font-weight: 800;
          line-height: 1.08;
          color: #e7f1f1;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }
        .lp-hero-title .gradient {
          background: linear-gradient(135deg, #39d0c3 0%, #60A5FA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-hero-sub {
          font-size: clamp(16px, 2.5vw, 20px);
          color: #a6b5bb;
          max-width: 640px;
          margin: 0 auto 48px;
          line-height: 1.6;
        }
        .lp-hero-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .lp-screen-mock {
          position: relative;
          z-index: 1;
          margin: 60px auto 0;
          max-width: 880px;
          width: 100%;
          padding: 0 24px;
        }
        .lp-screen-inner {
          border-radius: 20px;
          border: 1px solid rgba(57, 208, 195, 0.2);
          background: rgba(15, 23, 26, 0.85);
          backdrop-filter: blur(16px);
          box-shadow: 0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(57,208,195,0.08);
          overflow: hidden;
          animation: lp-float 5s ease-in-out infinite;
        }
        .lp-screen-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(57, 208, 195, 0.1);
          background: rgba(18, 28, 33, 0.9);
        }
        .lp-screen-dot { width: 12px; height: 12px; border-radius: 50%; }
        .lp-screen-content { display: flex; min-height: 200px; }
        .lp-mock-sidebar {
          width: 180px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #128C7E, #0f766b);
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .lp-mock-nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.8);
        }
        .lp-mock-nav-item.active {
          background: rgba(255,255,255,0.18);
          color: #fff;
          font-weight: 600;
        }
        .lp-mock-dot { width: 8px; height: 8px; border-radius: 50%; }
        .lp-mock-main {
          flex: 1;
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .lp-mock-card {
          background: rgba(57, 208, 195, 0.06);
          border: 1px solid rgba(57, 208, 195, 0.12);
          border-radius: 10px;
          padding: 12px;
        }
        .lp-mock-card-title { font-size: 10px; color: #a6b5bb; margin-bottom: 6px; font-weight: 500; }
        .lp-mock-card-val { font-size: 20px; font-weight: 700; color: #e7f1f1; }
        .lp-mock-card-sub { font-size: 9px; color: #39d0c3; margin-top: 2px; }

        .lp-section {
          position: relative;
          z-index: 1;
          padding: 100px 24px;
        }
        .lp-section-title {
          text-align: center;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          color: #e7f1f1;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .lp-section-sub {
          text-align: center;
          color: #a6b5bb;
          font-size: 17px;
          max-width: 560px;
          margin: 0 auto 60px;
          line-height: 1.6;
        }
        .lp-features-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .lp-feature-card {
          padding: 28px;
          border-radius: 18px;
          border: 1px solid rgba(57, 208, 195, 0.1);
          background: rgba(15, 23, 26, 0.7);
          backdrop-filter: blur(12px);
          transition: border-color 0.25s ease, transform 0.25s ease, background 0.25s ease;
        }
        .lp-feature-card:hover {
          border-color: rgba(57, 208, 195, 0.3);
          transform: translateY(-4px);
          background: rgba(20, 30, 34, 0.9);
        }
        .lp-feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          margin-bottom: 16px;
        }
        .lp-feature-title { font-size: 16px; font-weight: 700; color: #e7f1f1; margin-bottom: 8px; }
        .lp-feature-desc { font-size: 14px; color: #a6b5bb; line-height: 1.65; }

        .lp-stats-row {
          max-width: 700px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          text-align: center;
        }
        .lp-stat-card {
          padding: 24px 16px;
          border-radius: 16px;
          border: 1px solid rgba(57, 208, 195, 0.15);
          background: rgba(18, 28, 33, 0.7);
          backdrop-filter: blur(8px);
        }
        .lp-stat-val { font-size: 36px; font-weight: 800; color: #39d0c3; line-height: 1; margin-bottom: 6px; }
        .lp-stat-lbl { font-size: 13px; color: #a6b5bb; font-weight: 500; }

        .lp-cta-section {
          position: relative;
          z-index: 1;
          padding: 80px 24px 120px;
          text-align: center;
        }
        .lp-cta-box {
          max-width: 640px;
          margin: 0 auto;
          padding: 64px 40px;
          border-radius: 28px;
          border: 1px solid rgba(57, 208, 195, 0.2);
          background: rgba(15, 63, 58, 0.35);
          backdrop-filter: blur(24px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.35);
        }
        .lp-footer {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 32px 24px;
          border-top: 1px solid rgba(57, 208, 195, 0.08);
          color: #a6b5bb;
          font-size: 13px;
        }
        @media (max-width: 640px) {
          .lp-nav { padding: 14px 20px; }
          .lp-stats-row { grid-template-columns: repeat(2, 1fr); }
          .lp-mock-sidebar { display: none; }
          .lp-mock-main { grid-template-columns: repeat(2, 1fr); }
          .lp-cta-box { padding: 40px 24px; }
        }
      `}</style>

      <LandingBackground />

      {/* NAV */}
      <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
        <div className="lp-brand">
          <div className="lp-logo" />
          VA Pro
        </div>
        <div className="lp-nav-actions">
          <button className="lp-btn-ghost" onClick={onSignIn} id="lp-signin-nav">
            Sign In
          </button>
          <button className="lp-btn-primary" onClick={onGetStarted} id="lp-getstarted-nav">
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero" ref={heroRef}>
        <div className="lp-hero-badge lp-fade-up">
          <span className="dot" />
          Built for Philippine Virtual Assistants
        </div>

        <h1 className="lp-hero-title lp-fade-up lp-delay-1">
          Your all-in-one<br />
          <span className="gradient">VA productivity suite</span>
        </h1>

        <p className="lp-hero-sub lp-fade-up lp-delay-2">
          Track time, manage clients, generate invoices, and focus deeply —
          all from a single, beautiful platform designed for remote freelancers.
        </p>

        <div className="lp-hero-cta lp-fade-up lp-delay-3">
          <button
            className="lp-btn-primary lp-btn-primary-lg"
            onClick={onGetStarted}
            id="lp-getstarted-hero"
          >
            Start for free
            <ArrowRight style={{ display: "inline", width: 18, height: 18, marginLeft: 8, verticalAlign: "middle" }} />
          </button>
          <button
            className="lp-btn-outline-lg"
            onClick={onSignIn}
            id="lp-signin-hero"
          >
            Sign In
          </button>
        </div>

        {/* App mock */}
        <div className="lp-screen-mock lp-fade-up lp-delay-4">
          <div className="lp-screen-inner">
            <div className="lp-screen-bar">
              <div className="lp-screen-dot" style={{ background: "#ff5f57" }} />
              <div className="lp-screen-dot" style={{ background: "#ffbd2e" }} />
              <div className="lp-screen-dot" style={{ background: "#28c940" }} />
            </div>
            <div className="lp-screen-content">
              <div className="lp-mock-sidebar">
                {[
                  { label: "Dashboard", color: "#39d0c3", active: true },
                  { label: "Clients",   color: "#60A5FA" },
                  { label: "Tasks",     color: "#2ea043" },
                  { label: "Time",      color: "#f0883e" },
                  { label: "Reports",   color: "#a78bfa" },
                  { label: "Billing",   color: "#fb7185" },
                ].map((item) => (
                  <div key={item.label} className={`lp-mock-nav-item${item.active ? " active" : ""}`}>
                    <div className="lp-mock-dot" style={{ background: item.color }} />
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="lp-mock-main">
                {[
                  { title: "Total Clients", val: "8",    sub: "+2 this month" },
                  { title: "Active Tasks",  val: "14",   sub: "3 due today" },
                  { title: "Hours Today",   val: "6:42", sub: "billable" },
                  { title: "This Week",     val: "34h",  sub: "₱27,200" },
                  { title: "Invoices",      val: "₱84k", sub: "3 pending" },
                  { title: "Focus Score",   val: "94%",  sub: "on-time tasks" },
                ].map((card) => (
                  <div key={card.title} className="lp-mock-card">
                    <div className="lp-mock-card-title">{card.title}</div>
                    <div className="lp-mock-card-val">{card.val}</div>
                    <div className="lp-mock-card-sub">{card.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48, color: "#a6b5bb", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13 }}>Explore features</span>
          <ChevronDown style={{ width: 20, height: 20, animation: "lp-float 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* STATS */}
      <section className="lp-section" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="lp-stats-row">
          {stats.map((s) => (
            <div key={s.label} className="lp-stat-card">
              <div className="lp-stat-val">{s.value}</div>
              <div className="lp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-section">
        <h2 className="lp-section-title">Everything a VA needs</h2>
        <p className="lp-section-sub">
          From your first client to your busiest month — VA Pro keeps you organised, billable, and focused.
        </p>
        <div className="lp-features-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="lp-feature-card">
                <div
                  className="lp-feature-icon"
                  style={{ background: `${f.color}1a` }}
                >
                  <Icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta-section">
        <div className="lp-cta-box">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#e7f1f1", marginBottom: 12, letterSpacing: "-0.02em" }}>
            Ready to get organised?
          </h2>
          <p style={{ color: "#a6b5bb", fontSize: 16, lineHeight: 1.6, marginBottom: 36 }}>
            Create a free account and start tracking your time,<br />clients, and earnings today.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="lp-btn-primary lp-btn-primary-lg"
              onClick={onGetStarted}
              id="lp-getstarted-cta"
            >
              Create free account
            </button>
            <button
              className="lp-btn-outline-lg"
              onClick={onSignIn}
              id="lp-signin-cta"
            >
              I have an account
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <div className="lp-logo" style={{ width: 24, height: 24, borderRadius: 6 }} />
          <strong style={{ color: "#e7f1f1" }}>VA Pro</strong>
        </div>
        <p>
          Built for Philippine Virtual Assistants &nbsp;•&nbsp;
          <a
            href="https://clarklindleysuan.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#39d0c3", textDecoration: "none" }}
          >
            clarklindleysuan.com
          </a>
        </p>
      </footer>
    </>
  );
}
