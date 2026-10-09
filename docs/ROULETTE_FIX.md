# Roulette Royal — corrección de clasificación

## Error detectado

La instrucción «Quiero una app que sirva como la ruleta en los casinos» caía en el `records` por defecto y renderizaba un formulario de datos como si fuera un juego terminado. **Ese comportamiento era incorrecto.**

## Corrección

- `src/forge-engine.ts` ahora clasifica de manera explícita las variantes «ruleta», «roulette» y «rueda de casino».
- `src/roulette.ts` implementa una ruleta europea: 37 números únicos, asignación rojo/negro/verde, paridad, apuestas ficticias por color, paridad o un número, giros, resultado, premios simulados y validación de fichas suficientes.
- `src/RouletteGame.tsx` dibuja una rueda con SVG propio y anima sus giros con una aguja fija y un panel de puntos virtuales. No utiliza imágenes ni recursos copiados de casinos comerciales.
- `src/roulette.css` construye el tablero inspirado en estética de juego: tapete verde, madera, fichas y controles.
- `src/ForgeApp.tsx` y `src/forge-replay.ts` incluyen la ruleta dentro del flujo de conversación y su construcción visual gradual.
- `api/forge.ts` puede utilizar el plan del modelo, pero cuando existe un motor especializado lo entrega en vez de degradarlo a una UI genérica.
- El cliente acepta planes IA especializados al guardarlos y recargarlos.
- Las solicitudes de juegos no soportados se rechazan con una explicación, en lugar de generar un formulario genérico que se anuncia como juego.

## Seguridad y límites

Todas las fichas de Roulette Royal son únicamente puntuación de juego y **no representan dinero, créditos BMAD ni valor canjeable**. No existen pagos, depósitos, retiros, apuestas monetarias ni conexiones con casinos reales. Los giros utilizan aleatoriedad del navegador, con preferencia por `crypto.getRandomValues`, pero no se certifican para apuestas reguladas.

La opción «Crear y jugar mi app» usa el constructor local sin modelo generativo. «Generar plan con IA» requiere el endpoint de Vercel correctamente desplegado, credenciales y código beta. El chat narrativo es una simulación del desarrollo, no código autogenerado.

Probar: `npm test` y `npm run build`. Verificar ruleta, saldo insuficiente y juegos no soportados.
