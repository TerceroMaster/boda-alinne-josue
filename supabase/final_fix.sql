-- 1. Crear el esquema
CREATE SCHEMA IF NOT EXISTS linea_vida_vauquerita;

-- 2. Crear las tablas dentro del esquema
CREATE TABLE IF NOT EXISTS linea_vida_vauquerita.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS linea_vida_vauquerita.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES linea_vida_vauquerita.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar la seguridad (RLS) y crear políticas
ALTER TABLE linea_vida_vauquerita.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE linea_vida_vauquerita.posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Permitir lectura publica de eventos" ON linea_vida_vauquerita.events FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Permitir insertar eventos a publico" ON linea_vida_vauquerita.events FOR INSERT TO public WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Permitir lectura publica de posts" ON linea_vida_vauquerita.posts FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Permitir insertar posts a publico" ON linea_vida_vauquerita.posts FOR INSERT TO public WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. Dar permisos al esquema para la API web
GRANT USAGE ON SCHEMA linea_vida_vauquerita TO anon;
GRANT USAGE ON SCHEMA linea_vida_vauquerita TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA linea_vida_vauquerita TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA linea_vida_vauquerita TO authenticated;

-- 5. Habilitar Realtime para el esquema
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE linea_vida_vauquerita.events;
ALTER PUBLICATION supabase_realtime ADD TABLE linea_vida_vauquerita.posts;

-- 6. Forzar a Supabase a reconocer los cambios
NOTIFY pgrst, 'reload schema';
