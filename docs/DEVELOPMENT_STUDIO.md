# Estudio de Desarrollo

El Estudio hace visible el trabajo narrativo del equipo y la evolución de un producto ficticio de la startup elegida.

## Principio educativo

La conversación del equipo no es IA generativa en tiempo real. Su contenido se deriva del registro de decisiones persistido en la partida. Cada misión produce una intervención del agente principal, una decisión del fundador y otra reacción. También incorpora debates de Party Mode y financiación de emergencia.

## Progresión del producto

0-2 misiones: wireframe; 3-5: portada; 6-8: catálogo; 9-11: búsqueda y filtros; 12-14: lista seleccionable y formulario de demo; 15-17: beta y feedback; 18: lanzamiento final.

La progresión refleja el aprendizaje y las decisiones del jugador, no un proceso de compilación externo.

## Tres sitios simulados

EduConnect: tutorías por materia. FoodFlow: cafetería y menú. BookEasy: reserva de servicios. Los tres comparten un motor de presentación React y datos diferenciados.

## Persistencia

Las decisiones del juego ya se guardan en localStorage. El Estudio reconstruye los mensajes a partir de ellas. Las búsquedas, selecciones y formularios de la vista previa son interacciones efímeras y nunca envían datos a un servidor.

## Pruebas

`npm test` ejecuta los tests del motor de progresión, contenido de las tres startups y transcripción, además de las pruebas existentes de economía. `npm run build` compila TypeScript y Vite.

## Futuro

Agregar decisiones que modifiquen directamente los contenidos y colores del prototipo, escenas entre agentes más complejas y un exportador de la web simulada. No presentar generación de código autónoma hasta integrar un entorno real y seguro.

## Reproducir la construcción paso a paso

El botón **Reproducir obra** en el chat (o **↻** en el navegador de demostración) inicia una reconstrucción **visual y de solo lectura**. Los mensajes aparecen uno a uno, en orden histórico, y el panel derecho:
- Empieza en el wireframe y recupera cada fase liberada cuando Amelia anuncia la entrega.
- Muestra un estado de trabajo con el agente que habla, la parte visual afectada y un archivo ilustrativo.
- Resalta en la página la portada, catálogo, filtros, flujo o feedback según la etapa disponible.
- Actualiza el porcentaje temporal de la reproducción misión a misión sin alterar el progreso real guardado.
- Permite pausar/continuar, reiniciar, cambiar velocidad o terminar la reproducción.

También se puede elegir una versión de forma manual para salir de la reproducción y volver a probar los controles.

**Limitación explícita:** la historia del chat representa decisiones reales de la partida, pero no hay un motor que escriba código fuente en segundo plano. La reconstrucción visual es una simulación determinista del trabajo de los agentes; el prototipo React sí existe y es interactivo.
