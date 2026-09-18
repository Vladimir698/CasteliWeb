-- Usuarios iniciales Casteli
-- Las contraseñas NO se almacenan en texto plano: estos valores son hashes bcrypt.
-- Puede ejecutarse varias veces; actualiza los cinco usuarios indicados.

INSERT INTO usuarios (rol_id,nombre,usuario,password_hash,activo,created_at,updated_at)
VALUES
((SELECT id FROM roles WHERE nombre='Mecanico'),'Emerson','emerson','$2b$12$ZM/aEDBsz68veLsgU3jv7.ZyrKn7SzsLtep4FsfUi.jrjk7.Q52uy',TRUE,NOW(),NOW()),
((SELECT id FROM roles WHERE nombre='Mecanico'),'Anderson','anderson','$2b$12$ZQF2eapc9gnLLYFzHjERhOkjp9fRi3wfMyCqXiAX8JgWSefaJ2ava',TRUE,NOW(),NOW()),
((SELECT id FROM roles WHERE nombre='Administrador'),'Mariano','mariano','$2b$12$VRBxAmfuaP5Pn8MmussvBeMMrik3cQ/L7MZE37B2qonTP7dg87kQC',TRUE,NOW(),NOW()),
((SELECT id FROM roles WHERE nombre='Administrador'),'Rodolfo','rodolfo','$2b$12$cmm4K6SAs7bWmtKKiIi7keC.XbGTL4mu9Oo7jVdOzvN8U.SMYgFAO',TRUE,NOW(),NOW()),
((SELECT id FROM roles WHERE nombre='Administrador'),'Vladimir','vladimir','$2b$12$7OBuTA8Wqvgijzwx3Yxw1e4WVOycj24y8LHuJJnVvVKvJZv.GhSPe',TRUE,NOW(),NOW())
ON CONFLICT (usuario) DO UPDATE SET
 rol_id=EXCLUDED.rol_id,
 nombre=EXCLUDED.nombre,
 password_hash=EXCLUDED.password_hash,
 activo=TRUE,
 updated_at=NOW();
