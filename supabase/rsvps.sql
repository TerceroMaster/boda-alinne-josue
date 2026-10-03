-- Script para crear la tabla de invitados (RSVP)

-- 1. Crear tabla guests
CREATE TABLE public.guests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    whatsapp TEXT,
    status TEXT NOT NULL CHECK (status IN ('attending', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de seguridad
-- Permitir que cualquier persona pueda insertar su registro (RSVP público)
DO $$ BEGIN 
  CREATE POLICY "Permitir insertar guests" ON public.guests FOR INSERT TO public WITH CHECK (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Permitir que cualquier persona pueda ver los guests (útil para el admin y tal vez para mostrar un contador público si se desea luego)
DO $$ BEGIN 
  CREATE POLICY "Permitir leer guests" ON public.guests FOR SELECT TO public USING (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Permitir eliminar (solo por si el admin se equivoca o quiere borrar a alguien)
DO $$ BEGIN 
  CREATE POLICY "Permitir eliminar guests" ON public.guests FOR DELETE TO public USING (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Refrescar la caché
NOTIFY pgrst, 'reload schema';
