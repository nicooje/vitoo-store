# Guía de Despliegue en Vercel (Vitoo Store)

Esta guía condensa los pasos necesarios para publicar tu prototipo de Next.js en Vercel, asegurándose de que la conexión a Google Sheets funcione correctamente en producción.

## 1. Subir el Código a GitHub

1. Inicializa tu repositorio localmente si aún no lo has hecho:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - MVP Vitoo Store"
   ```
2. Ve a [GitHub](https://github.com/) y crea un nuevo repositorio (puede ser privado).
3. Vincula tu repositorio local con el remoto y empuja el código:
   ```bash
   git remote add origin https://github.com/tu-usuario/vito-store.git
   git branch -M main
   git push -u origin main
   ```

*Nota: Hemos verificado que el archivo `.gitignore` incluye `.env`, `.env.local` y `/node_modules`. Tus credenciales locales están seguras y **no** se subirán a GitHub.*

## 2. Conectar a Vercel

1. Inicia sesión en [Vercel](https://vercel.com/) (puedes usar tu cuenta de GitHub).
2. Haz clic en el botón negro superior que dice **"Add New..."** y selecciona **"Project"**.
3. En la lista de repositorios de GitHub, busca el que acabas de crear (ej: `vito-store`) y haz clic en **"Import"**.
4. Vercel detectará automáticamente que es un proyecto de Next.js. **PERO NO LE DES A DEPLOY TODAVÍA**. Necesitamos configurar el "Backend".

## 3. Configurar las Variables de Entorno (CRÍTICO)

En la pantalla de configuración del proyecto en Vercel (antes de hacer clic en Deploy), busca la sección **"Environment Variables"** y despliégala.

Debes agregar exactamente TRES variables (los nombres deben estar en mayúsculas como abajo). Los valores los obtienes del archivo JSON de tu Service Account de Google:

1.  **Name:** `SHEET_ID`
    **Value:** (pega el ID de tu Google Sheet, la cadena larga de letras y números)
    *Haz clic en Add*

2.  **Name:** `CLIENT_EMAIL`
    **Value:** (pega el email que termina en `gserviceaccount.com`)
    *Haz clic en Add*

3.  **Name:** `PRIVATE_KEY`
    **Value:** Esta es la más delicada. El JSON de Google trae los saltos de línea escritos como `\n` literalmente. En Vercel, debes pegar TODA la llave privada exactamente como viene, incluyendo los bloques `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`.
    *Nota para el equipo técnico:* El código ya incluye la lógica `.replace(/\\n/g, '\n')` para interpretar correctamente estos saltos de línea de Vercel. 
    *Haz clic en Add*

## 4. Desplegar (Deploy)

Una vez añadidas las 3 variables, puedes hacer clic en el botón azul **"Deploy"**.

Vercel instalará las dependencias (incluyendo `googleapis`), compilará el sitio consumiendo la data de tu Excel, y te generará una URL pública (ej: `vito-store.vercel.app`). ¡Tu E-commerce estará listo!
