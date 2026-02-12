# Cómo crear files.gard.cl para R2 (acceso público a archivos)

Así configuras el dominio `files.gard.cl` para que apunte a tu bucket R2 y puedas usar `R2_PUBLIC_URL=https://files.gard.cl`.

---

## 1. En Cloudflare R2: dominio personalizado en el bucket

1. Entra a **Cloudflare Dashboard** → **R2** → tu bucket (**opai**).
2. Abre la pestaña **Settings** del bucket.
3. Busca la sección **Public access** o **Custom Domains** (puede llamarse "Dominios personalizados" o "Public bucket").
4. Pulsa **Connect Domain** / **Añadir dominio**.
5. Escribe: **`files.gard.cl`** (sin https).
6. Cloudflare te mostrará un **registro CNAME** que debes crear. Anota algo como:
   - **Nombre:** `files` (o `files.gard.cl` según la interfaz)
   - **Objetivo / Target:** una URL tipo `opai.<account-id>.r2.cloudflarestorage.com` o similar.

Si en tu cuenta R2 la opción se llama **"R2.dev subdomain"** en vez de custom domain: activa el subdominio público que te dan (ej. `xxx.r2.dev`) y luego en DNS de Cloudflare puedes hacer un CNAME de `files.gard.cl` a ese `xxx.r2.dev`. En cuentas recientes lo habitual es **Custom Domain** directo sobre el bucket.

---

## 2. En Cloudflare DNS: crear el registro para files.gard.cl

1. En Cloudflare: **Websites** → **gard.cl** → **DNS** → **Records**.
2. **Add record**:
   - **Type:** `CNAME`
   - **Name:** `files` (así el dominio queda `files.gard.cl`)
   - **Target:** el valor que te indicó R2 en el paso anterior (el "objetivo" del CNAME). Suele ser algo como:
     - `opai.<tu-account-id>.r2.cloudflarestorage.com`, o
     - un hostname que Cloudflare te muestre al conectar el dominio en R2.
   - **Proxy status:** puede estar en "Proxied" (nube naranja) o "DNS only" (gris); si R2 te pide un target concreto, usa lo que diga la consola de R2.
3. Guarda el registro.

---

## 3. Esperar propagación y activar SSL

- Cloudflare suele activar el SSL para `files.gard.cl` en unos minutos (certificado automático).
- Cuando `https://files.gard.cl` abra sin error (o la página que muestre R2), ya está listo.

---

## 4. Poner el valor en Vercel

En **Vercel** → tu proyecto → **Settings** → **Environment Variables**:

- **Key:** `R2_PUBLIC_URL`
- **Value:** `https://files.gard.cl`

Guarda y haz **Redeploy** para que la app use la nueva variable.

---

## Resumen

| Dónde | Acción |
|-------|--------|
| R2 → bucket **opai** → Settings | Conectar dominio personalizado **files.gard.cl** y anotar el target del CNAME |
| Cloudflare DNS → **gard.cl** | Crear CNAME: nombre **files**, target = el que dio R2 |
| Vercel → Environment Variables | `R2_PUBLIC_URL` = `https://files.gard.cl` |

Si en la consola de R2 no ves "Custom domain" sino solo "Public bucket" con subdominio `.r2.dev`, dime qué opciones te salen y adaptamos los pasos.
