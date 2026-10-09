# Abrir BMAD Quest al público sin compartir el código beta

**Estado:** Implementación preparada. El acceso público permanece **desactivado** hasta instalar y configurar todas las protecciones. Esto evita exponer tu saldo de OpenAI sin controles.

## Acceso invitado

No necesita cuentas ni contraseñas. Cada visitante completa Cloudflare Turnstile antes de pedir una generación o mejora. La API verifica el token con Cloudflare en el servidor y reserva un cupo en Upstash Redis de forma atómica.

Cuotas iniciales:
- Hasta **2 creaciones** por IP/día UTC.
- Hasta **3 ediciones** por IP/día UTC.
- Máximo **4 solicitudes combinadas** por IP/día UTC.
- Máximo **25 solicitudes globales** por día UTC (se comparten entre todos).
- Máximo **2 solicitudes por minuto por IP** y **8 globales por minuto**.

El cómputo de solicitudes se reserva ANTES de consumir OpenAI y se cobra contra el cupo incluso si la IA falla. Las IP no se almacenan en texto claro: se usa un hash SHA-256 con sal privada. Los límites por IP son aproximados: una familia comparte IP; alguien podría usar distintas redes, por eso también existe el límite global.

La API pública entra solo si se cumplen TODAS estas condiciones: `FORGE_PUBLIC_ENABLED=1`, `OPENAI_API_KEY` presente, credenciales de Upstash, secret/sitekey de Turnstile, `FORGE_LIMIT_SALT` y se ejecuta detrás de Vercel. Si falta alguna, se mantiene automáticamente el modo beta con `FORGE_BETA_CODE`.

## Configuración necesaria

### 1. Upstash Redis
En [Vercel Marketplace](https://vercel.com/marketplace) instala Upstash Redis y vincula la base al proyecto **bmad-quest**; también sirve una base Redis creada en [Upstash Console](https://console.upstash.com/). Coloca en las variables de Vercel, solo en servidor:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Nunca** coloques el token Redis en GitHub o variables `VITE_*`. No uses almacenamiento en memoria de Vercel Functions como contador: no es compartido ni durable.

### 2. Cloudflare Turnstile
En [Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) crea un widget para `bmad-quest.vercel.app`. Si también quieres generar desde GitHub Pages, permite `coffebeltran-hue.github.io`. Configura:
- `TURNSTILE_SITE_KEY` (identificador público, pero se almacena como variable de Vercel y se entrega a los navegadores por `GET /api/access`).
- `TURNSTILE_SECRET_KEY` (secreto, solo Vercel).

Turnstile necesita verificación **server-side** en Siteverify; no basta con mostrar el widget. Sus tokens se utilizan una sola vez.

### 3. Activar la beta pública
Crea un secreto largo `FORGE_LIMIT_SALT` (p. ej. 32 bytes aleatorios, solo Vercel), añade `FORGE_PUBLIC_ENABLED=1` a Vercel Production y haz Redeploy. Antes de esto el sistema sigue privado: no basta con cambiar el texto del botón.

Para comprobar la activación sin consultar claves: abrir `https://bmad-quest.vercel.app/api/access`; debe responder `{"mode":"public","siteKey":"...","limits":{...}}`. Si devuelve `mode:"private"` revisa las seis variables necesarias y redeploy.

El frontend detecta el modo automáticamente. En público muestra «Acceso gratuito para visitantes» y Turnstile, y oculta el campo de código beta. Lo mismo sucede al editar una app en el estudio.

### 4. Proteger el gasto del propietario
En OpenAI API [Usage Limits](https://platform.openai.com/settings/organization/limits) configura un presupuesto de proyecto y alertas. Las cuotas de Redis ponen un límite al NÚMERO de solicitudes, **no garantizan un techo en dólares**: el coste por solicitud depende de tokens de entrada/salida y modelo. Revisa consumo antes de aumentar el cupo. Activa rate limiting/Firewall de Vercel como segunda barrera.

La API utiliza `max_output_tokens` y 55 segundos de timeout, pero un máximo de tokens no equivale a un presupuesto monetario.

### 5. Consideraciones
- **Acceso invitado ≠ cuentas verificadas**: no atribuye identidades reales ni recupera historial entre dispositivos. Para cupos personales rigurosos será necesario un proveedor de autenticación.
- Las solicitudes pueden fallar o generar código defectuoso; la ejecución permanece en un iframe aislado sin servicios de terceros.
- Las aplicaciones de casino usan únicamente fichas de juego no canjeables.
- El botón «Usar plantilla local sin IA» continúa disponible gratis incluso cuando se consume el cupo diario.
- Conserva `FORGE_BETA_CODE` en Vercel como fallback privado, pero evita distribuirlo masivamente.

## Pruebas

`npm test` incluye respuesta privada si falta alguna dependencia, validación de Turnstile, cuotas Redis atomizadas, límite global, agotamiento de cuota y fallo cerrado si Redis no responde. `npm run build` verifica TypeScript y compilación de Vite.

No se han usado credenciales Redis/Cloudflare reales durante las pruebas automatizadas; tras configurar el entorno hay que verificar una generación real y la contabilización de cuotas.
