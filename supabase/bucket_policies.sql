-- Políticas para permitir la carga de imágenes y videos en el nuevo bucket

DO $$ BEGIN
    CREATE POLICY "Public Upload para media_linea_vida_vaquerita" 
    ON storage.objects FOR INSERT TO public 
    WITH CHECK ( bucket_id = 'media_linea_vida_vaquerita' );
EXCEPTION WHEN duplicate_object THEN null; END $$;
