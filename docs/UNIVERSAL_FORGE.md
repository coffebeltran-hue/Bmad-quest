# Constructor flexible de prototipos

## Qué se puede hacer hoy en GitHub Pages

`src/forge-engine.ts` prioriza seis motores específicos (blackjack, trivia, tareas, triqui, reservas, tienda). Para una instrucción general que no coincida, crea `ForgeProject.kind="custom"` mediante `planUniversal`. Ya no obliga a elegir una de seis ideas predefinidas.

`src/universal-engine.ts` obtiene un esquema de una instrucción simple, sin enviar los textos a un servidor. `src/UniversalApp.tsx` convierte ese esquema en una app React interactiva:

- Registros: crear, editar, buscar, filtrar, finalizar, eliminar y exportar CSV.
- Metas y diarios: registro con estado y notas.
- Tarjetas de estudio: preguntas, respuestas y repaso.
- Calculadoras: suma, resta, multiplicación, división y porcentajes.
- Temporizador: pausar, comenzar, reiniciar y contar sesiones.
- Métricas: registrar y sumar indicadores.
- Juegos generales: minijuego de decisiones con puntos.

La conversación de los agentes y la construcción por etapas también se aplican a `custom`. Los datos de cada prototipo se almacenan localmente en el navegador.

## Límites honestos

El motor local no inventa código JavaScript nuevo. No genera todos los tipos posibles de aplicaciones, ni implementa GPS, mapas, reconocimiento de imágenes, pagos, multijugador, cuentas de usuario o backend por el mero hecho de nombrarlos. Si no reconoce características específicas, ofrece una herramienta útil pero **no declara que ya cumplió toda la instrucción**.

Para alcanzar generación más abierta hace falta conectar un backend protegido que use un modelo generativo, traduzca la solicitud a componentes verificados, valide su resultado y, si se necesita código arbitrario, lo compile y ejecute en un sandbox. Nunca colocar claves API privadas en variables `VITE_*` ni directamente en el navegador.

## Pruebas

`npm test`: motores específicos, economía, blackjack, constructor general, validador y transcripciones. `npm run build`: TypeScript estricto + Vite.
