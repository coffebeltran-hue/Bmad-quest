import {planUniversal} from './universal-engine.ts';
import type {UniversalBlueprint} from './universal-engine.ts';
export type ForgeKind = 'blackjack'|'quiz'|'tasks'|'booking'|'shop'|'tictactoe'|'roulette'|'custom';
export type ForgeProject = {kind:ForgeKind;prompt:string;title:string;summary:string;mode:'prompt';blueprint?:UniversalBlueprint;source?:'local'|'ai'};
export type ForgeResult = {project:ForgeProject|null;error:string};
export const FORGE_START_CREDITS = 250;
export const FORGE_MISSION_REWARD = 20;
export const FORGE_PARTY_REWARD = 12;
export const GIGS = [
 {id:'research',title:'Investigación freelance',detail:'Entregar un informe a un cliente virtual',pay:35,icon:'◈'},
 {id:'testing',title:'Caza de bugs',detail:'Validar una interfaz de demostración',pay:40,icon:'⌘'},
 {id:'design',title:'Diseño express',detail:'Preparar recursos de identidad visual',pay:30,icon:'✦'}
] as const;
const recognizers:{kind:ForgeKind;pattern:RegExp;title:string;summary:string}[]=[
 {kind:'roulette',pattern:/ruleta|roulette|rueda\s+(?:del?\s+)?casino/i,title:'Roulette Royal',summary:'Ruleta europea visual de 37 números, giros animados y resultados con fichas ficticias.'},
 {kind:'blackjack',pattern:/\bblack\s*jack\b|\bveintiuno\b|\b21\s*cartas\b/i,title:'Blackjack Arena',summary:'Juego de 21 con crupier virtual, cartas y lógica real.'},
 {kind:'tictactoe',pattern:/tres\s+en\s+raya|triqui|tic.?tac.?toe|gato\s+(?:juego|de)/i,title:'Tres en Raya',summary:'Tablero interactivo para jugar contra un rival automático.'},
 {kind:'quiz',pattern:/trivia|cuestionario|examen|preguntas|quiz|test\s+de\s+/i,title:'Quiz Master',summary:'Trivia interactiva con preguntas, opciones y puntuación.'},
 {kind:'tasks',pattern:/tareas|pendientes|to.?do|hábitos|habitos|checklist|lista\s+de\s+/i,title:'Task Studio',summary:'Gestor de tareas funcional con prioridades y filtros.'},
 {kind:'booking',pattern:/reservas|reservar|citas|agenda|barbería|barberia|peluquería|peluqueria|turnos|bookings?/i,title:'Reserva Fácil',summary:'Agenda de servicios con horarios y reservas de demostración.'},
 {kind:'shop',pattern:/tienda|catálogo|catalogo|ventas|restaurante|pedidos|menú|menu|e.?commerce|carrito|productos/i,title:'Market Studio',summary:'Mini tienda con buscador, carrito y confirmación visual.'}
];
const dangerous=/\b(?:hackear|phishing|spyware|malware|robar\s+contraseñas|ransomware)\b/i;
export function interpretIdea(value:string):ForgeResult {
 const prompt=value.trim().replace(/\s+/g,' ').slice(0,400);
 if(prompt.length<12)return {project:null,error:'Describe tu idea en una frase un poco más detallada.'};
 if(dangerous.test(prompt))return {project:null,error:'Esa idea no se puede crear en este estudio.'};
 const generic=planUniversal(prompt);
 // A concrete tool intent wins over incidental context such as "calculadora para mi tienda".
 const prefersCustom=['calculator','timer','flashcards','journal','goals','dashboard'].includes(generic.mode);
 const match=prefersCustom?undefined:recognizers.find(r=>r.pattern.test(prompt));
 if(!match){
  if(generic.mode==='game'||/casino|tragamonedas|tragaperra|p[oó]ker|baccarat|dados/i.test(prompt)){
   return {project:null,error:'Entendí que solicitas un juego, pero todavía no está implementada esa mecánica. Puedo crear blackjack, ruleta europea, triqui o trivia. No voy a sustituir tu juego por un formulario y decir que está terminado.'};
  }
  const blueprint=generic;
  return {project:{kind:'custom',prompt,title:blueprint.title,summary:'Prototipo funcional básico adaptado a tu idea. '+blueprint.caveat,mode:'prompt',blueprint,source:'local'},error:''};
 }
 return {project:{kind:match.kind,prompt,title:match.title,summary:match.summary,mode:'prompt'},error:''};
}
export function gigKey(chapter:number,id:string){return 'gig:'+chapter+':'+id}
export function canClaimGig(mode:'prompt'|'preset',index:number,gig:string,claimed:readonly string[]){
 return mode==='prompt' && GIGS.some(g=>g.id===gig) && !claimed.includes(gigKey(Math.min(5,Math.floor(Math.max(0,index)/3)),gig));
}
export function claimGig(credits:number,mode:'prompt'|'preset',index:number,gig:string,claimed:readonly string[]){
 if(!canClaimGig(mode,index,gig,claimed))return null;
 const config=GIGS.find(g=>g.id===gig);
 if(!config)return null;
 return {credits:credits+config.pay,earned:[...claimed,gigKey(Math.min(5,Math.floor(Math.max(0,index)/3)),gig)],pay:config.pay};
}
