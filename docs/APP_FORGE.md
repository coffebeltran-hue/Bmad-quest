# App Forge, plantillas y economía

## Diseño

Un `ForgeProject` se construye a partir de texto usando `interpretIdea` en `src/forge-engine.ts`. Detecta seis categorías mediante patrones controlados y ofrece mensajes explícitos ante solicitudes incompatibles, en vez de fingir que genera software arbitrario.

Los motores de interfaz están implementados en `src/ForgeWidgets.tsx`. La lógica de blackjack se encuentra aislada y verificable en `src/blackjack.ts`: baraja de 52 cartas, valores de ases 1/11, pedir carta, plantarse, dealer hasta 17, comparación, victoria, derrota, empate y nuevas rondas. No acepta ni procesa dinero real.

`src/ForgeApp.tsx` ofrece conversaciones narrativas, acceso a cada motor y una pestaña donde los jugadores pueden completar encargos gratuitos de la economía de la partida.

## Economía

- **preset**: el comienzo sigue siendo 100 CR, con costes, reglas y asistencia anteriores.
- **prompt**: el comienzo son 250 CR.
- Una misión completada aporta 20 CR y un debate aporta 12 CR, además de la recompensa educativa habitual.
- Tres trabajos por capítulo: investigación (35 CR), pruebas (40 CR), diseño (30 CR). El marcador `earned` evita repetir un mismo pago en un capítulo. Los trabajos vuelven a estar disponibles en el capítulo siguiente.
- Las fichas del blackjack sirven únicamente para puntuar rondas; son completamente independientes del sistema de créditos.

## Limitaciones

La generación libre de cualquier juego o software necesitaría un backend para el modelo de IA, sistemas de validación, ejecutores aislados y gestión de recursos. Ninguna de estas capacidades es parte de la versión estática en GitHub Pages. No hay APIs de pagos ni persistencia de registros de terceros.

## Construcción sincronizada de una app por instrucción

Al abrir el estudio de un proyecto creado por instrucción, la app sigue siendo funcional desde el principio. Al pulsar **↺ Recargar y construir**, **▷ Reproducir** o **↻** en el navegador de demostración, comienza una reconstrucción narrativa por siete etapas y 21 acciones:

1. Análisis del prompt y alcance.
2. Escenario y fondo de la aplicación.
3. Componentes visuales.
4. Contenido, textos y controles.
5. Reglas y lógica local.
6. Revisión de casos y pruebas.
7. Entrega del prototipo y habilitación de la interacción.

Los cinco agentes intervienen en los mensajes. La vista derecha muestra un wireframe inicial y luego la interfaz real de la plantilla con componentes progresivamente visibles. Se incluyen controles para pausar, adelantar/retroceder, reiniciar, ajustar velocidad y volver a la aplicación completa. El historial de misiones y decisiones existentes aparece después del recorrido básico.

La reproducción **no modifica partidas guardadas ni saldos**, y mientras aún se está mostrando cómo se construye, los controles del producto no están disponibles. Al llegar al final o salir de la reproducción, se restaura la app interactiva completa.

**Exactitud de la simulación:** los nombres de archivos reflejan archivos reales del proyecto, pero no son escrituras de código en tiempo real; las plantillas funcionales ya están implementadas en el repositorio. Para un constructor por IA autónomo sería necesario un servicio generativo externo y un entorno de ejecución aislado.
