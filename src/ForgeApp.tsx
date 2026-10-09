import {useEffect,useMemo,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import type {ForgeProject} from './forge-engine';
import {validateGeneratedBundle} from './generated-app';
import {GIGS,canClaimGig} from './forge-engine';
import {buildConversation,studioPercent,studioStage,RELEASES} from './studio-engine';
import type {StudioMission} from './studio-engine';
import {buildForgeScript,BUILD_STAGES,forgeFrame} from './forge-replay';
import type {BuildMessage} from './forge-replay';
import {BlackjackGame,QuizGame,TasksApp,TicTacToeGame,BookingApp,ShopApp} from './ForgeWidgets';
import UniversalApp from './UniversalApp';
import RouletteGame from './RouletteGame';
import GeneratedPreview from './GeneratedPreview';
import {planUniversal} from './universal-engine';
import './forge.css';
type ProjectEdit={instruction:string;title:string;at:number};
type ProjectRevision={instruction:string;previous:ForgeProject};
type ForgeSave={index:number;credits:number;quality:number;insight:number;founder:string;log:string[];earned:string[];edits:ProjectEdit[];revisions:ProjectRevision[]};
type ForgeProps={project:ForgeProject;save:ForgeSave;missions:readonly StudioMission[];debates:readonly (readonly string[])[];onBack:()=>void;onEarn:(gig:string)=>void;refineUrl:string;onApplyRevision:(project:ForgeProject,instruction:string)=>void;onRestoreRevision:()=>void};
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
  <footer className="forge-chat-caption">Reproducción narrativa del desarrollo. Las apps creadas por IA tienen archivos HTML, CSS y JS propios; comprueba sus funciones en la vista aislada.</footer>
 </aside>;
}
export default function ForgeApp({project,save,missions,debates,onBack,onEarn,refineUrl,onApplyRevision,onRestoreRevision}:ForgeProps){
 const [panel,setPanel]=useState<'preview'|'wallet'|'brief'>('preview');
 const [previewKey,setPreviewKey]=useState(0);
 const [replayActive,setReplayActive]=useState(false);
 const [playing,setPlaying]=useState(false);
 const [shown,setShown]=useState(0);
 const [speed,setSpeed]=useState(900);
 const [revisionPrompt,setRevisionPrompt]=useState('');
 const [betaCode,setBetaCode]=useState('');
 const [isRevising,setIsRevising]=useState(false);
 const [revisionError,setRevisionError]=useState('');
 const [revisionSuccess,setRevisionSuccess]=useState('');
 const history=useMemo(()=>buildConversation(save.log,missions,debates,project.title),[save.log,missions,debates,project.title]);
 const messages=useMemo(()=>{
   const base=buildForgeScript(project,history);
   const changes:BuildMessage[]=save.edits.flatMap((edit,i)=>[
     {id:'edit-'+i+'-founder',speaker:'Fundador',content:'Quiero mejorar la app: '+edit.instruction,stage:6,file:'brief.md',task:'Pedir un cambio',isMilestone:false},
     {id:'edit-'+i+'-john',speaker:'John',content:'Registramos la solicitud y priorizamos mantener las funcionalidades anteriores mientras añadimos la mejora.',stage:6,file:'brief.md',task:'Revisar alcance',isMilestone:false},
     {id:'edit-'+i+'-amelia',speaker:'Amelia',content:'Hay una nueva versión de «'+edit.title+'» lista para probar. Comprueba sus botones y resultados: el código generado aún necesita revisión manual.',stage:6,file:'app.js',task:'Entregar revisión para pruebas',isMilestone:true}
   ] as BuildMessage[]);
   return [...base,...changes];
 },[project,history,save.edits]);
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
 async function requestRevision(event:FormEvent<HTMLFormElement>){
   event.preventDefault();
   const instruction=revisionPrompt.trim();
   if(isRevising||!refineUrl)return;
   if(instruction.length<8||instruction.length>450){setRevisionError('Describe el cambio entre 8 y 450 caracteres.');return}
   if(!betaCode.trim()){setRevisionError('Necesitas el código de acceso a la beta.');return}
   setIsRevising(true);setRevisionError('');setRevisionSuccess('');
   try{
     const payload=project.kind==='generated'&&project.generated?
       {instruction,app:project.generated}:
       {instruction,original:{kind:project.kind,title:project.title,prompt:project.prompt,summary:project.summary}};
     const response=await fetch(refineUrl,{
       method:'POST',headers:{'Content-Type':'application/json','X-Forge-Beta-Code':betaCode},
       body:JSON.stringify(payload),signal:AbortSignal.timeout(65000)
     });
     const raw=await response.json();
     if(!response.ok)throw new Error(typeof raw.error==='string'?raw.error:'La IA no pudo editar la app.');
     const generated=validateGeneratedBundle(raw.generated);
     if(!generated)throw new Error('La versión nueva no pasó la validación; la anterior se conservó.');
     const next:ForgeProject={kind:'generated',mode:'prompt',source:'ai',prompt:project.prompt,title:generated.title,summary:generated.summary,generated};
     onApplyRevision(next,instruction);
     setRevisionPrompt('');setBetaCode('');
     setRevisionSuccess(raw.recreated?'Se creó una versión independiente basada en tu proyecto y tu solicitud. Revisa que conserve las funciones originales.':'Nueva versión creada a partir de tus archivos anteriores. Pruébala en «App en vivo».');
     setPanel('preview');setPlaying(false);setReplayActive(false);setPreviewKey(v=>v+1);
   }catch(error){setRevisionError(error instanceof Error?error.message:'No fue posible actualizar la aplicación.')}
   finally{setIsRevising(false)}
 }
 function restoreVersion(){
   if(isRevising)return;
   onRestoreRevision();
   setRevisionError('');setRevisionSuccess('Se restauró la versión anterior del proyecto.');
   setPlaying(false);setReplayActive(false);setPanel('preview');setPreviewKey(v=>v+1);
 }
 const completion=studioPercent(save.index);
 return <section className="forge-studio screen-in">
 <div className="forge-studio-top"><button onClick={onBack}>← Regresar a mi startup</button><span>✦ BMAD APP FORGE / PROYECTO PERSONALIZADO</span></div>
 <div className="forge-studio-intro"><div><span className="forge-kicker">TU IDEA, UN PRODUCTO INTERACTIVO</span><h1>De instrucción a <em>juego.</em></h1><p>{project.prompt}</p></div><div className="forge-studio-metrics"><div><span>CRÉDITOS BMAD</span><strong>{save.credits}<small> CR</small></strong></div><div><span>PROGRESO BMAD</span><strong>{completion}<small>%</small></strong></div></div></div>
 <div className="forge-flow"><span className="forge-step done">✓ ENTENDER</span><i/><span className="forge-step done">✓ ESTRUCTURAR</span><i/><span className="forge-step active">◈ PROBAR</span><i/><span className="forge-step">✦ MEJORAR</span></div>
 <div className="forge-workspace"><div className="forge-left-column">
 <Conversation messages={messages} shown={shown} playing={playing} replayActive={replayActive} speed={speed} onReplay={replay} onToggle={toggleReplay} onFinish={finishReplay} onNext={nextStep} onPrev={prevStep} onSpeed={setSpeed} founder={save.founder}/>
 <section className="forge-refine-panel" aria-label="Pedir cambios a los agentes">
  <div className="forge-refine-header"><span>✦ ITERACIÓN DEL PRODUCTO</span><h2>Pídele cambios al equipo</h2><p>Escribe qué quieres agregar, quitar o mejorar y Amelia preparará una nueva versión de la aplicación.</p></div>
  <form onSubmit={requestRevision}>
   <label htmlFor="forge-change-request">¿Qué cambiamos?</label>
   <textarea id="forge-change-request" value={revisionPrompt} onChange={e=>{setRevisionPrompt(e.target.value);setRevisionError('')}} maxLength={450} rows={4} disabled={isRevising} placeholder="Ejemplo: añade una tabla con los últimos 10 giros y un botón para cambiar el tema del casino."/>
   <div className="forge-edit-suggestions"><span>Ideas rápidas</span>
     {['Añade un historial de resultados','Mejora los colores y animaciones','Agrega opciones para personalizar la app'].map(s=><button type="button" key={s} disabled={isRevising} onClick={()=>setRevisionPrompt(s)}>{s}</button>)}
   </div>
   <label htmlFor="forge-edit-beta-code">Código beta de IA</label>
   <input type="password" autoComplete="off" id="forge-edit-beta-code" value={betaCode} onChange={e=>setBetaCode(e.target.value)} disabled={isRevising} placeholder="El código de acceso configurado en Vercel"/>
   {project.kind!=='generated'&&<p className="forge-conversion-note">Este proyecto usa un motor preprogramado. La IA construirá una versión nueva basada en la idea y los cambios solicitados; su diseño y reglas pueden ser distintos. Podrás volver a la anterior.</p>}
   <button className="forge-refine-submit" type="submit" disabled={isRevising||!refineUrl||!betaCode.trim()||revisionPrompt.trim().length<8}>{isRevising?'◌ Amelia está actualizando el código…':'✦ Pedir mejora a los agentes →'}</button>
   {!refineUrl&&<p className="forge-revision-error">Las mejoras por IA se habilitan desde el despliegue de Vercel, con la API configurada.</p>}
   {isRevising&&<p className="forge-revision-progress" role="status">Mary analiza el cambio, Winston revisa la estructura y Amelia escribe HTML, CSS y JavaScript. Puede tardar hasta un minuto. No cierres esta pantalla.</p>}
   {revisionError&&<p role="alert" className="forge-revision-error">{revisionError}</p>}
   {revisionSuccess&&<p role="status" className="forge-revision-success">{revisionSuccess}</p>}
  </form>
  {save.revisions.length>0&&<div className="forge-refine-history"><span>{save.revisions.length} versión(es) anteriores disponibles</span><button disabled={isRevising} onClick={restoreVersion}>↶ Recuperar versión anterior</button></div>}
  <p className="forge-refine-footnote">Tus créditos BMAD no se descuentan al editar. Cada solicitud sí puede generar consumo facturable en la API de OpenAI. El código resultante requiere pruebas manuales y se ejecuta aislado.</p>
 </section>
 </div><div className="forge-right"><div className="forge-browser-shell"><div className="forge-browser-title"><div className="browser-leds"><i/><i/><i/></div><span>▣ {project.title} · {replayActive?'Construcción sincronizada':'Demo ejecutable'}</span><button onClick={replay} title="Recargar y ver cómo se construye la app paso a paso">↻</button></div><div className="forge-address">🔒 forge.local/{project.kind} · {project.kind==='generated'?'Código generado por IA · Vista aislada':project.source==='ai'?'Plan asistido por IA · Ejecución local':'Ejecución local sin IA'}</div><nav className="forge-tabbar"><button className={panel==='preview'?'active':''} onClick={()=>setPanel('preview')}>◈ App en vivo</button><button className={panel==='wallet'?'active':''} onClick={()=>setPanel('wallet')}>◎ Ganar créditos</button><button className={panel==='brief'?'active':''} onClick={()=>setPanel('brief')}>☰ Plan BMAD</button></nav>
 {panel==='preview'&&<>
  <div className="forge-build-status" role="status" aria-live="polite"><div><span>{replayActive?'● DEMOSTRACIÓN DE CONSTRUCCIÓN':project.kind==='generated'?'◈ CÓDIGO GENERADO · PRUEBA MANUAL PENDIENTE':'✓ MVP FUNCIONAL'}</span><strong>{replayActive?(frame.message?.task||'Preparando el proyecto…'):project.kind==='generated'?'Tu app está lista para probarse':'Aplicación lista para probar'}</strong><small>{replayActive?(frame.message?.file||'src/forge-engine.ts'):project.kind==='generated'?'Código HTML, CSS y JavaScript generado; revisa acciones y reglas':'Interfaz y lógica implementadas en React'}</small></div><b>{replayActive?Math.round(Math.min(100,shown/messages.length*100)):'100'}%</b></div>
  <div className="forge-build-track"><i style={{width:(replayActive?Math.round(Math.min(100,shown/messages.length*100)):100)+'%'}}/></div>
  <div className="forge-build-phases" aria-label="Etapas del constructor">{BUILD_STAGES.map((st,i)=><span className={i===buildStage?'current':i<buildStage?'built':'pending'} key={st.name} title={st.description}>{i<buildStage?'✓':i+1}<small>{st.name}</small></span>)}</div>
  <div className="forge-preview" key={previewKey}>
   {buildStage===0?<div className="forge-construction-skeleton"><span>▧ WIREFRAME DEL PRODUCTO</span><div className="forge-skeleton-top"/><div className="forge-skeleton-body"><i/><i/><i/></div><div className="forge-skeleton-actions"><i/><i/></div><strong>{project.title}</strong><p>El equipo está definiendo estructura y alcance. La app se irá formando mientras hablan.</p></div>:<div className={'forge-build-frame phase-'+buildStage} data-stage={buildStage} inert={buildStage<6}>
    {project.kind==='generated'&&project.generated&&<GeneratedPreview bundle={project.generated} stage={buildStage}/>}
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
 {panel==='brief'&&<div className="forge-plan"><span>✦ PRODUCT BRIEF</span><h2>{project.title}</h2><blockquote>{project.prompt}</blockquote><div className="forge-plan-grid"><div><b>Motor elegido</b><span>{project.kind}</span></div><div><b>Versión visual</b><span>{RELEASES[studioStage(save.index)].name}</span></div><div><b>Estado</b><span>Plantilla funcional</span></div><div><b>Origen</b><span>Instrucción del usuario</span></div></div><p>{project.summary}</p><div className="forge-plan-warning">{project.kind==='generated'?'La IA generó archivos HTML, CSS y JavaScript originales, visibles en la pestaña App en vivo. Se ejecutan únicamente dentro de un iframe aislado. El código puede contener errores: prueba todas las funciones antes de compartirlo.':project.source==='ai'?'Este proyecto fue planificado mediante un modelo de IA en el servidor. El resultado es un esquema validado que utiliza controles React seguros; no ejecuta código arbitrario.':'Este proyecto utiliza el planificador local y herramientas React existentes. No ejecuta código arbitrario.'}</div></div>}
 </div><div className="forge-preview-bottom"><span className="forge-glow-dot"/> MOTOR {project.kind.toUpperCase()} ACTIVO <span>Sin datos enviados al exterior</span></div></div></div>
 <div className="forge-callout"><span>✦ SIGUIENTE ETAPA</span><p>Completa misiones y debates para ganar experiencia y créditos. Puedes jugar o usar tu aplicación de demostración desde ahora, sin gastar créditos BMAD dentro de ella.</p><button onClick={onBack}>Volver a las misiones →</button></div>
 </section>;
}
