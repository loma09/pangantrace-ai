"""
Price forecasting model untuk PanganTrace AI.
Uses Gradient Boosting Regressor with lag features for 7-day commodity price prediction.
"""

import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error


class PriceForecaster:
    """
    Time-series price forecasting model using Gradient Boosting with lag features.

    Approach:
    - Creates lag/rolling features from historical prices
    - Trains a Gradient Boosting Regressor to predict next-day price
    - Generates multi-step forecasts by iteratively predicting one day ahead
    """

    # Feature configuration
    LAG_DAYS = [1, 2, 3, 5, 7, 14]
    ROLLING_WINDOWS = [3, 7, 14]

    def __init__(self, forecast_days: int = 7):
        self.forecast_days = forecast_days
        self.model = GradientBoostingRegressor(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            min_samples_leaf=5,
            random_state=42,
        )
        self.scaler = StandardScaler()
        self.feature_names = []
        self.is_fitted = False

    @classmethod
    def _build_features(cls, df: pd.DataFrame) -> pd.DataFrame:
        """
        Build lag and rolling features from a price time-series DataFrame.
        Input must have columns: recorded_at, price, volume
        """
        df = df.copy()
        df["recorded_at"] = pd.to_datetime(df["recorded_at"])
        df = df.sort_values("recorded_at").reset_index(drop=True)

        # Lag features
        for lag in cls.LAG_DAYS:
            df[f"price_lag_{lag}"] = df["price"].shift(lag)

        # Rolling statistics
        for window in cls.ROLLING_WINDOWS:
            df[f"price_sma_{window}"] = df["price"].rolling(window, min_periods=1).mean()
            df[f"price_std_{window}"] = df["price"].rolling(window, min_periods=1).std().fillna(0)
            df[f"price_min_{window}"] = df["price"].rolling(window, min_periods=1).min()
            df[f"price_max_{window}"] = df["price"].rolling(window, min_periods=1).max()

        # Price change features
        df["price_pct_change_1"] = df["price"].pct_change().fillna(0)
        df["price_pct_change_7"] = df["price"].pct_change(7).fillna(0)

        # EMA
        df["price_ema_7"] = df["price"].ewm(span=7).mean()
        df["price_ema_14"] = df["price"].ewm(span=14).mean()

        # Deviation from SMA
        df["deviation_from_sma7"] = (df["price"] - df["price_sma_7"]) / df["price_sma_7"].replace(0, 1)
        df["deviation_from_sma14"] = (df["price"] - df["price_sma_14"]) / df["price_sma_14"].replace(0, 1)

        # Bollinger band position
        df["bollinger_pos"] = (df["price"] - df["price_sma_14"]) / (2 * df["price_std_14"].replace(0, 1))

        # Volume features
        if "volume" in df.columns:
            df["volume_sma_7"] = df["volume"].rolling(7, min_periods=1).mean()
            df["volume_ratio"] = df["volume"] / df["volume_sma_7"].replace(0, 1)

        # Calendar features
        df["day_of_week"] = df["recorded_at"].dt.dayofweek
        df["day_of_month"] = df["recorded_at"].dt.day
        df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
        df["is_month_start"] = (df["day_of_month"] <= 5).astype(int)
        df["is_month_end"] = (df["day_of_month"] >= 25).astype(int)

        return df

    def _get_feature_columns(self, df: pd.DataFrame) -> List[str]:
        """Get feature column names (everything except metadata and target)."""
        exclude = {"recorded_at", "price", "commodity_id", "province", "source",
                   "is_anomaly", "volume"}
        return [c for c in df.columns if c not in exclude]

    def train(
        self, df: pd.DataFrame, test_days: int = 14
    ) -> Dict:
        """
        Train the price forecasting model.

        Args:
            df: DataFrame with columns: recorded_at, price, volume
            test_days: number of recent days to hold out for evaluation

        Returns:
            Dict with training metrics (MAE, RMSE, MAPE)
        """
        featured_df = self._build_features(df)

        # Drop rows with NaN from lag features
        max_lag = max(self.LAG_DAYS)
        featured_df = featured_df.iloc[max_lag:].reset_index(drop=True)

        self.feature_names = self._get_feature_columns(featured_df)
        X = featured_df[self.feature_names].fillna(0)
        y = featured_df["price"]

        # Time-based split (no shuffle — preserve temporal order)
        split_idx = len(X) - test_days
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

        # Scale
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train
        self.model.fit(X_train_scaled, y_train)
        self.is_fitted = True

        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        metrics = self.evaluate(y_test.values, y_pred)

        # Dates for the test period
        test_dates = featured_df["recorded_at"].iloc[split_idx:].values
        metrics["test_dates"] = test_dates
        metrics["test_actual"] = y_test.values
        metrics["test_predicted"] = y_pred
        metrics["train_size"] = len(X_train)
        metrics["test_size"] = len(X_test)
        metrics["n_features"] = len(self.feature_names)

        print(f"Price model trained -- MAE: Rp {metrics['mae']:,.0f}, "
              f"RMSE: Rp {metrics['rmse']:,.0f}, MAPE: {metrics['mape']:.2f}%")
        return metrics

    def predict(self, df: pd.DataFrame) -> Dict:
        """
        Generate multi-day price forecast with confidence intervals.
        Uses iterative one-step-ahead prediction.

        Args:
            df: historical DataFrame with columns: recorded_at, price, volume

        Returns:
            Dict with model info and list of predictions
        """
        if not self.is_fitted:
            raise RuntimeError("Model must be trained first")

        # Work with a copy to iteratively append predictions
        work_df = df.copy()
        work_df["recorded_at"] = pd.to_datetime(work_df["recorded_at"])
        work_df = work_df.sort_values("recorded_at").reset_index(drop=True)

        results = []
        last_date = work_df["recorded_at"].iloc[-1]

        for i in range(1, self.forecast_days + 1):
            # Build features from current data
            featured = self._build_features(work_df)
            last_row = featured.iloc[[-1]]

            X = last_row[self.feature_names].fillna(0)
            X_scaled = self.scaler.transform(X)

            predicted_price = float(self.model.predict(X_scaled)[0])

            # Estimate confidence interval based on recent volatility
            recent_std = work_df["price"].tail(14).std()
            # Confidence decreases as we predict further out
            uncertainty = recent_std * (0.8 + 0.4 * i)

            next_date = last_date + pd.Timedelta(days=i)
            confidence = max(50, round(98 - i * 3.5, 1))

            results.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_price": round(predicted_price),
                "lower_bound": round(predicted_price - uncertainty),
                "upper_bound": round(predicted_price + uncertainty),
                "confidence": confidence,
            })

            # Append prediction to working data for next iteration
            new_row = pd.DataFrame({
                "recorded_at": [next_date],
                "price": [predicted_price],
                "volume": [work_df["volume"].tail(7).mean() if "volume" in work_df.columns else 0],
            })
            work_df = pd.concat([work_df, new_row], ignore_index=True)

        return {
            "model": "gradient_boosting",
            "forecast_days": self.forecast_days,
            "predictions": results,
        }

    def evaluate(self, actual: np.ndarray, predicted: np.ndarray) -> Dict:
        """Evaluate forecast accuracy with MAE, RMSE, and MAPE."""
        mae = mean_absolute_error(actual, predicted)
        rmse = float(np.sqrt(mean_squared_error(actual, predicted)))
        # Avoid division by zero in MAPE
        nonzero_mask = actual != 0
        if nonzero_mask.any():
            mape = float(np.mean(np.abs((actual[nonzero_mask] - predicted[nonzero_mask])
                                        / actual[nonzero_mask])) * 100)
        else:
            mape = 0.0

        return {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2),
        }

    def get_feature_importance(self) -> Dict[str, float]:
        """Return feature importances from gradient boosting."""
        if not self.is_fitted:
            raise RuntimeError("Model must be trained first")
        return dict(zip(
            self.feature_names,
            self.model.feature_importances_.tolist(),
        ))

    def save(self, path: str) -> None:
        """Save model to disk."""
        joblib.dump({
            "model": self.model,
            "scaler": self.scaler,
            "feature_names": self.feature_names,
            "forecast_days": self.forecast_days,
        }, path)
        print(f"Price model saved -> {path}")

    def load(self, path: str) -> None:
        """Load model from disk."""
        data = joblib.load(path)
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.feature_names = data["feature_names"]
        self.forecast_days = data["forecast_days"]
        self.is_fitted = True
        print(f"Price model loaded <- {path}")
