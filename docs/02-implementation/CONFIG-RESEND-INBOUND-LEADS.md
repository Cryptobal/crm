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
