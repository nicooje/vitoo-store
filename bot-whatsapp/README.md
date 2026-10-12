# Bot de WhatsApp → web de Vito Store

Lee las publicaciones del grupo **Vitö store 2💜** y las pasa al catálogo de la web
(Google Sheet + fotos en Cloudinary). La web se actualiza sola, sin volver a publicarla.

## Cómo se usa

- **`Actualizar Vito Store.bat`** (en la carpeta VitoStoreWeb): doble clic y listo.
  Se conecta, junta lo nuevo del grupo, actualiza la web y muestra un resumen.
- **`Vista previa Vito Store (sin cambios).bat`**: muestra qué haría, sin tocar la web.

La primera vez aparece un código de 8 letras. En el celular:
WhatsApp → Dispositivos vinculados → Vincular un dispositivo → *Vincular con el número de teléfono*
→ ingresá el código. Las siguientes veces ya no lo pide.

Usalo al menos cada 10–14 días: si el bot pasa mucho tiempo sin conectarse,
WhatsApp puede desvincularlo (en ese caso vuelve a pedir el código, no se pierde nada).

## Sin repetidos

- Cada mensaje del grupo se procesa **una sola vez** (queda anotado en `datos/estado.json`).
- Si un producto ya está en la web (mismo nombre), **se actualiza esa fila** (precios, stock en SI)
  en vez de agregar otra.
- Si se publica varias veces lo mismo, queda un solo producto con el precio más nuevo,
  y la misma foto no se sube dos veces.
- Si el nombre se parece a uno existente pero no es seguro, **no toca nada** y lo avisa en el
  resumen para que lo revises en el admin.
- Si editan el texto de una publicación (por ejemplo, cambian el precio), se vuelve a procesar.

## Configuración (`config.json`)

| campo | qué es |
|---|---|
| `telefono` | número vinculado al bot: va en `config.local.json` (no se sube a GitHub), formato internacional sin + |
| `grupos` | nombre (o parte del nombre) de los grupos a leer |
| `desde` | no procesa publicaciones anteriores a esta fecha |

Los resúmenes de cada corrida quedan en `datos/informes/`.
**No compartas ni subas la carpeta `datos/`**: tiene la sesión de WhatsApp (ya está en `.gitignore`).

## Pruebas

`npm install` y luego `npm test` (o `npx tsx test/probar.ts ruta/al/chat-exportado.txt`).

> Usa Baileys, una conexión no oficial de WhatsApp (como WhatsApp Web). Funciona bien para
> esto, pero WhatsApp no lo permite oficialmente: hay un riesgo bajo de que restrinja el número.
