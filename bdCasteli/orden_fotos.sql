-- Fotos asociadas a trabajos de reparación.
-- El archivo físico se guarda fuera de PostgreSQL (PHOTO_UPLOAD_DIR).
CREATE TABLE IF NOT EXISTS public.orden_fotos (
  id SERIAL PRIMARY KEY,
  trabajo_id INTEGER NOT NULL REFERENCES public.orden_trabajos(id) ON DELETE CASCADE,
  usuario_id INTEGER NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
  archivo VARCHAR(255) NOT NULL UNIQUE,
  nombre_original VARCHAR(255),
  mime_type VARCHAR(60) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orden_fotos_trabajo_id ON public.orden_fotos(trabajo_id);
