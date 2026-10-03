-- Eliminar posibles tablas vacías en public que hayamos creado antes por accidente
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Mover tus tablas (¡con tus fotos intactas!) al esquema public
ALTER TABLE IF EXISTS linea_vida_vauquerita.events SET SCHEMA public;
ALTER TABLE IF EXISTS linea_vida_vauquerita.posts SET SCHEMA public;

-- Habilitar seguridad en las nuevas tablas
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Recrear las políticas para public
DO $$ BEGIN CREATE POLICY "Permitir lectura eventos" ON public.events FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Permitir insertar eventos" ON public.events FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Permitir lectura posts" ON public.posts FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Permitir insertar posts" ON public.posts FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Habilitar Realtime para public
BEGIN; DROP PUBLICATION IF EXISTS supabase_realtime; CREATE PUBLICATION supabase_realtime; COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Eliminar el esquema maldito
DROP SCHEMA IF EXISTS linea_vida_vauquerita CASCADE;

NOTIFY pgrst, 'reload schema';
