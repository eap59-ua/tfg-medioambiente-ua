-- ==============================================================================
-- EcoAlerta — Datos de desarrollo (seeds)
-- PostgreSQL 16 + PostGIS 3.4
-- ==============================================================================
-- Ejecutar DESPUÉS de init.sql
-- Passwords generadas con bcryptjs (10 rounds)
-- ==============================================================================

-- ==============================================================================
-- USUARIOS DE PRUEBA
-- ==============================================================================
-- Admin:     admin@ecoalerta.es    / Admin123!
-- Ciudadano: maria.garcia@gmail.com / User1234
-- Ciudadano: carlos.lopez@gmail.com / User1234
-- Entidad:   ayto.alicante@ecoalerta.es / Entity12
-- ==============================================================================

INSERT INTO users (id, email, password_hash, display_name, bio, role, entity_id, is_active, is_verified) VALUES
    -- Administrador
    ('b0000000-0000-0000-0000-000000000001',
     'admin@ecoalerta.es',
     '$2a$10$6pN6sTwkiFmihrc0WY0rBOFc5k9BaaNrX0BSQ/Kf.qXIkaxWW.K.i',
     'Admin EcoAlerta',
     'Administrador principal de la plataforma EcoAlerta.',
     'admin', NULL, TRUE, TRUE),

    -- Ciudadano 1
    ('b0000000-0000-0000-0000-000000000002',
     'maria.garcia@gmail.com',
     '$2a$10$ob4OdBOIDU2fUJAyQhtzGeaFDUVY1iRHvh057cCmHC2sxakUkY0qu',
     'María García Pérez',
     'Vecina de San Vicente del Raspeig, preocupada por el medio ambiente.',
     'citizen', NULL, TRUE, TRUE),

    -- Ciudadano 2
    ('b0000000-0000-0000-0000-000000000003',
     'carlos.lopez@gmail.com',
     '$2a$10$od0viaTFlThW90wp6v6YqOHGBkSSoh4L2fi2BRKvnmdN8wOdcsbB.',
     'Carlos López Martínez',
     'Senderista y amante de la naturaleza. Reporto lo que veo en mis rutas.',
     'citizen', NULL, TRUE, TRUE),

    -- Usuario Entidad (Ayuntamiento de Alicante)
    ('b0000000-0000-0000-0000-000000000004',
     'ayto.alicante@ecoalerta.es',
     '$2a$10$vIEC7KuLOBVXtVjiNi4KMuFgXud2nx5QOtY3a0W2eiqN82XMsGiO6',
     'Medio Ambiente - Ayto. Alicante',
     'Concejalía de Medio Ambiente del Ayuntamiento de Alicante.',
     'entity', 'a0000000-0000-0000-0000-000000000001', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- INCIDENCIAS DE EJEMPLO (zona Alicante / San Vicente del Raspeig)
-- ==============================================================================

INSERT INTO incidents (id, title, description, category_id, reporter_id, assigned_entity_id, location, address, status, severity, priority_score, view_count) VALUES
    -- Incidencia 1: Vertido ilegal en el Barranco de las Ovejas (Alicante)
    ('c0000000-0000-0000-0000-000000000001',
     'Vertido ilegal en Barranco de las Ovejas',
     'He encontrado una gran cantidad de escombros y residuos de construcción vertidos en el cauce del Barranco de las Ovejas, cerca de la zona de Ciudad de Asís. Hay plásticos, hierros y restos de obra que podrían contaminar el agua cuando llueva.',
     1, -- Vertido ilegal
     'b0000000-0000-0000-0000-000000000002', -- María
     'a0000000-0000-0000-0000-000000000001', -- Ayuntamiento
     ST_SetSRID(ST_MakePoint(-0.4615, 38.3580), 4326),
     'Barranco de las Ovejas, Ciudad de Asís, Alicante',
     'validated', 'high', 12, 45),

    -- Incidencia 2: Contenedores desbordados en San Vicente
    ('c0000000-0000-0000-0000-000000000002',
     'Contenedores desbordados en Avda. de Alicante',
     'Los contenedores de la Avenida de Alicante (frente al Mercadona) llevan tres días sin ser recogidos. La basura se acumula alrededor y el olor es insoportable. Hay riesgo sanitario por la presencia de ratas.',
     6, -- Residuos abandonados
     'b0000000-0000-0000-0000-000000000003', -- Carlos
     NULL,
     ST_SetSRID(ST_MakePoint(-0.5240, 38.3960), 4326),
     'Avda. de Alicante 42, San Vicente del Raspeig',
     'pending', 'moderate', 5, 23),

    -- Incidencia 3: Humo de quema ilegal en la Serra del Maigmó
    ('c0000000-0000-0000-0000-000000000003',
     'Quema ilegal en zona forestal Serra del Maigmó',
     'Se observa humo abundante procedente de una parcela agrícola junto a la Serra del Maigmó. Parece una quema de rastrojos sin autorización en época de alto riesgo de incendio. Urge intervención.',
     4, -- Incendio forestal / quema
     'b0000000-0000-0000-0000-000000000002', -- María
     'a0000000-0000-0000-0000-000000000003', -- Bomberos
     ST_SetSRID(ST_MakePoint(-0.6100, 38.4700), 4326),
     'Partida rural, Serra del Maigmó, Tibi',
     'assigned', 'critical', 28, 87),

    -- Incidencia 4: Perro abandonado en campus UA
    ('c0000000-0000-0000-0000-000000000004',
     'Perro abandonado y herido en Campus UA',
     'Hay un perro de raza mediana, color marrón, que lleva varios días en los alrededores de la Facultad de Ciencias. Parece herido en una pata trasera y está muy delgado. Necesita atención veterinaria urgente.',
     7, -- Animales abandonados/maltratados
     'b0000000-0000-0000-0000-000000000003', -- Carlos
     'a0000000-0000-0000-0000-000000000002', -- SEPRONA
     ST_SetSRID(ST_MakePoint(-0.5137, 38.3856), 4326),
     'Campus Universidad de Alicante, Facultad de Ciencias',
     'in_progress', 'high', 15, 62),

    -- Incidencia 5: Ruido excesivo en zona residencial
    ('c0000000-0000-0000-0000-000000000005',
     'Ruido excesivo por obras nocturnas en Playa San Juan',
     'Desde hace una semana, hay obras de construcción en un solar de la Playa de San Juan que continúan después de las 22:00. El ruido de maquinaria pesada impide dormir a los vecinos de los bloques adyacentes.',
     8, -- Ruido excesivo
     'b0000000-0000-0000-0000-000000000002', -- María
     'a0000000-0000-0000-0000-000000000004', -- Policía Local
     ST_SetSRID(ST_MakePoint(-0.4215, 38.3750), 4326),
     'Calle Berna 15, Playa de San Juan, Alicante',
     'resolved', 'low', 3, 31)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- FOTOS DE EJEMPLO (URLs placeholder)
-- ==============================================================================

INSERT INTO incident_photos (id, incident_id, photo_url, thumbnail_url, caption, sort_order, file_size_bytes) VALUES
    ('d0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'https://placehold.co/1200x900?text=Vertido+Barranco',
     'https://placehold.co/300x225?text=Vertido+Thumb',
     'Vista general del vertido ilegal', 0, 245000),
    ('d0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000001',
     'https://placehold.co/1200x900?text=Escombros+Detalle',
     'https://placehold.co/300x225?text=Escombros+Thumb',
     'Detalle de los escombros y plásticos', 1, 198000),
    ('d0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000002',
     'https://placehold.co/1200x900?text=Contenedores',
     'https://placehold.co/300x225?text=Contenedores+Thumb',
     'Contenedores desbordados', 0, 312000),
    ('d0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000003',
     'https://placehold.co/1200x900?text=Humo+Serra',
     'https://placehold.co/300x225?text=Humo+Thumb',
     'Columna de humo visible desde la carretera', 0, 180000),
    ('d0000000-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000004',
     'https://placehold.co/1200x900?text=Perro+Campus',
     'https://placehold.co/300x225?text=Perro+Thumb',
     'Perro herido en los jardines de la facultad', 0, 267000)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- VOTOS DE EJEMPLO
-- ==============================================================================

INSERT INTO incident_votes (incident_id, user_id) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003'), -- Carlos vota vertido
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'), -- Carlos vota quema
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001'), -- Admin vota quema
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002')  -- María vota perro
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- COMENTARIOS DE EJEMPLO
-- ==============================================================================

INSERT INTO incident_comments (id, incident_id, user_id, content, is_official) VALUES
    ('e0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000003',
     'Yo también he visto esto. Cada vez hay más escombros, creo que alguien viene por las noches a verter.',
     FALSE),
    ('e0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     'Incidencia validada. Se ha notificado al servicio de limpieza del Ayuntamiento para su retirada.',
     TRUE),
    ('e0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000004',
     'b0000000-0000-0000-0000-000000000001',
     'Se ha contactado con SEPRONA y con la protectora de animales de San Vicente. Un equipo irá mañana a rescatar al animal.',
     TRUE)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- HISTORIAL DE ESTADOS DE EJEMPLO
-- ==============================================================================

INSERT INTO incident_status_history (id, incident_id, old_status, new_status, changed_by, note) VALUES
    ('f0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'pending', 'validated',
     'b0000000-0000-0000-0000-000000000001',
     'Incidencia verificada tras inspección visual.'),
    ('f0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000003',
     'pending', 'validated',
     'b0000000-0000-0000-0000-000000000001',
     'Confirmado humo visible. Alertados bomberos.'),
    ('f0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000003',
     'validated', 'assigned',
     'b0000000-0000-0000-0000-000000000001',
     'Asignada a Bomberos del Consorcio Provincial.'),
    ('f0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000005',
     'pending', 'validated',
     'b0000000-0000-0000-0000-000000000001',
     NULL),
    ('f0000000-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000005',
     'validated', 'resolved',
     'b0000000-0000-0000-0000-000000000001',
     'Policía Local visitó la obra y notificó al constructor. Obras nocturnas cesaron.')
ON CONFLICT (id) DO NOTHING;
