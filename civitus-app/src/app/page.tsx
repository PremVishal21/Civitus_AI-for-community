"use client";

import React, { useState, useEffect, useRef } from "react";
import ScrollHero from "@/components/ScrollHero";
import PlatformDashboard from "@/components/PlatformDashboard";
import { Brain, Sparkles, Zap, Activity, Compass, ArrowRight, Database, Server, Terminal, Clock } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type PayloadType = "weather" | "openaq" | "complaint";

export default function Home() {
  const [view, setView] = useState<"landing" | "platform">("landing");
  const [activePayload, setActivePayload] = useState<PayloadType>("weather");
  
  // Real-time Navbar Clock States - Initialized with default value to prevent synchronous effect setState warnings
  const [localCity, setLocalCity] = useState<string>("EAST CORRIDOR");
  const [localTime, setLocalTime] = useState<string>("");

  const mainRef = useRef<HTMLDivElement>(null);

  // Hydration-safe Geolocation & Clock
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`, {
            headers: {
              "Accept-Language": "en"
            }
          })
            .then((res) => res.json())
            .then((data) => {
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.county || data.address.state || "Local Area";
                setLocalCity(city.toUpperCase());
              }
            })
            .catch(() => {});
        },
        () => {}
      );
    }

    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    if (view === "platform") return;

    // 1. Navbar slide down on load
    gsap.fromTo(".floating-navbar",
      { opacity: 0, y: -60 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.15 }
    );

    // 2. Capabilities Section Reveal
    gsap.fromTo(".reveal-features-header",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#features",
          start: "top 80%"
        }
      }
    );

    gsap.fromTo(".features-card",
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.2)",
        stagger: 0.15,
        scrollTrigger: {
          trigger: "#features .grid",
          start: "top 85%"
        }
      }
    );

    // 3. Systems Architecture Section Reveal
    gsap.fromTo(".reveal-arch-header",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#architecture",
          start: "top 80%"
        }
      }
    );

    gsap.fromTo(".arch-card",
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: "#architecture .grid",
          start: "top 85%"
        }
      }
    );

    // 4. Operational Metrics Section Reveal
    gsap.fromTo(".reveal-metrics-header",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".reveal-metrics-header",
          start: "top 85%"
        }
      }
    );

    gsap.fromTo(".metric-card",
      { opacity: 0, scale: 0.92, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.3)",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".metric-card",
          start: "top 90%"
        }
      }
    );

    // 5. Ingestion Pipeline Section Reveal
    gsap.fromTo(".reveal-pipeline-header",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#pipeline",
          start: "top 80%"
        }
      }
    );

    gsap.fromTo(".pipeline-card",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: "#pipeline .grid",
          start: "top 85%"
        }
      }
    );

  }, { dependencies: [view], scope: mainRef });

  const handleEnterPlatform = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setView("platform");
  };

  const handleLeavePlatform = () => {
    setView("landing");
  };

  const payloads: Record<PayloadType, string> = {
    weather: `{
  "api": "openweathermap.org/v2.5/weather",
  "location": {
    "zone": "East Corridor",
    "coords": [37.765, -122.405]
  },
  "metrics": {
    "temperature": "31.2°C",
    "humidity": "58.4%",
    "inversion_layer": true,
    "wind_velocity": "12.4 km/h"
  },
  "timestamp": "2026-07-05T06:00:00.000Z"
}`,
    openaq: `{
  "api": "api.openaq.org/v2/measurements",
  "sensor_id": "AQI-E4-METRO",
  "pollutants": {
    "pm25": "88.4 µg/m³",
    "pm10": "112.0 µg/m³",
    "aqi_index": 165,
    "status": "UNHEALTHY"
  },
  "inferred_source": "construction_dust_excitation"
}`,
    complaint: `{
  "portal": "civitas.gov/incidents/report",
  "category": "environmental_hazard",
  "content": "Heavy concrete cutting dust coating local school yards",
  "nlp_classification": {
    "extracted_intent": "air_pollution_complaint",
    "urgency": "HIGH",
    "auto_ticket_created": "TKT-3122"
  }
}`
  };

  if (view === "platform") {
    return (
      <div className="relative min-h-screen bg-[#F6F1E7]">
        {/* Pass the exit callback directly to PlatformDashboard for clean header flow */}
        <PlatformDashboard onExit={handleLeavePlatform} />
      </div>
    );
  }

  return (
    <div ref={mainRef} className="flex flex-col min-h-screen bg-[#F6F1E7] text-[#1A1C1E] selection:bg-[#CFAC7D]/30 relative overflow-hidden">
      
      {/* Background Mesh Glows */}
      <div className="gradient-glow-sphere glow-forest top-[15vh] left-[-10vw]" />
      <div className="gradient-glow-sphere glow-gold top-[80vh] right-[-15vw]" />
      <div className="gradient-glow-sphere glow-forest top-[180vh] left-[-20vw]" />
      <div className="gradient-glow-sphere glow-gold top-[280vh] right-[-10vw]" />

      {/* FLOATING PILL-SHAPED LUXURY NAVBAR */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 floating-navbar gsap-reveal">
        <header className="neomorph-glass h-18 rounded-full flex items-center justify-between px-8 border border-[#795835]/10 backdrop-blur-md">
          {/* Logo brand - Plaster Logo */}
          <div className="flex items-center gap-2.5">
            <svg className="w-8 h-8 text-[#173328] fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H9v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <div>
              <h1 className="font-logo text-lg leading-none text-[#173328] tracking-wider uppercase font-bold text-glow-forest">
                CIVITAS AI
              </h1>
              <span className="text-[7.5px] uppercase text-zinc-500 font-bold tracking-widest block mt-0.5">
                Decision Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            <a href="#features" className="hover:text-[#173328] transition-all relative py-1 group">
              <span>Capabilities</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#CFAC7D] opacity-0 group-hover:opacity-100 transition-all" />
            </a>
            <a href="#architecture" className="hover:text-[#173328] transition-all relative py-1 group">
              <span>Architecture</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#CFAC7D] opacity-0 group-hover:opacity-100 transition-all" />
            </a>
            <a href="#pipeline" className="hover:text-[#173328] transition-all relative py-1 group">
              <span>Data Pipeline</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#CFAC7D] opacity-0 group-hover:opacity-100 transition-all" />
            </a>
          </nav>

          {/* Real-time Time & City indicator */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full neomorph-inset text-[9px] font-bold uppercase tracking-wider text-[#173328]">
            <Clock className="w-3.5 h-3.5 text-[#CFAC7D] animate-pulse" />
            <span>{localCity} • {localTime || "10:50 AM"}</span>
          </div>

          {/* Call to action */}
          <div>
            <button
              onClick={handleEnterPlatform}
              className="flex items-center gap-1.5 px-5 py-2.5 font-bold text-[9px] rounded-full cursor-pointer uppercase tracking-widest neomorph-btn-dark scale-hover"
            >
              <span>Launch Hub</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <ScrollHero onEnterPlatform={handleEnterPlatform} />

      {/* Capabilities Section */}
      <section id="features" className="relative z-20 py-32 px-8 md:px-16 bg-[#F6F1E7] border-t border-[#795835]/15">
        <div className="max-w-6xl mx-auto space-y-20">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto reveal-features-header gsap-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#173328]/5 border border-[#173328]/10 text-[#173328] text-[9px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-[#CFAC7D]" />
              <span>Full-Stack Community Brain</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-display font-bold tracking-tight text-[#173328] leading-[1.05] font-luxury text-glow-forest">
              A Higher Standard in Community Intelligence
            </h2>
            <p className="text-zinc-655 font-light leading-relaxed text-lg max-w-xl mx-auto italic">
              Unifying raw municipal grids. The platform proactively flags environment surges and dispatches critical response tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Health */}
            <div className="neomorph-plate neomorph-plate-hover p-10 rounded-[28px] relative overflow-hidden group transition-all flex flex-col justify-between features-card gsap-reveal scale-hover">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-full neomorph-inset text-[#173328] w-fit">
                    <Activity className="w-5 h-5 text-[#173328]" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-[#5E7F4E]/10 text-[#5E7F4E] border border-[#5E7F4E]/20">
                    Active Ingestion
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold text-[#173328] mb-3 font-luxury">Health Intelligence</h3>
                <p className="text-xs text-zinc-650 leading-relaxed font-light">
                  Predictive clinical modeling logs connected to Google BigQuery pipelines. Real-time patient intake forecasts detect potential hospital capacity strain up to 48 hours in advance.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-[#795835]/15 flex items-center justify-between text-[9.5px] uppercase tracking-wider font-bold text-zinc-500">
                <span>Core Framework:</span>
                <span className="text-[#173328] font-bold">BigQuery ML Models</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#ECE3D5] group-hover:bg-[#173328] transition-all" />
            </div>

            {/* Environment */}
            <div className="neomorph-plate neomorph-plate-hover p-10 rounded-[28px] relative overflow-hidden group transition-all flex flex-col justify-between features-card gsap-reveal scale-hover">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-full neomorph-inset text-[#173328] w-fit">
                    <Compass className="w-5 h-5 text-[#173328]" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-[#CFAC7D]/20 text-[#795835] border border-[#CFAC7D]/30">
                    Live Coordinates
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold text-[#173328] mb-3 font-luxury">Environmental Safety</h3>
                <p className="text-xs text-zinc-655 leading-relaxed font-light">
                  Micro-particulate AQI sensors, localized humidity indexes, and city flood plains correlated on real-time GIS mapping layers to highlight high-risk municipal grids.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-[#795835]/15 flex items-center justify-between text-[9.5px] uppercase tracking-wider font-bold text-zinc-500">
                <span>Telemetry Source:</span>
                <span className="text-[#173328] font-bold">OpenAQ API Sync</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#ECE3D5] group-hover:bg-[#173328] transition-all" />
            </div>

            {/* Action */}
            <div className="neomorph-plate neomorph-plate-hover p-10 rounded-[28px] relative overflow-hidden group transition-all flex flex-col justify-between features-card gsap-reveal scale-hover">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-full neomorph-inset text-[#173328] w-fit">
                    <Zap className="w-5 h-5 text-[#173328]" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-[#8F4C4C]/10 text-[#8F4C4C] border border-[#8F4C4C]/20">
                    Predictive Dispatch
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold text-[#173328] mb-3 font-luxury">Workflow Automation</h3>
                <p className="text-xs text-zinc-655 leading-relaxed font-light">
                  Natural Language Processing (NLP) classifiers group citizen report images and coordinate-driven complaints to trigger automated, prioritized route task dispatching.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-[#795835]/15 flex items-center justify-between text-[9.5px] uppercase tracking-wider font-bold text-zinc-500">
                <span>Auto-Routing:</span>
                <span className="text-[#173328] font-bold">NLP Classifier Queue</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#ECE3D5] group-hover:bg-[#173328] transition-all" />
            </div>
          </div>
        </div>
      </section>

      {/* Systems Architecture Section */}
      <section id="architecture" className="py-24 px-8 md:px-16 bg-[#ECE3D5]/40 border-t border-[#795835]/15 relative z-20">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto reveal-arch-header gsap-reveal">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">Stack Schema</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-[#173328] font-luxury text-glow-forest">Google Cloud Serverless Core</h2>
            <p className="text-zinc-600 font-light leading-relaxed text-sm max-w-lg mx-auto italic">
              Real-time Pub/Sub streams telemetry datasets into BigQuery models and AlloyDB vector stores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 neomorph-plate neomorph-plate-hover rounded-[24px] space-y-4 flex flex-col justify-between transition-all duration-300 arch-card gsap-reveal scale-hover">
              <div className="space-y-3">
                <span className="text-[9px] text-[#795835] uppercase tracking-wider block font-bold">1. Ingest telemetry</span>
                <strong className="text-[#173328] block font-display text-xl font-bold font-luxury">Pub/Sub Connectors</strong>
                <p className="text-xs text-zinc-650 font-light leading-relaxed">Streams live weather sensors, hospital bed updates, and coordinate-driven citizen report event logs.</p>
              </div>
              <div className="px-2.5 py-1 rounded bg-[#5E7F4E]/10 text-[#5E7F4E] border border-[#5E7F4E]/15 text-[8.5px] font-bold uppercase tracking-wider w-fit mx-auto">
                GCP Pub/Sub Stream
              </div>
            </div>

            <div className="p-6 neomorph-plate neomorph-plate-hover rounded-[24px] space-y-4 flex flex-col justify-between transition-all duration-300 arch-card gsap-reveal scale-hover">
              <div className="space-y-3">
                <span className="text-[9px] text-[#795835] uppercase tracking-wider block font-bold">2. Data Processing</span>
                <strong className="text-[#173328] block font-display text-xl font-bold font-luxury">Cloud Run Tasks</strong>
                <p className="text-xs text-zinc-650 font-light leading-relaxed">Runs data normalization microservices, OCR extraction, and geocoding services.</p>
              </div>
              <div className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-700 border border-blue-500/15 text-[8.5px] font-bold uppercase tracking-wider w-fit mx-auto">
                GCP Cloud Run Compute
              </div>
            </div>

            <div className="p-6 neomorph-plate neomorph-plate-hover rounded-[24px] space-y-4 flex flex-col justify-between transition-all duration-300 arch-card gsap-reveal scale-hover">
              <div className="space-y-3">
                <span className="text-[9px] text-[#795835] uppercase tracking-wider block font-bold">3. Database Layer</span>
                <strong className="text-[#173328] block font-display text-xl font-bold font-luxury">AlloyDB & BigQuery</strong>
                <p className="text-xs text-zinc-650 font-light leading-relaxed">Aggregates long-term historical records, vector embeddings, and multi-year metrics.</p>
              </div>
              <div className="px-2.5 py-1 rounded bg-[#CFAC7D]/20 text-[#795835] border border-[#CFAC7D]/30 text-[8.5px] font-bold uppercase tracking-wider w-fit mx-auto">
                GCP AlloyDB Vector
              </div>
            </div>

            <div className="p-6 neomorph-plate neomorph-plate-hover rounded-[24px] space-y-4 flex flex-col justify-between transition-all duration-300 arch-card gsap-reveal scale-hover">
              <div className="space-y-3">
                <span className="text-[9px] text-[#795835] uppercase tracking-wider block font-bold">4. AI Orchestration</span>
                <strong className="text-[#173328] block font-display text-xl font-bold font-luxury">Vertex AI ADK</strong>
                <p className="text-xs text-zinc-650 font-light leading-relaxed">Coordinates five reasoning agents determining forecast trends and dispatch tasks.</p>
              </div>
              <div className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-700 border border-purple-500/15 text-[8.5px] font-bold uppercase tracking-wider w-fit mx-auto">
                GCP Vertex AI Agents
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Dynamic Operational Metrics Section */}
      <section className="py-24 px-8 md:px-16 bg-[#ECE3D5]/20 border-t border-[#795835]/15 relative z-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto reveal-metrics-header gsap-reveal">
            <span className="text-[10px] text-[#795835] uppercase tracking-widest font-bold block">Live Grid Telemetry</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-[#173328] font-luxury text-glow-forest">Cognitive Operations Metrics</h2>
            <p className="text-zinc-650 font-light leading-relaxed text-sm max-w-lg mx-auto italic">
              Statistical indicators aggregated across GCP computing clusters and multi-agent queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Metric 1 */}
            <div className="p-8 neomorph-plate neomorph-plate-hover rounded-[28px] text-center space-y-4 transition-all duration-300 flex flex-col justify-between metric-card gsap-reveal scale-hover">
              <div className="mx-auto w-12 h-12 rounded-full neomorph-inset flex items-center justify-center text-[#5E7F4E]">
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[40px] font-display font-bold text-[#173328] block leading-none tracking-tight">1.2M+</span>
                <span className="text-[9.5px] text-[#5E7F4E] block font-bold uppercase tracking-wider font-sans">Telemetry Inputs</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-light leading-relaxed">
                Weather stations, traffic loops, and clinical intakes synced every 60 seconds.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="p-8 neomorph-plate neomorph-plate-hover rounded-[28px] text-center space-y-4 transition-all duration-300 flex flex-col justify-between metric-card gsap-reveal scale-hover">
              <div className="mx-auto w-12 h-12 rounded-full neomorph-inset flex items-center justify-center text-[#CFAC7D]">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[40px] font-display font-bold text-[#173328] block leading-none tracking-tight text-glow-gold">99.98%</span>
                <span className="text-[9.5px] text-[#795835] block font-bold uppercase tracking-wider font-sans">Vector Precision</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-light leading-relaxed">
                Unstructured documents indexed to AlloyDB Vector schemas with high-density precision.
              </p>
            </div>

            {/* Metric 3 */}
            <div className="p-8 neomorph-plate neomorph-plate-hover rounded-[28px] text-center space-y-4 transition-all duration-300 flex flex-col justify-between metric-card gsap-reveal scale-hover">
              <div className="mx-auto w-12 h-12 rounded-full neomorph-inset flex items-center justify-center text-[#795835]">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[40px] font-display font-bold text-[#173328] block leading-none tracking-tight">85ms</span>
                <span className="text-[9.5px] text-[#795835] block font-bold uppercase tracking-wider font-sans">Model Latency</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-light leading-relaxed">
                Gemini vector inference, threat correlation, and department routing execution speed.
              </p>
            </div>

            {/* Metric 4 */}
            <div className="p-8 neomorph-plate neomorph-plate-hover rounded-[28px] text-center space-y-4 transition-all duration-300 flex flex-col justify-between metric-card gsap-reveal scale-hover">
              <div className="mx-auto w-12 h-12 rounded-full neomorph-inset flex items-center justify-center text-[#8F4C4C]">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[40px] font-display font-bold text-[#173328] block leading-none tracking-tight">100%</span>
                <span className="text-[9.5px] text-[#8F4C4C] block font-bold uppercase tracking-wider font-sans">Auto Routing</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-light leading-relaxed">
                Incident logs dispatched dynamically to local public service repair routes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED DATA PIPELINE SECTION */}
      <section id="pipeline" className="py-32 px-8 md:px-16 bg-[#F6F1E7] border-t border-[#795835]/15 relative z-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto reveal-pipeline-header gsap-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#173328]/5 border border-[#173328]/10 text-[#173328] text-[9px] font-bold tracking-widest uppercase">
              <Database className="w-3.5 h-3.5 text-[#CFAC7D]" />
              <span>Full-Stack Data Flow</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-[#173328] font-luxury text-glow-forest">
              The Civitas Ingestion Pipeline
            </h2>
            <p className="text-zinc-655 font-light leading-relaxed text-sm max-w-lg mx-auto italic">
              Integrating real-time APIs, public governmental archives, and citizen reports into a singular Decision Intelligence engine.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            <div className="lg:col-span-3 neomorph-plate p-10 rounded-[28px] flex flex-col justify-between gap-12 pipeline-card gsap-reveal">
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-center text-xs">
                <div className="p-4 neomorph-inset rounded-[20px] space-y-2">
                  <Compass className="w-5 h-5 text-[#173328] mx-auto animate-pulse" />
                  <strong className="text-[#173328] block font-display">1. Raw Data</strong>
                  <span className="text-[10px] text-zinc-500 block font-light">Weather API, OpenAQ feeds.</span>
                </div>

                <div className="hidden sm:flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-[#CFAC7D]" />
                </div>

                <div className="p-4 neomorph-inset rounded-[20px] space-y-2">
                  <Server className="w-5 h-5 text-[#173328] mx-auto animate-pulse" />
                  <strong className="text-[#173328] block font-display">2. Pub/Sub</strong>
                  <span className="text-[10px] text-zinc-500 block font-light">Real-time triggers event queues.</span>
                </div>

                <div className="hidden sm:flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-[#CFAC7D]" />
                </div>

                <div className="p-4 neomorph-inset rounded-[20px] space-y-2">
                  <Brain className="w-5 h-5 text-[#173328] mx-auto animate-pulse" />
                  <strong className="text-[#173328] block font-display">3. Gemini</strong>
                  <span className="text-[10px] text-zinc-500 block font-light">Vector parsing & ADK reasoning.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#795835]/15 pt-8 text-xs">
                <div className="p-5 neomorph-inset rounded-[20px] scale-hover">
                  <strong className="text-sm font-display font-bold text-[#173328] block mb-2 font-luxury">Structured Feeds</strong>
                  <p className="text-zinc-655 font-light leading-relaxed mb-4">
                    Pulls hourly JSON telemetry from air sensors, hospital bed ratios, and traffic congestion points.
                  </p>
                  <span className="px-2.5 py-1 rounded bg-[#173328]/10 text-[#173328] text-[9px] font-bold uppercase tracking-wider">99.8% Connected</span>
                </div>

                <div className="p-5 neomorph-inset rounded-[20px] scale-hover">
                  <strong className="text-sm font-display font-bold text-[#173328] block mb-2 font-luxury">Unstructured Feeds</strong>
                  <p className="text-zinc-655 font-light leading-relaxed mb-4">
                    Ingests citizen report images, social texts, and clinical bulletins indexed to AlloyDB Vector database.
                  </p>
                  <span className="px-2.5 py-1 rounded bg-[#CFAC7D]/20 text-[#795835] text-[9px] font-bold uppercase tracking-wider">RAG Vector Sync</span>
                </div>
              </div>

            </div>

            {/* EXPENSIVE INTERACTIVE DATA PLAYGROUND PANEL */}
            <div className="lg:col-span-2 neomorph-plate p-8 rounded-[28px] flex flex-col justify-between space-y-6 pipeline-card gsap-reveal">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#CFAC7D] animate-pulse" />
                  <span className="text-[9px] text-[#CFAC7D] font-bold uppercase tracking-widest font-sans">Telemetry Stream Monitor</span>
                </div>
                <h4 className="text-xl font-display font-bold text-[#173328] font-luxury text-glow-forest">Live API Payload Playground</h4>
                <p className="text-xs text-zinc-550 font-light leading-relaxed font-sans">
                  Select a live telemetry node below to inspect raw payloads ingested by our GCP cloud services.
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActivePayload("weather")}
                    className={`px-4 py-2.5 text-[9px] uppercase tracking-wider font-bold rounded-full transition-all cursor-pointer scale-hover ${
                      activePayload === "weather"
                        ? "neomorph-btn-dark"
                        : "neomorph-btn"
                    }`}
                  >
                    Weather API
                  </button>

                  <button
                    onClick={() => setActivePayload("openaq")}
                    className={`px-4 py-2.5 text-[9px] uppercase tracking-wider font-bold rounded-full transition-all cursor-pointer scale-hover ${
                      activePayload === "openaq"
                        ? "neomorph-btn-dark"
                        : "neomorph-btn"
                    }`}
                  >
                    OpenAQ Sensor
                  </button>

                  <button
                    onClick={() => setActivePayload("complaint")}
                    className={`px-4 py-2.5 text-[9px] uppercase tracking-wider font-bold rounded-full transition-all cursor-pointer scale-hover ${
                      activePayload === "complaint"
                        ? "neomorph-btn-dark"
                        : "neomorph-btn"
                    }`}
                  >
                    Citizen Ticket
                  </button>
                </div>
              </div>

              {/* JSON Display */}
              <div className="bg-zinc-950 p-5 rounded-[20px] border border-white/5 font-mono text-[10px] text-[#CFAC7D] leading-relaxed overflow-x-auto h-52 shadow-inner">
                <pre>{payloads[activePayload]}</pre>
              </div>

              <span className="text-[9.5px] text-zinc-500 font-mono tracking-wider uppercase block text-right font-bold">
                ⚡ SECURED via AlloyDB Vector Search
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#173328] text-[#F6F1E7] pt-24 pb-12 overflow-hidden border-t border-[#795835]/35 z-20">
        
        {/* Silhouette background */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none opacity-15 text-[#CFAC7D]">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 120">
            <path d="M0 120 L0 80 L30 80 L30 50 L60 50 L60 90 L100 90 L100 40 L130 40 L130 90 L170 90 L170 30 L220 30 L220 100 L260 100 L260 70 L300 70 L300 100 L340 100 L340 20 L370 20 L370 100 L410 100 L410 60 L450 60 L450 120 Z" fill="currentColor" />
            <path d="M450 120 L450 90 L480 90 L480 60 L520 60 L520 90 L560 90 L560 30 L600 30 L600 100 L650 100 L650 40 L690 40 L690 90 L740 90 L740 10 L780 10 L780 95 L820 95 L820 50 L870 50 L870 120 Z" fill="currentColor" />
            <path d="M870 120 L870 80 L900 80 L900 60 L930 60 L930 90 L960 90 L960 40 L1000 40 L1000 120 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-[#F6F1E7]/10 pb-12">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <Brain className="w-5 h-5 text-[#CFAC7D]" />
              <span className="font-logo text-xl text-white">CIVITAS AI</span>
            </div>
            <p className="text-xs text-[#F6F1E7]/60 font-light italic max-w-xs leading-relaxed">
              &quot;An intelligent decision engine built to safeguard public health, environmental safety, and civic operations.&quot;
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-wider text-[#F6F1E7]/70">
            <a href="#features" className="hover:text-white transition-all relative py-1 group">
              <span>Capabilities</span>
            </a>
            <a href="#architecture" className="hover:text-white transition-all relative py-1 group">
              <span>Architecture</span>
            </a>
            <button
              onClick={handleEnterPlatform}
              className="text-[#CFAC7D] hover:text-[#CFAC7D]/85 transition-all cursor-pointer uppercase tracking-wider font-bold scale-hover"
            >
              Platform Console
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] text-[#F6F1E7]/40 relative z-10 uppercase tracking-widest font-bold">
          <span>© 2026 Civitas AI. All rights reserved.</span>
          <span>Google Cloud Hackathon Edition</span>
        </div>
      </footer>

    </div>
  );
}
