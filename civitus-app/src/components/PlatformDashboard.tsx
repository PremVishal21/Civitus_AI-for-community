/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  Compass,
  Database,
  Image as ImageIcon,
  MapPin,
  Play,
  RefreshCw,
  Upload,
  Zap,
  ArrowRight,
  Terminal,
  Copy,
  ExternalLink,
  Code,
  Layers,
  Search,
  Sparkles
} from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface RecommendedAction {
  id: string;
  action: string;
  status: "idle" | "dispatching" | "completed";
  iconType: "clinic" | "inventory" | "school" | "advisory" | "ambulance";
}

interface Ticket {
  id: string;
  title: string;
  department: string;
  severity: "URGENT" | "HIGH" | "MEDIUM";
  status: "OPEN" | "DISPATCHED" | "RESOLVED";
  timestamp: string;
}

interface PlatformDashboardProps {
  onExit?: () => void;
}

const INITIAL_LOGS = [
  "[REAL-TIME API] weather-node-04: Temp 31°C, Humidity 58%, Wind 12km/h (Sync completed)",
  "[OPENAQ API] sensor-east-zone-pm25: PM2.5 measured at 14.8 µg/m³ (Nominal)",
  "[GOVT DATABASE] hospital-beds-dataset: East Zone capacity audit complete. 74% bed occupancy.",
  "[REAL-TIME API] traffic-stream-ward5: Density matrix nominal at 22 vehicles/min.",
  "[CITIZEN PORTAL] feed-event: New sanitation ticket #TKT-4089 created for Ward 2.",
  "[REAL-TIME API] weather-node-04: Pressure gradient stabilized at 1012 hPa."
];

export default function PlatformDashboard({ onExit }: PlatformDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  
  
  // Real-time sensor metrics
  const [aqiVal, setAqiVal] = useState<number>(58);
  const [pm25Val, setPm25Val] = useState<number>(12.4);
  const [bedOccupancy, setBedOccupancy] = useState<number>(74);
  const [overallRisk, setOverallRisk] = useState<number>(24);
  
  // Simulation log ticker
  const [sensorLogs, setSensorLogs] = useState<string[]>(INITIAL_LOGS);
  
  // Decision Intelligence Demo Flow States
  const [queryInput, setQueryInput] = useState<string>("");
  const [demoTriggered, setDemoTriggered] = useState<boolean>(false);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  // Dynamic Query Outputs
  const [resultTitle, setResultTitle] = useState<string>("East Zone Respiratory Admissions Surge");
  const [resultConfidence, setResultConfidence] = useState<number>(94);
  const [causes, setCauses] = useState<{ label: string; value: string; desc: string }[]>([
    { label: "Primary Cause", value: "PM2.5 Spikes", desc: "Air pollution particulate matter increased by 41% in East Zone." },
    { label: "Secondary Cause", value: "High Pollen", desc: "Localized high concentration of seasonal grass pollens." },
    { label: "Third Cause", value: "Construction Dust", desc: "Suspended micro-sands from local metro pipeline excavation." }
  ]);
  const [resultProjection, setResultProjection] = useState<string>("Admissions will increase another 18% in the next 24 hours.");
  const [resultRationale, setResultRationale] = useState<string>("Formulated from correlations across: weather forecasts (high temperature, humidity), hospital bed telemetries, traffic APIs (congestion limits on route times), citizen complaints (dust reports), medicine inventories, and 5-year seasonal historical cycles.");
  
  // Map markers & state
  const [mapClinicsAdded, setMapClinicsAdded] = useState<boolean>(false);
  const mapRef = useRef<any>(null);

  // User live location coordinates (Default to SF [37.765, -122.405])
  const [userCoords, setUserCoords] = useState<[number, number]>([37.765, -122.405]);
  const [locationName, setLocationName] = useState<string>("East Corridor");

  // GSAP animation refs
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Geolocation lookup
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords([latitude, longitude]);
          setLocationName("Local Zone");
          
          // Reverse-geocoding lookup using Nominatim OpenStreetMap API
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`, {
            headers: {
              "Accept-Language": "en"
            }
          })
            .then((res) => res.json())
            .then((data) => {
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.county || data.address.state || "Local";
                setLocationName(`${city} District`);
              }
            })
            .catch((err) => console.log("Nominatim reverse geocoding failed: ", err));
        },
        (error) => {
          console.log("Geolocation permission denied or failed. Fallback to default SF coordinates.", error);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Recommended actions and their dispatch status
  const [actions, setActions] = useState<RecommendedAction[]>([
    { id: "act-1", action: "Deploy two mobile clinics", status: "idle", iconType: "clinic" },
    { id: "act-2", action: "Increase inhaler inventory", status: "idle", iconType: "inventory" },
    { id: "act-3", action: "Notify East Zone schools (draft email)", status: "idle", iconType: "school" },
    { id: "act-4", action: "Issue public health advisory", status: "idle", iconType: "advisory" },
    { id: "act-5", action: "Increase ambulance coverage", status: "idle", iconType: "ambulance" }
  ]);

  // Live Incident Tickets List
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "TKT-4089", title: "Dumping Complaint Ward 2", department: "Sanitation & Waste", severity: "MEDIUM", status: "OPEN", timestamp: "12:44:10" },
    { id: "TKT-3122", title: "Asphalt Cracking East Corridor", department: "Road Maintenance", severity: "HIGH", status: "OPEN", timestamp: "11:20:05" }
  ]);

  // Document indexing state
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Citizen report Vision upload simulator states
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<any | null>(null);
  const [visionLoading, setVisionLoading] = useState<boolean>(false);

  // File Upload Refs & States
  const visionFileInputRef = useRef<HTMLInputElement>(null);
  const ragFileInputRef = useRef<HTMLInputElement>(null);
  const [docName, setDocName] = useState<string>("");

  // IoT Logs Generator Loop (real-time stream simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString();
      const randomMsgType = Math.random();
      let logMsg = "";

      if (randomMsgType < 0.25) {
        const val = demoTriggered ? (78 + Math.random() * 25).toFixed(1) : (10 + Math.random() * 12).toFixed(1);
        logMsg = `[${time}] [OPENAQ API] sensor-east-zone-pm25: PM2.5 concentration spikes to ${val} µg/m³ (${Number(val) > 35 ? "ALERT: UNHEALTHY" : "NOMINAL"})`;
        if (demoTriggered) {
          setPm25Val(Number(val));
          setAqiVal(Math.floor(Number(val) * 1.8));
        }
      } else if (randomMsgType < 0.50) {
        const val = demoTriggered ? (88 + Math.random() * 6).toFixed(0) : (70 + Math.random() * 6).toFixed(0);
        logMsg = `[${time}] [GOVT DATABASE] hospital-beds-dataset: Bed telemetry updates to ${val}% capacity in East Zone.`;
        if (demoTriggered) {
          setBedOccupancy(Number(val));
        }
      } else if (randomMsgType < 0.75) {
        logMsg = `[${time}] [CITIZEN PORTAL] report-feed: Automated NLP clustering grouped 12 construction dust complaints in East Zone.`;
      } else {
        logMsg = `[${time}] [REAL-TIME API] traffic-sensor-east: Heavy congestion detected near subway intersection. Transit index: 78/100.`;
      }

      setSensorLogs((prev) => [logMsg, ...prev.slice(0, 24)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [demoTriggered]);

  // GSAP Animations setup
  
  // 1. Tab Transition Reveal
  useGSAP(() => {
    if (!tabContentRef.current) return;
    
    // Stagger animate all direct children of the active tab pane
    gsap.fromTo(tabContentRef.current.querySelectorAll(".tab-pane-active > *"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 }
    );

    // Dynamic map overlay popups reveal
    if (activeTab === "map") {
      gsap.fromTo(".map-panel-reveal",
        { opacity: 0, scale: 0.95, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", delay: 0.3, stagger: 0.1 }
      );
    }
  }, { dependencies: [activeTab] });

  // 2. Demo Query Stagger Revealer
  useGSAP(() => {
    if (!demoTriggered || demoLoading) return;
    
    // Fade and slide the results columns
    gsap.fromTo(".demo-reveal", 
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.15 }
    );
    
    // Elastic zoom cards reveal
    gsap.fromTo(".demo-cause-card",
      { opacity: 0, scale: 0.93 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.3)", stagger: 0.1, delay: 0.3 }
    );
  }, { dependencies: [demoTriggered, demoLoading] });

  // 3. Vision Result Panel Slide-In
  useGSAP(() => {
    if (!visionResult || visionLoading) return;
    
    gsap.fromTo(".vision-result-reveal",
      { opacity: 0, x: 25 },
      { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", stagger: 0.1 }
    );
  }, { dependencies: [visionResult, visionLoading] });

  // 4. RAG Indexing Panel Slide Down
  useGSAP(() => {
    if (!uploadStatus) return;
    
    gsap.fromTo(".upload-status-reveal",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, { dependencies: [uploadStatus] });


  // Dynamic Leaflet Map setup (sepia-editorial theme)
  useEffect(() => {
    if (activeTab !== "map") {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let map: any = null;

    const setupMap = async () => {
      if (typeof window === "undefined" || !(window as any).L) {
        setTimeout(setupMap, 100);
        return;
      }

      const L = (window as any).L;
      if (!isMounted) return;

      if (!mapRef.current) {
        const container = document.getElementById("leaflet-platform-map");
        if (!container) return;

        map = L.map("leaflet-platform-map", {
          zoomControl: false,
          attributionControl: false
        }).setView(userCoords, 14);
        mapRef.current = map;

        L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
          maxZoom: 20,
          attribution: "Map data © Google"
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);
      } else {
        map = mapRef.current;
      }

      // Clear existing markers from map
      if (map._markersGroup) {
        map.removeLayer(map._markersGroup);
      }

      const markersGroup = L.layerGroup().addTo(map);
      map._markersGroup = markersGroup;

      const userLat = userCoords[0];
      const userLng = userCoords[1];

      // Add a custom pulsing blue user location locator marker
      const userIcon = L.divIcon({
        html: `<div class="relative w-8 h-8 flex items-center justify-center">
                 <div class="absolute w-8 h-8 bg-blue-500/30 user-pulse-animation"></div>
                 <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
               </div>`,
        className: "user-loc-marker",
        iconSize: [32, 32]
      });

      L.marker(userCoords, { icon: userIcon }).addTo(markersGroup).bindPopup(`
        <div style="background-color: #F6F1E7; color: #1A1C1E; border: 1px solid rgba(121,88,53,0.2); padding: 8px; border-radius: 6px; font-family: sans-serif;">
          <strong style="color: #173328; font-family: serif; font-size: 13px;">Your Live Coordinates</strong><br/>
          <span style="font-size: 10px; color: #555;">Lat/Lng: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}</span>
        </div>
      `, { closeButton: false }).openPopup();

      const basePoints = [
        { name: `${locationName} General Clinic`, coords: [userLat + 0.003, userLng - 0.003], type: "clinic", desc: "Capacity strained: " + bedOccupancy + "% bed occupancy." },
        { name: `AQI Sensor ${locationName.split(' ')[0] || "Local"}-04`, coords: [userLat - 0.005, userLng + 0.004], type: "sensor", desc: demoTriggered ? `AQI: ${aqiVal} (PM2.5: ${pm25Val} µg/m³)` : `AQI ${aqiVal}: Moderate` },
        { name: "Local Infrastructure Pipeline Excavation", coords: [userLat + 0.001, userLng + 0.007], type: "site", desc: "Source of localized dust & traffic gridlock." }
      ];

      basePoints.forEach((pt) => {
        let color = "#173328"; // Forest green
        if (pt.type === "sensor" && demoTriggered) color = "#8F4C4C"; // Error red
        if (pt.type === "site") color = "#795835"; // Earth brown

        const icon = L.divIcon({
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #F6F1E7; box-shadow: 0 0 10px ${color}"></div>`,
          className: "custom-marker-icon",
          iconSize: [14, 14]
        });

        L.marker(pt.coords, { icon }).addTo(markersGroup).bindPopup(`
          <div style="background-color: #F6F1E7; color: #1A1C1E; border: 1px solid rgba(121,88,53,0.2); padding: 8px; border-radius: 6px; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <strong style="color: #173328; font-family: serif; font-size: 14px;">${pt.name}</strong><br/>
            <span style="font-size: 11px; color: #424844">${pt.desc}</span>
          </div>
        `, { closeButton: false });
      });

      if (mapClinicsAdded) {
        const clinicPoints = [
          { name: "Mobile Health Unit Alpha", coords: [userLat - 0.002, userLng - 0.001] },
          { name: "Mobile Health Unit Beta", coords: [userLat + 0.004, userLng - 0.005] }
        ];

        clinicPoints.forEach((cp) => {
          const goldIcon = L.divIcon({
            html: `<div style="background-color: #CFAC7D; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #173328; box-shadow: 0 0 15px #CFAC7D"></div>`,
            className: "mobile-clinic-icon",
            iconSize: [18, 18]
          });

          L.marker(cp.coords, { icon: goldIcon }).addTo(markersGroup).bindPopup(`
            <div style="background-color: #F6F1E7; color: #1A1C1E; border: 2px solid #173328; padding: 8px; border-radius: 6px; font-family: sans-serif;">
              <strong style="color: #173328; font-family: serif;">${cp.name}</strong><br/>
              <span style="font-size: 11px; color: #5E7F4E; font-weight: bold;">⚡ DEPLOYED & ACTIVE</span>
            </div>
          `, { closeButton: false }).openPopup();
        });

        L.circle(userCoords, {
          color: "#CFAC7D",
          fillColor: "#CFAC7D",
          fillOpacity: 0.1,
          radius: 800
        }).addTo(markersGroup);
      }

      // Trigger Leaflet layout recalculation to ensure tiles fit container dimensions correctly
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 350);
    };

    setupMap();

    return () => {
      isMounted = false;
    };
  }, [activeTab, demoTriggered, mapClinicsAdded, bedOccupancy, userCoords, locationName, aqiVal, pm25Val]);

  // Dynamically update suggested actions based on the query keywords
  const generateDynamicActions = (query: string): RecommendedAction[] => {
    const q = query.toLowerCase();
    if (q.includes("flood") || q.includes("water") || q.includes("drain") || q.includes("rain") || q.includes("storm")) {
      return [
        { id: "act-1", action: "Clear stormwater catch basins near subway", status: "idle", iconType: "clinic" },
        { id: "act-2", action: "Deploy emergency water pumps to East Sector", status: "idle", iconType: "ambulance" },
        { id: "act-3", action: "Issue street flooding transit detour advisory", status: "idle", iconType: "advisory" },
        { id: "act-4", action: "Dispatch drainage clearing task to Sanitation", status: "idle", iconType: "inventory" },
        { id: "act-5", action: "Coordinate water level monitoring loops", status: "idle", iconType: "school" }
      ];
    } else if (q.includes("garbage") || q.includes("trash") || q.includes("sanitation") || q.includes("dumping") || q.includes("hygiene")) {
      return [
        { id: "act-1", action: "Reroute waste trucks to clean Ward 2 pile", status: "idle", iconType: "clinic" },
        { id: "act-2", action: "Deploy smart waste bins to high-density grids", status: "idle", iconType: "inventory" },
        { id: "act-3", action: "Issue warning citation to construction contractor", status: "idle", iconType: "advisory" },
        { id: "act-4", action: "Schedule emergency container sweep for East Sector", status: "idle", iconType: "school" },
        { id: "act-5", action: "Audit local dumping camera streams", status: "idle", iconType: "ambulance" }
      ];
    } else if (q.includes("pothole") || q.includes("road") || q.includes("pavement") || q.includes("street") || q.includes("traffic")) {
      return [
        { id: "act-1", action: "Deploy road repair crew with asphalt sealants", status: "idle", iconType: "clinic" },
        { id: "act-2", action: "Re-route municipal bus schedules near fracturing", status: "idle", iconType: "inventory" },
        { id: "act-3", action: "Publish congestion advisory near highway exit", status: "idle", iconType: "advisory" },
        { id: "act-4", action: "Notify local asphalt maintenance board", status: "idle", iconType: "school" },
        { id: "act-5", action: "Audit heavy vehicle route limits", status: "idle", iconType: "ambulance" }
      ];
    } else if (q.includes("air") || q.includes("quality") || q.includes("pollution") || q.includes("smog") || q.includes("dust")) {
      return [
        { id: "act-1", action: "Distribute emergency mask inventories", status: "idle", iconType: "clinic" },
        { id: "act-2", action: "Order suspension of open concrete cutting", status: "idle", iconType: "inventory" },
        { id: "act-3", action: "Issue public air-quality health alert", status: "idle", iconType: "advisory" },
        { id: "act-4", action: "Notify local school boards to keep kids indoors", status: "idle", iconType: "school" },
        { id: "act-5", action: "Deploy air filtration scrubbers to East Sector", status: "idle", iconType: "ambulance" }
      ];
    } else {
      // Default: Hospital/Environmental query (Default Demo query)
      return [
        { id: "act-1", action: "Deploy two mobile clinics", status: "idle", iconType: "clinic" },
        { id: "act-2", action: "Increase inhaler inventory", status: "idle", iconType: "inventory" },
        { id: "act-3", action: "Notify East Zone schools (draft email)", status: "idle", iconType: "school" },
        { id: "act-4", action: "Issue public health advisory", status: "idle", iconType: "advisory" },
        { id: "act-5", action: "Increase ambulance coverage", status: "idle", iconType: "ambulance" }
      ];
    }
  };

  const handleQuerySubmit = (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const queryText = directQuery || queryInput;
    if (!queryText.trim()) return;

    setDemoLoading(true);
    setDemoStep(0);
    setDemoTriggered(false);

    // Dynamic Response Selection Logic
    const q = queryText.toLowerCase();
    let titleText = "";
    const confScore = 90 + Math.floor(Math.random() * 8); // 90 to 97
    let causeData = [];
    let projectionText = "";
    let rationaleText = "";

    // Live state changes
    let targetAqi = 50;
    let targetPm25 = 12.0;
    let targetBeds = 70;
    let targetRisk = 20;

    if (q.includes("flood") || q.includes("water") || q.includes("drain") || q.includes("rain") || q.includes("storm")) {
      titleText = "Drainage Overflow & Localized Flooding Risk";
      causeData = [
        { label: "Primary Cause", value: "Clogged Flow Valves", desc: "Leaves, plastic waste, and construction sediment blocking storm catch basins." },
        { label: "Secondary Cause", value: "Excessive Runoff Rate", desc: "Heavy precipitation rate exceeding local drainage conduit designs." },
        { label: "Third Cause", value: "Subsurface Backflow", desc: "High local water tables pushing back through low-lying outflow points." }
      ];
      projectionText = "Water pooling will expand 25% if storm valves are not cleared.";
      rationaleText = "Derived from correlating real-time weather radars (precip intensity), satellite ground moisture feeds, citizen water logs, and historical flood maps.";
      targetRisk = 75;
      targetAqi = 22; // rain washes air
      targetPm25 = 4.2;
      targetBeds = 71;
    } else if (q.includes("garbage") || q.includes("trash") || q.includes("sanitation") || q.includes("dumping") || q.includes("hygiene")) {
      titleText = "Waste Accumulation & Vector Hazards";
      causeData = [
        { label: "Primary Cause", value: "Missed Trash Routes", desc: "East Zone sanitation vehicles delayed by road works and crew deficits." },
        { label: "Secondary Cause", value: "Commercial Dumping", desc: "Local developers unloading drywall and concrete debris in non-designated zones." },
        { label: "Third Cause", value: "Container Shortfalls", desc: "Insufficient public disposal bins for high-density metropolitan grids." }
      ];
      projectionText = "Vector infestation indexes are modeled to rise 14% over 48h.";
      rationaleText = "Synthesized from citizen report uploads (vision-parsed), sanitation fleet GPS routes, vector breeding maps, and municipal density indices.";
      targetRisk = 55;
      targetAqi = 62;
      targetPm25 = 14.8;
      targetBeds = 69;
    } else if (q.includes("pothole") || q.includes("road") || q.includes("pavement") || q.includes("street") || q.includes("traffic")) {
      titleText = "Street Structural Degradation & Transit Gridlock";
      causeData = [
        { label: "Primary Cause", value: "Freeze-Thaw Cracks", desc: "Thermal moisture cycling fracturing older sub-base structural layers." },
        { label: "Secondary Cause", value: "Heavy Freight Vehicles", desc: "Commercial cement trucks and payloaders violating weight restrictions." },
        { label: "Third Cause", value: "Delayed Asphalt Seal", desc: "Municipal resurfacing pipeline deferred by emergency budget reallocations." }
      ];
      projectionText = "Commute delay delays projected to swell by 15 minutes near block.";
      rationaleText = "Derived by correlating camera stream speeds, axle-weight telemetry, citizen pothole snapshots, and historic paving logs.";
      targetRisk = 65;
      targetAqi = 84; // traffic idle
      targetPm25 = 28.5;
      targetBeds = 73;
    } else if (q.includes("air") || q.includes("quality") || q.includes("pollution") || q.includes("smog") || q.includes("dust")) {
      titleText = "Particulate Matter (PM2.5) Air Pollution Surge";
      causeData = [
        { label: "Primary Cause", value: "Concrete Dust Ingestion", desc: "Suspended micro-sands from local municipal highway drilling excavations." },
        { label: "Secondary Cause", value: "Inversion Layer Trap", desc: "High atmospheric pressure trapping emissions close to street levels." },
        { label: "Third Cause", value: "Freight Traffic Smog", desc: "High-density diesel combustion particulates idling along East Sector crossings." }
      ];
      projectionText = "AQI is projected to remain in 'Unhealthy' range for next 24 hours.";
      rationaleText = "Synthesized from OpenAQ sensors, local construction schedules, atmospheric pressure indices, and wind velocity feeds.";
      targetRisk = 82;
      targetAqi = 168;
      targetPm25 = 89.2;
      targetBeds = 84;
    } else {
      // Default: Hospital / Admissions query
      titleText = "East Zone Respiratory Admissions Surge";
      causeData = [
        { label: "Primary Cause", value: "PM2.5 Spikes", desc: "Air pollution particulate matter increased by 41% in East Zone." },
        { label: "Secondary Cause", value: "High Pollen", desc: "Localized high concentration of seasonal grass pollens." },
        { label: "Third Cause", value: "Construction Dust", desc: "Suspended micro-sands from local metro pipeline excavation." }
      ];
      projectionText = "Admissions will increase another 18% in the next 24 hours.";
      rationaleText = "Formulated from correlations across: weather forecasts (high temperature, humidity), hospital bed telemetries, traffic APIs (congestion limits on route times), citizen complaints (dust reports), medicine inventories, and 5-year seasonal historical cycles.";
      targetRisk = 91;
      targetAqi = 165;
      targetPm25 = 88.4;
      targetBeds = 91;
    }

    setResultTitle(titleText);
    setResultConfidence(confScore);
    setCauses(causeData);
    setResultProjection(projectionText);
    setResultRationale(rationaleText);

    // Update Suggested Actions state
    setActions(generateDynamicActions(queryText));

    // Stagger step updates for loading animation
    setTimeout(() => {
      setDemoStep(1); 
      setTimeout(() => {
        setDemoStep(2); 
        setTimeout(() => {
          setDemoStep(3); 
          setTimeout(() => {
            setDemoLoading(false);
            setDemoTriggered(true);
            setOverallRisk(targetRisk);
            setPm25Val(targetPm25);
            setAqiVal(targetAqi);
            setBedOccupancy(targetBeds);
          }, 1200);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleQuerySubmitDirect = (query: string) => {
    handleQuerySubmit(undefined, query);
  };

  const dispatchAction = (actionId: string, actionName: string, iconType: string) => {
    setActions((prev) =>
      prev.map((act) => (act.id === actionId ? { ...act, status: "dispatching" } : act))
    );

    setTimeout(() => {
      setActions((prev) =>
        prev.map((act) => (act.id === actionId ? { ...act, status: "completed" } : act))
      );

      if (iconType === "clinic") {
        setMapClinicsAdded(true);
        setTickets((prev) => [
          {
            id: "TKT-9081",
            title: "Deploy Mobile Clinics (East Zone)",
            department: "Civil Emergency & Health",
            severity: "URGENT",
            status: "DISPATCHED",
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
        alert("Mobile Units dispatched. Coordination parameters shared. Sepia Map updated with clinic coordinates!");
      } else if (iconType === "school") {
        setTickets((prev) => [
          {
            id: "TKT-8120",
            title: "Notify East Zone Schools: PM2.5 spikes",
            department: "Education Board Integration",
            severity: "URGENT",
            status: "RESOLVED",
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
        alert("Air quality alert email dispatched to 14 educational institutes in East Zone.");
      } else if (iconType === "advisory") {
        setTickets((prev) => [
          {
            id: "TKT-7049",
            title: "Broadcast Local Health Advisory",
            department: "Public Information Office",
            severity: "URGENT",
            status: "RESOLVED",
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
        alert("Public Health Advisory broadcasted via civic SMS alerts and local weather feeds.");
      } else {
        alert(`${actionName} successfully registered in workflow orchestrator queue.`);
      }
    }, 1200);
  };

  const runVisionMock = (imgType: "flood" | "garbage" | "pothole") => {
    setVisionLoading(true);
    setVisionResult(null);

    const presetImg = {
      flood: "/imgs/ezgif-frame-001.jpg",
      garbage: "/imgs/ezgif-frame-100.jpg",
      pothole: "/imgs/ezgif-frame-200.jpg"
    };

    setVisionImage(presetImg[imgType]);

    setTimeout(() => {
      let analysis: any = {};
      if (imgType === "flood") {
        analysis = {
          issue: "Surface storm overflow / clogged drainage basin",
          severity: "CRITICAL",
          department: "Water Services Infrastructure",
          action: "Deploy local maintenance to purge debris from flow valve.",
          ticketId: "TKT-FL-102"
        };
      } else if (imgType === "garbage") {
        analysis = {
          issue: "Sanitation waste accumulation / bins overflowing",
          severity: "MEDIUM",
          department: "Public Works & Hygiene",
          action: "Re-route municipal loader vehicles to clean dumping quadrant.",
          ticketId: "TKT-GB-992"
        };
      } else {
        analysis = {
          issue: "Severe pavement fracturing / hazard to traffic flow",
          severity: "HIGH",
          department: "Road Maintenance Board",
          action: "Dispatch localized repair crew with quick-setting asphalt sealants.",
          ticketId: "TKT-RD-492"
        };
      }

      setResultTitle(analysis.issue);
      setActions(generateDynamicActions(analysis.issue));
      setVisionResult(analysis);
      setVisionLoading(false);
    }, 1500);
  };

  const handleVisionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVisionLoading(true);
      setVisionResult(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setVisionImage(event.target?.result as string);
        
        setTimeout(() => {
          const actionText = `Extracted visual features from image: "${file.name}". Auto-generated routing task to repair grid coordinates.`;
          setVisionResult({
            issue: `Uploaded Incident File: ${file.name}`,
            severity: "HIGH",
            department: "Municipal Services",
            action: actionText,
            ticketId: "TKT-CIT-" + Math.floor(1000 + Math.random() * 9000)
          });
          setActions(generateDynamicActions(file.name));
          setVisionLoading(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
      setUploadStatus("");
      setUploadProgress(0);
    }
  };

  const triggerDocIngester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) {
      alert("Please select a document bulletin to index first.");
      return;
    }
    setUploadStatus(`Uploading ${docName}...`);
    setUploadProgress(15);

    const intv = setInterval(() => {
      setUploadProgress((prg) => {
        if (prg >= 100) {
          clearInterval(intv);
          setUploadStatus(`Ingestion complete. Extracted 42 vectors from "${docName}" and indexed them to AlloyDB Vector database.`);
          return 100;
        }
        return prg + 25;
      });
    }, 500);
  };

  return (
    <div className="flex h-screen w-full bg-[#F6F1E7] overflow-hidden text-[#1A1C1E] relative">
      
      {/* Background Mesh Glows */}
      <div className="gradient-glow-sphere glow-forest top-[10vh] left-[5vw]" />
      <div className="gradient-glow-sphere glow-gold bottom-[10vh] right-[5vw]" />

      {/* minimal elegant sidebar */}
      <aside className="w-64 bg-[#ECE3D5] border-r border-[#795835]/15 flex flex-col justify-between p-6 shrink-0 z-20">
        <div className="space-y-8">
          
          {/* Logo brand - Plaster Logo */}
          <div className="flex items-center gap-2.5">
            <svg className="w-8 h-8 text-[#173328] fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H9v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <div>
              <h2 className="font-logo text-lg leading-none text-[#173328] tracking-wider uppercase font-bold text-glow-forest">
                CIVITAS AI
              </h2>
              <span className="text-[7.5px] uppercase text-zinc-500 font-bold tracking-widest block mt-0.5 font-sans">
                Decision Intelligence
              </span>
            </div>
          </div>

          {/* Nav List with luxury geometric style */}
          <nav className="flex flex-col gap-3.5 font-bold text-xs uppercase tracking-wider py-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-full transition-all text-left cursor-pointer scale-hover ${
                activeTab === "overview"
                  ? "neomorph-sidebar-btn-active text-[#173328] glow-ring-forest font-bold"
                  : "neomorph-sidebar-btn text-zinc-650 hover:text-[#173328]"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Core Query Console</span>
            </button>

            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-full transition-all text-left cursor-pointer scale-hover ${
                activeTab === "map"
                  ? "neomorph-sidebar-btn-active text-[#173328] glow-ring-forest font-bold"
                  : "neomorph-sidebar-btn text-zinc-650 hover:text-[#173328]"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Geographic Map</span>
            </button>

            <button
              onClick={() => setActiveTab("sensors")}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-full transition-all text-left cursor-pointer scale-hover ${
                activeTab === "sensors"
                  ? "neomorph-sidebar-btn-active text-[#173328] glow-ring-forest font-bold"
                  : "neomorph-sidebar-btn text-zinc-650 hover:text-[#173328]"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>IoT Telemetry Feed</span>
            </button>

            <button
              onClick={() => setActiveTab("vision")}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-full transition-all text-left cursor-pointer scale-hover ${
                activeTab === "vision"
                  ? "neomorph-sidebar-btn-active text-[#173328] glow-ring-forest font-bold"
                  : "neomorph-sidebar-btn text-zinc-650 hover:text-[#173328]"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Multimodal Vision</span>
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-full transition-all text-left cursor-pointer scale-hover ${
                activeTab === "documents"
                  ? "neomorph-sidebar-btn-active text-[#173328] glow-ring-forest font-bold"
                  : "neomorph-sidebar-btn text-zinc-650 hover:text-[#173328]"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>RAG Indexer</span>
            </button>

            
          </nav>
        </div>

        {/* Brand sign off */}
        <div className="text-[11px] text-zinc-500 font-light border-t border-[#795835]/15 pt-4">
          <p className="italic text-glow-gold font-medium">
            Technology Built for Humanity
          </p>
          <span className="block mt-1.5 font-mono uppercase tracking-wider text-[9px] font-bold">Google Cloud ADK</span>
        </div>
      </aside>

      {/* Main View */}
      <main className="flex-1 flex flex-col overflow-hidden z-10">
        
        {/* Core Topbar */}
        <header className="h-20 border-b border-[#795835]/10 flex items-center justify-between px-10 bg-[#ECE3D5]/30 z-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-[#173328]">
              {activeTab === "overview" ? "Decision Intelligence Console" : activeTab.replace("-", " ")}
            </h2>
            <p className="text-xs text-zinc-555 font-light italic">Structured &amp; unstructured community telemetry correlation</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full neomorph-inset text-xs">
              <span className={`w-2 h-2 rounded-full ${demoTriggered ? "bg-[#B88042] animate-pulse" : "bg-[#5E7F4E]"}`} />
              <span className="text-[#424844] font-bold uppercase tracking-wider text-[10px]">
                {demoTriggered ? "East Alert Active" : "Systems Nominal"}
              </span>
            </div>

            {demoTriggered && (
              <button
                onClick={() => {
                  setDemoTriggered(false);
                  setOverallRisk(24);
                  setPm25Val(12.4);
                  setAqiVal(58);
                  setBedOccupancy(74);
                  setMapClinicsAdded(false);
                  setActions((prev) => prev.map((act) => ({ ...act, status: "idle" })));
                }}
                className="px-4 py-2.5 text-[10px] uppercase tracking-wider rounded-full cursor-pointer neomorph-btn-danger scale-hover"
              >
                Reset Demo
              </button>
            )}

            {/* EXIT HUB INLINE BUTTON */}
            {onExit && (
              <button
                onClick={onExit}
                className="px-4 py-2.5 text-[10px] uppercase tracking-widest rounded-full cursor-pointer neomorph-btn scale-hover"
              >
                Exit Hub
              </button>
            )}
          </div>
        </header>

        {/* Tab view containers */}
        <div ref={tabContentRef} className="flex-1 overflow-y-auto p-10 space-y-10 z-0">
          
          {activeTab === "overview" && (
            <div className="space-y-10 tab-pane-active">
              
              {/* COGNITIVE BRIEFING PANEL */}
              <div className="neomorph-plate neomorph-plate-hover p-6 rounded-[24px] bg-[#ECE3D5]/20 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#795835]/10 transition-all duration-300 cursor-default">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full neomorph-inset flex items-center justify-center text-[#173328] shrink-0">
                    <Brain className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#CFAC7D] font-bold uppercase tracking-widest block">AI Cognitive Briefing</span>
                    <h4 className="text-lg font-display font-bold text-[#173328]">Live System Synopsis for {locationName}</h4>
                    <p className="text-xs text-zinc-650 font-light mt-1.5 leading-relaxed max-w-xl">
                      {demoTriggered ? (
                        <span className="text-[#8F4C4C] font-semibold">
                          ⚠️ ALERT: Critical surge in hospital admissions detected near East Zone grid coordinates. Ingestion model reports high localized PM2.5 particulate levels correlated with traffic gridlock. Emergency mobile clinics are recommended for immediate dispatch.
                        </span>
                      ) : (
                        <span>
                          ✅ Status: Nominal. Atmospheric sensors and hospital telemetries are within normal parameters. The vector database is synchronized with local bulletins. Ready for search simulations.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 neomorph-inset px-4 py-2.5 rounded-full">
                  <div className="flex gap-1 items-center">
                    <span className="w-1 h-3.5 bg-[#173328] rounded-full animate-[pulse_1s_infinite_0.1s]" />
                    <span className="w-1 h-5 bg-[#5E7F4E] rounded-full animate-[pulse_1s_infinite_0.3s]" />
                    <span className="w-1 h-2.5 bg-[#CFAC7D] rounded-full animate-[pulse_1s_infinite_0.5s]" />
                    <span className="w-1 h-4 bg-[#795835] rounded-full animate-[pulse_1s_infinite_0.2s]" />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Acoustic Feed Active</span>
                </div>
              </div>
              
              {/* PRIMARY INTERACTIVE QUERY BOX */}
              <div className="neomorph-plate neomorph-plate-hover p-10 rounded-[28px] relative transition-all duration-300 cursor-default">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-3">Decision Interface Core</span>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-[#173328] mb-6">
                  Query the Community&apos;s Predictive Brain
                </h3>
                
                <form
                  onSubmit={handleQuerySubmit}
                  className="flex gap-4 items-center"
                >
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="Ask: Why are hospital admissions increasing in East Zone?"
                    className="flex-1 bg-[#F6F1E7] neomorph-inset rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#173328]/20 transition-all font-medium text-zinc-800 placeholder-zinc-400"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer neomorph-btn-dark scale-hover"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Suggested Prompts Grid */}
                <div className="mt-6 space-y-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Try a suggested query:</span>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { label: "Hospital admissions surge", query: "Why are hospital admissions increasing in East Zone?" },
                      { label: "Street flooding risk", query: "Is there a flood risk from drainage overflow in the West Corridor?" },
                      { label: "Air quality alert", query: "Why is air pollution spiking near the construction sites?" },
                      { label: "Garbage accumulation", query: "Why is garbage piling up in Ward 2 residential blocks?" },
                      { label: "Road pothole damage", query: "What is causing road pavement fracturing on East Highway?" },
                    ].map((prompt) => (
                      <button
                        key={prompt.label}
                        onClick={() => {
                          setQueryInput(prompt.query);
                          setTimeout(() => {
                            handleQuerySubmitDirect(prompt.query);
                          }, 50);
                        }}
                        className="text-[10px] px-4 py-2 rounded-full neomorph-inset text-[#173328] transition-all font-bold flex items-center gap-1.5 border border-[#173328]/10 cursor-pointer scale-hover"
                      >
                        <Play className="w-3 h-3 text-[#CFAC7D]" />
                        <span>{prompt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loader status */}
                {demoLoading && (
                  <div className="mt-8 p-6 neomorph-inset rounded-[20px] space-y-4">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-[#173328] animate-spin" />
                      <span className="text-xs font-bold text-[#173328] uppercase tracking-wider">ADK Reasoning Pipeline Triggered...</span>
                    </div>
                    
                    <div className="space-y-2 font-mono text-[11px] text-zinc-600 pl-7">
                      <div className={demoStep >= 1 ? "text-[#5E7F4E] font-semibold" : "opacity-40"}>
                        {demoStep >= 1 ? "✓" : "○"} [Telemetry Ingest] Streaming OpenAQ micro-sensors, Maps route delays, and Weather forecasting...
                      </div>
                      <div className={demoStep >= 2 ? "text-[#5E7F4E] font-semibold" : "opacity-40"}>
                        {demoStep >= 2 ? "✓" : "○"} [BigQuery Analytics] Correlating environmental spikes with public clinical admission registers...
                      </div>
                      <div className={demoStep >= 3 ? "text-[#5E7F4E] font-semibold" : "opacity-40"}>
                        {demoStep >= 3 ? "✓" : "○"} [Gemini RAG] Semantic indexing of construction guidelines and local medical playbooks complete.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DEMO QUERY RESULTS TREE */}
              {demoTriggered && !demoLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Left Column: Causes & Prediction */}
                  <div className="md:col-span-2 space-y-8 demo-reveal">
                    <div className="neomorph-plate p-10 rounded-[28px] space-y-8">
                      
                      {/* Diagnostic Summary Header */}
                      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#795835]/15 pb-6">
                        <div>
                          <span className="px-3 py-1 rounded-full bg-[#8F4C4C]/10 border border-[#8F4C4C]/20 text-[9px] font-bold text-[#8F4C4C] uppercase tracking-widest">
                            Predictive Core Output
                          </span>
                          <h4 className="text-3xl font-display font-bold text-[#173328] mt-2 text-glow-forest">
                            {resultTitle}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Confidence Score</span>
                          <span className="text-3xl font-display font-bold text-[#5E7F4E] text-glow-gold">{resultConfidence}%</span>
                        </div>
                      </div>

                      {/* Three primary causes cards */}
                      <div className="space-y-4">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block font-sans">Root Cause Matrix</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {causes.map((cause, idx) => (
                            <div key={idx} className="p-5 neomorph-inset rounded-[20px] demo-cause-card">
                              <span className="text-[9px] text-[#8F4C4C] block uppercase font-bold">{cause.label}</span>
                              <strong className="text-2xl text-[#173328] block font-display mt-1">{cause.value}</strong>
                              <p className="text-xs text-zinc-655 mt-2 font-light leading-relaxed">
                                {cause.desc}
                              </p>
                            </div>
                          ))}

                        </div>
                      </div>

                      {/* Prediction model forecasts */}
                      <div className="p-6 neomorph-inset rounded-[20px] flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-500 block uppercase tracking-widest font-bold">Inference Projection</span>
                          <strong className="text-xl text-[#173328] font-display font-bold">{resultProjection}</strong>
                          <p className="text-xs text-zinc-600 font-light leading-relaxed">
                            Based on meteorological indices and grid congestion data.
                          </p>
                        </div>
                        <div className="h-12 w-28 shrink-0">
                          <svg className="w-full h-full" viewBox="0 0 100 40">
                            <path d="M0 35 L30 32 L60 22 L100 5" fill="none" stroke="#8F4C4C" strokeWidth="2.5" />
                            <path d="M0 35 L30 32 L60 22 L100 5 L100 40 L0 40 Z" fill="rgba(143, 76, 76, 0.1)" />
                            <circle cx="100" cy="5" r="3.5" fill="#8F4C4C" />
                          </svg>
                        </div>
                      </div>

                      {/* Reasoning matrix */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block font-sans">Reasoning Context</span>
                        <div className="neomorph-inset p-5 rounded-[20px] text-xs font-light text-zinc-700 leading-relaxed">
                          <strong>Rationale:</strong> &quot;{resultRationale}&quot;
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions Automation Column (Right side) */}
                  <div className="md:col-span-1 demo-reveal">
                    <div className="neomorph-plate neomorph-plate-hover p-8 rounded-[28px] flex flex-col justify-between h-full space-y-6 transition-all duration-300 cursor-default">
                      
                      <div className="space-y-6">
                        <div>
                          <span className="text-[9px] text-[#5E7F4E] font-bold uppercase tracking-widest block">Action Automation</span>
                          <h4 className="text-xl font-display font-bold text-[#173328] mt-1 text-glow-forest">Recommended Actions</h4>
                          <p className="text-xs text-zinc-555 font-light leading-relaxed">Authorize and route tasks immediately to local grids.</p>
                        </div>

                        <div className="space-y-3.5">
                          {actions.map((act) => (
                            <div key={act.id} className="p-3.5 neomorph-inset rounded-[20px] flex items-center justify-between gap-3 text-xs scale-hover">
                              <div className="flex-1">
                                <span className="text-[#173328] font-bold text-[11px] block leading-snug">{act.action}</span>
                              </div>
                              <div className="shrink-0 pl-2">
                                {act.status === "completed" ? (
                                  <span className="flex items-center gap-1 text-[#5E7F4E] font-bold text-[9px] uppercase tracking-wider">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Active</span>
                                  </span>
                                ) : act.status === "dispatching" ? (
                                  <span className="text-[#B88042] text-[9px] font-bold animate-pulse uppercase tracking-wider">Routing...</span>
                                ) : (
                                  <button
                                    onClick={() => dispatchAction(act.id, act.action, act.iconType)}
                                    className="px-3.5 py-2 font-bold text-[9px] rounded-full uppercase tracking-widest cursor-pointer block text-center neomorph-btn-dark scale-hover"
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#795835]/15">
                        <p className="text-[10px] text-zinc-500 leading-normal font-light italic">
                          *Approving dispatches will update clinic markers on the Geographic Map tab.
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* DATA PIPELINE FLOW */}
              <div className="neomorph-plate neomorph-plate-hover p-8 rounded-[28px] space-y-6 transition-all duration-300 cursor-default">
                <div>
                  <h4 className="text-lg font-display font-bold text-[#173328] text-glow-forest">Enterprise Ingestion Architecture</h4>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">Visual representation of streaming datasets running under Google Cloud services</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
                  
                  {/* Column 1 */}
                  <div className="neomorph-inset p-5 rounded-[20px] space-y-3">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold font-sans">Ingestion telemetry</span>
                    <div className="space-y-1.5 text-left text-[11px] font-bold">
                      <div className="flex items-center justify-between p-2 bg-[#ECE3D5] rounded-lg">
                        <span>Weather API (Live forecasts)</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5E7F4E]" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-[#ECE3D5] rounded-lg">
                        <span>Air Quality API (OpenAQ)</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5E7F4E]" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-[#ECE3D5] rounded-lg">
                        <span>Govt Open Data (data.gov.in)</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5E7F4E]" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-[#ECE3D5] rounded-lg">
                        <span>Citizen Complaint Portals</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5E7F4E]" />
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="neomorph-inset p-5 rounded-[20px] space-y-3">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold font-sans">Vertex AI Infrastructure</span>
                    <div className="space-y-1.5 text-left text-[11px] font-bold">
                      <div className="p-2 bg-[#ECE3D5] rounded-lg flex justify-between">
                        <span>Pub/Sub Event Ingester</span>
                        <span className="text-zinc-500 text-[10px] font-bold">Active</span>
                      </div>
                      <div className="p-2 bg-[#ECE3D5] rounded-lg flex justify-between">
                        <span>Cloud Run microservices</span>
                        <span className="text-zinc-500 text-[10px] font-bold">Active</span>
                      </div>
                      <div className="p-2 bg-[#ECE3D5] rounded-lg flex justify-between">
                        <span>AlloyDB Vector Core</span>
                        <span className="text-[#5E7F4E] text-[10px] font-bold">Connected</span>
                      </div>
                      <div className="p-2 bg-[#ECE3D5] rounded-lg flex justify-between">
                        <span>BigQuery Data Warehouse</span>
                        <span className="text-[#5E7F4E] text-[10px] font-bold">Ingesting</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="neomorph-inset p-5 rounded-[20px] space-y-3">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold font-sans">Live Ticket Feed</span>
                    <div className="space-y-1.5 text-left font-mono text-[10px]">
                      {tickets.map((t) => (
                        <div key={t.id} className="p-2 bg-[#ECE3D5] rounded-lg flex items-center justify-between gap-1 shadow-sm scale-hover">
                          <span className="text-[#173328] font-bold">{t.id}</span>
                          <span className="truncate flex-1 text-zinc-700 pl-1 text-[11px] font-bold">{t.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            t.status === "DISPATCHED" ? "bg-[#CFAC7D]/30 text-[#795835]" : "bg-[#B88042]/15 text-[#B88042]"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEOGRAPHIC MAP */}
          {activeTab === "map" && (
            <div className="space-y-6 tab-pane-active">
              <div className="flex items-center justify-between flex-wrap gap-4 neomorph-plate neomorph-plate-hover p-5 rounded-[20px] transition-all duration-300 cursor-default">
                <div>
                  <h3 className="font-display font-semibold text-xl text-[#173328] text-glow-forest">Interactive Sepia Map</h3>
                  <p className="text-xs text-zinc-655 font-light italic">Plotting active clinics and sensors in the East Zone</p>
                </div>
                <div className="flex gap-4 text-xs font-bold text-[#173328] uppercase tracking-wider text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#173328]" />
                    <span>Clinics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CFAC7D]" />
                    <span>Mobile Medical Units</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-400/5 px-2 py-0.5 rounded">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8F4C4C]" />
                    <span>Triggered Sensors</span>
                  </div>
                </div>
              </div>

              {/* sepia-map container with absolute overlay panels */}
              <div className="sepia-map overflow-hidden rounded-[24px] border border-[#795835]/25 relative shadow-md">
                <div id="leaflet-platform-map" className="w-full h-[520px] z-10" />
                
                {/* Floating Map Legend */}
                <div className="absolute top-4 left-4 z-40 p-5 rounded-2xl max-w-xs neomorph-glass border border-white/40 shadow-lg map-panel-reveal">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-2 font-sans">Live Coordinate Feeds</span>
                  <div className="space-y-3 text-xs">
                    <div>
                      <strong className="text-[#173328] block font-display">General Clinic</strong>
                      <span className="text-zinc-655 block font-light leading-relaxed">East Zone medical intake terminal.</span>
                    </div>
                    
                    {mapClinicsAdded && (
                      <div className="border-t border-[#795835]/15 pt-2">
                        <strong className="text-[#CFAC7D] block font-display font-semibold">⚡ Mobile Clinic Alpha / Beta</strong>
                        <span className="text-zinc-650 block font-light leading-relaxed">Deployed to Ward 5. Distributing asthma reserves.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* EXPENSIVE FLOATING OPERATIONAL STATS PANEL (Top-Right) */}
                <div className="absolute top-4 right-4 z-40 p-5 rounded-2xl max-w-xs neomorph-glass border border-white/40 shadow-lg space-y-4 map-panel-reveal">
                  <span className="text-[9px] text-[#5E7F4E] font-bold uppercase tracking-widest block">Active Telemetry Correlations</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 neomorph-inset rounded-xl">
                      <span className="text-zinc-500 text-[9px] block">Clinics Deployed</span>
                      <strong className="text-lg text-[#173328] block">{mapClinicsAdded ? "2 Units" : "0 Units"}</strong>
                    </div>

                    <div className="p-2.5 neomorph-inset rounded-xl">
                      <span className="text-zinc-500 text-[9px] block">Surge AQI Max</span>
                      <strong className="text-lg text-[#173328] block">{aqiVal} AQI</strong>
                    </div>

                    <div className="p-2.5 neomorph-inset rounded-xl">
                      <span className="text-zinc-500 text-[9px] block">Clinical Strain</span>
                      <strong className={`text-lg block ${overallRisk > 50 ? "text-[#8F4C4C]" : "text-zinc-700"}`}>
                        {bedOccupancy}% Beds
                      </strong>
                    </div>

                    <div className="p-2.5 neomorph-inset rounded-xl">
                      <span className="text-zinc-500 text-[9px] block">Overall Risk</span>
                      <strong className={`text-lg block ${overallRisk > 50 ? "text-[#8F4C4C]" : "text-zinc-700"}`}>
                        {overallRisk}% Critical
                      </strong>
                    </div>
                  </div>

                  <span className="text-[8px] text-zinc-400 font-mono tracking-wider uppercase block text-center font-bold">
                    Auto-correlating 12 sensors
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY STREAM */}
          {activeTab === "sensors" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 tab-pane-active">
              
              <div className="md:col-span-1 neomorph-plate neomorph-plate-hover p-6 rounded-[24px] flex flex-col h-[580px] transition-all duration-300 cursor-default">
                <div className="flex items-center justify-between mb-4 border-b border-[#795835]/15 pb-3">
                  <div>
                    <h3 className="font-display font-semibold text-[#173328] text-glow-forest">Live Telemetry Console</h3>
                    <p className="text-xs text-zinc-555 font-light">Simulated real-time sampling inputs</p>
                  </div>
                  <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />
                </div>

                <div className="flex-1 neomorph-inset rounded-[20px] p-4 font-mono text-[10px] overflow-y-auto space-y-2.5">
                  {sensorLogs.map((log, idx) => {
                    const isAlert = log.includes("ALERT") || log.includes("spikes") || log.includes("UNHEALTHY");
                    return (
                      <div
                        key={idx}
                        className={`${isAlert ? "text-[#8F4C4C] font-semibold" : "text-zinc-700"} border-b border-[#795835]/10 pb-1`}
                      >
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="neomorph-plate neomorph-plate-hover p-6 rounded-[24px] space-y-6 transition-all duration-300 cursor-default">
                  <div>
                    <h3 className="font-display font-semibold text-[#173328] text-glow-forest">Active Sensor Grid Telemetries</h3>
                    <p className="text-xs text-zinc-550 font-light">Real-time parameters derived from smart city grids</p>
                  </div>

                  <div className="space-y-6">
                    {/* Telemetry 1 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-755">Air Quality index (AQI)</span>
                        <span className={overallRisk > 50 ? "text-[#8F4C4C] font-bold" : "text-[#5E7F4E] font-bold"}>
                          {aqiVal} AQI ({overallRisk > 50 ? "Unhealthy" : "Good"})
                        </span>
                      </div>
                      <div className="w-full h-3.5 neomorph-inset rounded-full overflow-hidden border-transparent">
                        <div
                          className={`h-full transition-all duration-1000 ${overallRisk > 50 ? "bg-[#8F4C4C]" : "bg-[#5E7F4E]"}`}
                          style={{ width: `${Math.min(100, (aqiVal / 200) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Telemetry 2 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-755">Hospital bed Occupancy</span>
                        <span className={overallRisk > 50 ? "text-[#8F4C4C] font-bold" : "text-zinc-650 font-bold"}>
                          {bedOccupancy}% Capacity Strain
                        </span>
                      </div>
                      <div className="w-full h-3.5 neomorph-inset rounded-full overflow-hidden border-transparent">
                        <div
                          className={`h-full transition-all duration-1000 ${overallRisk > 50 ? "bg-[#8F4C4C]" : "bg-[#173328]"}`}
                          style={{ width: `${bedOccupancy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="neomorph-plate neomorph-plate-hover p-6 rounded-[20px] flex items-center justify-between transition-all duration-300 cursor-default scale-hover">
                  <div className="space-y-1">
                    <h4 className="font-display font-semibold text-[#173328]">Trigger Manual Ingest Queue</h4>
                    <p className="text-xs text-zinc-555 font-light">Invoke Pub/Sub event batch connector to sync climate metrics</p>
                  </div>
                  <button
                    onClick={() => {
                      alert("Ingested batch telemetry successfully from 14 weather monitoring coordinates.");
                      setSensorLogs((prev) => [`[${new Date().toLocaleTimeString()}] [PUB/SUB INGEST] Ingested Bulk Batch: synced climate coordinates 1-14 successfully.`, ...prev]);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 font-bold uppercase tracking-wider rounded-full cursor-pointer neomorph-btn-dark scale-hover"
                  >
                    <span>Ingest Data</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: MULTIMODAL VISION */}
          {activeTab === "vision" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 tab-pane-active">
              <div className="neomorph-plate neomorph-plate-hover p-6 rounded-[24px] space-y-6 transition-all duration-300 cursor-default">
                <div>
                  <h3 className="font-display font-semibold text-[#173328] text-glow-forest">Multimodal Incident Ingestion</h3>
                  <p className="text-xs text-zinc-550 font-light leading-relaxed">
                    Simulate uploaded imagery from citizens reports. Gemini Vision analyzes the pixel data to predict municipal hazards and auto-routes tickets.
                  </p>
                </div>

                {/* Choosing Mocks */}
                <div className="space-y-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block font-sans">Select Simulation Image Source</span>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => runVisionMock("flood")}
                      className="aspect-video relative rounded-2xl overflow-hidden group transition-all neomorph-plate hover:neomorph-plate-hover flex flex-col items-center justify-center p-2 text-center cursor-pointer scale-hover"
                    >
                      <MapPin className="w-5 h-5 text-zinc-655 mb-1 group-hover:text-[#173328]" />
                      <span className="text-[10px] text-zinc-750 font-semibold font-sans">Street Flood</span>
                    </button>

                    <button
                      onClick={() => runVisionMock("garbage")}
                      className="aspect-video relative rounded-2xl overflow-hidden group transition-all neomorph-plate hover:neomorph-plate-hover flex flex-col items-center justify-center p-2 text-center cursor-pointer scale-hover"
                    >
                      <AlertTriangle className="w-5 h-5 text-zinc-655 mb-1 group-hover:text-[#173328]" />
                      <span className="text-[10px] text-zinc-750 font-semibold font-sans">Overflowing Bin</span>
                    </button>

                    <button
                      onClick={() => runVisionMock("pothole")}
                      className="aspect-video relative rounded-2xl overflow-hidden group transition-all neomorph-plate hover:neomorph-plate-hover flex flex-col items-center justify-center p-2 text-center cursor-pointer scale-hover"
                    >
                      <Compass className="w-5 h-5 text-zinc-655 mb-1 group-hover:text-[#173328]" />
                      <span className="text-[10px] text-zinc-750 font-semibold font-sans">Road Pothole</span>
                    </button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-[#795835]/20 rounded-2xl p-8 text-center neomorph-inset flex flex-col items-center justify-center gap-2">
                  <Upload className="w-8 h-8 text-zinc-400 animate-pulse" />
                  <span className="text-xs text-zinc-555 font-light">Drag and drop citizen JPEG photos</span>
                  
                  {/* Hidden Input file selector */}
                  <input
                    type="file"
                    ref={visionFileInputRef}
                    onChange={handleVisionImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    onClick={() => visionFileInputRef.current?.click()}
                    className="mt-2 text-[10px] px-4 py-2 bg-[#F6F1E7] border border-[#795835]/20 text-[#173328] hover:scale-103 active:scale-97 transition-all font-bold uppercase tracking-wider rounded-full cursor-pointer neomorph-btn scale-hover"
                  >
                    Upload Snap
                  </button>
                </div>
              </div>

              <div className="neomorph-plate neomorph-plate-hover p-6 rounded-[24px] flex flex-col justify-between min-h-[420px] transition-all duration-300 cursor-default">
                <div>
                  <h3 className="font-display font-semibold text-[#173328] mb-4 text-glow-forest">Gemini Vision Telemetry Outcome</h3>
                  
                  {visionLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-44 bg-[#ECE3D5] rounded flex items-center justify-center">
                        <span className="text-xs text-zinc-655 font-mono">Running visual feature segmentation...</span>
                      </div>
                    </div>
                  ) : visionResult ? (
                    <div className="space-y-5 vision-result-reveal">
                      <div className="aspect-video relative rounded-2xl overflow-hidden neomorph-inset shadow-none border-transparent">
                        {visionImage && (
                          <img
                            src={visionImage}
                            alt="Vision analysis target"
                            className="w-full h-full object-cover opacity-80"
                          />
                        )}
                        <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded bg-[#F6F1E7] border border-[#795835]/20 text-[9px] font-mono text-[#173328] font-bold">
                          Confidence: 96.8%
                        </div>
                      </div>

                      <div className="space-y-3 font-mono text-xs text-zinc-700">
                        <div className="flex border-b border-[#795835]/10 pb-1.5">
                          <span className="w-32 text-zinc-500 font-bold">Target Issue:</span>
                          <span className="text-[#1A1C1E] font-bold">{visionResult.issue}</span>
                        </div>
                        <div className="flex border-b border-[#795835]/10 pb-1.5">
                          <span className="w-32 text-zinc-500 font-bold">Severity:</span>
                          <span className={`font-bold ${visionResult.severity === "CRITICAL" ? "text-[#8F4C4C]" : "text-[#B88042]"}`}>
                            {visionResult.severity}
                          </span>
                        </div>
                        <div className="flex border-b border-[#795835]/10 pb-1.5">
                          <span className="w-32 text-zinc-500 font-bold">Department:</span>
                          <span className="text-[#1A1C1E] font-bold">{visionResult.department}</span>
                        </div>
                        <div className="flex border-b border-[#795835]/10 pb-1.5">
                          <span className="w-32 text-zinc-500 font-bold">Prescription:</span>
                          <span className="text-[#1A1C1E] font-light leading-relaxed font-bold">{visionResult.action}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 neomorph-inset rounded-2xl flex items-center justify-center text-center p-4">
                      <span className="text-xs text-zinc-555 italic font-sans">Select a simulated incident on the left to run visual ML diagnostics.</span>
                    </div>
                  )}
                </div>

                {visionResult && !visionLoading && (
                  <div className="mt-6 p-4 neomorph-inset rounded-2xl flex items-center justify-between border-transparent vision-result-reveal">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase font-sans">Automation Completed</span>
                      <strong className="text-[#173328] text-xs font-bold">{visionResult.ticketId} Dispatched</strong>
                    </div>
                    <span className="px-3.5 py-1.5 bg-[#5E7F4E]/20 text-[#5E7F4E] border border-[#5E7F4E]/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Routed
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: DOCUMENTS RAG INDEXER */}
          {activeTab === "documents" && (
            <div className="max-w-2xl mx-auto neomorph-plate neomorph-plate-hover p-8 rounded-[28px] space-y-6 tab-pane-active transition-all duration-300 cursor-default">
              <div>
                <h3 className="font-display font-semibold text-[#173328] text-glow-forest">RAG File Indexing Service</h3>
                <p className="text-xs text-zinc-555 font-light leading-relaxed">
                  Vectorize unstructured PDF reports, bulletins, or climate guidelines. Chunks are converted to high-dimensional embeddings and indexed to AlloyDB Vector database.
                </p>
              </div>

              <form onSubmit={triggerDocIngester} className="space-y-4">
                <div 
                  onClick={() => ragFileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#795835]/20 rounded-[20px] p-12 text-center neomorph-inset flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#ECE3D5]/20 transition-all scale-hover"
                >
                  <Database className="w-10 h-10 text-[#795835]/60 mb-2" />
                  
                  {/* Hidden Input file selector */}
                  <input
                    type="file"
                    ref={ragFileInputRef}
                    onChange={handleDocSelect}
                    accept=".pdf,.txt,.xlsx,.csv"
                    className="hidden"
                  />

                  {docName ? (
                    <>
                      <strong className="text-[#5E7F4E] text-sm">✓ Selected: {docName}</strong>
                      <span className="text-xs text-zinc-500 font-light font-sans">Click to change file bulletin</span>
                    </>
                  ) : (
                    <>
                      <strong className="text-zinc-750 text-sm font-sans">Drag regulatory and medical records here</strong>
                      <span className="text-xs text-zinc-500 font-light font-sans">Supports PDF, XLSX, and TXT bulletins</span>
                    </>
                  )}

                  <button 
                    type="submit" 
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering input click
                    }}
                    className="mt-2 text-xs px-5 py-2.5 font-bold uppercase tracking-widest rounded cursor-pointer neomorph-btn-dark scale-hover"
                  >
                    Index Document
                  </button>
                </div>
              </form>

              {uploadStatus && (
                <div className="space-y-3 p-4 neomorph-inset rounded-xl font-mono text-[11px] text-zinc-700 upload-status-reveal">
                  <div className="flex items-center justify-between">
                    <span>Indexing progress:</span>
                    <span className="text-[#173328] font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#ECE3D5] rounded overflow-hidden">
                    <div className="h-full bg-[#173328] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="pt-1 font-light leading-relaxed font-bold">{uploadStatus}</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
