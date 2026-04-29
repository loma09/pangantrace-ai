"""
Generate synthetic commodity price data for PanganTrace AI.
Simulates daily prices for 6 komoditas across 15 provinces.
Includes diverse fraud patterns with ground-truth labels (~5% anomaly rate).
"""

import csv
import random
import os
from datetime import datetime, timedelta

COMMODITIES = {
    "beras_premium": {"base": 16200, "volatility": 0.025, "unit": "kg"},
    "beras_medium": {"base": 13100, "volatility": 0.020, "unit": "kg"},
    "jagung": {"base": 5200, "volatility": 0.035, "unit": "kg"},
    "kedelai": {"base": 9800, "volatility": 0.030, "unit": "kg"},
    "gula_pasir": {"base": 17500, "volatility": 0.020, "unit": "kg"},
    "minyak_goreng": {"base": 15000, "volatility": 0.015, "unit": "liter"},
}

PROVINCES = [
    "Jawa Timur", "Jawa Barat", "Jawa Tengah", "DKI Jakarta",
    "Sumatera Utara", "Sumatera Selatan", "Lampung", "Banten",
    "Sulawesi Selatan", "Bali", "NTT", "NTB",
    "Kalimantan Selatan", "Kalimantan Timur", "DI Yogyakarta",
]

# Diverse fraud scenarios — multiple types of manipulation (~5% anomaly rate)
FRAUD_SCENARIOS = [
    # === Type 1: Sudden price spike (cartel price fixing) ===
    {"commodity": "gula_pasir", "province": "NTT", "day_range": (50, 58),
     "type": "spike", "magnitude": 0.22},
    {"commodity": "beras_premium", "province": "Jawa Timur", "day_range": (60, 68),
     "type": "spike", "magnitude": 0.18},
    {"commodity": "minyak_goreng", "province": "DKI Jakarta", "day_range": (25, 33),
     "type": "spike", "magnitude": 0.16},
    {"commodity": "beras_medium", "province": "Banten", "day_range": (70, 78),
     "type": "spike", "magnitude": 0.20},

    # === Type 2: Gradual drift (slow price manipulation) ===
    {"commodity": "jagung", "province": "Jawa Barat", "day_range": (35, 60),
     "type": "drift", "magnitude": 0.007},
    {"commodity": "kedelai", "province": "Sumatera Utara", "day_range": (25, 55),
     "type": "drift", "magnitude": 0.006},
    {"commodity": "gula_pasir", "province": "Sumatera Selatan", "day_range": (40, 65),
     "type": "drift", "magnitude": 0.005},

    # === Type 3: Sudden price drop (dumping / subsidy fraud) ===
    {"commodity": "minyak_goreng", "province": "Lampung", "day_range": (45, 53),
     "type": "drop", "magnitude": 0.20},
    {"commodity": "beras_premium", "province": "NTB", "day_range": (30, 37),
     "type": "drop", "magnitude": 0.17},

    # === Type 4: Abnormal volume with stable price (suspicious bulk) ===
    {"commodity": "beras_medium", "province": "Sulawesi Selatan", "day_range": (50, 62),
     "type": "volume_spike", "magnitude": 5.0},
    {"commodity": "gula_pasir", "province": "Kalimantan Selatan", "day_range": (30, 42),
     "type": "volume_spike", "magnitude": 4.5},
    {"commodity": "jagung", "province": "Lampung", "day_range": (60, 70),
     "type": "volume_spike", "magnitude": 4.0},
    {"commodity": "kedelai", "province": "Bali", "day_range": (40, 50),
     "type": "volume_spike", "magnitude": 3.5},

    # === Type 5: Price volatility explosion (market manipulation) ===
    {"commodity": "beras_premium", "province": "DKI Jakarta", "day_range": (50, 62),
     "type": "volatility", "magnitude": 4.0},
    {"commodity": "jagung", "province": "Jawa Timur", "day_range": (35, 47),
     "type": "volatility", "magnitude": 3.5},

    # === Type 6: Coordinated manipulation (multiple provinces) ===
    {"commodity": "kedelai", "province": "Jawa Timur", "day_range": (65, 75),
     "type": "spike", "magnitude": 0.15},
    {"commodity": "kedelai", "province": "Jawa Tengah", "day_range": (66, 76),
     "type": "spike", "magnitude": 0.14},
    {"commodity": "kedelai", "province": "Jawa Barat", "day_range": (67, 77),
     "type": "spike", "magnitude": 0.13},

    # === Type 7: Weekend-only manipulation ===
    {"commodity": "jagung", "province": "NTB", "day_range": (20, 75),
     "type": "weekend_spike", "magnitude": 0.12},
    {"commodity": "minyak_goreng", "province": "Kalimantan Timur", "day_range": (30, 70),
     "type": "weekend_spike", "magnitude": 0.10},
]


def generate_prices(days: int = 90, output_dir: str = ".") -> str:
    """Generate synthetic daily price CSV with diverse fraud patterns and ground-truth labels."""
    random.seed(42)
    output_path = os.path.join(output_dir, "prices.csv")
    end_date = datetime(2026, 4, 29)
    start_date = end_date - timedelta(days=days)

    rows = []
    for commodity_id, meta in COMMODITIES.items():
        for province in PROVINCES:
            price = meta["base"] * (1 + random.uniform(-0.05, 0.05))
            for day in range(days):
                date = start_date + timedelta(days=day)
                day_of_week = date.weekday()

                # Normal random walk
                change = random.gauss(0, meta["volatility"])
                price = price * (1 + change)
                price = max(price, meta["base"] * 0.7)

                volume = round(random.uniform(5, 200), 1)
                is_anomaly = 0

                # Check fraud scenarios
                for fraud in FRAUD_SCENARIOS:
                    if (
                        fraud["commodity"] == commodity_id
                        and fraud["province"] == province
                        and fraud["day_range"][0] <= day <= fraud["day_range"][1]
                    ):
                        fraud_type = fraud["type"]

                        if fraud_type == "spike":
                            price *= 1 + fraud["magnitude"]
                            is_anomaly = 1

                        elif fraud_type == "drift":
                            price *= 1 + fraud["magnitude"]
                            if day - fraud["day_range"][0] >= 8:
                                is_anomaly = 1

                        elif fraud_type == "drop":
                            price *= 1 - fraud["magnitude"]
                            is_anomaly = 1

                        elif fraud_type == "volume_spike":
                            volume = round(volume * fraud["magnitude"], 1)
                            is_anomaly = 1

                        elif fraud_type == "volatility":
                            wild_change = random.gauss(0, meta["volatility"] * fraud["magnitude"])
                            price *= 1 + wild_change
                            is_anomaly = 1

                        elif fraud_type == "weekend_spike":
                            if day_of_week >= 5:
                                price *= 1 + fraud["magnitude"]
                                is_anomaly = 1

                rows.append({
                    "commodity_id": commodity_id,
                    "province": province,
                    "price": round(price),
                    "volume": volume,
                    "source": "bps",
                    "recorded_at": date.strftime("%Y-%m-%d"),
                    "is_anomaly": is_anomaly,
                })

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    anomaly_count = sum(1 for r in rows if r["is_anomaly"] == 1)
    print(f"Generated {len(rows)} price records ({anomaly_count} anomalies, "
          f"{anomaly_count/len(rows)*100:.1f}%) -> {output_path}")
    return output_path


if __name__ == "__main__":
    generate_prices(output_dir=os.path.dirname(os.path.abspath(__file__)))
