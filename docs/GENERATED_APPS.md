# Generación libre de miniapps por IA — beta experimental

## Antes y después

Antes, `/api/forge` devolvía uno de nueve esquemas y los renderizaba siempre con componentes React existentes, por lo que ideas diferentes recibían formularios parecidos.

Ahora existe una **ruta aparte** `POST /api/generate` que pide al modelo archivos **HTML, CSS y JavaScript específicos para cada instrucción**, respetando una salida JSON estructurada. Los archivos se validan y luego se muestran dentro de un `iframe` cuyo único permiso adicional es `sandbox="allow-scripts"` **SIN allow-same-origin**. El código no se evalúa en la aplicación principal ni se ejecuta en los servidores de Vercel.

La vista `src/GeneratedPreview.tsx` enseña el resultado en tamaños de escritorio/móvil, permite consultar los tres archivos y reiniciar la miniapp. Su construcción se reproduce en etapas dentro del chat BMAD: primero wireframe, después HTML y estilos, y finalmente JavaScript. Este recorrido está narrado a partir del resultado **ya generado**; no es una grabación del razonamiento del modelo.

## Activación

Se reutilizan `OPENAI_API_KEY`, `FORGE_BETA_CODE` y `FORGE_ALLOWED_ORIGIN` de Vercel. Opcional: `OPENAI_CODE_MODEL`, por defecto `gpt-5-mini`.

En Vercel, el cliente apunta a `/api/generate`. En GitHub Pages, se infiere `/api/generate` de la URL `VITE_FORGE_API_URL` que termina en `/api/forge`.

El usuario elige **Crear por instrucción** y escribe una idea. El botón principal **Generar aplicación REAL con IA** llama al modelo y consume saldo de la API de OpenAI; el botón **Usar plantilla local sin IA** sigue disponible por separado.

## Aislamiento y límites

- La función de Vercel exige un código de beta, rechaza orígenes desconocidos y limita el prompt y el volumen de la respuesta.
- El frontend valida la estructura y limita el tamaño de los archivos antes de persistirlos en localStorage.
- El iframe tiene origen opaco; su CSP bloquea scripts externos, red saliente (fetch/WebSocket), iframes secundarios, fuentes externas, formularios remotos y accesos a servicios externos.
- No se monta el código generado en React, no se instala ninguna dependencia, no se escribe código en el repositorio por solicitud de usuario.
- El sandbox bloquea almacenamiento local del marco, acceso al DOM del padre y comunicación con APIs. Las apps generadas son prototipos **100% navegador / sesiones de demostración**, no servicios productivos.
- Un iframe restringido **reduce riesgo pero no garantiza aislamiento absoluto** contra programas maliciosos o que consumen muchos recursos. Antes de dar acceso público sin clave, se requiere un dominio de vista previa independiente, límites de tiempo/recursos, autenticación por usuario, rate limits del lado del servidor, evaluación automática y control de gasto.
- El modelo puede equivocarse: el estado «generado» no equivale a «probado». Es obligatorio comprobar las interacciones y las reglas antes de declarar una aplicación terminada. Si necesita bases de datos, pagos reales, multijugador o APIs, **no funcionará en este sandbox sin backend**.

## Verificaciones

`npm test` prueba validación de bundle, etapas de ejecución (JS activado solo al final), el contrato de la API mediante `fetch` simulado, autenticación, orígenes y rechazo de salidas inválidas. `npm run build` prueba TypeScript/Vite.

Las pruebas simuladas no validan resultados reales del modelo; la primera generación de usuario requiere una comprobación manual.
