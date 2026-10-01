-- Casteli: indices recomendados para produccion.
-- Seguro para ejecutar mas de una vez.

CREATE INDEX IF NOT EXISTS idx_vehiculos_cliente_id
  ON public.vehiculos (cliente_id);

CREATE INDEX IF NOT EXISTS idx_ordenes_trabajo_vehiculo_id
  ON public.ordenes_trabajo (vehiculo_id);

CREATE INDEX IF NOT EXISTS idx_ordenes_trabajo_estado_id
  ON public.ordenes_trabajo (estado_id);

CREATE INDEX IF NOT EXISTS idx_ordenes_trabajo_fecha_recepcion
  ON public.ordenes_trabajo (fecha_recepcion DESC);

CREATE INDEX IF NOT EXISTS idx_ordenes_trabajo_fecha_fin
  ON public.ordenes_trabajo (fecha_fin DESC);

CREATE INDEX IF NOT EXISTS idx_orden_trabajos_orden_id
  ON public.orden_trabajos (orden_id);

CREATE INDEX IF NOT EXISTS idx_orden_repuestos_orden_id
  ON public.orden_repuestos (orden_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id
  ON public.usuarios (rol_id);

ANALYZE public.vehiculos;
ANALYZE public.ordenes_trabajo;
ANALYZE public.orden_trabajos;
ANALYZE public.orden_repuestos;
