"""
Generate synthetic supply chain transaction data for PanganTrace AI.
Simulates flows: Producer → Distributor → Retailer with volume leakage.
"""

import csv
import random
import os
from datetime import datetime, timedelta

NODES = {
    "producers": [
        {"id": "PROD-JT-001", "name": "KUD Tani Makmur", "province": "Jawa Timur"},
        {"id": "PROD-JT-002", "name": "KUD Sumber Rejeki", "province": "Jawa Timur"},
        {"id": "PROD-JT-003", "name": "KUD Tani Sejahtera", "province": "Jawa Timur"},
        {"id": "PROD-JB-001", "name": "KUD Harapan Baru", "province": "Jawa Barat"},
        {"id": "PROD-NT-001", "name": "KUD Nusa Tani", "province": "NTT"},
    ],
    "distributors": [
        {"id": "DIST-JT-001", "name": "PT Pangan Makmur", "province": "Jawa Timur", "leakage": 0.056},
        {"id": "DIST-JT-002", "name": "CV Distribusi Nusantara", "province": "Jawa Timur", "leakage": 0.01},
        {"id": "DIST-JB-001", "name": "PT Agri Sejahtera", "province": "Jawa Barat", "leakage": 0.123},
        {"id": "DIST-NT-001", "name": "PT Manis Sejahtera", "province": "NTT", "leakage": 0.136},
    ],
    "retailers": [
        {"id": "RET-JT-012", "name": "Pasar Induk Surabaya", "province": "Jawa Timur"},
        {"id": "RET-JT-015", "name": "Pasar Wonokromo", "province": "Jawa Timur"},
        {"id": "RET-JB-005", "name": "Pasar Caringin Bandung", "province": "Jawa Barat"},
        {"id": "RET-NT-003", "name": "Pasar Oesapa Kupang", "province": "NTT"},
    ],
}

COMMODITIES = ["beras_premium", "beras_medium", "jagung", "kedelai", "gula_pasir", "minyak_goreng"]


def generate_transactions(days: int = 90, output_dir: str = ".") -> str:
    """Generate synthetic supply chain transactions with volume leakage."""
    random.seed(42)
    output_path = os.path.join(output_dir, "transactions.csv")
    end_date = datetime(2026, 4, 29)
    start_date = end_date - timedelta(days=days)

    rows = []
    tx_id = 1

    for day in range(days):
        date = start_date + timedelta(days=day)
        if date.weekday() == 6:  # Skip Sunday
            continue

        for commodity in COMMODITIES:
            # Producer → Distributor
            for dist in NODES["distributors"]:
                matching_prods = [p for p in NODES["producers"] if p["province"] == dist["province"]]
                if not matching_prods:
                    continue
                prod = random.choice(matching_prods)
                volume_out = round(random.uniform(10, 80), 1)
                rows.append({
                    "id": tx_id,
                    "from_node_id": prod["id"],
                    "to_node_id": dist["id"],
                    "commodity_id": commodity,
                    "volume": volume_out,
                    "price_per_unit": round(random.uniform(4000, 18000)),
                    "document_number": f"SJ-{date.strftime('%Y%m%d')}-{tx_id:04d}",
                    "transaction_date": date.strftime("%Y-%m-%d"),
                })
                tx_id += 1

                # Distributor → Retailer (with leakage)
                matching_rets = [r for r in NODES["retailers"] if r["province"] == dist["province"]]
                if not matching_rets:
                    continue
                ret = random.choice(matching_rets)
                leakage = dist.get("leakage", 0.01)
                volume_received = round(volume_out * (1 - leakage), 1)
                rows.append({
                    "id": tx_id,
                    "from_node_id": dist["id"],
                    "to_node_id": ret["id"],
                    "commodity_id": commodity,
                    "volume": volume_received,
                    "price_per_unit": round(random.uniform(5000, 20000)),
                    "document_number": f"SJ-{date.strftime('%Y%m%d')}-{tx_id:04d}",
                    "transaction_date": date.strftime("%Y-%m-%d"),
                })
                tx_id += 1

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"✅ Generated {len(rows)} transactions → {output_path}")
    return output_path


if __name__ == "__main__":
    generate_transactions(output_dir=os.path.dirname(os.path.abspath(__file__)))
