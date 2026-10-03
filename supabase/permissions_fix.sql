-- Grant usage on the custom schema
GRANT USAGE ON SCHEMA linea_vida_vauquerita TO anon;
GRANT USAGE ON SCHEMA linea_vida_vauquerita TO authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA linea_vida_vauquerita TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA linea_vida_vauquerita TO authenticated;

-- Grant permissions on sequences (if any are used for IDs, though we use gen_random_uuid)
GRANT ALL ON ALL SEQUENCES IN SCHEMA linea_vida_vauquerita TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA linea_vida_vauquerita TO authenticated;
