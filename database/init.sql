-- ==============================================================================
-- EcoAlerta — Esquema inicial de base de datos
-- PostgreSQL 16 + PostGIS 3.4
-- TFG: Aplicación colaborativa para el cuidado del medio ambiente
-- ==============================================================================

-- Habilitar extensión PostGIS para datos geoespaciales
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLA: users — Usuarios de la plataforma
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'citizen'
                    CHECK (role IN ('citizen', 'admin', 'moderator')),
    avatar_url      TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLA: categories — Categorías de incidencias medioambientales
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    icon            VARCHAR(50),       -- Nombre del icono para el frontend
    color           VARCHAR(7),        -- Color hex (#FF5733)
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLA: incidents — Incidencias medioambientales reportadas
-- ==============================================================================
CREATE TABLE IF NOT EXISTS incidents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    reporter_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    -- Datos geoespaciales (PostGIS)
    location        GEOMETRY(Point, 4326) NOT NULL,  -- SRID 4326 = WGS84 (GPS)
    address         TEXT,                             -- Dirección legible
    -- Estado de la incidencia
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN (
                        'pending',       -- Pendiente de revisión
                        'validated',     -- Validada por un admin
                        'in_progress',   -- En proceso de resolución
                        'resolved',      -- Resuelta
                        'rejected',      -- Rechazada
                        'duplicate'      -- Duplicada
                    )),
    priority        VARCHAR(10) DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    -- Metadatos
    is_anonymous    BOOLEAN DEFAULT FALSE,
    view_count      INTEGER DEFAULT 0,
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID REFERENCES users(id),
    resolution_note TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índice espacial para búsquedas geográficas eficientes
CREATE INDEX IF NOT EXISTS idx_incidents_location
    ON incidents USING GIST (location);

-- Índices para filtros frecuentes
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents (category_id);
CREATE INDEX IF NOT EXISTS idx_incidents_reporter ON incidents (reporter_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents (created_at DESC);

-- ==============================================================================
-- TABLA: incident_photos — Fotografías de las incidencias
-- ==============================================================================
CREATE TABLE IF NOT EXISTS incident_photos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    photo_url       TEXT NOT NULL,
    thumbnail_url   TEXT,
    caption         VARCHAR(255),
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_incident ON incident_photos (incident_id);

-- ==============================================================================
-- TABLA: incident_comments — Comentarios en incidencias
-- ==============================================================================
CREATE TABLE IF NOT EXISTS incident_comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    is_official     BOOLEAN DEFAULT FALSE,  -- Respuesta oficial de autoridad
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_incident ON incident_comments (incident_id);

-- ==============================================================================
-- TABLA: incident_votes — Votos/apoyo a incidencias
-- ==============================================================================
CREATE TABLE IF NOT EXISTS incident_votes (
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (incident_id, user_id)
);

-- ==============================================================================
-- TABLA: notifications — Notificaciones a usuarios
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT,
    reference_id    UUID,              -- ID de incidencia u otro recurso
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);

-- ==============================================================================
-- DATOS INICIALES — Categorías de incidencias
-- ==============================================================================
INSERT INTO categories (name, description, icon, color) VALUES
    ('Vertido ilegal',        'Vertidos de residuos sólidos o líquidos en zonas no autorizadas',     'trash',       '#E74C3C'),
    ('Contaminación agua',    'Contaminación de ríos, arroyos, acequias o aguas subterráneas',       'droplet',     '#3498DB'),
    ('Contaminación aire',    'Emisiones, humos, olores o partículas contaminantes',                 'wind',        '#95A5A6'),
    ('Daño forestal',         'Talas ilegales, incendios provocados o daños a masa forestal',        'tree-pine',   '#27AE60'),
    ('Residuos peligrosos',   'Presencia de amianto, productos químicos o residuos industriales',    'alert-triangle','#F39C12'),
    ('Ruido excesivo',        'Contaminación acústica por encima de niveles permitidos',             'volume-2',    '#9B59B6'),
    ('Fauna en peligro',      'Animales heridos, trampas ilegales o destrucción de hábitats',        'bird',        '#1ABC9C'),
    ('Infraestructura dañada','Contenedores rotos, alcantarillas obstruidas, mobiliario dañado',     'construction','#E67E22'),
    ('Otro',                  'Otros problemas medioambientales no categorizados',                   'help-circle', '#34495E')
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de actualización automática
CREATE TRIGGER tr_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_comments_updated_at
    BEFORE UPDATE ON incident_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
