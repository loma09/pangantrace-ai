# PanganTrace AI — Azure Services Integration Guide

## Services Overview

PanganTrace AI integrates **3 Azure AI Services** to deliver intelligent fraud detection:

| Service | Purpose | API Used |
|---------|---------|----------|
| Azure Anomaly Detector | Detect price spikes & volume outliers | Univariate Detection |
| Azure Machine Learning | 7-day price forecasting | Managed Online Endpoint |
| Azure OpenAI Service | Generate Indonesian-language insights | Chat Completions (GPT-4o) |

---

## 1. Azure Anomaly Detector

**File**: `backend/app/services/azure/anomaly_detector.py`

### What it does
- Analyzes daily price time-series to find abnormal spikes/drops
- Analyzes volume data to detect distribution anomalies
- Uses univariate anomaly detection with daily granularity

### Configuration
```env
AZURE_ANOMALY_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_ANOMALY_KEY=your_key
```

### Key Parameters
- **Sensitivity**: 85 (higher = more sensitive, more false positives)
- **Granularity**: Daily
- **Min data points**: 12 (recommended 30+)

### Provisioning
1. Azure Portal → Create "Anomaly Detector" resource
2. Pricing tier: S0 (Standard)
3. Copy endpoint + key to `.env`

---

## 2. Azure Machine Learning

**File**: `backend/app/services/azure/ml_client.py`

### What it does
- Forecasts commodity prices 7 days ahead
- Uses Prophet model (trend + weekly seasonality)
- Falls back to SMA when Prophet/endpoint unavailable

### Model Pipeline
1. Train in Jupyter notebook (`03_price_forecasting.ipynb`)
2. Register model via `04_azure_ml_deploy.ipynb`
3. Deploy to Managed Online Endpoint
4. Backend calls endpoint for real-time inference

### Configuration
```env
AZURE_ML_ENDPOINT=https://your-endpoint.inference.ml.azure.com
AZURE_ML_KEY=your_key
```

### Provisioning
1. Azure Portal → Create "Machine Learning" workspace
2. Create Managed Online Endpoint
3. Deploy registered model
4. Copy scoring URI + key to `.env`

---

## 3. Azure OpenAI Service (GPT-4o)

**File**: `backend/app/services/azure/openai_client.py`

### What it does
- Generates human-readable fraud analysis in Bahasa Indonesia
- Creates daily summary reports for field officers
- Produces actionable recommendations (audit targets, verification steps)

### System Prompt Strategy
The service uses a carefully crafted system prompt that instructs GPT-4o to:
- Write in formal Bahasa Indonesia
- Focus on actionable recommendations
- Reference specific node IDs and volumes
- Target non-technical field officers as audience

### Configuration
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Provisioning
1. Azure Portal → Create "Azure OpenAI" resource
2. Deploy GPT-4o model in Azure OpenAI Studio
3. Note the deployment name (used as `AZURE_OPENAI_DEPLOYMENT`)
4. Copy endpoint + key to `.env`

---

## Cost Estimation (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|---------------|
| Anomaly Detector | S0 | ~$25 (10K transactions) |
| Azure ML | Managed Endpoint | ~$50 (Standard_DS3_v2) |
| Azure OpenAI | GPT-4o | ~$30 (daily summaries + alerts) |
| Azure SQL | Basic | ~$5 |
| **Total** | | **~$110/month** |

> **Tip**: Use Free Tier for development. Azure for Students provides $100 credit.
