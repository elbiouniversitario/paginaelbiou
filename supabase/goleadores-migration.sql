-- Create goleadores table
CREATE TABLE IF NOT EXISTS public.goleadores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id      uuid NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
  jugador_nombre  text NOT NULL,
  minuto          integer,
  es_penal        boolean NOT NULL DEFAULT false,
  categoria       text NOT NULL DEFAULT 'Mayor'
                    CHECK (categoria IN ('Mayor','Reserva','Pre-Senior','Sub 20','Sub 18','Femenino')),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.goleadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read goleadores"
  ON public.goleadores FOR SELECT USING (true);

CREATE POLICY "service_role all goleadores"
  ON public.goleadores FOR ALL USING (auth.role() = 'service_role');
