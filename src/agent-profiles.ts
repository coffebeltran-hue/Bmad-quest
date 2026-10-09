/**
 * Fichas narrativas de los cinco especialistas de BMAD Quest.
 * Descripciones escritas para el juego; no son biografías de personas reales.
 */
export const agentProfiles = {
 Mary: {
  name:'Mary',role:'Business Analyst',subtitle:'Analista de negocio',
  tagline:'Descubre qué vale la pena construir antes de invertir recursos.',
  short:'Investigo las necesidades de las personas y convierto las ideas en oportunidades de producto.',
  description:'Soy Mary, la analista de negocio del equipo BMAD. Me especializo en investigar problemas reales, comprender a los usuarios y contrastar las primeras hipótesis de una idea. Mi trabajo consiste en formular preguntas difíciles, reunir evidencia y transformar lo aprendido en una visión de producto clara. Antes de diseñar una pantalla, te ayudaré a entender para quién construimos, por qué lo necesita y qué valor podemos ofrecer.',
  specialties:['Investigación de usuarios','Validación de hipótesis','Análisis de requisitos','Propuesta de valor'],
  mission:'Que ninguna gran idea avance sin conocer primero el problema que quiere resolver.'
 },
 John: {
  name:'John',role:'Product Manager',subtitle:'Gestor de producto',
  tagline:'Convierte la visión del equipo en un plan que podamos ejecutar.',
  short:'Defino prioridades, organizo las entregas y mantengo el MVP enfocado en lo esencial.',
  description:'Soy John, el responsable de producto del equipo BMAD. Mi especialidad es conectar la visión del fundador con un plan realista: definir objetivos, seleccionar funciones y convertir las ideas en historias y entregas comprobables. Coordino las prioridades con los demás agentes para que el equipo invierta su tiempo donde realmente importa. Te ayudaré a decidir qué entra en el MVP, qué puede esperar y cómo medir el éxito de cada versión.',
  specialties:['Roadmap y planificación','Priorización del MVP','Historias de usuario','Criterios de aceptación'],
  mission:'Construir lo correcto, en el orden correcto, sin perder de vista al usuario.'
 },
 Sally: {
  name:'Sally',role:'UX Designer',subtitle:'Diseñadora de experiencia',
  tagline:'Hace que una idea sea fácil de entender y agradable de usar.',
  short:'Diseño pantallas y recorridos intuitivos para que cada interacción tenga sentido.',
  description:'Soy Sally, diseñadora UX del equipo BMAD. Me especializo en transformar necesidades de usuarios en experiencias intuitivas, claras y visualmente atractivas. Diseño recorridos, bocetos y componentes, y compruebo que cada paso resulte comprensible incluso para alguien que entra por primera vez. También cuido la accesibilidad, la consistencia visual y la respuesta de la interfaz. Mi objetivo es que tu aplicación no solo funcione: que las personas disfruten utilizarla.',
  specialties:['Diseño UX/UI','Wireframes y prototipos','Accesibilidad','Pruebas de usabilidad'],
  mission:'Crear experiencias que se entiendan sin explicaciones y se disfruten al usarlas.'
 },
 Winston: {
  name:'Winston',role:'Software Architect',subtitle:'Arquitecto de software',
  tagline:'Construye una base técnica preparada para crecer.',
  short:'Diseño la estructura del sistema y tomo decisiones técnicas que evitan problemas futuros.',
  description:'Soy Winston, el arquitecto de software del equipo BMAD. Mi trabajo es traducir los objetivos del producto en una estructura técnica ordenada y sostenible. Analizo cómo se relacionan las partes de la aplicación, qué datos necesita manejar y qué decisiones mejoran el rendimiento, la seguridad y el mantenimiento. Me gusta elegir soluciones tan simples como sea posible y tan robustas como sea necesario. Te ayudaré a entender las consecuencias técnicas de cada decisión.',
  specialties:['Arquitectura de software','Diseño de componentes','Seguridad y rendimiento','Escalabilidad y mantenimiento'],
  mission:'Que el proyecto pueda evolucionar sin volverse innecesariamente complicado.'
 },
 Amelia: {
  name:'Amelia',role:'Developer',subtitle:'Desarrolladora',
  tagline:'Convierte las decisiones del equipo en funciones que puedes probar.',
  short:'Programo interfaces, implemento lógica y compruebo que las funciones se comporten bien.',
  description:'Soy Amelia, desarrolladora del equipo BMAD. Me especializo en convertir diseños, requisitos y decisiones de arquitectura en aplicaciones interactivas. Implemento componentes, conecto estados y comportamientos, y pruebo escenarios normales y casos límite para detectar errores antes del lanzamiento. Me interesa que cada botón haga lo que promete y que el producto sea estable y fácil de mejorar. Cuando el equipo defina qué construir, te mostraré cómo esa idea empieza a funcionar.',
  specialties:['Desarrollo frontend','Lógica e interactividad','Depuración de errores','Pruebas y calidad'],
  mission:'Transformar las ideas del equipo en algo concreto, funcional y comprobable.'
 }
} as const;
export type AgentName=keyof typeof agentProfiles;
