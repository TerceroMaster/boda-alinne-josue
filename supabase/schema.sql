-- Crear el esquema solicitado
CREATE SCHEMA IF NOT EXISTS linea_vida_vauquerita;

-- Crear tabla para los eventos (Bloques principales)
CREATE TABLE IF NOT EXISTS linea_vida_vauquerita.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla para los posts (fotos/videos dentro de los eventos)
CREATE TABLE IF NOT EXISTS linea_vida_vauquerita.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES linea_vida_vauquerita.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar Storage (Bucket) para guardar los archivos multimedia
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de seguridad para eventos
ALTER TABLE linea_vida_vauquerita.events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Permitir lectura publica de eventos" ON linea_vida_vauquerita.events FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Permitir insertar eventos a publico" ON linea_vida_vauquerita.events FOR INSERT TO public WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Políticas de seguridad para posts
ALTER TABLE linea_vida_vauquerita.posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Permitir lectura publica de posts" ON linea_vida_vauquerita.posts FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Permitir insertar posts a publico" ON linea_vida_vauquerita.posts FOR INSERT TO public WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Políticas para el Bucket
DO $$ BEGIN
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING ( bucket_id = 'media' );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public Upload" ON storage.objects FOR INSERT TO public WITH CHECK ( bucket_id = 'media' );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- ¡MUY IMPORTANTE! Permisos de Esquema
-- ==========================================
GRANT USAGE ON SCHEMA linea_vida_vauquerita TO anon;
GRANT USAGE ON SCHEMA linea_vida_vauquerita TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA linea_vida_vauquerita TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA linea_vida_vauquerita TO authenticated;
