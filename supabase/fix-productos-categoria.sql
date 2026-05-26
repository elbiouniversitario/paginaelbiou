-- Fix: drop existing categoria CHECK constraint and recreate with all categories
ALTER TABLE public.productos
  DROP CONSTRAINT IF EXISTS productos_categoria_check;

ALTER TABLE public.productos
  ADD CONSTRAINT productos_categoria_check
  CHECK (categoria IN ('Camisetas', 'Shorts', 'Abrigos', 'Accesorios', 'Calzado'));
