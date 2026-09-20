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


-- Datos de facturación del propietario.
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS codigo_trabajo VARCHAR(100);


-- Roles operativos de Casteli.
INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 'Administrador','Acceso completo al sistema',NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre='Administrador');
INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 'Mecanico','Acceso operativo sin precios, cobros ni facturación',NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre='Mecanico');

-- Intervalos personalizados para cálculo automático de mantenimiento.
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS intervalo_aceite_km INT;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS intervalo_aceite_meses INT;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS intervalo_frenos_meses INT;

-- Fechas/km reales del último servicio y revisión general.
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS ultimo_aceite_fecha DATE;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS ultimo_frenos_fecha DATE;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS intervalo_revision_km INT;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS ultima_revision_km INT;
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS proxima_revision_km INT;
