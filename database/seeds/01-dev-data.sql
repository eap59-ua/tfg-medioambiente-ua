-- ==============================================================================
-- EcoAlerta — Datos de prueba (seed)
-- ==============================================================================
-- Uso: Se ejecuta automáticamente con Docker o con `npm run db:seed`
-- ==============================================================================

-- Usuario admin de prueba (password: admin123)
INSERT INTO users (email, password_hash, display_name, role, is_active, is_verified) VALUES
    ('admin@ecoalerta.es', '$2a$10$placeholder_hash_change_me', 'Administrador', 'admin', true, true),
    ('ciudadano@test.es', '$2a$10$placeholder_hash_change_me', 'María García', 'citizen', true, true),
    ('anonimo@test.es', '$2a$10$placeholder_hash_change_me', 'Juan López', 'citizen', true, false)
ON CONFLICT (email) DO NOTHING;

-- Incidencias de ejemplo en la zona de Alicante / San Vicente del Raspeig
-- Nota: Las coordenadas usan ST_SetSRID(ST_MakePoint(lng, lat), 4326)
INSERT INTO incidents (title, description, category_id, reporter_id, location, address, status, priority)
SELECT
    'Vertido de escombros en Barranco de las Ovejas',
    'Se han detectado varios montones de escombros y residuos de construcción depositados ilegalmente junto al cauce del barranco.',
    (SELECT id FROM categories WHERE name = 'Vertido ilegal'),
    (SELECT id FROM users WHERE email = 'ciudadano@test.es'),
    ST_SetSRID(ST_MakePoint(-0.4701, 38.3542), 4326),
    'Barranco de las Ovejas, Alicante',
    'pending',
    'high'
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE title = 'Vertido de escombros en Barranco de las Ovejas');

INSERT INTO incidents (title, description, category_id, reporter_id, location, address, status, priority)
SELECT
    'Contenedores desbordados en Campus UA',
    'Los contenedores de reciclaje junto a la Facultad de Ciencias llevan varios días sin recogerse y están completamente desbordados.',
    (SELECT id FROM categories WHERE name = 'Infraestructura dañada'),
    (SELECT id FROM users WHERE email = 'anonimo@test.es'),
    ST_SetSRID(ST_MakePoint(-0.5141, 38.3853), 4326),
    'Campus Universidad de Alicante, San Vicente del Raspeig',
    'validated',
    'medium'
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE title = 'Contenedores desbordados en Campus UA');

INSERT INTO incidents (title, description, category_id, reporter_id, location, address, status, priority)
SELECT
    'Agua turbia en acequia de El Campello',
    'El agua de la acequia presenta un color marrón oscuro inusual y un olor fuerte. Posible vertido industrial.',
    (SELECT id FROM categories WHERE name = 'Contaminación agua'),
    (SELECT id FROM users WHERE email = 'ciudadano@test.es'),
    ST_SetSRID(ST_MakePoint(-0.3968, 38.4275), 4326),
    'Acequia principal, El Campello, Alicante',
    'in_progress',
    'critical'
WHERE NOT EXISTS (SELECT 1 FROM incidents WHERE title = 'Agua turbia en acequia de El Campello');
