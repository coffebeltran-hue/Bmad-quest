import {useEffect,useMemo,useRef,useState} from 'react';
import type {ForgeProject} from './forge-engine';
import {GIGS,canClaimGig} from './forge-engine';
import {buildConversation,studioPercent,studioStage,RELEASES} from './studio-engine';
import type {StudioMission} from './studio-engine';
import {BlackjackGame,QuizGame,TasksApp,TicTacToeGame,BookingApp,ShopApp} from './ForgeWidgets';
import './forge.css';
type ForgeSave={index:number;credits:number;quality:number;insight:number;founder:string;log:string[];earned:string[]};
type ForgeProps={project:ForgeProject;save:ForgeSave;missions:readonly StudioMission[];debates:readonly (readonly string[])[];onBack:()=>void;onEarn:(gig:string)=>void};
const portrait=(name:string)=>import.meta.env.BASE_URL+'characters/'+name.toLowerCase()+'.svg';
type ForgeMessage={id:string;speaker:string;content:string};
function Conversation({project,save,missions,debates}:{project:ForgeProject;save:ForgeSave;missions:readonly StudioMission[];debates:readonly (readonly string[])[]}){
 const history=useMemo(()=>buildConversation(save.log,missions,debates,project.title),[save.log,missions,debates,project.title]);
 const messages:ForgeMessage[]=useMemo(()=>[
  {id:'forge-design',speaker:'Mary',content:'Analicé la instrucción: «'+project.prompt+'». Identifiqué una estructura compatible con una de nuestras plantillas.'},
  {id:'forge-arch',speaker:'Winston',content:'Activaremos el motor '+project.kind+'. Su lógica está programada en TypeScript y sus acciones se ejecutan en la vista previa.'},
  {id:'forge-build',speaker:'Amelia',content:'¡Primera versión jugable lista! Puedes probarla en pantalla mientras sigues el trabajo del equipo.'},
  ...history.map(m=>({id:m.id,speaker:m.speaker,content:m.content}))
 ],[history,project]);
 const [shown,setShown]=useState<number>(Infinity);
 const [playing,setPlaying]=useState(false);
 const scroll=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{if(!playing)return;if(shown>=messages.length){setPlaying(false);return}const timer=window.setTimeout(()=>setShown(n=>n+1),800);return()=>window.clearTimeout(timer)},[playing,shown,messages.length]);
 useEffect(()=>{if(playing&&scroll.current)scroll.current.scrollTo({top:scroll.current.scrollHeight,behavior:'smooth'})},[shown,playing]);
 function toggle(){if(playing){setPlaying(false);return}if(shown>=messages.length)setShown(0);setPlaying(true)}
 return <aside className="forge-chat"><div className="forge-panel-title"><div className="forge-panel-symbol">◈</div><div><strong># equipo-en-desarrollo</strong><small>Conversación vinculada a tu partida</small></div><span className="forge-online">● ONLINE</span></div><div className="forge-chat-actions"><button onClick={()=>{setShown(0);setPlaying(true)}}>↺ Recargar proceso</button><button onClick={toggle}>{playing?'Ⅱ Pausar':'▷ Reproducir'}</button><button onClick={()=>{setShown(Infinity);setPlaying(false)}}>Ver todo</button></div><div className="forge-chat-messages" ref={scroll}>{messages.slice(0,shown).map((m,i)=><div className={'forge-chat-line '+(i===Math.min(messages.length,shown)-1&&playing?'active':'')} key={m.id}>{m.speaker==='Fundador'?<div className="forge-self">YO</div>:<img src={portrait(m.speaker)} alt=""/>}<div><strong>{m.speaker==='Fundador'?save.founder:m.speaker}</strong><p>{m.content}</p></div></div>)}</div><footer className="forge-chat-caption">Diálogos narrativos a partir de decisiones. No representan agentes IA trabajando de forma autónoma en tiempo real.</footer></aside>;
}
export default function ForgeApp({project,save,missions,debates,onBack,onEarn}:ForgeProps){
 const [panel,setPanel]=useState<'preview'|'wallet'|'brief'>('preview');
 const [previewKey,setPreviewKey]=useState(0);
 const completion=studioPercent(save.index);
 return <section className="forge-studio screen-in">
 <div className="forge-studio-top"><button onClick={onBack}>← Regresar a mi startup</button><span>✦ BMAD APP FORGE / PROYECTO PERSONALIZADO</span></div>
 <div className="forge-studio-intro"><div><span className="forge-kicker">TU IDEA, UN PRODUCTO INTERACTIVO</span><h1>De instrucción a <em>juego.</em></h1><p>{project.prompt}</p></div><div className="forge-studio-metrics"><div><span>CRÉDITOS BMAD</span><strong>{save.credits}<small> CR</small></strong></div><div><span>PROGRESO BMAD</span><strong>{completion}<small>%</small></strong></div></div></div>
 <div className="forge-flow"><span className="forge-step done">✓ ENTENDER</span><i/><span className="forge-step done">✓ ESTRUCTURAR</span><i/><span className="forge-step active">◈ PROBAR</span><i/><span className="forge-step">✦ MEJORAR</span></div>
 <div className="forge-workspace"><Conversation project={project} save={save} missions={missions} debates={debates}/><div className="forge-right"><div className="forge-browser-shell"><div className="forge-browser-title"><div className="browser-leds"><i/><i/><i/></div><span>▣ {project.title} · Demo ejecutable</span><button onClick={()=>setPreviewKey(k=>k+1)} title="Reiniciar la miniaplicación">↻</button></div><div className="forge-address">🔒 forge.local/{project.kind} · Motor {project.kind} · Sin servidor externo</div><nav className="forge-tabbar"><button className={panel==='preview'?'active':''} onClick={()=>setPanel('preview')}>◈ App en vivo</button><button className={panel==='wallet'?'active':''} onClick={()=>setPanel('wallet')}>◎ Ganar créditos</button><button className={panel==='brief'?'active':''} onClick={()=>setPanel('brief')}>☰ Plan BMAD</button></nav>
 {panel==='preview'&&<div className="forge-preview" key={previewKey}>
  {project.kind==='blackjack'&&<BlackjackGame/>}
  {project.kind==='quiz'&&<QuizGame prompt={project.prompt}/>}
  {project.kind==='tasks'&&<TasksApp/>}
  {project.kind==='tictactoe'&&<TicTacToeGame/>}
  {project.kind==='booking'&&<BookingApp title={project.title}/>}
  {project.kind==='shop'&&<ShopApp title={project.title}/>}
 </div>}
 {panel==='wallet'&&<div className="forge-wallet"><div className="forge-wallet-hero"><span>◎ LABORATORIO DE INGRESOS</span><h2>Tu talento vale créditos.</h2><p>Los encargos son gratuitos. Obtienes recompensas una vez por capítulo; al completar tres misiones se renuevan.</p><strong>{save.credits} CR DISPONIBLES</strong></div><div className="forge-gigs">{GIGS.map(g=>{const available=canClaimGig('prompt',save.index,g.id,save.earned);return <div className="forge-gig" key={g.id}><span>{g.icon}</span><div><strong>{g.title}</strong><p>{g.detail}</p><small>+{g.pay} CR</small></div><button disabled={!available} onClick={()=>onEarn(g.id)}>{available?'Completar →':'Cobrado ✓'}</button></div>})}</div><p className="forge-wallet-tip">También ganas +20 CR por misión completada y +12 CR por debate en Party Mode, solo en este modo.</p></div>}
 {panel==='brief'&&<div className="forge-plan"><span>✦ PRODUCT BRIEF</span><h2>{project.title}</h2><blockquote>{project.prompt}</blockquote><div className="forge-plan-grid"><div><b>Motor elegido</b><span>{project.kind}</span></div><div><b>Versión visual</b><span>{RELEASES[studioStage(save.index)].name}</span></div><div><b>Estado</b><span>Plantilla funcional</span></div><div><b>Origen</b><span>Instrucción del usuario</span></div></div><p>{project.summary}</p><div className="forge-plan-warning">El intérprete funciona con categorías reconocidas y plantillas implementadas. No utiliza IA generativa ni crea cualquier software fuera de ellas.</div></div>}
 </div><div className="forge-preview-bottom"><span className="forge-glow-dot"/> MOTOR {project.kind.toUpperCase()} ACTIVO <span>Sin datos enviados al exterior</span></div></div></div>
 <div className="forge-callout"><span>✦ SIGUIENTE ETAPA</span><p>Completa misiones y debates para ganar experiencia y créditos. Puedes jugar o usar tu aplicación de demostración desde ahora, sin gastar créditos BMAD dentro de ella.</p><button onClick={onBack}>Volver a las misiones →</button></div>
 </section>;
}
