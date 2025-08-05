CREATE TABLE IF NOT EXISTS form_drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    form_type VARCHAR(50) NOT NULL, -- 'water_quality', 'biodiversity', 'contamination', etc.
    form_data JSONB NOT NULL, -- Datos del formulario en formato JSON
    draft_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tabla para análisis de calidad del agua
CREATE TABLE IF NOT EXISTS water_quality_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    analysis_type VARCHAR(50) NOT NULL,
    parameters TEXT[] NOT NULL,
    stations TEXT[] NOT NULL,
    date_range_start DATE,
    date_range_end DATE,
    comparison_mode BOOLEAN DEFAULT FALSE,
    alert_thresholds BOOLEAN DEFAULT TRUE,
    results JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Tabla para monitoreo de biodiversidad
CREATE TABLE IF NOT EXISTS biodiversity_monitoring (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    monitoring_type VARCHAR(50) NOT NULL,
    taxonomic_groups TEXT[] NOT NULL,
    conservation_status VARCHAR(50) DEFAULT 'all',
    sampling_method VARCHAR(50) DEFAULT 'visual',
    include_rare_species BOOLEAN DEFAULT TRUE,
    generate_report BOOLEAN DEFAULT FALSE,
    results JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Tabla para análisis de contaminación
CREATE TABLE IF NOT EXISTS contamination_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    contaminant_types TEXT[] NOT NULL,
    severity_level VARCHAR(20) DEFAULT 'all',
    sources TEXT[],
    mitigation_actions TEXT[],
    notify_authorities BOOLEAN DEFAULT FALSE,
    emergency_protocol BOOLEAN DEFAULT FALSE,
    results JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Tabla para monitoreo de condiciones físicas
CREATE TABLE IF NOT EXISTS physical_conditions_monitoring (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    parameters TEXT[] NOT NULL,
    measurement_interval VARCHAR(20) DEFAULT '15min',
    extreme_condition_alerts BOOLEAN DEFAULT TRUE,
    weather_integration BOOLEAN DEFAULT TRUE,
    forecast_period VARCHAR(10) DEFAULT '24h',
    configuration JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para gestión de estaciones
CREATE TABLE IF NOT EXISTS station_management_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(20) NOT NULL, -- 'add', 'edit', 'delete'
    station_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    station_type VARCHAR(50) DEFAULT 'coastal',
    sensors TEXT[],
    maintenance_schedule VARCHAR(50) DEFAULT 'monthly',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Tabla para generación de reportes
CREATE TABLE IF NOT EXISTS report_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    report_type VARCHAR(50) NOT NULL,
    format VARCHAR(10) NOT NULL,
    include_charts BOOLEAN DEFAULT TRUE,
    auto_send BOOLEAN DEFAULT FALSE,
    recipients TEXT[],
    custom_parameters TEXT[],
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Tabla para búsquedas avanzadas (historial)
CREATE TABLE IF NOT EXISTS advanced_searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    search_type VARCHAR(50) NOT NULL,
    keywords TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'all',
    date_range_start DATE,
    date_range_end DATE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_radius INTEGER,
    parameters TEXT[],
    alert_level VARCHAR(20) DEFAULT 'all',
    include_historical BOOLEAN DEFAULT FALSE,
    sort_by VARCHAR(20) DEFAULT 'relevance',
    max_results INTEGER DEFAULT 100,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_form_drafts_user_type ON form_drafts(user_id, form_type);
CREATE INDEX IF NOT EXISTS idx_water_quality_user ON water_quality_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_biodiversity_user ON biodiversity_monitoring(user_id);
CREATE INDEX IF NOT EXISTS idx_contamination_user ON contamination_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_physical_conditions_user ON physical_conditions_monitoring(user_id);
CREATE INDEX IF NOT EXISTS idx_station_requests_user ON station_management_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_report_requests_user ON report_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_advanced_searches_user ON advanced_searches(user_id);
