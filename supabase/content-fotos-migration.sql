-- 1. Múltiples fotos por producto
ALTER TABLE productos ADD COLUMN IF NOT EXISTS fotos text[] DEFAULT '{}';

-- 2. Tabla de contenido editable del sitio
CREATE TABLE IF NOT EXISTS public.site_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave      text UNIQUE NOT NULL,
  valor      text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read"  ON site_content FOR SELECT USING (true);
CREATE POLICY "admin_write"  ON site_content FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND es_admin = true));

-- 3. Contenido inicial (Historia + Hero)
INSERT INTO site_content (clave, valor) VALUES
  ('hero_descripcion',  'Más que un club. Una comunidad forjada en la cancha, en las aulas y en el corazón de cada socio desde 1952.'),
  ('hito_1_year',       '2002'),
  ('hito_1_titulo',     'Fundación del Club'),
  ('hito_1_desc',       'Un grupo de estudiantes y docentes universitarios fundaron el club con la convicción de que el deporte y la educación van de la mano. Con pocos recursos pero mucha pasión, se jugó el primer partido oficial.'),
  ('hito_2_year',       '2008'),
  ('hito_2_titulo',     'Primer Campeonato Regional'),
  ('hito_2_desc',       'Seis años después de su fundación, el equipo conquistó su primer título regional, consolidando al club como una potencia emergente del fútbol universitario.'),
  ('hito_3_year',       '2023'),
  ('hito_3_titulo',     'Estadio Propio'),
  ('hito_3_desc',       'Gracias al esfuerzo colectivo de socios y dirigentes, se inauguró el estadio del club. Más de 2.000 personas presenciaron el primer partido oficial en casa propia.'),
  ('hito_4_year',       '2026'),
  ('hito_4_titulo',     'Nueva Era Digital'),
  ('hito_4_desc',       'El club da el salto al futuro: estadio renovado, plataforma digital, tienda oficial online y más de 3.400 socios activos.')
ON CONFLICT (clave) DO NOTHING;
