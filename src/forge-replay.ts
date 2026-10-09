import type {ForgeKind,ForgeProject} from './forge-engine';
import type {StudioMessage} from './studio-engine';
export type BuilderAgent='Mary'|'John'|'Sally'|'Winston'|'Amelia'|'Fundador';
export type BuildMessage={
 id:string; speaker:BuilderAgent; content:string;
 stage:number; file:string; task:string; isMilestone:boolean;
};
export const BUILD_STAGES=[
 {name:'La idea',description:'Analizar la instrucción',focus:'idea'},
 {name:'Escenario',description:'Dibujar el fondo',focus:'layout'},
 {name:'Componentes',description:'Agregar elementos a la pantalla',focus:'components'},
 {name:'Contenido',description:'Añadir información y controles',focus:'content'},
 {name:'Lógica',description:'Preparar el estado y reglas',focus:'logic'},
 {name:'Pruebas',description:'Verificar las acciones',focus:'tests'},
 {name:'Jugable',description:'Habilitar la aplicación',focus:'complete'}
] as const;
type Script={noun:string;parts:string;features:string;logic:string;test:string;file:string};
const scripts:Record<ForgeKind,Script>={
 blackjack:{noun:'mesa de blackjack',parts:'tapete verde, borde de madera y zona del crupier',features:'cartas, manos y marcador de 21',logic:'baraja, ases de 1 u 11, pedir carta y plantarse',test:'la banca roba hasta 17 y las manos se comparan correctamente',file:'src/blackjack.ts'},
 quiz:{noun:'trivia',parts:'panel del desafío y tarjeta de pregunta',features:'opciones, preguntas y marcador de aciertos',logic:'selección de respuestas y validación de puntos',test:'las respuestas correctas suman puntos y se puede reiniciar',file:'src/ForgeWidgets.tsx'},
 tasks:{noun:'gestor de tareas',parts:'espacio de productividad y encabezado',features:'campo para tareas, filtros y lista',logic:'añadir, marcar, priorizar y borrar elementos',test:'los filtros muestran las tareas correctas sin perder datos',file:'src/ForgeWidgets.tsx'},
 booking:{noun:'agenda de reservas',parts:'formulario y cuadrícula de horarios',features:'servicios, fechas y espacios disponibles',logic:'selección de hora y confirmación de reserva simulada',test:'una hora reservada aparece bloqueada en la demostración',file:'src/ForgeWidgets.tsx'},
 shop:{noun:'tienda virtual',parts:'vitrina de productos y portada',features:'tarjetas, buscador y precios',logic:'filtrado, selección y carrito de demostración',test:'el total suma productos y la confirmación vacía el carrito',file:'src/ForgeWidgets.tsx'},
 tictactoe:{noun:'juego de tres en raya',parts:'tablero de nueve casillas y panel arcade',features:'símbolos X/O y estado de partida',logic:'turnos, detección de victoria y rival automático',test:'no se permite jugar después de ganar y se puede reiniciar',file:'src/ForgeWidgets.tsx'}
};
export function buildForgeScript(project:ForgeProject,history:readonly StudioMessage[]=[]):BuildMessage[]{
 const script=scripts[project.kind];
 const stages: (readonly [BuilderAgent,string,string,boolean])[][]=[
  [
   ['Mary','He leído tu idea: «'+project.prompt+'». Primero debemos entender qué experiencia quieres construir.','Analizar la instrucción',false],
   ['John','El objetivo es entregar una '+script.noun+' que se pueda usar, no solo una imagen. Definiré la experiencia mínima.','Definir el producto',false],
   ['Winston','Elegí un motor local para '+script.noun+'. Nos permite mostrar y ejecutar funcionalidades reales sin un servidor.','Seleccionar arquitectura',true]
  ],
  [
   ['Sally','Empiezo con el escenario: '+script.parts+'. Mira la estructura que aparece a la derecha.','Diseñar el escenario',false],
   ['Amelia','Creo el contenedor, los fondos y la jerarquía visual. Todavía no hay acciones disponibles.','Construir el layout',false],
   ['Sally','La primera capa está lista. Ahora podemos ubicar los elementos de la interfaz.','Entregar escenario',true]
  ],
  [
   ['Sally','Voy a colocar '+script.features+'. Necesitamos que cada elemento sea reconocible.','Diseñar componentes',false],
   ['Amelia','Incorporo las piezas a la vista previa y preparo sus estados visuales.','Montar componentes',false],
   ['John','Ya tenemos una pantalla reconocible. Revisemos si representa bien tu idea.','Revisar componentes',true]
  ],
  [
   ['Mary','Definimos los textos y los datos que verá el usuario. Nada debe depender de acciones falsas.','Preparar contenido',false],
   ['Sally','Ajusto tamaños, etiquetas y legibilidad para que la experiencia sea clara.','Refinar contenido',false],
   ['Amelia','Contenido y controles colocados. Lo siguiente es conectar la lógica del producto.','Entregar contenido',true]
  ],
  [
   ['Winston','La lógica principal incluye '+script.logic+'. Se implementa dentro del motor de la plantilla.','Planificar reglas',false],
   ['Amelia','Conecto eventos y estados en el código real. Durante la reproducción los botones siguen bloqueados para no interrumpirla.','Conectar comportamiento',false],
   ['John','La interacción principal está preparada. Antes de jugar revisemos las condiciones límite.','Revisar flujo',true]
  ],
  [
   ['Mary','Comprobaremos errores y casos especiales. Esta versión no utiliza datos externos ni dinero real.','Comprobar casos',false],
   ['Winston','Verificamos que '+script.test+'.','Revisar reglas y pruebas',false],
   ['Amelia','El producto está listo para pasar del modo construcción a la demostración interactiva.','Cerrar pruebas',true]
  ],
  [
   ['John','¡Entregamos el primer MVP funcional! Ya puedes probar la aplicación completa.','Presentar entrega',false],
   ['Amelia','Habilito botones, formularios y acciones. Puedes reiniciar la app sin reiniciar el proyecto BMAD.','Activar prototipo',false],
   ['Sally','¡Versión jugable lista! Seguiremos mejorándola con las próximas decisiones del fundador.','Publicar demostración',true]
  ]
 ];
 const output:BuildMessage[]=[];
 stages.forEach((messages,stage)=>{
  messages.forEach(([speaker,content,task,isMilestone],i)=>output.push({
   id:'forge-stage-'+stage+'-'+i,speaker,content,stage,task,
   file:stage===0?'src/forge-engine.ts':stage===4||stage===5?script.file:'src/ForgeWidgets.tsx',
   isMilestone
  }));
 });
 history.filter(m=>m.id!=='start-0'&&m.id!=='start-1'&&m.id!=='start-2').forEach(m=>{
  output.push({id:'history-'+m.id,
   speaker:m.speaker,content:m.content,stage:6,
   file:m.kind==='decision'?'src/main.tsx':'src/ForgeWidgets.tsx',
   task:m.kind==='decision'?'Registrar decisión del fundador':'Revisar el avance de la partida',
   isMilestone:m.kind==='milestone'});
 });
 return output;
}
export function forgeFrame(messages:readonly BuildMessage[],shown:number){
 const count=Number.isFinite(shown)?Math.max(0,Math.min(messages.length,Math.floor(shown))):messages.length;
 const current=count?messages[count-1]:undefined;
 const stage=current?.stage??0;
 return {stage,percent:count?Math.round((stage*100+((messages.slice(0,count).filter(m=>m.id.startsWith('forge-stage-'+stage+'-')).length/3)*100))/7):0,
  message:current,complete:stage===6&&count>=21,visible:count};
}
