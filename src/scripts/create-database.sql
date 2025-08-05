-- Crear base de datos para el Dashboard Ambiental Costero

-- Tabla de usuarios (Formulario 5: Registro de Usuario)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    institution VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'researcher', 'viewer', 'analyst')),
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estaciones de monitoreo
CREATE TABLE IF NOT EXISTS monitoring_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'warning', 'offline')),
    installation_date DATE,
    last_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de parámetros ambientales
CREATE TABLE IF NOT EXISTS environmental_parameters (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES monitoring_stations(id),
    ph DECIMAL(4, 2),
    oxygen DECIMAL(5, 2),
    temperature DECIMAL(5, 2),
    salinity DECIMAL(5, 2),
    turbidity DECIMAL(5, 2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración de alertas (Formulario 3: Configuración de Alertas)
CREATE TABLE IF NOT EXISTS alert_configurations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    parameter_type VARCHAR(50) NOT NULL,
    min_threshold DECIMAL(10, 4),
    max_threshold DECIMAL(10, 4),
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    frequency_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alertas generadas
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES monitoring_stations(id),
    parameter_type VARCHAR(50) NOT NULL,
    current_value DECIMAL(10, 4),
    threshold_value DECIMAL(10, 4),
    alert_level VARCHAR(20) CHECK (alert_level IN ('low', 'medium', 'high')),
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Tabla de exportaciones de datos (Formulario 4: Exportación de Datos)
CREATE TABLE IF NOT EXISTS data_exports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    export_format VARCHAR(10) CHECK (export_format IN ('CSV', 'JSON', 'PDF')),
    date_range_start DATE,
    date_range_end DATE,
    stations_included TEXT[], -- Array de IDs de estaciones
    parameters_included TEXT[], -- Array de parámetros
    file_path VARCHAR(500),
    file_size_mb DECIMAL(8, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Tabla de configuración de accesibilidad
CREATE TABLE IF NOT EXISTS accessibility_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    high_contrast BOOLEAN DEFAULT FALSE,
    font_size INTEGER DEFAULT 16 CHECK (font_size BETWEEN 12 AND 24),
    dyslexia_font BOOLEAN DEFAULT FALSE,
    screen_reader BOOLEAN DEFAULT FALSE,
    animations_disabled BOOLEAN DEFAULT FALSE,
    visual_alerts BOOLEAN DEFAULT TRUE,
    audio_captions BOOLEAN DEFAULT FALSE,
    transcriptions BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo
INSERT INTO monitoring_stations (name, latitude, longitude, status) VALUES
('Estación Bahía Norte', 10.4806, -75.5133, 'active'),
('Estación Costa Central', 10.3932, -75.4794, 'active'),
('Estación Puerto Sur', 10.3897, -75.5142, 'warning'),
('Estación Arrecife Este', 10.4234, -75.4567, 'active'),
('Estación Manglar Oeste', 10.4123, -75.5234, 'offline'),
('Estación Coral Norte', 10.4567, -75.4890, 'warning');

-- Insertar parámetros ambientales de ejemplo
INSERT INTO environmental_parameters (station_id, ph, oxygen, temperature, salinity, turbidity) VALUES
(1, 7.8, 8.2, 24.5, 35.2, 2.1),
(2, 7.6, 7.9, 25.1, 35.8, 2.3),
(3, 7.2, 6.8, 26.3, 36.1, 3.2),
(4, 8.1, 8.5, 23.8, 34.9, 1.8),
(6, 7.3, 7.1, 25.8, 35.5, 2.7);

-- Insertar alertas de ejemplo
INSERT INTO alerts (station_id, parameter_type, current_value, threshold_value, alert_level, message) VALUES
(3, 'oxygen', 6.8, 7.0, 'high', 'Nivel de oxígeno bajo en Puerto Sur'),
(2, 'temperature', 25.1, 25.0, 'medium', 'Temperatura elevada en Costa Central'),
(1, 'ph', 7.8, 7.5, 'low', 'Variación de pH en Bahía Norte');
