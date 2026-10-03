-- Añadir la columna de fecha del evento (event_date)
ALTER TABLE public.events ADD COLUMN event_date TIMESTAMP WITH TIME ZONE;

-- Refrescar caché
NOTIFY pgrst, 'reload schema';
