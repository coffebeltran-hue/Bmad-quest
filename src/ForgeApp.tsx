import {useEffect,useMemo,useRef,useState} from 'react';
import type {ForgeProject} from './forge-engine';
import {GIGS,canClaimGig} from './forge-engine';
import {buildConversation,studioPercent,studioStage,RELEASES} from './studio-engine';
import type {StudioMission} from './studio-engine';
import {buildForgeScript,BUILD_STAGES,forgeFrame} from './forge-replay';
import type {BuildMessage} from './forge-replay';
import {BlackjackGame,QuizGame,TasksApp,TicTacToeGame,BookingApp,ShopApp} from './ForgeWidgets';
import UniversalApp from './UniversalApp';
import RouletteGame from './RouletteGame';
import {planUniversal} from './universal-engine';
import './forge.css';
type ForgeSave={index:number;credits:number;quality:number;insight:number;founder:string;log:string[];earned:string[]};
type ForgeProps={project:ForgeProject;save:ForgeSave;missions:readonly StudioMission[];debates:readonly (readonly string[])[];onBack:()=>void;onEarn:(gig:string)=>void};
const portrait=(name:string)=>import.meta.env.BASE_URL+'characters/'+name.toLowerCase()+'.svg';
function Conversation({messages,shown,playing,replayActive,speed,onReplay,onToggle,onFinish,onNext,onPrev,onSpeed,founder}:{messages:readonly BuildMessage[];shown:number;playing:boolean;replayActive:boolean;speed:number;onReplay:()=>void;onToggle:()=>void;onFinish:()=>void;onNext:()=>void;onPrev:()=>void;onSpeed:(n:number)=>void;founder:string}){
 const feed=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{if(replayActive&&feed.current)feed.current.scrollTo({top:feed.current.scrollHeight,behavior:'smooth'})},[shown,replayActive]);
 const visible=replayActive?messages.slice(0,shown):messages;
 return <aside className="forge-chat">
  <div className="forge-panel-title"><div className="forge-panel-symbol">◈</div><div><strong># equipo-en-desarrollo</strong><small>Construcción paso a paso · {messages.length} eventos</small></div><span className="forge-online">● ONLINE</span></div>
  <div className="forge-chat-actions forge-replay-controls">
   <button onClick={onReplay}>↺ Recargar y construir</button>
   <button onClick={onToggle}>{playing?'Ⅱ Pausar':replayActive?'▷ Continuar':'▷ Reproducir'}</button>
   {replayActive&&<><button onClick={onPrev} title="Retroceder un paso">‹</button><button onClick={onNext} title="Adelantar un paso">›</button></>}
   <button onClick={onFinish}>Ver app completa</button>
  </div>
  {replayActive&&<div className="forge-replay-speed"><span>{playing?'● CONSTRUYENDO':'Ⅱ EN PAUSA'} · {Math.min(shown,messages.length)}/{messages.length}</span><label>Velocidad <select value={speed} onChange={e=>onSpeed(Number(e.target.value))}><option value={1600}>Lenta</option><option value={900}>Normal</option><option value={450}>Rápida</option></select></label></div>}
  <div className="forge-chat-messages" role="log" aria-label="Conversación y tareas de los agentes" ref={feed}>
   {visible.map((m,i)=><div className={'forge-chat-line '+(i===visible.length-1&&replayActive?'active':'')} key={m.id}>
    {m.speaker==='Fundador'?<div className="forge-self">YO</div>:<img src={portrait(m.speaker)} alt=""/>}
    <div><div className="forge-chat-line-head"><strong>{m.speaker==='Fundador'?founder:m.speaker}</strong><span>{BUILD_STAGES[m.stage].name}</span></div><p>{m.content}</p>{replayActive&&i===visible.length-1&&<small className="forge-build-activity">⌘ {m.task} · {m.file}</small>}</div>
   </div>)}
   {!visible.length&&<div className="forge-chat-empty">Preparando el proyecto… pulsa reproducir para ver el primer paso.</div>}
  </div>
  <footer className="forge-chat-caption">Simulación narrativa basada en plantillas React reales. Los agentes no están escribiendo código autónomamente.</footer>
 </aside>;
}
export default function ForgeApp({project,save,missions,debates,onBack,onEarn}:ForgeProps){
 const [panel,setPanel]=useState<'preview'|'wallet'|'brief'>('preview');
 const [previewKey,setPreviewKey]=useState(0);
 const [replayActive,setReplayActive]=useState(false);
 const [playing,setPlaying]=useState(false);
 const [shown,setShown]=useState(0);
 const [speed,setSpeed]=useState(900);
 const history=useMemo(()=>buildConversation(save.log,missions,debates,project.title),[save.log,missions,debates,project.title]);
 const messages=useMemo(()=>buildForgeScript(project,history),[project,history]);
 const frame=forgeFrame(messages,shown);
 const buildStage=replayActive?frame.stage:6;
 useEffect(()=>{
   if(!replayActive||!playing)return;
   if(shown>=messages.length){setPlaying(false);return}
   const timer=window.setTimeout(()=>setShown(n=>Math.min(messages.length,n+1)),speed);
   return()=>window.clearTimeout(timer);
 },[replayActive,playing,shown,messages.length,speed]);
 function replay(){
   setPanel('preview');setPreviewKey(v=>v+1);
   setReplayActive(true);setShown(0);setPlaying(true);
 }
 function finishReplay(){setPlaying(false);setReplayActive(false);setShown(messages.length)}
 function toggleReplay(){
   if(!replayActive||shown>=messages.length){replay();return}
   setPlaying(v=>!v);
 }
 function nextStep(){setPlaying(false);setReplayActive(true);setShown(v=>Math.min(messages.length,v+1))}
 function prevStep(){setPlaying(false);setReplayActive(true);setShown(v=>Math.max(0,v-1))}
 const completion=studioPercent(save.index);
 return <section className="forge-studio screen-in">
 <div className="forge-studio-top"><button onClick={onBack}>← Regresar a mi startup</button><span>✦ BMAD APP FORGE / PROYECTO PERSONALIZADO</span></div>
 <div className="forge-studio-intro"><div><span className="forge-kicker">TU IDEA, UN PRODUCTO INTERACTIVO</span><h1>De instrucción a <em>juego.</em></h1><p>{project.prompt}</p></div><div className="forge-studio-metrics"><div><span>CRÉDITOS BMAD</span><strong>{save.credits}<small> CR</small></strong></div><div><span>PROGRESO BMAD</span><strong>{completion}<small>%</small></strong></div></div></div>
 <div className="forge-flow"><span className="forge-step done">✓ ENTENDER</span><i/><span className="forge-step done">✓ ESTRUCTURAR</span><i/><span className="forge-step active">◈ PROBAR</span><i/><span className="forge-step">✦ MEJORAR</span></div>
 <div className="forge-workspace"><Conversation messages={messages} shown={shown} playing={playing} replayActive={replayActive} speed={speed} onReplay={replay} onToggle={toggleReplay} onFinish={finishReplay} onNext={nextStep} onPrev={prevStep} onSpeed={setSpeed} founder={save.founder}/><div className="forge-right"><div className="forge-browser-shell"><div className="forge-browser-title"><div className="browser-leds"><i/><i/><i/></div><span>▣ {project.title} · {replayActive?'Construcción sincronizada':'Demo ejecutable'}</span><button onClick={replay} title="Recargar y ver cómo se construye la app paso a paso">↻</button></div><div className="forge-address">🔒 forge.local/{project.kind} · Motor {project.kind} · {project.source==='ai'?'Plan asistido por IA · Ejecución local':'Ejecución local sin IA'}</div><nav className="forge-tabbar"><button className={panel==='preview'?'active':''} onClick={()=>setPanel('preview')}>◈ App en vivo</button><button className={panel==='wallet'?'active':''} onClick={()=>setPanel('wallet')}>◎ Ganar créditos</button><button className={panel==='brief'?'active':''} onClick={()=>setPanel('brief')}>☰ Plan BMAD</button></nav>
 {panel==='preview'&&<>
  <div className="forge-build-status" role="status" aria-live="polite"><div><span>{replayActive?'● DEMOSTRACIÓN DE CONSTRUCCIÓN':'✓ MVP FUNCIONAL'}</span><strong>{replayActive?(frame.message?.task||'Preparando el proyecto…'):'Aplicación lista para probar'}</strong><small>{replayActive?(frame.message?.file||'src/forge-engine.ts'):'Interfaz y lógica implementadas en React'}</small></div><b>{replayActive?Math.round(Math.min(100,shown/messages.length*100)):'100'}%</b></div>
  <div className="forge-build-track"><i style={{width:(replayActive?Math.round(Math.min(100,shown/messages.length*100)):100)+'%'}}/></div>
  <div className="forge-build-phases" aria-label="Etapas del constructor">{BUILD_STAGES.map((st,i)=><span className={i===buildStage?'current':i<buildStage?'built':'pending'} key={st.name} title={st.description}>{i<buildStage?'✓':i+1}<small>{st.name}</small></span>)}</div>
  <div className="forge-preview" key={previewKey}>
   {buildStage===0?<div className="forge-construction-skeleton"><span>▧ WIREFRAME DEL PRODUCTO</span><div className="forge-skeleton-top"/><div className="forge-skeleton-body"><i/><i/><i/></div><div className="forge-skeleton-actions"><i/><i/></div><strong>{project.title}</strong><p>El equipo está definiendo estructura y alcance. La app se irá formando mientras hablan.</p></div>:<div className={'forge-build-frame phase-'+buildStage} data-stage={buildStage} inert={buildStage<6}>
    {project.kind==='blackjack'&&<BlackjackGame/>}
    {project.kind==='roulette'&&<RouletteGame/>}
    {project.kind==='quiz'&&<QuizGame prompt={project.prompt}/>}
    {project.kind==='tasks'&&<TasksApp/>}
    {project.kind==='tictactoe'&&<TicTacToeGame/>}
    {project.kind==='booking'&&<BookingApp title={project.title}/>}
    {project.kind==='shop'&&<ShopApp title={project.title}/>}
    {project.kind==='custom'&&<UniversalApp blueprint={project.blueprint||planUniversal(project.prompt)} disabled={buildStage<6}/>}
   </div>}
  </div>
  {replayActive&&<div className="forge-replay-caption"><span>✦ {BUILD_STAGES[buildStage].description}</span><p>La vista evoluciona con las conversaciones. Los controles se habilitan cuando Amelia completa la entrega.</p>{buildStage===6&&<button onClick={finishReplay}>Probar la app completa ↗</button>}</div>}
 </>}
 {panel==='wallet'&&<div className="forge-wallet"><div className="forge-wallet-hero"><span>◎ LABORATORIO DE INGRESOS</span><h2>Tu talento vale créditos.</h2><p>Los encargos son gratuitos. Obtienes recompensas una vez por capítulo; al completar tres misiones se renuevan.</p><strong>{save.credits} CR DISPONIBLES</strong></div><div className="forge-gigs">{GIGS.map(g=>{const available=canClaimGig('prompt',save.index,g.id,save.earned);return <div className="forge-gig" key={g.id}><span>{g.icon}</span><div><strong>{g.title}</strong><p>{g.detail}</p><small>+{g.pay} CR</small></div><button disabled={!available} onClick={()=>onEarn(g.id)}>{available?'Completar →':'Cobrado ✓'}</button></div>})}</div><p className="forge-wallet-tip">También ganas +20 CR por misión completada y +12 CR por debate en Party Mode, solo en este modo.</p></div>}
 {panel==='brief'&&<div className="forge-plan"><span>✦ PRODUCT BRIEF</span><h2>{project.title}</h2><blockquote>{project.prompt}</blockquote><div className="forge-plan-grid"><div><b>Motor elegido</b><span>{project.kind}</span></div><div><b>Versión visual</b><span>{RELEASES[studioStage(save.index)].name}</span></div><div><b>Estado</b><span>Plantilla funcional</span></div><div><b>Origen</b><span>Instrucción del usuario</span></div></div><p>{project.summary}</p><div className="forge-plan-warning">{project.source==='ai'?'Este proyecto fue planificado mediante un modelo de IA en el servidor. El resultado es un esquema validado que utiliza controles React seguros; no ejecuta código arbitrario.':'Este proyecto utiliza el planificador local y herramientas React existentes. No ejecuta código arbitrario.'}</div></div>}
 </div><div className="forge-preview-bottom"><span className="forge-glow-dot"/> MOTOR {project.kind.toUpperCase()} ACTIVO <span>Sin datos enviados al exterior</span></div></div></div>
 <div className="forge-callout"><span>✦ SIGUIENTE ETAPA</span><p>Completa misiones y debates para ganar experiencia y créditos. Puedes jugar o usar tu aplicación de demostración desde ahora, sin gastar créditos BMAD dentro de ella.</p><button onClick={onBack}>Volver a las misiones →</button></div>
 </section>;
}
