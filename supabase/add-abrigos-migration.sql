-- 1. Actualizar el check constraint para incluir "Abrigos"
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_categoria_check;
ALTER TABLE productos ADD CONSTRAINT productos_categoria_check
  CHECK (categoria IN ('Camisetas', 'Shorts', 'Abrigos', 'Accesorios', 'Calzado'));

-- 2. Insertar Canguro bordado y Campera tipo Parka
INSERT INTO productos (nombre, precio, categoria, descripcion, talles, activo, destacado, stock)
VALUES
  (
    'Canguro bordado',
    1500,
    'Abrigos',
    'Canguro de algodón con escudo bordado y espalda estampada.',
    ARRAY['S','M','L','XL','XXL'],
    true,
    true,
    0
  ),
  (
    'Campera tipo Parka',
    2000,
    'Abrigos',
    'Parka de corte largo que brinda mayor cobertura y libertad de movimiento. Confeccionada en 100% poliéster, es cómoda y liviana. Cuenta con bolsillos con cierre seguro y puños que aportan un buen ajuste. Ideal para uso urbano y actividades al aire libre.',
    ARRAY['S','M','L','XL','XXL'],
    true,
    true,
    0
  );
