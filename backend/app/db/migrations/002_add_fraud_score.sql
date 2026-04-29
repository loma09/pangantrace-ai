-- Migration 002: Add fraud_score column optimizations
-- Adds a covering index for dashboard queries that filter by fraud_score

CREATE INDEX idx_anomaly_fraud_score ON anomaly_records (fraud_score DESC, detected_at DESC);
CREATE INDEX idx_alert_fraud_score ON alerts (fraud_score DESC, detected_at DESC);

-- Add column for tracking which Azure ML model version detected the anomaly
ALTER TABLE anomaly_records ADD model_version NVARCHAR(50) NULL;
