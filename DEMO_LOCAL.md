# Demostración temporal de Casteli

Casteli puede mostrarse desde celulares u otras computadoras sin desplegarlo todavía en un hosting. El proyecto incluye un script para Windows que inicia la aplicación local, verifica PostgreSQL y abre un **Cloudflare Quick Tunnel** HTTPS.

## Primera vez

Abra PowerShell en la carpeta del proyecto y ejecute:

```powershell
npm run demo
```

Si `cloudflared` no está instalado, el script intentará instalarlo mediante Windows Package Manager (`winget`). Después de la instalación puede ser necesario cerrar PowerShell, abrirlo nuevamente y volver a ejecutar `npm run demo`.

## Cada demostración

```powershell
npm run demo
```

El script:
1. usa la configuración local de `.env`;
2. inicia Casteli en el puerto 3000;
3. comprueba `/health`, incluida la conexión con PostgreSQL;
4. inicia Cloudflare Tunnel;
5. Cloudflare imprime una dirección temporal `https://....trycloudflare.com`.

Abra esa dirección desde el celular o compártala con las personas que participen en la prueba.

## Para terminar

Presione `Ctrl+C` en la ventana de demostración. El enlace temporal dejará de funcionar.

## Requisitos

- La computadora debe permanecer encendida.
- PostgreSQL debe estar iniciado.
- Debe existir el archivo local `.env`.
- La computadora debe tener Internet.
- No abra el puerto de PostgreSQL en el router.
- El enlace de Quick Tunnel es temporal y cambia entre ejecuciones.
- Este mecanismo es exclusivamente para pruebas/demostraciones, no para producción.

El archivo `.env` continúa excluido de Git y no debe subirse al repositorio.
