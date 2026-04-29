"""
Generate data sintetis realistis untuk demo & training.
Simulasi transaksi distribusi beras 1 tahun di 5 provinsi.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)

PROVINCES = ["Jawa Timur", "Jawa Barat", "Sulawesi Selatan", "Kalimantan", "Nusa Tenggara"]
COMMODITIES = ["beras_premium", "beras_medium", "jagung", "kedelai"]

BASE_PRICES = {
    "beras_premium": 15000,
    "beras_medium":  12500,
    "jagung":         5000,
    "kedelai":        9500,
}

def generate_transactions(days: int = 365) -> pd.DataFrame:
    records = []
    start = datetime.now() - timedelta(days=days)

    for day in range(days):
        date = start + timedelta(days=day)
        for province in PROVINCES:
            for commodity in COMMODITIES:
                base_price = BASE_PRICES[commodity]

                # Seasonal + trend + noise
                seasonal = np.sin(2 * np.pi * day / 365) * 0.05
                trend = day / 365 * 0.03
                noise = np.random.normal(0, 0.02)
                price = base_price * (1 + seasonal + trend + noise)

                volume_in = np.random.normal(1000, 80)
                # Inject fraud: 3% chance of volume discrepancy
                is_fraud = np.random.random() < 0.03
                leakage = np.random.uniform(0.08, 0.25) if is_fraud else np.random.uniform(0, 0.02)
                volume_out = volume_in * (1 - leakage)

                # Inject price spike fraud: 2% chance
                is_price_fraud = np.random.random() < 0.02
                if is_price_fraud:
                    price *= np.random.uniform(1.15, 1.35)

                records.append({
                    "timestamp": date.isoformat(),
                    "province": province,
                    "commodity": commodity,
                    "price": round(price, 0),
                    "volume_in": round(max(volume_in, 0), 2),
                    "volume_out": round(max(volume_out, 0), 2),
                    "is_fraud": is_fraud or is_price_fraud,  # label untuk training
                })

    return pd.DataFrame(records)

if __name__ == "__main__":
    df = generate_transactions(365)
    df.to_csv("ml/data/synthetic/transactions.csv", index=False)
    print(f"Generated {len(df):,} records")
    print(f"Fraud rate: {df['is_fraud'].mean():.1%}")
    print(df.head())