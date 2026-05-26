-- Seed all 15 Mayor matches for Primera Rueda 2026
-- Clears existing Mayor partidos first to avoid duplicates
DELETE FROM public.partidos WHERE categoria = 'Mayor';

INSERT INTO public.partidos (rival, fecha, sede, es_local, estado, competencia, categoria) VALUES
  ('Old Brendans Club',              '2026-04-12', 'Campo Deportivo Elbio Fernández', true,  'programado', 'Primera Rueda 2026', 'Mayor'),
  ('San Isidro Lomas Universitario', '2026-04-19', null,                              false, 'programado', 'Primera Rueda 2026', 'Mayor'),
  ('San Juan Bautista',              '2026-04-26', 'Campo Deportivo Elbio Fernández', true,  'programado', 'Primera Rueda 2026', 'Mayor'),
  ('Alemán Universitario',           '2026-05-17', 'Campo Deportivo Elbio Fernández', true,  'programado', 'Primera Rueda 2026', 'Mayor'),
  ('Olimar',                         '2026-05-24', null,                              false, 'programado', 'Primera Rueda 2026', 'Mayor'),
  ('City Park',                      '2026-05-31', 'Campo Deportivo Elbio Fernández', true,  'programado', 'Primera Rueda 2026', 'Mayor'),
  ('Club Jesús María',               '2026-06-07', null,                              false, 'programado', 'Primera Rueda 2026', 'Mayor'),
  ('Náutico C. y P.G.',              '2026-06-14', 'Campo Deportivo Elbio Fernández', true,  'programado', 'Primera Rueda 2026', 'Mayor'),
  ('Ceibos Club',                    '2026-06-21', null,                              false, 'programado', 'Primera Rueda 2026', 'Mayor'),
  ('Sagrada Familia',                '2026-06-28', 'Campo Deportivo Elbio Fernández', true,  'programado', 'Primera Rueda 2026', 'Mayor'),
  ('Club Universidad Católica',      '2026-07-26', null,                              false, 'programado', 'Primera Rueda 2026', 'Mayor'),
  ('J.M.L.M.',                       '2026-08-02', 'Campo Deportivo Elbio Fernández', true,  'programado', 'Primera Rueda 2026', 'Mayor'),
  ('Centro Cristóbal Colón',         '2026-08-09', null,                              false, 'programado', 'Primera Rueda 2026', 'Mayor'),
  ('Independiente',                  '2026-08-16', null,                              false, 'programado', 'Primera Rueda 2026', 'Mayor'),
  -- Suspended match goes last (future date so it sorts to end naturally)
  ('Círculo de Tenis Montevideo',    '2026-08-30', null,                              false, 'suspendido', 'Primera Rueda 2026', 'Mayor');
