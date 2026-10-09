/** A safe, deterministic, no-code app blueprint rendered by a controlled React runtime. */
export type UniversalMode='records'|'tasks'|'calculator'|'timer'|'flashcards'|'journal'|'goals'|'dashboard'|'game';
export type UniversalBlueprint={
 mode:UniversalMode;
 title:string;
 description:string;
 entity:string;
 action:string;
 fieldLabel:string;
 tags:string[];
 primaryColor:string;
 capabilities:string[];
 caveat:string;
};
const modeRules:{mode:UniversalMode;tokens:RegExp;entity:string;action:string;field:string}[]=[
 {mode:'calculator',tokens:/calcul(ar|adora|o)|porcentaj|propina|presupuesto|convers(or|i[oó]n)|impuesto|iva\b|descuento|inter[eé]s|matem[aá]tic|operaciones/i,entity:'operación',action:'Calcular',field:'Resultado'},
 {mode:'timer',tokens:/cron[oó]metro|temporizador|pomodoro|meditaci[oó]n|cuenta regresiva|productividad por tiempo|reloj de estudio/i,entity:'sesión',action:'Empezar',field:'Duración'},
 {mode:'flashcards',tokens:/tarjetas de memoria|flashcards?|vocabulario|memorizar|estudiar palabras|aprender idiomas|repasar conceptos/i,entity:'tarjeta',action:'Practicar',field:'Respuesta'},
 {mode:'journal',tokens:/diario|bit[aá]cora|registro personal|notas|bloc de notas|anotaciones|escribir pensamientos/i,entity:'nota',action:'Guardar nota',field:'Contenido'},
 {mode:'goals',tokens:/metas|objetivos|progreso personal|ahorro|rutina|hábitos|habitos|entrenamiento|fitness|ejercicios|deporte/i,entity:'meta',action:'Registrar avance',field:'Progreso'},
 {mode:'dashboard',tokens:/dashboard|panel de control|estad[ií]stic|m[eé]trica|anal[ií]tic|gr[aá]fic|ventas|finanzas|reportes/i,entity:'indicador',action:'Agregar dato',field:'Valor'},
 {mode:'tasks',tokens:/tareas|pendientes|por hacer|checklist|organizar proyecto|planificador|planear actividad/i,entity:'tarea',action:'Nueva tarea',field:'Estado'},
 {mode:'game',tokens:/\bjuego\b|simulador|aventura|arcade|puntos|competencia|lanzar dados/i,entity:'desafío',action:'Empezar juego',field:'Puntuación'},
];
const stop=/^(?:quiero|necesito|deseo|crea|crear|hazme|haz|construye|construir|generame|gen[eé]rame|desarrolla|desarrollar|una|un|app|aplicaci[oó]n|p[aá]gina|sitio|web|que|me|permita|para|de|la|el|los|las|mi|mis|por|favor|simple|sencilla|sencillo|se|pueda|tenga|con)$/i;
function titleFromPrompt(prompt:string):string{
 const cleaned=prompt.normalize('NFKC').replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(w=>w&&!stop.test(w)).slice(0,5);
 const result=cleaned.join(' ');
 return result?result[0].toUpperCase()+result.slice(1):'Mi nueva aplicación';
}
function entityFromPrompt(prompt:string):string{
 const m=prompt.match(/(?:gestionar|administrar|guardar|registrar|organizar|seguimiento de|control de|lista de|sobre|para)\s+(?:mis|mi|los|las|una|un|el|la|de\s+)?\s*([\p{L}]{3,18})/iu);
 return m?.[1]?.toLowerCase()||'elemento';
}
export function planUniversal(prompt:string):UniversalBlueprint{
 const text=prompt.trim().replace(/\s+/g,' ').slice(0,400);
 const found=modeRules.find(x=>x.tokens.test(text));
 const mode=found?.mode||(/registr|gestionar|lista|almacenar|organizar|inventario|cat[aá]logo|colecci[oó]n|personas|mascotas|pacientes|clientes|recetas|libros/i.test(text)?'records':'records');
 const entity=found?.entity||entityFromPrompt(text);
 const caps:Record<UniversalMode,string[]>={
  records:['Crear registros','Buscar y filtrar','Editar y eliminar','Exportar datos'],
  tasks:['Crear tareas','Cambiar estado','Filtrar tareas','Eliminar tareas'],
  calculator:['Operaciones matemáticas','Historial de resultados','Porcentajes y descuentos'],
  timer:['Iniciar y pausar','Configurar duración','Reiniciar sesión','Historial de sesiones'],
  flashcards:['Crear tarjetas','Revelar respuestas','Practicar conceptos','Eliminar tarjetas'],
  journal:['Escribir entradas','Editar notas','Buscar contenido','Eliminar entradas'],
  goals:['Crear objetivos','Registrar avances','Consultar progreso','Eliminar objetivos'],
  dashboard:['Registrar indicadores','Visualizar métricas','Crear estadísticas','Exportar datos'],
  game:['Retos interactivos','Puntuación','Elecciones','Reiniciar partida']
 };
 const caveat=mode==='game'
 ?'Este primer prototipo contiene un minijuego de decisiones; no incluye todas las mecánicas especiales que podría requerir tu idea.'
 :mode==='records'
 ?'Este prototipo ofrece un registro flexible. Las funciones particulares de tu idea, como cámaras, mapas o servicios externos, necesitan desarrollo adicional.'
 :'La versión incluye las herramientas principales de este tipo; cualquier integración externa o función avanzada requiere desarrollo adicional.';
 const palette:Record<UniversalMode,string>={records:'#7561dc',tasks:'#6255c9',calculator:'#286e9e',timer:'#9a64d3',flashcards:'#1c9c8a',journal:'#b46a9a',goals:'#398f77',dashboard:'#4f64bb',game:'#b36c5d'};
 return {mode,title:titleFromPrompt(text),description:text,entity,action:found?.action||'Añadir '+entity,fieldLabel:found?.field||'Información',tags:['Todos','Pendientes','Completados'],primaryColor:palette[mode],capabilities:caps[mode],caveat};
}
/** Defensive check before rendering a blueprint sourced from a remote service or a saved game. */
export function validateBlueprint(input:unknown):UniversalBlueprint|null{
 if(!input||typeof input!=='object')return null;
 const x=input as Record<string,unknown>;
 const validModes:UniversalMode[]=['records','tasks','calculator','timer','flashcards','journal','goals','dashboard','game'];
 if(!validModes.includes(x.mode as UniversalMode))return null;
 const stringKeys=['title','description','entity','action','fieldLabel','primaryColor','caveat'] as const;
 if(stringKeys.some(k=>typeof x[k]!=='string'||(x[k] as string).length>420))return null;
 if(!Array.isArray(x.tags)||!Array.isArray(x.capabilities))return null;
 if(x.tags.length>8||x.capabilities.length>12||!x.tags.every((v:unknown)=>typeof v==='string'&&v.length<=70)||!x.capabilities.every((v:unknown)=>typeof v==='string'&&v.length<=90))return null;
 if(!/^#[\da-fA-F]{6}$/.test(x.primaryColor as string))return null;
 return x as UniversalBlueprint;
}
