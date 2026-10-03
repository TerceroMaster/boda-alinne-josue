-- Habilitar permisos de eliminación y actualización para eventos
DO $$ BEGIN 
  CREATE POLICY "Permitir eliminar eventos" ON public.events FOR DELETE TO public USING (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN 
  CREATE POLICY "Permitir actualizar eventos" ON public.events FOR UPDATE TO public USING (true) WITH CHECK (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Habilitar permisos de eliminación y actualización para posts (recuerdos)
DO $$ BEGIN 
  CREATE POLICY "Permitir eliminar posts" ON public.posts FOR DELETE TO public USING (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN 
  CREATE POLICY "Permitir actualizar posts" ON public.posts FOR UPDATE TO public USING (true) WITH CHECK (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Refrescar caché de Supabase
NOTIFY pgrst, 'reload schema';
