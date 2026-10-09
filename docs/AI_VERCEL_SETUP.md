# Habilitar generación asistida por IA en Vercel

**Estado:** Backend implementado en el repositorio, pero la generación NO se activará hasta desplegarlo y configurar los secretos. GitHub Pages no ejecuta las funciones `api/`.

## 1. Despliegue en Vercel

1. Importar `coffebeltran-hue/Bmad-quest` como nuevo proyecto desde GitHub en Vercel.
2. Framework: Vite, Build Command: `npm run build`, Output Directory: `dist`.
3. La configuración de Vite usa base `/` cuando Vercel define `VERCEL`; GitHub Pages conserva base `/Bmad-quest/`.
4. El archivo `api/forge.ts` se despliega como Vercel Function en `/api/forge`. Probar su existencia con un POST válido; una ruta sin credenciales debe responder con HTTP 503, y una sin código correcto con HTTP 401.

## 2. Variables del proyecto Vercel (Settings > Environment Variables)

Configurar como **Secret**, únicamente en servidor:

- `OPENAI_API_KEY`: clave propia de OpenAI API, no la de ChatGPT. Requiere uso de API habilitado.
- `FORGE_BETA_CODE`: clave aleatoria y larga que se comunica por un canal seguro únicamente a los evaluadores de la beta. No almacenar en el código o en una variable `VITE_*`.

Opcionales:

- `OPENAI_FORGE_MODEL`: modelo compatible con Responses API y salida de JSON Schema estricto. Valor predeterminado `gpt-5-mini`.
- `FORGE_ALLOWED_ORIGIN`: orígenes adicionales permitidos (separados por coma). Por defecto permite dominio propio de Vercel y `https://coffebeltran-hue.github.io` + `http://localhost:5173`.

Publicar el proyecto de nuevo tras cambiar variables. Ver documentación actual de Vercel sobre secretos y despliegues.

## 3. Frontend y GitHub Pages

En el despliegue de Vercel, el botón aparece automáticamente y consume `/api/forge` desde el mismo origen.

En GitHub Pages, el frontend necesita una variable de compilación **pública** `VITE_FORGE_API_URL` con una URL completa, por ejemplo `https://<tu-proyecto>.vercel.app/api/forge`. En GitHub Actions define una variable del repositorio `FORGE_API_URL` con esa URL; el workflow la pasa al proceso de compilación. No hay credenciales en esa variable.

De lo contrario, GitHub Pages seguirá ofreciendo solo el generador local, sin errores.

## Seguridad y control de costes

- El endpoint falla cerrado si faltan `OPENAI_API_KEY` o `FORGE_BETA_CODE`.
- Rechaza orígenes no autorizados y un código de acceso incorrecto.
- Limita la longitud del prompt y el tamaño máximo de salida del modelo.
- `store:false` solicita no guardar las respuestas del lado de OpenAI.
- Verifica estructura y campos; el navegador solo representa componentes React preexistentes.
- Los códigos de acceso compartidos **no son autenticación robusta, ni un limitador de solicitudes**. Antes de hacer una beta pública, activar Vercel WAF/Firewall rate limiting o autenticación por usuario, un límite de gasto del proveedor y monitoreo. Evitar abrir la API ilimitadamente.
- No recibe ni ejecuta JavaScript o HTML generados por el modelo, ni permite llamadas a servicios de terceros desde el blueprint.

## Qué genera la IA

La IA interpreta el objetivo, selecciona entre `records`, `tasks`, `calculator`, `timer`, `flashcards`, `journal`, `goals`, `dashboard` y `game`, y personaliza etiquetas, títulos, tema y advertencias. El runtime no incorpora funciones fuera de esos motores. En particular, la palabra «juego» no habilita automáticamente físicas, escenas 3D, multijugador, voz o redes.

## Pruebas

- `npm test`: casos sin claves, código de acceso incorrecto, CORS y mock de OpenAI sin red real.
- `npm run build`: TypeScript + Vite.
- No se han realizado llamadas a OpenAI con credenciales reales ni pruebas end-to-end del despliegue Vercel hasta configurar un proyecto y secretos.
