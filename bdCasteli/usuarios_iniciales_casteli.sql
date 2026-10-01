-- Usuarios iniciales Casteli
-- Las contraseñas NO se almacenan en texto plano: estos valores son hashes bcrypt.
-- Puede ejecutarse varias veces; actualiza los cinco usuarios indicados.

INSERT INTO usuarios (rol_id,nombre,usuario,password_hash,activo,created_at,updated_at)
VALUES
((SELECT id FROM roles WHERE nombre='Mecanico'),'Emerson','emerson','$2b$12$ocWFNtrE.OT.zc7AMp1r1uw/7Tlpn1y6b54y2aUX8/QxCaJv2c3NG',TRUE,NOW(),NOW()),
((SELECT id FROM roles WHERE nombre='Mecanico'),'Anderson','anderson','$2b$12$YyfbZgxOLLvOFDiTgGiR3uV4xbpCYcJeJ6vqzE3tQdmlEfj8ShGHW',TRUE,NOW(),NOW()),
((SELECT id FROM roles WHERE nombre='Administrador'),'Mariano','mariano','$2b$12$qsso1rsQFpqoiKu2QAjkVeCOLziLWQVocZYCCTQHLbYPnZ4SffjrS',TRUE,NOW(),NOW()),
((SELECT id FROM roles WHERE nombre='Administrador'),'Rodolfo','rodolfo','$2b$12$FUygAQUaZ26svWucOMj8neR/jJpqR2GIYp7wz0mYtQQ8Vgv93QEHe',TRUE,NOW(),NOW()),
((SELECT id FROM roles WHERE nombre='Administrador'),'Vladimir','vladimir','$2b$12$BmfgGgrrghnG5tznzU/cvO4yzLjECvb/y9HojTA5mS.WSctBFA/Im',TRUE,NOW(),NOW())
ON CONFLICT (usuario) DO UPDATE SET
 rol_id=EXCLUDED.rol_id,
 nombre=EXCLUDED.nombre,
 password_hash=EXCLUDED.password_hash,
 activo=TRUE,
 updated_at=NOW();
