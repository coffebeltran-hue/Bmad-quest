# Iterar aplicaciones con IA (edición por instrucciones)

## Experiencia

Debajo del historial **# equipo-en-desarrollo** aparece el panel **Pídele cambios al equipo**.

- Describe un ajuste como «agrega un historial de los últimos 10 giros» o «pon un selector de temas».
- Ingresa el código beta privado usado para generar aplicaciones.
- El botón **Pedir mejora a los agentes** llama a `POST /api/refine`.
- La nueva aplicación se muestra a la derecha en **App en vivo**. Se añaden mensajes narrativos de Fundador, John y Amelia al chat; se preservan la historia, misiones, créditos y progreso del juego.
- La app nueva se guarda en la partida del navegador junto con un historial de hasta **3 versiones anteriores**. El botón **Recuperar versión anterior** deshace el último cambio.

## Cambio en app generada con IA

Se envían `files.html`, `files.css` y `files.javascript` **existentes** junto con la instrucción nueva. El modelo devuelve los archivos completos revisados, con el objetivo de conservar las características previas y añadir el cambio.

## Cambio en app de plantilla local (ej. Roulette Royal)

Estas apps existen como componentes React del propio videojuego, no como un archivo HTML editable. No se modifica directamente el motor original: el servidor recibe el brief, las características generales y el nuevo requisito, y crea una **implementación independiente** en HTML/CSS/JS. Esto puede cambiar diseño o reglas. La interfaz lo advierte antes de continuar y mantiene la versión React original disponible para deshacer.

## Límites

- No se garantizan ausencia de bugs ni conservación perfecta de comportamiento. La vista está marcada para prueba manual.
- El código no se evalúa en el proceso Vercel ni en React: solo dentro del iframe con origen opaco, `sandbox="allow-scripts"` y CSP que bloquea red y servicios externos.
- El código beta nunca se guarda en localStorage. `OPENAI_API_KEY` y `FORGE_BETA_CODE` se consultan únicamente en servidor.
- Cada edición implica una nueva llamada a la API de OpenAI con posible coste para el propietario; no gasta créditos del videojuego.
- No se aplica ninguna edición si la API falla o el resultado no pasa validaciones. La versión anterior permanece intacta.
- Las apps generadas deben continuar siendo prototipos aislados: no tienen pagos, datos de otros usuarios ni funcionalidades backend.

## Pruebas

`npm test`: autenticación, CORS, rechazos, diferencias entre refinar código y recrear plantilla, preservación de estado del juego, restauración de versiones.
`npm run build`: TypeScript estricto + Vite. La primera edición real con credenciales debe probarse manualmente.
