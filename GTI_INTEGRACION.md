# Integración GTI Facturación

Casteli deja preparado el punto de integración desde **Facturación Quincenal**.

## Variables requeridas

```env
GTI_API_URL=
GTI_API_TOKEN=
```

No se deben guardar credenciales reales en GitHub.

## Estado actual

El sitio público de GTI no expone la especificación técnica del API de facturación electrónica. Por eso el adaptador de Casteli está aislado en:

`server/src/data/gtiService.js`

Cuando GTI entregue el endpoint, autenticación y estructura JSON oficial, se ajusta únicamente ese archivo sin volver a modificar órdenes, clientes, repuestos ni Facturación Quincenal.

Casteli ya prepara desde una orden:
- número de orden como referencia externa;
- nombre, identificación, correo y teléfono del cliente;
- repuestos/materiales con cantidad y precio;
- servicio de taller/mano de obra;
- estado y referencia devueltos por GTI.

**No habilitar GTI_API_URL / GTI_API_TOKEN con valores de prueba en producción.** Primero validar el contrato oficial y el ambiente de pruebas de GTI.
