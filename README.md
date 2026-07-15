# PanganTrace AI

> **"From farm to table — every kilogram, every rupiah, tracked."**

Platform cerdas monitoring rantai pasok pangan nasional berbasis Azure AI. Dibangun untuk membantu pemerintah Indonesia mendeteksi fraud subsidi, memprediksi harga komoditas, dan melacak distribusi pangan secara real-time.

![Platform Preview](https://pangantrace-ai.vercel.app)

---

## Live Demo

| Service | URL | Status |
|---|---|---|
| Frontend | [pangantrace-ai.vercel.app](https://pangantrace-ai.vercel.app) | ![Live](https://img.shields.io/badge/status-live-brightgreen) |
| FastAPI | [pangantrace-api-v2.azurewebsites.net](https://pangantrace-api-v2.azurewebsites.net/docs) | ![Live](https://img.shields.io/badge/status-live-brightgreen) |
| Gateway | [pangantrace-gateway.azurewebsites.net](https://pangantrace-gateway.azurewebsites.net) | ![Live](https://img.shields.io/badge/status-live-brightgreen) |

---

## Tentang Proyek

PanganTrace AI adalah platform monitoring rantai pasok pangan yang menggabungkan **deteksi fraud berbasis AI**, **prediksi harga komoditas**, dan **supply chain tracking** dalam satu dashboard terpadu. Platform ini memanfaatkan layanan Microsoft Azure untuk memberikan visibilitas penuh kepada pemerintah dalam mengawasi distribusi pangan nasional.

### Problem Statement
- Kebocoran subsidi pangan mencapai triliunan rupiah per tahun
- Fluktuasi harga komoditas strategis yang tidak terprediksi
- Minimnya transparansi alur distribusi dari produsen ke konsumen

### Solusi
Platform end-to-end berbasis Azure AI yang memungkinkan deteksi anomali otomatis, prediksi harga 7 hari ke depan, dan pelacakan distribusi real-time di 34 provinsi Indonesia.

---

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
| **Fraud Detection** | Deteksi anomali harga & volume transaksi real-time menggunakan Azure Anomaly Detector + custom ML |
| **Prediksi Harga** | Forecast harga 7 komoditas strategis 7 hari ke depan dengan model Prophet + LSTM |
| **Supply Chain Tracking** | Visualisasi interaktif alur distribusi pangan end-to-end |
| **AI Insights** | Generate laporan & insight Bahasa Indonesia otomatis via Azure OpenAI GPT-4o |
| **Dashboard Real-time** | KPI fraud score, alert aktif, harga terkini 34 provinsi |
| **Laporan Otomatis** | Executive summary siap cetak untuk pengambil kebijakan |

---

## Arsitektur

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Next.js 14     │    │   Laravel 11     │    │    FastAPI       │
│   Dashboard      │───▶│   API Gateway    │───▶│   AI Backend     │
│   :3000          │    │   :8080          │    │   :8000          │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                                        │
                    ┌───────────────────────────────────┤
                    ▼               ▼                   ▼
             ┌──────────┐   ┌──────────────┐   ┌──────────────┐
             │  Azure   │   │    Azure     │   │    Azure     │
             │ OpenAI   │   │     SQL      │   │  Event Hubs  │
             │  GPT-4o  │   │  Database    │   │              │
             └──────────┘   └──────────────┘   └──────────────┘
```

---

## Azure Services

| Service | Kegunaan |
|---|---|
| **Azure OpenAI (GPT-4o)** | Generate insight fraud & laporan executive summary Bahasa Indonesia |
| **Azure SQL Database** | Menyimpan data transaksi, histori harga, hasil deteksi anomali |
| **Azure Event Hubs** | Streaming data transaksi real-time dari node rantai pasok |
| **Azure App Service** | Hosting FastAPI AI backend & Laravel API gateway |

---

## Tech Stack

**Frontend**
- Next.js 14, TypeScript, Tailwind CSS
- Recharts, React Simple Maps

**Backend**
- FastAPI (Python 3.11), SQLAlchemy
- Laravel 11 (PHP 8.3) — API Gateway

**AI/ML**
- Azure OpenAI GPT-4o
- Prophet + LSTM (price forecasting)
- Custom anomaly detection model

**Infrastructure**
- Azure App Service (Linux, F1)
- Azure SQL Database (Basic)
- Azure Event Hubs (Basic)
- Docker, GitHub Actions

---

## Struktur Project

```
pangantrace-ai/
├── backend/              # FastAPI + Python
│   ├── app/
│   │   ├── api/v1/       # REST API routes
│   │   ├── core/         # Config, logging
│   │   ├── db/           # Database, migrations
│   │   ├── models/       # SQLAlchemy models
│   │   └── services/     # Business logic + Azure
│   ├── ml/               # ML notebooks & models
│   └── tests/            # pytest test suite
├── frontend/             # Next.js 14 dashboard
│   ├── app/              # Pages (App Router)
│   ├── components/       # React components
│   ├── lib/              # Utilities, API client
│   └── types/            # TypeScript interfaces
├── gateway/              # Laravel API gateway
├── infra/                # Azure Bicep IaC
└── docs/                 # Documentation
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Azure account dengan AI services

### 1. Clone & Setup
```bash
git clone https://github.com/loma09/pangantrace-ai.git
cd pangantrace-ai
cp .env.example backend/.env
# Edit backend/.env dengan Azure credentials kamu
```

### 2. Jalankan Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Jalankan Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### 4. Atau pakai Docker
```bash
docker-compose up
```

### 5. Akses Aplikasi
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

---

## Environment Variables

Buat file `backend/.env` berdasarkan `.env.example`:

```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-openai.openai.azure.com/
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-11-20

# Azure SQL Database
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=pangantrace
AZURE_SQL_USERNAME=sqladmin
AZURE_SQL_PASSWORD=your_password

# Azure Event Hubs
AZURE_EVENTHUB_CONNECTION=Endpoint=sb://...
AZURE_EVENTHUB_NAME=pangan-transactions

# App
SECRET_KEY=your-secret-key
```

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/anomaly/summary` | Summary anomali |
| `POST` | `/api/v1/anomaly/detect` | Deteksi fraud |
| `GET` | `/api/v1/prices/current` | Harga terkini |
| `POST` | `/api/v1/prices/predict` | Prediksi harga |
| `GET` | `/api/v1/alerts` | Daftar alert |
| `POST` | `/api/v1/insights/generate` | Generate insight AI |

Dokumentasi lengkap: [/docs](https://pangantrace-api-v2.azurewebsites.net/docs)

---

## Roadmap

- [ ] Integrasi data real BPS & Kemendag
- [ ] Azure Machine Learning untuk model fraud lebih akurat
- [ ] Mobile app untuk Field Officer
- [ ] Notifikasi WhatsApp/Telegram untuk alert fraud
- [ ] Multi-bahasa (Indonesia & English)

---

## Lisensi

Dibangun untuk **Microsoft Elevate x Dicoding** — Hackathon.


---

<div align="center">
  <strong>Powered by Microsoft Azure AI Services</strong><br/>
  <a href="https://pangantrace-ai.vercel.app">Live Demo</a> •
  <a href="https://pangantrace-api-v2.azurewebsites.net/docs">API Docs</a>
</div>
