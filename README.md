# 🏛️ Civitus AI: Community Intelligence & Autonomous Decision Engine

[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-Vertex_AI-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> **Civitus AI** is a state-of-the-art, full-stack municipal decision intelligence platform built for public health emergency response, environmental telemetry tracking, and predictive civic workflow automation. Developed with Next.js 15, React 19, GSAP smooth scroll animations, and powered by Google Cloud serverless infrastructure.

---

## 🌟 Core Capabilities

* 🏥 **Predictive Health Intelligence**:
  * Clinical patient intake forecasting connected to Google BigQuery ML models.
  * Real-time hospital bed availability and emergency capacity overload detection up to **48 hours in advance**.
* 🌿 **Environmental Telemetry & AQI Monitoring**:
  * Micro-particulate PM2.5 and PM10 sensor indexing via real-time OpenAQ API sync.
  * Localized atmospheric inversion layer alerts, weather telemetry, and GIS spatial mapping.
* ⚡ **Predictive Dispatch & Automated Routing**:
  * Natural Language Processing (NLP) classification engine for citizen report tickets.
  * Auto-dispatches prioritized public service task queues directly to repair crews.
* 💻 **Interactive Telemetry Playground**:
  * Real-time API payload inspector for Weather, OpenAQ, and Citizen Incident tickets.
* 🎨 **Luxury Neomorphic & Glassmorphic UI/UX**:
  * Canvas-driven 3D scroll hero animation sequence (260 frames).
  * Geolocation-aware floating luxury navigation header with live regional clock and weather indicator.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Data Telemetry Sources
        Sensors[📡 OpenAQ Micro-Sensors] --> PubSub[⚡ GCP Pub/Sub Stream]
        Weather[🌦️ Weather APIs] --> PubSub
        Reports[📱 Citizen Incident Tickets] --> PubSub
    end

    subgraph GCP Serverless Compute & Storage
        PubSub --> CloudRun[💻 GCP Cloud Run Microservices]
        CloudRun --> AlloyDB[(🗄️ GCP AlloyDB Vector Store)]
        CloudRun --> BigQuery[(📊 GCP BigQuery ML)]
    end

    subgraph AI Reasoning & Orchestration
        AlloyDB & BigQuery --> VertexAI[🧠 GCP Vertex AI ADK Agents]
        VertexAI --> NLP[⚡ NLP Classifier & Task Router]
    end

    subgraph Frontend Decision Console
        VertexAI & NLP --> Console[🖥️ Civitus Next.js 15 Console]
        Console --> Dashboard[📊 Health, Environment & Dispatch Modules]
    end
```

---

## 🛠️ Tech Stack Breakdown

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 15.5 (App Router) | High-performance server/client rendered web application |
| **UI Library** | React 19.1 + Tailwind CSS v4 | Neomorphic glassmorphic design system |
| **Animations** | GSAP 3.15 + ScrollTrigger | Canvas frame interpolation & smooth scroll transitions |
| **Icons** | Lucide React | Clean, modern vector iconography |
| **Cloud Infrastructure**| Google Cloud Platform (GCP) | Pub/Sub, Cloud Run, BigQuery ML, AlloyDB Vector Search |
| **AI Orchestration** | Google Vertex AI ADK | Multi-agent reasoning and NLP ticket classification |

---

## 📁 Project Structure

```
Civitus_AI-for-community/
├── civitus-app/               # Main Next.js 15 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Main Landing Page & Interactive Platform View
│   │   │   ├── layout.tsx     # Global Font & Metadata Configuration
│   │   │   └── globals.css    # Custom Neomorphic & Glassmorphic Utilities
│   │   └── components/
│   │       ├── ScrollHero.tsx        # Canvas 3D Scroll Frame Animation Hero
│   │       └── PlatformDashboard.tsx # Executive Municipal Intelligence Console
│   ├── public/                # Static Media & Icons
│   ├── next.config.ts         # Next.js Configuration
│   ├── tailwindcss / postcss  # Tailwind v4 Configuration
│   ├── vercel.json            # Vercel Deployment Configuration
│   └── package.json           # Application Dependencies
├── imagess/                   # 260 Canvas Animation Frame Assets
├── .gitignore                 # Excluded Build Files & Secrets
├── LICENSE                    # MIT Open Source License
└── README.md                  # Main Repository Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: `v18.18+` or `v20+`
* **npm** / **yarn** / **pnpm**

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/PremVishal21/Civitus_AI-for-community.git
   cd Civitus_AI-for-community/civitus-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file inside `civitus-app/`:
   ```bash
   cp .env.example .env.local
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to launch Civitus AI.

5. **Build for Production**
   ```bash
   npm run build
   npm run start
   ```

---

## ☁️ Deployment

This project is pre-configured for seamless deployment on **Vercel** via `civitus-app/vercel.json`:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPremVishal21%2FCivitus_AI-for-community)

---



---

<p align="center">
  Built with ❤️ for the <strong>Google Cloud GenAI Hackathon</strong> by <a href="https://github.com/PremVishal21">Prem Vishal</a>
</p>
