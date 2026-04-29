"""
Feature engineering untuk PanganTrace AI fraud detection.
Combines price time-series features with supply chain transaction features.
"""

import pandas as pd
import numpy as np
from typing import Tuple


def compute_price_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate fitur dari data harga time-series.

    Input columns: commodity_id, province, price, volume, recorded_at
    Output: DataFrame dengan fitur statistik tambahan.
    """
    df = df.copy()
    df["recorded_at"] = pd.to_datetime(df["recorded_at"])
    df = df.sort_values(["commodity_id", "province", "recorded_at"])

    features = []
    for (commodity, province), group in df.groupby(["commodity_id", "province"]):
        g = group.copy()

        # Rolling statistics (price)
        g["price_sma_7"] = g["price"].rolling(7, min_periods=1).mean()
        g["price_sma_14"] = g["price"].rolling(14, min_periods=1).mean()
        g["price_std_7"] = g["price"].rolling(7, min_periods=1).std().fillna(0)
        g["price_ema_7"] = g["price"].ewm(span=7).mean()

        # Deviation ratio: how far current price is from moving average
        g["price_deviation_ratio"] = (g["price"] - g["price_sma_7"]) / g["price_sma_7"].replace(0, 1)

        # Percentage change (different windows)
        g["price_pct_change"] = g["price"].pct_change().fillna(0)
        g["price_pct_change_3d"] = g["price"].pct_change(3).fillna(0)
        g["price_pct_change_7d"] = g["price"].pct_change(7).fillna(0)

        # Rolling volatility (std of pct_change)
        g["price_volatility_7"] = g["price_pct_change"].rolling(7, min_periods=1).std().fillna(0)

        # Bollinger band position: (price - sma) / (2 * std)
        g["bollinger_position"] = (g["price"] - g["price_sma_14"]) / (2 * g["price_std_7"].replace(0, 1))

        # SMA crossover signal: short-term vs long-term
        g["sma_crossover"] = (g["price_sma_7"] - g["price_sma_14"]) / g["price_sma_14"].replace(0, 1)

        # Volume features
        g["volume_sma_7"] = g["volume"].rolling(7, min_periods=1).mean()
        g["volume_ratio"] = g["volume"] / g["volume_sma_7"].replace(0, 1)
        g["volume_std_7"] = g["volume"].rolling(7, min_periods=1).std().fillna(0)

        # Price-volume divergence
        g["price_volume_divergence"] = g["price_deviation_ratio"].abs() * g["volume_ratio"]

        # Day of week (seasonal pattern)
        g["day_of_week"] = g["recorded_at"].dt.dayofweek
        g["is_weekend"] = (g["day_of_week"] >= 5).astype(int)

        features.append(g)

    return pd.concat(features, ignore_index=True)


def compute_transaction_features(transactions_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate daily transaction features per commodity.
    Aggregates supply chain data to detect volume and pricing anomalies.
    """
    df = transactions_df.copy()
    df["transaction_date"] = pd.to_datetime(df["transaction_date"])

    # Daily aggregates per commodity
    daily = df.groupby(["commodity_id", "transaction_date"]).agg(
        tx_count=("id", "count"),
        tx_total_volume=("volume", "sum"),
        tx_avg_volume=("volume", "mean"),
        tx_std_volume=("volume", "std"),
        tx_avg_price=("price_per_unit", "mean"),
        tx_std_price=("price_per_unit", "std"),
        tx_max_volume=("volume", "max"),
        tx_min_volume=("volume", "min"),
    ).reset_index()

    # Fill NaN std (when only 1 transaction per day)
    daily["tx_std_volume"] = daily["tx_std_volume"].fillna(0)
    daily["tx_std_price"] = daily["tx_std_price"].fillna(0)

    # Volume spread: max - min (high spread = suspicious)
    daily["tx_volume_spread"] = daily["tx_max_volume"] - daily["tx_min_volume"]

    # Price coefficient of variation (normalized volatility)
    daily["tx_price_cv"] = daily["tx_std_price"] / daily["tx_avg_price"].replace(0, 1)

    # Volume discrepancy features per node
    vol_out = df.groupby(["commodity_id", "transaction_date", "from_node_id"])["volume"].sum().reset_index()
    vol_out.columns = ["commodity_id", "transaction_date", "node_id", "vol_out"]
    vol_in = df.groupby(["commodity_id", "transaction_date", "to_node_id"])["volume"].sum().reset_index()
    vol_in.columns = ["commodity_id", "transaction_date", "node_id", "vol_in"]

    node_flows = vol_out.merge(vol_in, on=["commodity_id", "transaction_date", "node_id"], how="outer").fillna(0)
    node_flows["leakage_pct"] = (node_flows["vol_in"] - node_flows["vol_out"]) / node_flows["vol_in"].replace(0, 1)

    # Max leakage per commodity per day
    max_leakage = node_flows.groupby(["commodity_id", "transaction_date"]).agg(
        tx_max_leakage_pct=("leakage_pct", "max"),
        tx_avg_leakage_pct=("leakage_pct", "mean"),
    ).reset_index()

    daily = daily.merge(max_leakage, on=["commodity_id", "transaction_date"], how="left")
    daily["tx_max_leakage_pct"] = daily["tx_max_leakage_pct"].fillna(0)
    daily["tx_avg_leakage_pct"] = daily["tx_avg_leakage_pct"].fillna(0)

    return daily


def compute_chain_features(transactions_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate fitur dari data transaksi rantai pasok.
    Fokus pada discrepancy volume masuk vs keluar per node.
    """
    df = transactions_df.copy()

    vol_out = df.groupby("from_node_id")["volume"].sum().reset_index()
    vol_out.columns = ["node_id", "total_volume_out"]

    vol_in = df.groupby("to_node_id")["volume"].sum().reset_index()
    vol_in.columns = ["node_id", "total_volume_in"]

    chain_features = vol_out.merge(vol_in, on="node_id", how="outer").fillna(0)
    chain_features["discrepancy"] = chain_features["total_volume_in"] - chain_features["total_volume_out"]
    chain_features["discrepancy_pct"] = (
        chain_features["discrepancy"] / chain_features["total_volume_in"].replace(0, 1) * 100
    )

    return chain_features


def prepare_training_data(
    price_df: pd.DataFrame, transactions_df: pd.DataFrame = None
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Prepare labeled training data for fraud model.
    Combines price features + transaction features (if available).
    Uses ground-truth is_anomaly labels from the data generator.
    """
    if "is_anomaly" not in price_df.columns:
        raise ValueError(
            "Column 'is_anomaly' not found. "
            "Please regenerate data with the updated generate_prices.py"
        )

    df = compute_price_features(price_df)

    # Base feature columns (price-based)
    feature_cols = [
        "price_sma_7", "price_sma_14", "price_std_7", "price_ema_7",
        "price_deviation_ratio", "price_pct_change", "price_pct_change_3d",
        "price_pct_change_7d", "price_volatility_7", "bollinger_position",
        "sma_crossover", "volume_sma_7", "volume_ratio", "volume_std_7",
        "price_volume_divergence", "day_of_week", "is_weekend",
    ]

    # Add transaction features if available
    if transactions_df is not None:
        tx_features = compute_transaction_features(transactions_df)
        tx_features = tx_features.rename(columns={"transaction_date": "recorded_at"})
        tx_features["recorded_at"] = pd.to_datetime(tx_features["recorded_at"])

        df = df.merge(
            tx_features, on=["commodity_id", "recorded_at"], how="left"
        )

        tx_cols = [
            "tx_count", "tx_total_volume", "tx_avg_volume", "tx_std_volume",
            "tx_avg_price", "tx_std_price", "tx_volume_spread", "tx_price_cv",
            "tx_max_leakage_pct", "tx_avg_leakage_pct",
        ]
        # Fill missing transaction features (days without transactions)
        for col in tx_cols:
            if col in df.columns:
                df[col] = df[col].fillna(0)

        feature_cols.extend(tx_cols)

    X = df[feature_cols].fillna(0)
    y = df["is_anomaly"]

    print(f"Training data: {len(X)} samples, {y.sum()} anomalies ({y.mean()*100:.1f}%)")
    print(f"Features: {len(feature_cols)} columns ({', '.join(feature_cols[:5])}...)")
    return X, y
