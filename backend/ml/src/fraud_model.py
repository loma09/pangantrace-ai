"""
Fraud detection model untuk PanganTrace AI.
Uses Gradient Boosting + Isolation Forest with class imbalance handling.
"""

import joblib
import numpy as np
import pandas as pd
from typing import Dict, Optional
from sklearn.ensemble import GradientBoostingClassifier, IsolationForest
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_sample_weight


class FraudDetectionModel:
    """Model deteksi fraud subsidi pangan berbasis gradient boosting."""

    def __init__(self):
        self.classifier = GradientBoostingClassifier(
            n_estimators=300,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            min_samples_leaf=5,
            max_features="sqrt",
            random_state=42,
        )
        self.isolation_forest = IsolationForest(
            n_estimators=150,
            contamination="auto",
            random_state=42,
        )
        self.scaler = StandardScaler()
        self.feature_names = []
        self.is_fitted = False

    def train(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2) -> Dict:
        """Train the fraud model with class imbalance handling."""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )

        # Store feature names before scaling
        self.feature_names = list(X.columns)

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Compute sample weights to handle class imbalance
        # Gives higher weight to minority class (anomalies)
        sample_weights = compute_sample_weight("balanced", y_train)

        # Train gradient boosting with sample weights
        self.classifier.fit(X_train_scaled, y_train, sample_weight=sample_weights)

        # Train isolation forest (unsupervised — no labels needed)
        self.isolation_forest.fit(X_train_scaled)

        # Evaluate
        y_pred = self.classifier.predict(X_test_scaled)
        y_proba = self.classifier.predict_proba(X_test_scaled)[:, 1]

        # Cross-validation score on full dataset for more reliable metric
        X_scaled_full = self.scaler.transform(X)
        cv_scores = cross_val_score(
            self.classifier, X_scaled_full, y, cv=5, scoring="roc_auc"
        )

        metrics = {
            "accuracy": float((y_pred == y_test).mean()),
            "roc_auc": float(roc_auc_score(y_test, y_proba)),
            "cv_auc_mean": float(cv_scores.mean()),
            "cv_auc_std": float(cv_scores.std()),
            "anomaly_count_train": int(y_train.sum()),
            "anomaly_count_test": int(y_test.sum()),
            "total_train": len(y_train),
            "total_test": len(y_test),
            "classification_report": classification_report(y_test, y_pred, output_dict=True),
        }

        self.is_fitted = True
        print(f"Model trained -- AUC: {metrics['roc_auc']:.4f}, "
              f"CV AUC: {metrics['cv_auc_mean']:.4f} (+/- {metrics['cv_auc_std']:.4f}), "
              f"Accuracy: {metrics['accuracy']:.4f}")
        return metrics

    def predict_fraud_score(self, X: pd.DataFrame) -> np.ndarray:
        """Predict fraud score (0-100) for new data."""
        if not self.is_fitted:
            raise RuntimeError("Model must be trained first")

        X_scaled = self.scaler.transform(X)

        # Combine supervised + unsupervised scores
        gb_proba = self.classifier.predict_proba(X_scaled)[:, 1]
        if_scores = -self.isolation_forest.score_samples(X_scaled)  # Higher = more anomalous
        if_normalized = (if_scores - if_scores.min()) / (if_scores.max() - if_scores.min() + 1e-8)

        # Weighted combination: 70% supervised, 30% unsupervised
        combined = 0.7 * gb_proba + 0.3 * if_normalized
        fraud_scores = np.clip(combined * 100, 0, 100)

        return fraud_scores

    def get_feature_importance(self) -> Dict[str, float]:
        """Return feature importances from gradient boosting."""
        if not self.is_fitted:
            raise RuntimeError("Model must be trained first")
        return dict(zip(
            self.feature_names,
            self.classifier.feature_importances_.tolist(),
        ))

    def save(self, path: str) -> None:
        """Save model to disk."""
        joblib.dump({
            "classifier": self.classifier,
            "isolation_forest": self.isolation_forest,
            "scaler": self.scaler,
            "feature_names": self.feature_names,
        }, path)
        print(f"Model saved -> {path}")

    def load(self, path: str) -> None:
        """Load model from disk."""
        data = joblib.load(path)
        self.classifier = data["classifier"]
        self.isolation_forest = data["isolation_forest"]
        self.scaler = data["scaler"]
        self.feature_names = data.get("feature_names", [])
        self.is_fitted = True
        print(f"Model loaded <- {path}")
