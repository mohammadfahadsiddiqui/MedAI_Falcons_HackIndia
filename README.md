# 🏥 MedAI — Intelligent Healthcare Ecosystem

<div align="center">

![MedAI Banner](https://img.shields.io/badge/MedAI-2026%20Edition-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0xIDE1aC0ydi02aDJ2NnptMC04aC0yVjdoMnYyeiIvPjwvc3ZnPg==)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini%202.5%20Flash-AI-4285F4?style=for-the-badge&logo=google)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)

**A futuristic, AI-powered healthcare ecosystem built for HackIndia 2026**

[🚀 Live Demo](#) · [📖 Features](#-features) · [⚡ Quick Start](#-quick-start) · [🔑 API Setup](#-api-setup)

</div>

---

## 🌟 Overview

MedAI is a comprehensive 2026-grade intelligent healthcare platform that combines real-time AI analysis, physician-grade diagnostic tools, and family health management — all in one beautifully designed application.

Built with **Gemini 2.5 Flash** for multimodal AI, **Firebase** for secure authentication, and **React + TypeScript** for a blazing-fast, type-safe frontend.

---

## ✨ Features

### 🤖 Core AI Features
| Feature | Description |
|---|---|
| **AI Consultant** | Chat with Gemini 2.5 Flash in English, Hindi & Urdu. Voice input with auto-send |
| **Prescription Upload** | Upload prescription images/PDFs for instant AI OCR + medication analysis |
| **AI Second Opinion** | Get 3 differential diagnoses with ICD-10 codes, confidence scores & red flags |
| **AI Insights** | Personalized health tips and trend analysis powered by AI |

### 🧬 2026 AI Feature Pages
| Feature | Route | Description |
|---|---|---|
| **Digital Health Twin** | `/health-twin` | AI-powered 6–12 month health risk prediction with organ health map |
| **Mental Health Companion** | `/mental-health` | Mood tracking, CBT exercises, AI journal analysis & burnout assessment |
| **Doctor Dashboard** | `/doctor-dashboard` | SOAP note generator, differential diagnosis, drug checker & analytics |
| **Family Health Vault** | `/family-vault` | Multi-profile family records with hereditary disease pattern AI analysis |
| **Smart Medications** | `/medications` | Daily dose tracker, drug interaction checker, refill reminders |

### 🏥 Healthcare Tools
- **Lab Tests** — 55+ tests across 13 categories + 9 health packages with cart & booking
- **Dosage Calculator** — Weight-based medication dosage with safety checks
- **Pharmacy** — Medicine search, cart, checkout & order tracking
- **Health Tracker** — Daily logging for sleep, water, exercise, BP, blood sugar & weight
- **Emergency Panel** — SOS alerts, nearest hospitals, emergency contacts
- **Doctor Finder** — Browse and filter specialist physicians

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/mohammadfahadsiddiqui/MedAI_Falcons_HackIndia.git
cd MedAI_Falcons_HackIndia

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Add your VITE_GEMINI_API_KEY (see API Setup below)

# 4. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — register an account and explore!

---

## 🔑 API Setup

### Google Gemini API Key (Required for AI features)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key and add it to your `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Never commit your `.env` file** — it's in `.gitignore` by default.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript + Vite 7 |
| **AI Engine** | Google Gemini 2.5 Flash (text + vision) |
| **Authentication** | Firebase Auth |
| **State Management** | Zustand |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Styling** | Vanilla CSS with Design Tokens |
| **Notifications** | React Hot Toast |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute
│   └── layout/        # Sidebar, Header, DashboardLayout
├── pages/
│   ├── AIConsultant/  # Gemini chat with voice + multilingual
│   ├── Dashboard/     # Main dashboard with stats & charts
│   ├── HealthTwin/    # Digital Health Twin (AI 2026)
│   ├── MentalHealth/  # Mental Health AI Companion (AI 2026)
│   ├── DoctorDashboard/ # Doctor tools (AI 2026)
│   ├── SecondOpinion/ # AI Second Opinion (AI 2026)
│   ├── FamilyVault/   # Family Health Vault (AI 2026)
│   ├── Medications/   # Smart Medication System (AI 2026)
│   ├── LabTests/      # Lab test catalog + booking
│   ├── Pharmacy/      # Medicine store + checkout
│   ├── Prescription/  # AI prescription analysis
│   ├── HealthTracker/ # Daily health logging
│   └── ...more
├── store/             # Zustand global state
├── firebase/          # Firebase config
└── styles/            # Global CSS design system
```

---

## 🎨 Design System

- **Dark/Light mode** with smooth transitions
- **Glassmorphism** cards with gradient borders
- **Framer Motion** page transitions and micro-animations
- **Google Fonts** — Inter + Poppins
- **Responsive** down to 768px

---

## 👥 Team — MedAI Falcons

Built with ❤️ for **HackIndia 2026**

| Name | Role |
|---|---|
| Mohammad Fahad Siddiqui | Lead Developer & AI Integration |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>🏆 Built for HackIndia 2026 · Powered by Google Gemini 2.5 Flash · Firebase</sub>
</div>
