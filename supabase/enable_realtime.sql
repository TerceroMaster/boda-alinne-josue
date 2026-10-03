-- Habilitar Realtime para el esquema personalizado
-- Por defecto, Supabase solo activa realtime para el esquema 'public'.
-- Tenemos que activarlo manualmente para nuestras tablas en 'linea_vida_vauquerita'

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE linea_vida_vauquerita.events;
ALTER PUBLICATION supabase_realtime ADD TABLE linea_vida_vauquerita.posts;
