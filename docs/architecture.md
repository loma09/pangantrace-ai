# PanganTrace AI — System Architecture

## Overview

PanganTrace AI uses a three-tier architecture: **Next.js Frontend** → **Laravel Gateway** → **FastAPI Backend**, with three Azure AI services for intelligent fraud detection.

## Data Flow

```
[BPS / Bulog Data Feed]
        │
        ▼
┌─────────────────────────────────────────────────┐
│              FastAPI Backend (:8000)             │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Price Service │  │ Chain Service│            │
│  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                    │
│  ┌──────▼──────────────────▼───────┐            │
│  │         Fraud Engine            │            │
│  │  • Price anomaly scoring (40%)  │            │
│  │  • Volume discrepancy   (35%)  │            │
│  │  • Correlation analysis (25%)  │            │
│  └──────────────┬──────────────────┘            │
│                 │                               │
│    ┌────────────┼─────────────┐                 │
│    ▼            ▼             ▼                 │
│  Azure       Azure ML      Azure               │
│  Anomaly     Endpoint      OpenAI               │
│  Detector    (Prophet)     GPT-4o               │
└─────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────┐     ┌──────────────────┐
│  Laravel Gateway │     │  Azure SQL       │
│  • Auth (Sanctum)│     │  • Prices        │
│  • Rate limiting │     │  • Anomalies     │
│  • API proxy     │     │  • Alerts        │
└──────┬───────────┘     │  • Chain nodes   │
       │                 │  • Transactions  │
       ▼                 └──────────────────┘
┌──────────────────┐
│  Next.js 14      │
│  Dashboard       │
│  • Overview      │
│  • Fraud detect  │
│  • Price predict │
│  • Supply chain  │
│  • Reports       │
└──────────────────┘
```

## Fraud Score Calculation

The Fraud Engine computes a weighted score (0-100):

| Signal | Weight | Source |
|--------|--------|--------|
| Price anomaly severity | 40% | Azure Anomaly Detector |
| Volume discrepancy | 35% | Chain transaction analysis |
| Price-volume correlation | 25% | Statistical correlation |

### Risk Levels
- **Low** (0-39): Normal fluctuation
- **Medium** (40-69): Requires monitoring
- **High** (70-79): Investigation recommended
- **Critical** (80-100): Immediate audit required

## Database Schema

```
commodities ─┬─ price_records
             ├─ anomaly_records ── alerts
             └─ chain_transactions
                     │
              chain_nodes (producer → distributor → retailer)
```

## Security Architecture

1. **Frontend** → Gateway: JWT token (Laravel Sanctum)
2. **Gateway** → Backend: Internal API key (header-based)
3. **Backend** → Azure: Managed Identity / API Key
4. **Database**: Azure SQL with encrypted connections (TLS 1.2)

## Deployment

- **Development**: `docker-compose up` (3 containers)
- **Production**: Azure Container Apps + Azure SQL + Azure AI Services
- **IaC**: Azure Bicep templates in `infra/bicep/`
