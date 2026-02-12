# Configurar Resend Inbound para leads@inbound.gard.cl

Para que al reenviar un correo a **leads@inbound.gard.cl** Resend lo reciba y llame a tu API (y se cree el lead automáticamente), haz esto en orden.

---

## 1. Dominio de recepción en Resend

Usa un **subdominio** (`inbound.gard.cl`) para no chocar con los MX de tu correo actual de gard.cl.

1. Entra a [Resend](https://resend.com) → **Domains**.
2. **Add Domain**.
3. Dominio: **`inbound.gard.cl`** (solo el subdominio, no gard.cl entero).
4. Resend te pedirá unos registros DNS para **verificar** el dominio (p. ej. TXT o CNAME). Anótalos.

---

## 2. DNS en Cloudflare para inbound.gard.cl

1. En **Cloudflare** → **gard.cl** → **DNS** → **Records**.
2. Crea los registros que Resend te haya indicado para verificar **inbound.gard.cl** (nombre del registro = `inbound` si el dominio es inbound.gard.cl).
3. Cuando Resend marque el dominio como verificado, en la página del dominio en Resend activa **Receiving** (recibir correos). Resend te mostrará un **registro MX** que debes añadir.
4. En Cloudflare DNS, añade ese **MX**:
   - **Type:** MX  
   - **Name:** `inbound` (para que sea inbound.gard.cl)  
   - **Mail server / Target:** el valor que te dé Resend (algo tipo `feedback-smtp.xxx.amazonses.com` o similar).  
   - **Priority:** el número que indique Resend (ej. 10).
5. En Resend, confirma con **“I’ve added the record”** y espera a que el MX aparezca como verificado.

Si Resend solo te deja verificar **gard.cl** (dominio raíz), entonces en Domains añade **gard.cl**, verifica con los registros que te pida y después en la misma página activa **Receiving**; Resend te dará el MX. Para no afectar el correo actual de gard.cl, en la documentación de Resend recomiendan usar un subdominio. Si en tu cuenta solo puedes verificar gard.cl, añade el MX en el subdominio **inbound** (Name = `inbound`) para que el correo a *@inbound.gard.cl vaya a Resend; en ese caso puede que tengas que contactar a Resend para confirmar que recibirán en ese subdominio.

---

## 3. Webhook para enviar el correo a tu API

1. En Resend → **Webhooks**.
2. **Add Webhook**.
3. **Endpoint URL:** la URL de tu app en Vercel + la ruta del webhook, por ejemplo:  
   **`https://tu-dominio.vercel.app/api/webhook/inbound-email`**  
   (sustituye `tu-dominio` por el que tengas en Vercel, o usa tu dominio propio si ya apunta a Vercel).
4. **Event:** marca **`email.received`**.
5. Guarda el webhook.

Cuando llegue un correo a cualquier dirección **@inbound.gard.cl** (incluida **leads@inbound.gard.cl**), Resend enviará un POST a esa URL con el evento `email.received`. Tu API ya filtra por destinatario `leads@inbound.gard.cl` (variable `INBOUND_LEADS_EMAIL`).

---

## 4. Comprobar que todo está listo

| Dónde | Qué revisar |
|-------|-------------|
| Resend → Domains | **inbound.gard.cl** (o gard.cl) verificado y **Receiving** activado con MX verificado. |
| Cloudflare DNS | Registros de verificación + **MX** para `inbound` (inbound.gard.cl) con el valor que dio Resend. |
| Resend → Webhooks | Webhook con evento **email.received** y URL **https://&lt;tu-app&gt;/api/webhook/inbound-email**. |
| Vercel | Variable **INBOUND_LEADS_EMAIL** = **leads@inbound.gard.cl** (ya la tienes). |

---

## 5. Prueba

1. Envía un correo **a ti mismo** (o pide a alguien que te escriba).
2. En Gmail (o tu cliente), **reenvía** ese correo a **leads@inbound.gard.cl**.
3. En unos segundos deberías ver en la app un **nuevo lead** en CRM → Leads, con origen “Correo reenviado” y los datos extraídos por IA.

Si no aparece el lead, revisa en Vercel los logs del deployment (o la pestaña “Functions” / “Logs”) para ver si llegó el POST a `/api/webhook/inbound-email` y si hubo algún error.

---

## 6. Error "no se ha encontrado el dominio inbound.gard.cl"

Si al enviar a **leads@inbound.gard.cl** tu cliente de correo dice que no encuentra el dominio:

- **Causa:** El registro **MX de recepción** para `inbound.gard.cl` no está verificado en Resend (en Domains → inbound.gard.cl aparece "Enable Receiving (MX)" en **Pending**).
- **Qué hacer:**
  1. En Resend → **Domains** → **inbound.gard.cl**, en la sección **"Enable Receiving (MX)"** verás el registro MX que debes crear (nombre y valor / mail server).
  2. En tu proveedor DNS (p. ej. Cloudflare → gard.cl → DNS), crea un registro **MX**:
     - **Name:** `inbound` (para que aplique a inbound.gard.cl).
     - **Mail server:** el valor exacto que muestra Resend (p. ej. `feedback-smtp.xxx.amazonses.com`).
     - **Priority:** la que indique Resend (ej. 10).
  3. En Resend, pulsa **"I've added the record"** (o "Verify") y espera a que el estado pase a **Verified**.
  4. La propagación DNS puede tardar unos minutos; si sigue en Pending, espera 15–30 min y vuelve a verificar en Resend.

Cuando el MX esté **Verified**, los correos a leads@inbound.gard.cl llegarán a Resend y se activará el webhook.

---

## 7. El correo no rebota pero no aparece el lead

Si el correo **ya no rebota** (Gmail lo envía bien) pero **no se crea el lead** en la app:

1. **Resend → Webhooks**  
   Abre el webhook de `email.received` y mira la sección de eventos. Si aparece un evento **email.received** tras enviar el correo, Resend sí recibió el correo y llamó a tu API. Si no hay eventos, el correo no está llegando a Resend (revisa MX y propagación).

2. **URL del webhook**  
   Debe ser exactamente:  
   `https://opai.gard.cl/api/webhook/inbound-email`  
   (no barra final, HTTPS). Comprueba que responde: abre en el navegador  
   `https://opai.gard.cl/api/webhook/inbound-email`  
   — debe devolver JSON con `ok: true` y `expectedRecipient: "leads@inbound.gard.cl"`.

3. **Vercel → Logs**  
   En el proyecto en Vercel, ve a **Logs** (o **Functions** → elegir la función) y filtra por `/api/webhook/inbound-email`. Busca líneas `[inbound-email] Webhook received:` tras enviar el correo.  
   - Si no hay ninguna petición: Resend no está llamando (revisa URL del webhook y que el evento sea `email.received`).  
   - Si hay petición pero `skipped: wrong_recipient`: la variable **INBOUND_LEADS_EMAIL** en Vercel debe ser exactamente `leads@inbound.gard.cl` (mismo valor que en Resend).  
   - Si hay error 502/500: revisa el mensaje en el log (p. ej. Resend API, base de datos, R2).

4. **Variable en Vercel**  
   En el proyecto → **Settings** → **Environment Variables**, confirma que **INBOUND_LEADS_EMAIL** = `leads@inbound.gard.cl` en Production (y Preview si pruebas en preview).
