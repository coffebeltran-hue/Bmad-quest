# Academia BMAD: instalación y catálogo de comandos

La página **Academia** contiene una guía visual de instalación y 18 conceptos explicados con habilidades, ejemplos de uso y resultados.

## Fuentes oficiales consultadas (20 de octubre de 2026)

- https://docs.bmad-method.org/start/install-bmad/
- https://docs.bmad-method.org/reference/skills-and-agents/
- https://docs.bmad-method.org/start/build-your-first-change/
- https://docs.bmad-method.org/plan/explore-and-validate-an-idea/

Las fichas de los conceptos hacen referencia a la **v7 preview**. Su nomenclatura puede cambiar. La guía permite elegir **v6.12 estable** como ruta de instalación distinta; no asume que sus comandos coincidan con los de v7.

## Instalar en terminal

**Prerequisitos:** Node.js 20.12+, npm, Git, Python 3.10+ y `uv`. Verificar mediante `node --version`, `git --version`, etc.

1. Crear o abrir una carpeta de proyecto. CMD: `mkdir mi-proyecto-bmad` seguido de `cd mi-proyecto-bmad`; PowerShell: `New-Item -ItemType Directory -Force mi-proyecto-bmad` y `Set-Location mi-proyecto-bmad`; Bash: `mkdir -p mi-proyecto-bmad && cd mi-proyecto-bmad`.
2. Para v7 (preview): `npx skills add bmad-code-org/BMAD-METHOD --skill '*'`. En CMD el asterisco se entrecomilla con comillas dobles `--skill "*"`.
3. Para v6.12 estable: `npx bmad-method install`.
4. En la carpeta, abrir un editor con un asistente de programación compatible (por ejemplo VS Code con Codex, o Claude Code).
5. **En el chat del asistente, no en la terminal**, invocar la skill `bmad` y pedir `bmad setup`, después `bmad status` para el flujo v7.
6. Invocar una skill como `bmad-brainstorming`, `bmad-prd` o `bmad-party-mode`. Según la herramienta puede requerir prefijo `/` o `$`.

La instalación de Skills CLI puede pedir confirmar permisos y seleccionar herramienta; estos son comandos orientativos, no una instalación ejecutada desde la página web. La ubicación de las skills depende de la herramienta.

## Las 18 fichas

- Agentes: `bmad-agent-analyst`
- Skills y workflows: `bmad`
- Brainstorming: `bmad-brainstorming`
- Forge Idea: `bmad-forge-idea`
- Deep Recon: `bmad-deep-recon`
- Product Brief: `bmad-product-brief`
- PRD: `bmad-prd`
- MVP: consultar `bmad` y preparar alcance a partir del PRD; no se inventa una skill autónoma para el concepto.
- Epics y tickets: `bmad-agent-po`, menú `TICKETS`.
- UX Design: `bmad-ux`
- Architecture: `bmad-architecture`
- QA y Code Review: `bmad-qa-generate-e2e-tests` / `bmad-code-review`
- Party Mode: `bmad-party-mode`
- Advanced Elicitation: `bmad-advanced-elicitation`
- Correct Course: `bmad-agent-po`, menú `REPLAN`.
- Retrospective: `bmad-retrospective`
- Project Context: `bmad-project-context`
- Customization: `bmad-customize`

Los menús de agentes son **contextuales**: se abre el agente antes de introducir `BP`, `PRD`, `CA`, `QA`, `CR`, `ER` o `REPLAN`.

## Detalles de implementación

- `src/academy-data.ts`: 18 definiciones tipadas, con descripción, comando y ejemplo.
- `src/AcademyView.tsx`: interfaz educativa con selector de terminal/versión, pasos para copiar y tarjetas.
- `src/academy.css`: estilos responsivos.
- `src/main.tsx`: reemplaza la Academia estática sin alterar las partidas.
- `tests/academy.test.mjs`: verifica número de conceptos, búsqueda y campos educativos.

La página es educativa y **no oficial**. Instalar BMAD requiere ejecutar los comandos en el equipo del usuario y conceder permisos al instalador.
