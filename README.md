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
