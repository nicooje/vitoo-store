# Instrucciones para la Integración de Vito Store con Google Sheets

Para que el catálogo de la web se actualice automáticamente desde una hoja de cálculo, debes configurar un archivo de Google Sheets.

## Estructura Esperada de Columnas

Asegúrate de que la hoja de cálculo contenga exactamente las siguientes columnas, en este orden preciso. La primera fila (Fila 1) se usa como encabezado, por lo que **la lectura de los datos comenzará a partir de la Fila 2**.

| Columna A | Columna B | Columna C | Columna D | Columna E | Columna F |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ID** | **Nombre del Producto** | **Categoría** | **Precio** | **URL de Imagen** | **Tiene Stock** |

### Explicación de cada Columna:

*   **A (ID):** Un número único para cada producto (ej. 1, 2, 3...).
*   **B (Nombre del Producto):** El título visible en la web (ej. `Bikini Triángulo 'Verano'`).
*   **C (Categoría):** Ayuda visual en la tarjeta. Recomendados: `Lencería`, `Trajes de Baño`, `Pijamas`.
*   **D (Precio):** El precio en ARS sin símbolos ni formato de moneda (solo números, ej. `25000`). La web le pondrá el formato automáticamente (`$ 25.000`).
*   **E (URL de Imagen):** Un enlace completo a la foto alojada en internet (ej. de Unsplash, Google Drive público o tu hosting de imágenes).
*   **F (Tiene Stock):** Para habilitar la venta. Escribe `TRUE`, `V`, o `SI` si hay stock. Escribe `FALSE` o `NO` si no hay (esto mostrará el cartel de "Sin Stock").

---

## Ejemplo Fila 2 (Datos válidos):
- A2: `1`
- B2: `Conjunto Encaje 'Passion'`
- C2: `Lencería`
- D2: `18500`
- E2: `https://images.unsplash.com/photo-15967040...`
- F2: `SI`

## Pasos para conectar:
1. Crear un Proyecto en Google Cloud Console.
2. Habilitar la "Google Sheets API".
3. Crear una Cuenta de Servicio (Service Account) y generar una llave (archivo JSON con el correo del cliente y llave privada).
4. Compartir tu hoja de Google Sheets (como "Lector") con el correo electrónico (Client Email) de esa Cuenta de Servicio.
5. Copiar el ID de la hoja de cálculo (está en la URL, entre `/d/` y `/edit`).
6. Cargar en el entorno de producción (Vercel) las variables `SHEET_ID`, `CLIENT_EMAIL` y `PRIVATE_KEY`.
