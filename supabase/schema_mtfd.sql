  -- Tables in the public schema
  CREATE TABLE IF NOT EXISTS public.events_mtfd (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS public.post_mtfd (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events_mtfd(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- Guest table if needed
  CREATE TABLE IF NOT EXISTS public.guest_mtfd (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events_mtfd(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    whatsapp TEXT,
    status TEXT DEFAULT 'pending',
    gender TEXT CHECK (gender IN ('Masculino', 'Femenino', 'Otro')),
    age INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- Dedications table for guestbook
  CREATE TABLE IF NOT EXISTS public.dedications_mtfd (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- Global Settings table
  CREATE TABLE IF NOT EXISTS public.settings_mtfd (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_name TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
  
  -- Insert default music setting
  INSERT INTO public.settings_mtfd (key_name, value) VALUES ('background_music_url', '/la-carrera-del-violinista.mp3') ON CONFLICT (key_name) DO NOTHING;

  -- Storage bucket
  INSERT INTO storage.buckets (id, name, public) VALUES ('media_mtfd', 'media_mtfd', true)
  ON CONFLICT (id) DO NOTHING;

  -- RLS Policies
  ALTER TABLE public.events_mtfd ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Permitir lectura publica de events_mtfd" ON public.events_mtfd FOR SELECT TO public USING (true);
  CREATE POLICY "Permitir insertar events_mtfd a publico" ON public.events_mtfd FOR INSERT TO public WITH CHECK (true);

  ALTER TABLE public.post_mtfd ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Permitir lectura publica de post_mtfd" ON public.post_mtfd FOR SELECT TO public USING (true);
  CREATE POLICY "Permitir insertar post_mtfd a publico" ON public.post_mtfd FOR INSERT TO public WITH CHECK (true);

  ALTER TABLE public.guest_mtfd ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Permitir lectura publica de guest_mtfd" ON public.guest_mtfd FOR SELECT TO public USING (true);
  CREATE POLICY "Permitir insertar guest_mtfd a publico" ON public.guest_mtfd FOR INSERT TO public WITH CHECK (true);

  ALTER TABLE public.dedications_mtfd ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Permitir lectura publica de dedications_mtfd" ON public.dedications_mtfd FOR SELECT TO public USING (true);
  CREATE POLICY "Permitir insertar dedications_mtfd a publico" ON public.dedications_mtfd FOR INSERT TO public WITH CHECK (true);

  ALTER TABLE public.settings_mtfd ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Permitir lectura publica de settings_mtfd" ON public.settings_mtfd FOR SELECT TO public USING (true);
  CREATE POLICY "Permitir actualizar settings_mtfd a publico" ON public.settings_mtfd FOR UPDATE TO public USING (true);
  CREATE POLICY "Permitir insertar settings_mtfd a publico" ON public.settings_mtfd FOR INSERT TO public WITH CHECK (true);

  -- Storage policies
  CREATE POLICY "Public Access mtfd" ON storage.objects FOR SELECT TO public USING ( bucket_id = 'media_mtfd' );
  CREATE POLICY "Public Upload mtfd" ON storage.objects FOR INSERT TO public WITH CHECK ( bucket_id = 'media_mtfd' );
