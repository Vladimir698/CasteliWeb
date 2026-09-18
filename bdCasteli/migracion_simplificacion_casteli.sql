-- CASTELI: migración no destructiva para la interfaz simplificada
-- Ejecutar UNA VEZ sobre la base existente.

ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS proximo_aceite_km INT;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS proximo_aceite_fecha DATE;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS proximo_frenos_fecha DATE;

ALTER TABLE ordenes_trabajo ADD COLUMN IF NOT EXISTS mano_obra NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE ordenes_trabajo ADD COLUMN IF NOT EXISTS otros NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE ordenes_trabajo ADD COLUMN IF NOT EXISTS descuento NUMERIC(12,2) NOT NULL DEFAULT 0;

-- Los repuestos siguen usando orden_repuestos, pero ya no necesitan estar ligados a inventario.
-- orden_trabajos.estado se reutiliza con los valores 'detectado' y 'realizado'.

UPDATE orden_trabajos SET estado='realizado' WHERE estado IS NULL;


-- Cierre de reparaciones, facturación quincenal e integración GTI.
ALTER TABLE ordenes_trabajo ADD COLUMN IF NOT EXISTS responsable_trabajo VARCHAR(100);
ALTER TABLE ordenes_trabajo ADD COLUMN IF NOT EXISTS finalizado_por VARCHAR(150);
ALTER TABLE ordenes_trabajo ADD COLUMN IF NOT EXISTS gti_estado VARCHAR(30);
ALTER TABLE ordenes_trabajo ADD COLUMN IF NOT EXISTS gti_referencia VARCHAR(120);

INSERT INTO estados_orden (nombre)
SELECT 'Finalizada'
WHERE NOT EXISTS (SELECT 1 FROM estados_orden WHERE nombre='Finalizada');
