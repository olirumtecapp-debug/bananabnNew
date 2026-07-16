
-- Tabela de salas do Mico
CREATE TABLE public.rooms (
  code text PRIMARY KEY,
  host_id uuid NOT NULL,
  state jsonb NOT NULL,
  status text NOT NULL DEFAULT 'lobby',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.rooms TO authenticated, anon;
GRANT ALL ON public.rooms TO service_role;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ver uma sala pelo código (não expõe dados sensíveis; é um jogo público por sala)
CREATE POLICY "read any room"
  ON public.rooms FOR SELECT
  USING (true);

-- Escritas apenas via server functions (service_role bypassa RLS); não há policies para INSERT/UPDATE/DELETE

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
