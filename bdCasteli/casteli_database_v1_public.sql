-- CASTELI DATABASE V1
-- PostgreSQL (Esquema PUBLIC)

-- Si desea reconstruir la base durante desarrollo:
DROP TABLE IF EXISTS prefacturas CASCADE;
DROP TABLE IF EXISTS compras_detalle CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS orden_repuestos CASCADE;
DROP TABLE IF EXISTS inventario CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS orden_fotos CASCADE;
DROP TABLE IF EXISTS orden_observaciones CASCADE;
DROP TABLE IF EXISTS orden_trabajos CASCADE;
DROP TABLE IF EXISTS orden_diagnosticos CASCADE;
DROP TABLE IF EXISTS orden_historial CASCADE;
DROP TABLE IF EXISTS ordenes_trabajo CASCADE;
DROP TABLE IF EXISTS estados_orden CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles(
 id SERIAL PRIMARY KEY,
 nombre VARCHAR(50) UNIQUE NOT NULL,
 descripcion TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios(
 id SERIAL PRIMARY KEY,
 rol_id INT REFERENCES roles(id),
 nombre VARCHAR(150) NOT NULL,
 usuario VARCHAR(60) UNIQUE NOT NULL,
 email VARCHAR(150),
 password_hash TEXT NOT NULL,
 activo BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes(
 id SERIAL PRIMARY KEY,
 tipo_cliente VARCHAR(20) DEFAULT 'persona',
 nombre VARCHAR(150) NOT NULL,
 identificacion VARCHAR(30),
 telefono VARCHAR(30),
 correo VARCHAR(150),
 direccion TEXT,
 notas TEXT,
 activo BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehiculos(
 id SERIAL PRIMARY KEY,
 cliente_id INT REFERENCES clientes(id),
 placa VARCHAR(20) UNIQUE NOT NULL,
 marca VARCHAR(80) NOT NULL,
 modelo VARCHAR(80) NOT NULL,
 anio INT,
 vin VARCHAR(50),
 numero_motor VARCHAR(50),
 motor VARCHAR(80),
 color VARCHAR(40),
 combustible VARCHAR(30),
 transmision VARCHAR(30),
 traccion VARCHAR(30),
 cilindraje VARCHAR(30),
 kilometraje_actual INT DEFAULT 0,
 activo BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estados_orden(
 id SERIAL PRIMARY KEY,
 nombre VARCHAR(60) UNIQUE NOT NULL
);

CREATE TABLE ordenes_trabajo(
 id SERIAL PRIMARY KEY,
 numero_orden VARCHAR(30) UNIQUE NOT NULL,
 vehiculo_id INT REFERENCES vehiculos(id),
 estado_id INT REFERENCES estados_orden(id),
 usuario_recepciona INT REFERENCES usuarios(id),
 usuario_asignado INT REFERENCES usuarios(id),
 fecha_recepcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 fecha_inicio TIMESTAMP,
 fecha_fin TIMESTAMP,
 kilometraje_ingreso INT NOT NULL,
 nivel_combustible VARCHAR(30),
 prioridad VARCHAR(20) DEFAULT 'Normal',
 problema_reportado TEXT NOT NULL,
 observaciones TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orden_historial(
 id SERIAL PRIMARY KEY,
 orden_id INT REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
 usuario_id INT REFERENCES usuarios(id),
 estado_anterior INT REFERENCES estados_orden(id),
 estado_nuevo INT REFERENCES estados_orden(id),
 comentario TEXT,
 fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orden_diagnosticos(
 id SERIAL PRIMARY KEY,
 orden_id INT REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
 usuario_id INT REFERENCES usuarios(id),
 descripcion TEXT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orden_trabajos(
 id SERIAL PRIMARY KEY,
 orden_id INT REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
 usuario_id INT REFERENCES usuarios(id),
 descripcion TEXT NOT NULL,
 fecha_inicio TIMESTAMP,
 fecha_fin TIMESTAMP,
 estado VARCHAR(30)
);

CREATE TABLE orden_observaciones(
 id SERIAL PRIMARY KEY,
 orden_id INT REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
 usuario_id INT REFERENCES usuarios(id),
 observacion TEXT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orden_fotos(
 id SERIAL PRIMARY KEY,
 orden_id INT REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
 ruta_archivo TEXT,
 descripcion TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proveedores(
 id SERIAL PRIMARY KEY,
 nombre VARCHAR(150) NOT NULL,
 telefono VARCHAR(30),
 correo VARCHAR(150),
 contacto VARCHAR(120)
);

CREATE TABLE inventario(
 id SERIAL PRIMARY KEY,
 codigo VARCHAR(50) UNIQUE,
 descripcion VARCHAR(200) NOT NULL,
 categoria VARCHAR(80),
 existencia NUMERIC(12,2) DEFAULT 0,
 costo NUMERIC(12,2) DEFAULT 0,
 precio NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE orden_repuestos(
 id SERIAL PRIMARY KEY,
 orden_id INT REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
 inventario_id INT REFERENCES inventario(id),
 proveedor_id INT REFERENCES proveedores(id),
 descripcion VARCHAR(200),
 cantidad NUMERIC(12,2),
 costo NUMERIC(12,2),
 precio NUMERIC(12,2),
 descuento NUMERIC(12,2)
);

CREATE TABLE compras(
 id SERIAL PRIMARY KEY,
 proveedor_id INT REFERENCES proveedores(id),
 numero_factura VARCHAR(60),
 fecha DATE DEFAULT CURRENT_DATE,
 subtotal NUMERIC(12,2),
 iva NUMERIC(12,2),
 total NUMERIC(12,2)
);

CREATE TABLE compras_detalle(
 id SERIAL PRIMARY KEY,
 compra_id INT REFERENCES compras(id) ON DELETE CASCADE,
 inventario_id INT REFERENCES inventario(id),
 descripcion VARCHAR(200),
 cantidad NUMERIC(12,2),
 costo NUMERIC(12,2)
);

CREATE TABLE prefacturas(
 id SERIAL PRIMARY KEY,
 orden_id INT UNIQUE REFERENCES ordenes_trabajo(id),
 subtotal NUMERIC(12,2),
 iva NUMERIC(12,2),
 total NUMERIC(12,2)
);

INSERT INTO roles(nombre,descripcion) VALUES
('Administrador','Acceso completo'),
('Mecanico Administrativo','Recepción'),
('Mecanico','Taller');

INSERT INTO estados_orden(nombre) VALUES
('Recibida'),('Diagnóstico'),('Esperando aprobación'),
('Esperando repuestos'),('Reparación'),
('Control de calidad'),('Lista para facturar'),
('Facturada'),('Entregada'),('Cancelada');

CREATE INDEX idx_cliente_nombre ON clientes(nombre);
CREATE INDEX idx_vehiculo_placa ON vehiculos(placa);
CREATE INDEX idx_orden_estado ON ordenes_trabajo(estado_id);
CREATE INDEX idx_orden_vehiculo ON ordenes_trabajo(vehiculo_id);
