export type StudioAgent = 'Mary'|'John'|'Sally'|'Winston'|'Amelia';
export type StudioSpeaker = StudioAgent|'Fundador';
export type StudioMission = {
  title:string; topic:string; lead:string; brief:string;
  choices:readonly {label:string; note:string}[];
};
export type StudioMessage = {
  id:string; speaker:StudioSpeaker; content:string; phase:string;
  kind:'chat'|'decision'|'milestone';
};
export const RELEASES = [
  {name:'Idea',detail:'Boceto e identidad inicial',unlock:0},
  {name:'Identidad',detail:'Encabezado y portada',unlock:3},
  {name:'Oferta',detail:'Catálogo de servicios',unlock:6},
  {name:'Diseño UX',detail:'Búsqueda y navegación',unlock:9},
  {name:'Interactividad',detail:'Flujos de selección y reserva',unlock:12},
  {name:'Beta',detail:'Feedback y mejoras',unlock:15},
  {name:'Lanzamiento',detail:'Prototipo visual completo',unlock:18}
] as const;

export const SITE_VARIANTS = [
 {name:'EduConnect',type:'Aprende sin límites',pitch:'Encuentra al tutor ideal y alcanza tu siguiente gran logro.',action:'Buscar tutor',noun:'tutorías',categoryLabel:'Materia',
  categories:['Todos','Matemáticas','Idiomas','Programación'],
  products:[
   {id:'mat',title:'Matemáticas sin miedo',category:'Matemáticas',detail:'Álgebra, cálculo y práctica a tu ritmo.',price:'45.000',tag:'Popular',symbol:'∑'},
   {id:'eng',title:'Inglés para el mundo',category:'Idiomas',detail:'Clases prácticas para hablar con confianza.',price:'38.000',tag:'Nuevo',symbol:'Aa'},
   {id:'code',title:'Tu primera app',category:'Programación',detail:'De cero al primer proyecto funcional.',price:'52.000',tag:'Top',symbol:'</>'}
  ],select:'Reservar sesión',done:'¡Tu tutoría fue solicitada!',fave:'Mis tutorías'},
 {name:'FoodFlow',type:'Tu antojo, sin fila',pitch:'Descubre lo mejor de tu cafetería y arma tu pedido favorito.',action:'Explorar menú',noun:'productos',categoryLabel:'Categoría',
  categories:['Todos','Bebidas','Desayunos','Snacks'],
  products:[
   {id:'latte',title:'Latte de la casa',category:'Bebidas',detail:'Café cremoso para arrancar con todo.',price:'11.900',tag:'Popular',symbol:'☕'},
   {id:'toast',title:'Tostada especial',category:'Desayunos',detail:'Pan artesanal y toppings frescos.',price:'17.900',tag:'Nuevo',symbol:'✧'},
   {id:'cookie',title:'Galleta gigante',category:'Snacks',detail:'Chocolate y mucha buena vibra.',price:'8.500',tag:'Top',symbol:'✺'}
  ],select:'Añadir al pedido',done:'¡Pedido agregado a tu lista!',fave:'Mi pedido'},
 {name:'BookEasy',type:'Tu tiempo, a tu manera',pitch:'Reserva el servicio que buscas en segundos, sin complicaciones.',action:'Ver servicios',noun:'servicios',categoryLabel:'Tipo',
  categories:['Todos','Belleza','Bienestar','Asesoría'],
  products:[
   {id:'sty',title:'Cambio de look',category:'Belleza',detail:'Encuentra un servicio de estilismo a tu medida.',price:'60.000',tag:'Popular',symbol:'✂'},
   {id:'yoga',title:'Pausa de bienestar',category:'Bienestar',detail:'Un espacio para recargar energías.',price:'35.000',tag:'Nuevo',symbol:'✿'},
   {id:'advice',title:'Asesoría personal',category:'Asesoría',detail:'Una sesión para resolver tus preguntas.',price:'48.000',tag:'Top',symbol:'◎'}
  ],select:'Reservar turno',done:'¡Reserva visual registrada!',fave:'Mis reservas'}
] as const;

export function studioStage(completed:number):number {
 const n=Number.isFinite(completed)?Math.max(0,Math.min(18,Math.floor(completed))):0;
 return Math.min(6,Math.floor(n/3));
}
export function studioPercent(completed:number):number {
 return Math.round(Math.min(18,Math.max(0,Number.isFinite(completed)?completed:0))*100/18);
}
export function buildConversation(
 log:readonly string[],
 missions:readonly StudioMission[],
 debates:readonly (readonly string[])[],
 startupName:string
):StudioMessage[]{
 const messages:StudioMessage[]=[
  {id:'start-0',speaker:'Mary',phase:'Inicio',kind:'chat',content:'Equipo, llegó nuestro nuevo proyecto: '+startupName+'. Voy a investigar el problema y las personas a las que queremos ayudar.'},
  {id:'start-1',speaker:'John',phase:'Inicio',kind:'chat',content:'Organizaré el alcance. Las elecciones del fundador serán las que definan qué construimos primero.'},
  {id:'start-2',speaker:'Amelia',phase:'Inicio',kind:'milestone',content:'¡Proyecto inicializado! Ya tenemos un boceto en la vista previa. Se irá desbloqueando una nueva versión cada tres misiones.'}
 ];
 let completed=0;
 log.forEach((line,index)=>{
  const mission=missions.find(m=>line.startsWith(m.title+': '));
  if(mission){
   const picked=mission.choices.find(c=>line.includes(c.label));
   const agent=(['Mary','John','Sally','Winston','Amelia'].includes(mission.lead)?mission.lead:'John') as StudioAgent;
   const second=(['Mary','John','Sally','Winston','Amelia'] as const)[(completed+2)%5];
   messages.push({id:'m-'+index+'-plan',speaker:agent,phase:mission.topic,kind:'chat',content:'Trabajamos en «'+mission.title+'». '+mission.brief});
   messages.push({id:'m-'+index+'-choice',speaker:'Fundador',phase:mission.topic,kind:'decision',content:'Elegí: '+(picked?.label||line.slice(mission.title.length+2).replace(/ \(\d+ CR\)$/,''))+'.'});
   messages.push({id:'m-'+index+'-response',speaker:second,phase:mission.topic,kind:'chat',content:picked?.note||'Anotamos la decisión para la siguiente iteración del producto.'});
   completed++;
   if(completed%3===0){
    const milestone=RELEASES[studioStage(completed)];
    messages.push({id:'m-'+index+'-version',speaker:'Amelia',phase:milestone.name,kind:'milestone',content:'¡Nueva versión disponible! '+milestone.detail+'. Puedes probar lo que acabamos de desbloquear en la vista previa.'});
   }
   return;
  }
  const party=debates.find(d=>line.startsWith(d[0]+': '));
  if(party){
   messages.push({id:'p-'+index+'-start',speaker:'Winston',phase:'Party Mode',kind:'chat',content:'En la sala de debate analizamos «'+party[0]+'» desde perspectivas distintas.'});
   messages.push({id:'p-'+index+'-decision',speaker:'Fundador',phase:'Party Mode',kind:'decision',content:line.slice(party[0].length+2)});
   messages.push({id:'p-'+index+'-end',speaker:'John',phase:'Party Mode',kind:'chat',content:'Decisión registrada. La usaremos para orientar la siguiente etapa del equipo.'});
   return;
  }
  if(line.startsWith('Financiación de emergencia')){
   messages.push({id:'f-'+index,speaker:'John',phase:'Presupuesto',kind:'decision',content:'Conseguimos financiación temporal. La decisión ayuda a avanzar, pero afecta la calidad del proyecto.'});
  }
 });
 return messages;
}

export type ReplayFocus = 'wireframe'|'hero'|'catalog'|'filters'|'checkout'|'feedback';
export type ReplayFrame = {
 completed: number; stage: number; progress: number; focus: ReplayFocus;
 speaker: StudioSpeaker; task: string; file: string; activity: string;
};
/**
 * Read-only reconstruction of the visual build from chat messages.
 * The actual saved game and its progress are never mutated during playback.
 */
export function replayFrame(messages:readonly StudioMessage[],shown:number):ReplayFrame {
 const count=Number.isFinite(shown)?Math.max(0,Math.min(messages.length,Math.floor(shown))):messages.length;
 const visible=messages.slice(0,count);
 const completed=visible.filter(m=>/^m-\d+-response$/.test(m.id)).length;
 const released=visible.filter(m=>/^m-\d+-version$/.test(m.id)).length;
 const stage=Math.min(6,released);
 const last=visible[visible.length-1];
 const phase=(last?.phase||'Inicio').toLowerCase();
 let focus:ReplayFocus=stage===0?'wireframe':'hero';
 if(stage>=2 && (phase.includes('prd')||phase.includes('mvp')||phase.includes('ticket')||phase.includes('plan')||phase.includes('arquitect')))focus='catalog';
 if(stage>=3 && (phase.includes('ux')||phase.includes('acces')||phase.includes('usabil')||phase.includes('diseñ')))focus='filters';
 if(stage>=4 && (phase.includes('debug')||phase.includes('qa')||phase.includes('review')||phase.includes('valid')||phase.includes('party')))focus='checkout';
 if(stage>=5 && (phase.includes('feedback')||phase.includes('retrospect')||phase.includes('beta')))focus='feedback';
 if(last?.kind==='milestone'){
  focus=(['wireframe','hero','catalog','filters','checkout','feedback','feedback'] as const)[stage];
 }
 const targets:Record<ReplayFocus,{task:string;file:string;activity:string}>={
  wireframe:{task:'Planificando la estructura de la página',file:'design/wireframe',activity:'Dibujando bloques, estructura y flujo de usuario'},
  hero:{task:'Diseñando identidad y portada',file:'components/Hero.tsx',activity:'Aplicando marca, colores y sección principal'},
  catalog:{task:'Armando el catálogo de servicios',file:'components/Catalog.tsx',activity:'Preparando tarjetas y contenido del producto'},
  filters:{task:'Mejorando la experiencia de búsqueda',file:'components/Search.tsx',activity:'Añadiendo navegación, búsqueda y filtros'},
  checkout:{task:'Conectando las interacciones',file:'components/Flow.tsx',activity:'Preparando selección y confirmación simulada'},
  feedback:{task:'Probando y puliendo la página',file:'components/Feedback.tsx',activity:'Revisando detalles y experiencia final'}
 };
 const target=targets[focus];
 return {
  completed,stage,progress:studioPercent(completed),focus,
  speaker:last?.speaker||'Mary',
  task:last?.kind==='milestone'?'Entregado: '+RELEASES[stage].name:target.task,
  file:target.file,
  activity:last?.kind==='decision'?'Revisando la elección del fundador en el prototipo':target.activity
 };
}
