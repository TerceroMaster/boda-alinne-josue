-- Añadir campos de sexo y edad a la tabla de invitados
ALTER TABLE public.guests ADD COLUMN gender TEXT CHECK (gender IN ('Masculino', 'Femenino', 'Otro'));
ALTER TABLE public.guests ADD COLUMN age INTEGER;

-- Refrescar caché
NOTIFY pgrst, 'reload schema';
