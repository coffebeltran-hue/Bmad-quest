# BMAD: Startup Quest

Videojuego educativo **no oficial** inspirado en BMAD Method. Administra una startup tecnológica y aprende exploración de problemas, PRD, UX, arquitectura, QA, Party Mode y retrospectivas.

## Estado

**Versión inicial jugable + actualización visual** (v0.2): 3 startups, 5 especialistas, 18 misiones narrativas, 8 debates de Party Mode con opciones, 14 conceptos en la academia, recursos, decisiones, guardado automático y resultados. El rediseño añade cinco retratos vectoriales originales, portada futurista con oficina ilustrada, tarjetas de personajes, animaciones CSS, paneles de misión, dashboard de startup y sala de Party Mode rediseñada. Los debates son escenarios programados, **no** sesiones reales de agentes IA.

> Es un punto de partida. Los minijuegos independientes, oficina completamente explorable, ilustraciones avanzadas y pruebas E2E siguen pendientes.

## Estudio de Desarrollo (nueva función)

En la partida se puede abrir **Estudio** desde el menú o el monitor de la oficina. Tiene un chat ficticio con mensajes de Mary, John, Sally, Winston y Amelia vinculados a las decisiones guardadas, además de una página React interactiva de la startup elegida.

- Progreso de construcción calculado a partir de las 18 misiones.
- Siete versiones: boceto, identidad, oferta, UX, interactividad, beta y lanzamiento; cada tres misiones se desbloquea una fase.
- Vista previa contextual para EduConnect, FoodFlow y BookEasy.
- Controles visuales de navegación, catálogo, búsqueda, filtros, selección y confirmación de demo.
- No hay transacciones reales, backend ni agentes IA generando código automáticamente: las conversaciones son una dramatización educativa, y el prototipo existe como código React del juego.
- Pruebas deterministas del motor de progresión y transcripción en `tests/studio.test.mjs`.

## IA generativa opcional (beta privada)

El proyecto incluye un endpoint **`api/forge.ts`** pensado para Vercel que llama a OpenAI Responses API y devuelve un **esquema estructurado validado**, no código arbitrario. La app muestra el botón «Generar plan con IA» **solo cuando está configurada la URL del backend o se abre desde un despliegue en Vercel**. La app local y las seis plantillas tradicionales siguen disponibles sin API.

Para la configuración del despliegue, las claves y los controles de acceso consulta [`docs/AI_VERCEL_SETUP.md`](docs/AI_VERCEL_SETUP.md). **Nunca publiques `OPENAI_API_KEY` ni `FORGE_BETA_CODE` en el frontend, `.env` versionado, la conversación o variables `VITE_*`.**

La generación está acotada a nueve motores React verificados. No promete crear literalmente cualquier software: para scripts/plugins libres hace falta sandbox aislado, pruebas, control de costes y medidas de seguridad adicionales.

## App Forge — Crear por instrucción

La pantalla **Nueva aventura** ofrece dos rutas:

- **Proyecto predeterminado**: EduConnect, FoodFlow o BookEasy; presupuesto inicial de **100 CR**, reglas económicas originales y Estudio con el prototipo guiado.
- **Crear por instrucción**: interpreta texto en español, inicia con **250 CR**, genera una plantilla React funcional compatible y abre un estudio con la app y el chat educativo. La partida registra el modo, el prompt y la plantilla elegida en localStorage.

Tipos soportados en esta fase: **Blackjack** con baraja y crupier virtual, **Triqui**, **Trivia**, **Tareas**, **Reservas** y **Tienda**. Si la instrucción no encaja en esas seis categorías, el constructor crea una **versión funcional básica personalizada** con una de las herramientas generales: registros editables, diario, objetivos, tareas, cronómetro, calculadora, tarjetas de estudio, métricas o retos de decisiones. No puede implementar cualquier integración o mecánica novedosa por sí solo. **No existe generación universal de código por IA ni ejecutores remotos**.

En el modo por instrucción se ganan **+20 CR al completar cada misión**, **+12 CR al participar en cada debate**, y se puede realizar un encargo de investigación, QA o diseño por capítulo (35, 40 o 30 CR respectivamente). Los encargos solo se pueden reclamar una vez por capítulo. La economía de los proyectos predeterminados no se modifica. El dinero del blackjack son puntos virtuales independientes, sin compras, retiros ni premios reales.

Todas las aplicaciones generadas son **demostraciones locales**: no realizan reservas reales, compras, comunicaciones a servicios externos ni pagos. El chat representa decisiones de la partida y no agentes IA trabajando en tiempo real.

## Desarrollo

Requiere Node.js 22+.

```bash
npm install
npm run dev
npm run build
```

## Publicación

El workflow `.github/workflows/deploy.yml` intenta publicar el build automáticamente desde `main`. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**. El sitio esperado, tras un despliegue correcto, es:

https://coffebeltran-hue.github.io/Bmad-quest/

La URL no se considera activa hasta verificar la ejecución de Actions.

## Stack

React, TypeScript y Vite. El progreso se guarda en localStorage del navegador. No requiere servidor ni claves de API.

## Referencias

- [BMAD Method](https://docs.bmad-method.org/)
- [Repositorio oficial](https://github.com/bmad-code-org/BMAD-METHOD)

Los nombres de agentes se utilizan como referencia educativa, sin afiliación oficial. Licencia del código del juego: MIT; revisar por separado licencias de dependencias y marcas.
