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
