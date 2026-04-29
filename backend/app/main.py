from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1 import anomaly, prices, chain, alerts, insights
from app.core.config import get_settings
from app.db.database import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="PanganTrace AI",
    description="AI-powered food supply chain monitoring & fraud detection",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://pangantrace.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(anomaly.router, prefix="/api/v1/anomaly", tags=["Anomaly Detection"])
app.include_router(prices.router, prefix="/api/v1/prices", tags=["Price Prediction"])
app.include_router(chain.router, prefix="/api/v1/chain", tags=["Supply Chain"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(insights.router, prefix="/api/v1/insights", tags=["AI Insights"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.APP_NAME}
