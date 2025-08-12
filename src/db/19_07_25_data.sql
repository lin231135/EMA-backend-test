-- ============================================================================
-- EMA - Datos de ejemplo (semilla mínima)
-- Passwords en claro aquí; se hashean en 20_..._hash_passwords.sql
-- ============================================================================

BEGIN;

-- Usuarios: admin, maestro, padre
INSERT INTO "User"(name, last_name, email, phone, password, role, description)
VALUES
('Ada',   'Admin',   'admin@ema.test',   '+50211111111', 'admin123',  'admin',   NULL),
('Marco', 'Maestro', 'marco@ema.test',   '+50222222222', 'maestro123','maestro', 'Piano & Teoría musical'),
('Paula', 'Padre',   'paula@ema.test',   '+50233333333', 'padre123',  'padre',   NULL)
ON CONFLICT (email) DO NOTHING;

-- Hijo de Paula
INSERT INTO Kid(parent_id, name, birth_date)
SELECT id, 'Carlitos', DATE '2020-05-01' FROM "User" WHERE email='paula@ema.test'
ON CONFLICT DO NOTHING;

-- Curso del maestro
INSERT INTO Course(name, teacher_id, modality, capacity, cost)
SELECT 'Piano Básico', U.id, 'academia', 3, 150.00
FROM "User" U WHERE U.email='marco@ema.test'
ON CONFLICT (name) DO NOTHING;

-- Horario (mañana de mañana +1 día)
INSERT INTO Schedule(course_id, teacher_id, schedule_date, start_time, end_time)
SELECT C.id, C.teacher_id, (CURRENT_DATE + INTERVAL '1 day')::date, TIME '10:00', TIME '11:00'
FROM Course C WHERE C.name='Piano Básico'
ON CONFLICT DO NOTHING;

COMMIT;