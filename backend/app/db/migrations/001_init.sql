-- PanganTrace AI — Initial Schema
-- Target: Azure SQL Database

-- Komoditas pangan
CREATE TABLE commodities (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    unit NVARCHAR(20) NOT NULL DEFAULT 'kg',
    category NVARCHAR(50) NOT NULL DEFAULT 'pangan_pokok',
    is_subsidized INT DEFAULT 0,
    base_price FLOAT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Catatan harga harian
CREATE TABLE price_records (
    id INT IDENTITY(1,1) PRIMARY KEY,
    commodity_id NVARCHAR(50) NOT NULL REFERENCES commodities(id),
    province NVARCHAR(100) NOT NULL,
    price FLOAT NOT NULL,
    volume FLOAT NULL,
    source NVARCHAR(50) DEFAULT 'bps',
    recorded_at DATETIME2 NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_price_commodity_date ON price_records (commodity_id, recorded_at);
CREATE INDEX idx_price_province_date ON price_records (province, recorded_at);

-- Node rantai pasok
CREATE TABLE chain_nodes (
    id NVARCHAR(30) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    node_type NVARCHAR(20) NOT NULL,
    province NVARCHAR(100) NOT NULL,
    city NVARCHAR(100) NULL,
    address NVARCHAR(255) NULL,
    contact_person NVARCHAR(100) NULL,
    contact_phone NVARCHAR(20) NULL,
    is_active INT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_node_type_province ON chain_nodes (node_type, province);

-- Transaksi distribusi
CREATE TABLE chain_transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    from_node_id NVARCHAR(30) NOT NULL REFERENCES chain_nodes(id),
    to_node_id NVARCHAR(30) NOT NULL REFERENCES chain_nodes(id),
    commodity_id NVARCHAR(50) NOT NULL REFERENCES commodities(id),
    volume FLOAT NOT NULL,
    price_per_unit FLOAT NULL,
    total_value FLOAT NULL,
    document_number NVARCHAR(50) NULL,
    transaction_date DATETIME2 NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_chain_tx_date ON chain_transactions (commodity_id, transaction_date);
CREATE INDEX idx_chain_tx_from ON chain_transactions (from_node_id, transaction_date);
CREATE INDEX idx_chain_tx_to ON chain_transactions (to_node_id, transaction_date);

-- Anomali terdeteksi
CREATE TABLE anomaly_records (
    id INT IDENTITY(1,1) PRIMARY KEY,
    commodity_id NVARCHAR(50) NOT NULL REFERENCES commodities(id),
    province NVARCHAR(100) NOT NULL,
    detection_type NVARCHAR(30) NOT NULL,
    fraud_score FLOAT NOT NULL DEFAULT 0.0,
    risk_level NVARCHAR(20) NOT NULL DEFAULT 'low',
    severity_score FLOAT NULL,
    expected_value FLOAT NULL,
    actual_value FLOAT NULL,
    deviation_pct FLOAT NULL,
    volume_in FLOAT NULL,
    volume_out FLOAT NULL,
    discrepancy_pct FLOAT NULL,
    ai_insight NVARCHAR(MAX) NULL,
    ai_generated_by NVARCHAR(50) NULL,
    azure_service NVARCHAR(100) DEFAULT 'Azure Anomaly Detector',
    azure_request_id NVARCHAR(100) NULL,
    detected_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_anomaly_risk ON anomaly_records (risk_level, detected_at);
CREATE INDEX idx_anomaly_province ON anomaly_records (province, detected_at);
CREATE INDEX idx_anomaly_commodity ON anomaly_records (commodity_id, detected_at);

-- Alert fraud
CREATE TABLE alerts (
    id NVARCHAR(30) PRIMARY KEY,
    anomaly_id INT NULL REFERENCES anomaly_records(id),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    province NVARCHAR(100) NOT NULL,
    commodity_id NVARCHAR(50) NOT NULL REFERENCES commodities(id),
    severity NVARCHAR(20) NOT NULL DEFAULT 'low',
    fraud_score FLOAT NOT NULL DEFAULT 0.0,
    status NVARCHAR(20) NOT NULL DEFAULT 'open',
    azure_service NVARCHAR(100) DEFAULT 'Azure Anomaly Detector',
    assigned_to NVARCHAR(100) NULL,
    resolved_at DATETIME2 NULL,
    resolution_notes NVARCHAR(MAX) NULL,
    recommended_actions NVARCHAR(MAX) NULL,
    detected_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_alert_status_severity ON alerts (status, severity);
CREATE INDEX idx_alert_province ON alerts (province, detected_at);

-- Seed komoditas
INSERT INTO commodities (id, name, unit, is_subsidized, base_price) VALUES
('beras_premium', 'Beras Premium', 'kg', 1, 16200),
('beras_medium', 'Beras Medium', 'kg', 1, 13100),
('jagung', 'Jagung', 'kg', 0, 5200),
('kedelai', 'Kedelai', 'kg', 0, 9800),
('gula_pasir', 'Gula Pasir', 'kg', 1, 17500),
('minyak_goreng', 'Minyak Goreng', 'liter', 1, 15000);
