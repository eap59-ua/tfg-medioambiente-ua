-- ==============================================================================
-- EcoAlerta — Esquema de base de datos v3
-- PostgreSQL 16 + PostGIS 3.4
-- TFG: Aplicación colaborativa para el cuidado del medio ambiente
-- Autor: Erardo Aldana Pessoa | Tutor: José Luis Sánchez Romero
-- Sprint 6: Añadidas tablas user_2fa, user_recovery_codes, security_audit_log
-- ==============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLA: responsible_entities — Organismos responsables de incidencias
-- ==============================================================================
CREATE TABLE IF NOT EXISTS responsible_entities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN (
                        'municipality', 'police', 'fire_department',
                        'seprona', 'environmental_agency', 'ngo', 'other'
                    )),
    contact_email   VARCHAR(255),
    contact_phone   VARCHAR(20),
    jurisdiction    GEOMETRY(Polygon, 4326),   -- Zona geográfica de competencia
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TABLA: users — Usuarios de la plataforma
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    bio             TEXT,
    avatar_url      TEXT,
    role            VARCHAR(20) NOT NULL DEFAULT 'citizen'
                    CHECK (role IN ('citizen', 'admin', 'entity', 'moderator')),
    entity_id       UUID REFERENCES responsible_entities(id) ON DELETE SET NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    -- Campos para CAPTCHA tras intentos fallidos (RF-SEC-03)
    failed_login_attempts   INTEGER DEFAULT 0,
    failed_login_window_start TIMESTAMPTZ,
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
    default_severity VARCHAR(10) DEFAULT 'moderate'
                    CHECK (default_severity IN ('low', 'moderate', 'high', 'critical')),
    default_entity_id UUID REFERENCES responsible_entities(id) ON DELETE SET NULL,
    icon            VARCHAR(50),
    color           VARCHAR(7),
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
    assigned_entity_id UUID REFERENCES responsible_entities(id) ON DELETE SET NULL,
    -- Datos geoespaciales (PostGIS)
    location        GEOMETRY(Point, 4326) NOT NULL,  -- SRID 4326 = WGS84 (GPS)
    address         TEXT,                             -- Dirección legible
    -- Estado y severidad
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN (
                        'pending',       -- Pendiente de revisión
                        'validated',     -- Validada por un admin
                        'assigned',      -- Asignada a una entidad
                        'in_progress',   -- En proceso de resolución
                        'resolved',      -- Resuelta
                        'rejected',      -- Rechazada
                        'duplicate'      -- Duplicada
                    )),
    severity        VARCHAR(10) NOT NULL DEFAULT 'moderate'
                    CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
    priority_score  INTEGER DEFAULT 0,
    -- Resolución
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID REFERENCES users(id),
    resolution_note TEXT,
    -- Metadatos
    is_anonymous    BOOLEAN DEFAULT FALSE,
    view_count      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índice espacial para búsquedas geográficas eficientes
CREATE INDEX IF NOT EXISTS idx_incidents_location
    ON incidents USING GIST (location);

-- Índices para filtros frecuentes
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents (category_id);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents (severity);
CREATE INDEX IF NOT EXISTS idx_incidents_entity ON incidents (assigned_entity_id);
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
    file_size_bytes INTEGER,
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
    is_official     BOOLEAN DEFAULT FALSE,
    parent_id       UUID REFERENCES incident_comments(id) ON DELETE CASCADE,
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
-- TABLA: incident_follows — Seguimiento de incidencias
-- ==============================================================================
CREATE TABLE IF NOT EXISTS incident_follows (
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (incident_id, user_id)
);

-- ==============================================================================
-- TABLA: incident_status_history — Historial de cambios de estado
-- ==============================================================================
CREATE TABLE IF NOT EXISTS incident_status_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    old_status      VARCHAR(30),
    new_status      VARCHAR(30) NOT NULL,
    changed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    note            TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_incident
    ON incident_status_history (incident_id);

-- ==============================================================================
-- TABLA: notifications — Notificaciones a usuarios
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT,
    reference_type  VARCHAR(30),
    reference_id    UUID,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications (user_id, is_read);

-- ==============================================================================
-- TABLA: user_2fa — Secretos TOTP por usuario (Sprint 6 — RF-SEC-04..09)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_2fa (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    secret_encrypted    TEXT NOT NULL,           -- AES-256-GCM: iv:tag:ciphertext (base64)
    enabled             BOOLEAN NOT NULL DEFAULT FALSE,
    enabled_at          TIMESTAMPTZ,
    last_used_counter   BIGINT,                  -- último counter TOTP aceptado (anti-replay)
    last_used_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- TABLA: user_recovery_codes — Códigos de recuperación 2FA (1:N)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_recovery_codes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash   TEXT NOT NULL,                   -- bcrypt hash
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recovery_user_unused
    ON user_recovery_codes(user_id) WHERE used = FALSE;

-- ==============================================================================
-- TABLA: security_audit_log — Log de auditoría de seguridad (Sprint 6)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS security_audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(64) NOT NULL,
    ip          INET,
    user_agent  TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user_time
    ON security_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action_time
    ON security_audit_log(action, created_at DESC);

-- ==============================================================================
-- DATOS INICIALES — Entidades responsables
-- ==============================================================================
INSERT INTO responsible_entities (id, name, type, contact_email, contact_phone) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Ayuntamiento de Alicante',
     'municipality', 'medioambiente@alicante.es', '965 14 91 00'),
    ('a0000000-0000-0000-0000-000000000002', 'SEPRONA - Guardia Civil',
     'seprona', 'seprona@guardiacivil.es', '062'),
    ('a0000000-0000-0000-0000-000000000003', 'Bomberos Consorcio Provincial Alicante',
     'fire_department', 'bomberos@dfrfrfr.es', '112'),
    ('a0000000-0000-0000-0000-000000000004', 'Policía Local de Alicante',
     'police', 'policialocal@alicante.es', '092'),
    ('a0000000-0000-0000-0000-000000000005', 'Consellería de Medio Ambiente GVA',
     'environmental_agency', 'medioambiente@gva.es', '012')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- DATOS INICIALES — Categorías de incidencias (12 categorías)
-- ==============================================================================
INSERT INTO categories (name, description, default_severity, default_entity_id, icon, color) VALUES
    ('Vertido ilegal',
     'Vertidos de residuos sólidos o líquidos en zonas no autorizadas',
     'high', 'a0000000-0000-0000-0000-000000000001', 'trash', '#E74C3C'),
    ('Contaminación de agua',
     'Contaminación de ríos, arroyos, acequias o aguas subterráneas',
     'high', 'a0000000-0000-0000-0000-000000000005', 'droplet', '#3498DB'),
    ('Contaminación del aire',
     'Emisiones, humos, olores o partículas contaminantes',
     'moderate', 'a0000000-0000-0000-0000-000000000005', 'wind', '#95A5A6'),
    ('Incendio forestal / quema',
     'Incendios forestales, quemas ilegales o provocadas',
     'critical', 'a0000000-0000-0000-0000-000000000003', 'flame', '#FF6B35'),
    ('Daño forestal (tala ilegal)',
     'Talas ilegales, destrucción de masa forestal',
     'high', 'a0000000-0000-0000-0000-000000000002', 'tree-pine', '#27AE60'),
    ('Residuos abandonados',
     'Residuos domésticos o industriales abandonados en vía pública o zonas naturales',
     'moderate', 'a0000000-0000-0000-0000-000000000001', 'package', '#F39C12'),
    ('Animales abandonados/maltratados',
     'Animales domésticos abandonados o con signos de maltrato',
     'high', 'a0000000-0000-0000-0000-000000000002', 'paw-print', '#E67E22'),
    ('Ruido excesivo',
     'Contaminación acústica por encima de niveles permitidos',
     'low', 'a0000000-0000-0000-0000-000000000004', 'volume-2', '#9B59B6'),
    ('Infraestructura dañada',
     'Contenedores rotos, alcantarillas obstruidas, mobiliario urbano dañado',
     'moderate', 'a0000000-0000-0000-0000-000000000001', 'construction', '#E67E22'),
    ('Residuos peligrosos',
     'Presencia de amianto, productos químicos o residuos industriales peligrosos',
     'critical', 'a0000000-0000-0000-0000-000000000003', 'alert-triangle', '#C0392B'),
    ('Fauna en peligro (hábitat)',
     'Destrucción de hábitats, trampas ilegales, especies protegidas amenazadas',
     'high', 'a0000000-0000-0000-0000-000000000002', 'bird', '#1ABC9C'),
    ('Otro',
     'Otros problemas medioambientales no categorizados',
     'moderate', 'a0000000-0000-0000-0000-000000000001', 'help-circle', '#34495E')
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
