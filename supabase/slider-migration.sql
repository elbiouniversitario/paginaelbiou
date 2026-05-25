-- Seed initial content for HeroSlider slides
-- Run this AFTER content-fotos-migration.sql (which creates the site_content table)
INSERT INTO site_content (clave, valor) VALUES
  ('slide_1_tag',    'Estadio Municipal'),
  ('slide_1_linea1', 'La Casa'),
  ('slide_1_linea2', 'de la Pasión'),
  ('slide_1_sub',    'Más de 5.000 hinchas viven cada partido en casa'),
  ('slide_1_foto',    ''),
  ('slide_1_visible', 'true'),
  ('slide_2_tag',    'Complejo de Entrenamiento'),
  ('slide_2_linea1', 'Donde se Forja'),
  ('slide_2_linea2', 'el Campeón'),
  ('slide_2_sub',    'Instalaciones de primer nivel para nuestros jugadores'),
  ('slide_2_foto',    ''),
  ('slide_2_visible', 'true'),
  ('slide_3_tag',    'Cantera Universitaria'),
  ('slide_3_linea1', 'El Futuro'),
  ('slide_3_linea2', 'Azul y Amarillo'),
  ('slide_3_sub',    'Formando los cracks de mañana desde 1952'),
  ('slide_3_foto',    ''),
  ('slide_3_visible', 'true'),
  ('slide_4_tag',    'Campo Auxiliar'),
  ('slide_4_linea1', 'Setenta Años'),
  ('slide_4_linea2', 'de Historia'),
  ('slide_4_sub',    'Un club universitario con raíces profundas en la comunidad'),
  ('slide_4_foto',    ''),
  ('slide_4_visible', 'true')
ON CONFLICT (clave) DO NOTHING;
