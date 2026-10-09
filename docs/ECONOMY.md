# Economía y límites presupuestarios

- Cada misión muestra su precio (5 CR o 13 CR).
- Cada debate muestra su precio (2 CR o 8 CR).
- Una opción que no puede pagarse queda deshabilitada; la validación también ocurre dentro de la lógica del juego.
- El saldo nunca puede hacerse negativo ni permite comprar acciones gratuitas por agotar fondos.
- Cuando todas las decisiones siguientes son inasequibles, aparece una actividad de financiación de emergencia: +20 CR y -7 puntos de calidad.
- Solo se permite una financiación por misión o debate (checkpoint), evitando un bucle infinito de subvenciones.
- Las partidas anteriores de localStorage se migran para agregar `fundingUsed` sin perder su historial de decisiones.
- El motor de crédito está centralizado en `src/economy.ts` y se ejecutan pruebas automatizadas durante el despliegue.
