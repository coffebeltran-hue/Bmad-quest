import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import './style.css';
import StudioView from './Studio';
import ForgeApp from './ForgeApp';
import type {ForgeProject} from './forge-engine';
import {interpretIdea,FORGE_START_CREDITS,FORGE_MISSION_REWARD,FORGE_PARTY_REWARD,claimGig} from './forge-engine';
import {applyCreditDelta, canAfford, canRequestFunding, fundEmergency, MISSION_COSTS, PARTY_COSTS} from './economy';
type Choice={label:string;note:string;delta:[number,number,number]};
type Mission={title:string;topic:string;lead:string;brief:string;question:string;choices:[Choice,Choice]};
type Save={startup:number;founder:string;index:number;credits:number;quality:number;insight:number;log:string[];party:number[];fundingUsed:string[];mode:'preset'|'prompt';project?:ForgeProject;earned:string[]};
const startups=[['EduConnect','Plataforma de tutorías','🎓'],['FoodFlow','Pedidos para cafeterías','☕'],['BookEasy','Reservas de servicios','📅']];
const agents=[['Mary','Analista','MA','violet'],['John','Product Manager','JO','blue'],['Sally','Diseñadora UX','SA','pink'],['Winston','Arquitecto','WI','cyan'],['Amelia','Developer','AM','amber']];
const chapters=['La idea','El plan','Experiencia UX','Construcción','La crisis','Lanzamiento'];
const mk=(title:string,topic:string,lead:string,brief:string,question:string,good:string,bad:string,positive:string,negative:string):Mission=>({title,topic,lead,brief,question,choices:[{label:good,note:positive,delta:[-5,9,9]},{label:bad,note:negative,delta:[-13,-6,3]}]});
const missions:Mission[]=[
mk('Descubre un problema','Investigación','Mary','No construyas antes de entender a las personas.','¿Cómo comienzas?','Entrevistar usuarios reales','Asumir necesidades sin preguntar','Encontraste información relevante.','La intuición no garantiza demanda.'),
mk('Explora posibilidades','Brainstorming','Mary','La primera idea no siempre es la mejor.','¿Cómo evaluamos alternativas?','Crear opciones y compararlas','Quedarnos con la primera','El equipo considera varios enfoques.','Se perdieron opciones posibles.'),
mk('Redacta la visión','Product Brief','Mary','Una idea necesita problema, público y valor.','¿Qué debe incluir el brief?','Usuarios, problema y valor','Solo nombre y logotipo','La visión queda clara.','Falta justificar el producto.'),
mk('Especifica el resultado','PRD','John','Escribe requisitos que puedan comprobarse.','¿Cuál es más verificable?','Completar una reserva en tres pasos','Ser la plataforma más increíble','Puedes medir el resultado.','No hay criterio de aceptación.'),
mk('Arma tu MVP','Priorización','John','Tiempo y recursos limitados obligan a elegir.','¿Qué construyes primero?','Flujo principal y validación','Todas las funciones premium','El alcance es realista.','El equipo se sobrecarga.'),
mk('Organiza el trabajo','Epics y tickets','John','Convierte ideas grandes en entregas pequeñas.','¿Cómo asignas la tarea?','Tickets con criterios claros','Un ticket para toda la aplicación','El avance puede verificarse.','Es difícil saber cuándo terminará.'),
mk('Traza el recorrido','UX Design','Sally','Diseña desde las acciones del usuario.','¿Qué priorizas?','Ruta hasta la tarea principal','Una intro animada interminable','El flujo es entendible.','El usuario tarda en llegar al objetivo.'),
mk('Incluye a todos','Accesibilidad','Sally','La interfaz debe funcionar con teclado y lectores.','¿Qué cambias?','Foco y controles etiquetados','Eliminar toda indicación de foco','Más personas pueden utilizarla.','La navegación se dificulta.'),
mk('Escucha la prueba','Usabilidad','Sally','Un prototipo debe probarse con personas.','¿Cómo respondes al fallo?','Corregir y probar de nuevo','Culpar al usuario','La experiencia mejora.','El problema persiste.'),
mk('Elige arquitectura','Architecture','Winston','La complejidad debe responder a necesidades reales.','¿Qué sistema escoger?','Componentes simples y claros','Microservicios para cada botón','La solución es mantenible.','Aumentó la complejidad sin valor.'),
mk('Caza el error','Debugging','Amelia','Una acción repetida crea dos pedidos.','¿Cuál es mejor arreglo?','Validar y prevenir duplicados','Pedir que no hagan doble clic','Se corrige la causa del fallo.','Los duplicados siguen apareciendo.'),
mk('Puerta de calidad','QA / Code Review','Amelia','Antes de liberar debemos comprobar comportamientos.','¿Cómo verificar?','Probar casos límite y revisar','Publicar sin pruebas','El equipo encuentra fallos temprano.','El producto sigue siendo frágil.'),
mk('Escucha a tu equipo','Party Mode','John','Cada agente aporta una perspectiva diferente.','¿Cómo decides?','Comparar evidencia y argumentos','Seguir la primera opinión','La decisión considera compensaciones.','Faltan perspectivas importantes.'),
mk('Ajusta el rumbo','Correct Course','John','Un requisito cambia cerca del lanzamiento.','¿Qué haces?','Evaluar impacto y repriorizar','Agregarlo sin revisar el plan','El cambio queda controlado.','El alcance aumenta sin control.'),
mk('Desafía el consenso','Advanced Elicitation','Mary','Todos están de acuerdo demasiado rápido.','¿Qué preguntas?','¿Qué demostraría que fallamos?','¿Podemos acabar ya la reunión?','Identificas hipótesis ocultas.','El consenso puede ocultar riesgos.'),
mk('Lanza con criterio','Validación','Amelia','No necesitas perfección, pero sí un flujo probado.','¿Cuál es la condición de lanzamiento?','Pruebas críticas satisfactorias','Estar cansados de programar','El lanzamiento es más confiable.','La prisa crea problemas.'),
mk('Mide lo que importa','Feedback','Sally','Tus primeros usuarios expresan frustraciones.','¿Qué haces?','Medir y mejorar la experiencia','Ignorar los comentarios','El producto evoluciona con evidencia.','Se pierden aprendizajes.'),
mk('Aprende del viaje','Retrospective','Winston','Es momento de convertir errores en decisiones mejores.','¿Cómo termina la reunión?','Acciones para el siguiente ciclo','Buscar culpables','El equipo aprende en conjunto.','Se pierde la confianza.')
];
const debates=[
['MVP vs funciones premium','John: validemos primero. · Sally: aseguremos usabilidad. · Amelia: el tiempo es limitado.'],
['Cambio de requisitos','John: mide el impacto. · Winston: revisa dependencias. · Mary: valida necesidad.'],
['Error en producción','Amelia: reproduce el fallo. · Sally: avisa a usuarios. · Winston: revisa los datos.'],
['Sobreingeniería','Winston: dimensionemos los riesgos. · Amelia: mantengamos el diseño simple.'],
['Feedback inesperado','Mary: una opinión no es toda la muestra. · Sally: hagamos pruebas.'],
['Anti-Consensus Club','Mary: ¿qué evidencia nos refutaría? · John: cuestionemos el consenso.'],
['Code Review Crew','Amelia: hay casos límite. · Winston: revisemos mantenibilidad y seguridad.'],
['Presupuesto crítico','John: prioricemos. · Sally: no sacrifiquemos la tarea principal.']
];
const initial=(startup:number,founder:string):Save=>({startup,founder,index:0,credits:100,quality:35,insight:0,log:[],party:[],fundingUsed:[],mode:'preset',earned:[]});
const key='bmad-quest-save-1';
function load():Save|null {
 try {
  const x=JSON.parse(localStorage.getItem(key)||'null');
  if (!x || !Number.isInteger(x.index) || x.index<0 || x.index>18 ||
    !Number.isInteger(x.startup) || x.startup<0 || x.startup>2 ||
    !Number.isFinite(x.credits) || x.credits<0 ||
    !Number.isFinite(x.quality) || !Number.isFinite(x.insight) ||
    !Array.isArray(x.log) || !Array.isArray(x.party)) return null;
  const blueprint=x.mode==='prompt'&&x.project&&typeof x.project.prompt==='string'?interpretIdea(x.project.prompt).project:null;
  return {...x,mode:blueprint?'prompt':'preset',project:blueprint||undefined,
    fundingUsed:Array.isArray(x.fundingUsed)?x.fundingUsed.filter((id:unknown)=>typeof id==='string'):[],
    earned:Array.isArray(x.earned)?x.earned.filter((id:unknown)=>typeof id==='string'):[]};
 } catch { return null; }
}

function CharacterArt({name,variant='portrait'}:{name:string;variant?:'portrait'|'mini'|'tile'}){
 const agent=agents.find(a=>a[0]===name);
 return <div className={'character-art '+variant+' '+(agent?.[3]||'blue')}>
   <img src={import.meta.env.BASE_URL+'characters/'+name.toLowerCase()+'.svg'} alt={'Retrato ilustrado de '+name} loading={variant==='portrait'?'eager':'lazy'}/>
 </div>;
}
function App(){
 const [save,setSave]=useState<Save|null>(load);
 const [screen,setScreen]=useState<'home'|'game'|'academy'|'party'|'studio'|'report'>('home');
 const [founder,setFounder]=useState('Fundador/a');
 const [startup,setStartup]=useState(0);
 const [showNew,setShowNew]=useState(false);
 const [creationMode,setCreationMode]=useState<'preset'|'prompt'>('preset');
 const [prompt,setPrompt]=useState('');
 const [feedback,setFeedback]=useState('');
 const [selectedDebate,setSelectedDebate]=useState(0);
 const [term,setTerm]=useState('');
 const mission=save&&save.index<missions.length?missions[save.index]:null;
 const chapter=save?Math.min(5,Math.floor(save.index/3)):0;
 const progress=save?Math.round(save.index/missions.length*100):0;
 const currentAgent=mission?.lead==='Todos'?'Mary':mission?.lead||'Mary';
 useEffect(()=>{if(save)localStorage.setItem(key,JSON.stringify(save));else localStorage.removeItem(key)},[save]);
 function navigate(to:'home'|'game'|'academy'|'party'|'studio'|'report'){
   setFeedback('');setScreen(to);window.scrollTo({top:0,behavior:'smooth'});
 }
 const analyzedIdea=interpretIdea(prompt);
 function begin(){
   if(creationMode==='prompt'){
     if(!analyzedIdea.project)return;
     const project=analyzedIdea.project;
     setSave({...initial(0,founder),mode:'prompt',project,credits:FORGE_START_CREDITS});
     setScreen('studio');
   }else{
     setSave(initial(startup,founder));
     setScreen('game');
   }
   setFeedback('');setShowNew(false);
   window.scrollTo({top:0});
 }
 function earnCredits(gig:string){
   setSave(current=>{
     if(!current||current.mode!=='prompt')return current;
     const awarded=claimGig(current.credits,current.mode,current.index,gig,current.earned);
     if(!awarded)return current;
     return {...current,credits:awarded.credits,earned:awarded.earned,
       log:[...current.log,'Encargo completado: '+gig+' (+'+awarded.pay+' CR)']};
   });
 }
 function decide(i:number){
   if(!save||!mission||feedback)return;
   const c=mission.choices[i];
   if (!c || applyCreditDelta(save.credits,c.delta[0])===null)return;
   setSave(current=>{
     if(!current||current.index!==save.index)return current;
     const nextCredits=applyCreditDelta(current.credits,c.delta[0]);
     if(nextCredits===null)return current;
     return {...current,index:current.index+1,credits:nextCredits+(current.mode==='prompt'?FORGE_MISSION_REWARD:0),
       quality:Math.min(100,Math.max(0,current.quality+c.delta[1])),
       insight:Math.min(100,current.insight+c.delta[2]),
       log:[...current.log,mission.title+': '+c.label+' ('+(-c.delta[0])+' CR)']};
   });
   setFeedback(c.note);
 }
 function debate(i:number){
   if(!save||save.party.includes(selectedDebate))return;
   const wins=i===0;
   const delta=wins?-PARTY_COSTS[0]:-PARTY_COSTS[1];
   if(applyCreditDelta(save.credits,delta)===null)return;
   setSave(current=>{
     if(!current||current.party.includes(selectedDebate))return current;
     const nextCredits=applyCreditDelta(current.credits,delta);
     if(nextCredits===null)return current;
     return {...current,party:[...current.party,selectedDebate],
       credits:nextCredits+(current.mode==='prompt'?FORGE_PARTY_REWARD:0),insight:Math.min(100,current.insight+(wins?7:2)),
       quality:Math.min(100,Math.max(0,current.quality+(wins?5:-4))),
       log:[...current.log,debates[selectedDebate][0]+': '+(wins?'Analizar perspectivas':'Decidir sin analizar')+' ('+(-delta)+' CR)']};
   });
 }
 function requestFunding(checkpoint:string,minCost:number){
   setSave(current=>{
     if(!current||current.mode==='prompt')return current;
     if(checkpoint.startsWith('mission:') && Number(checkpoint.slice(8))!==current.index)return current;
     if(checkpoint.startsWith('party:') && current.party.includes(Number(checkpoint.slice(6))))return current;
     const funding=fundEmergency(current,checkpoint,minCost);
     if(!funding)return current;
     return {...current,...funding,log:[...current.log,'Financiación de emergencia: +20 CR / -7 calidad ('+checkpoint+')']};
   });
 }
 const lexicon=[
  ['Agentes','Roles especializados que ayudan a explorar, planificar, diseñar y construir.','Equipo'],
  ['Skills y workflows','Capacidades y secuencias de trabajo para alcanzar un objetivo.','Fundamentos'],
  ['Brainstorming','Generación y exploración de varias ideas antes de seleccionarlas.','Exploración'],
  ['Forge Idea','Desafiar hipótesis para fortalecer una idea de producto.','Exploración'],
  ['Deep Recon','Investigar profundamente un problema con evidencia.','Exploración'],
  ['Product Brief','Resumen de problema, público y propuesta de valor.','Planificación'],
  ['PRD','Documento de requisitos del producto y criterios verificables.','Planificación'],
  ['MVP','Producto mínimo que permite validar una hipótesis.','Planificación'],
  ['Epics y tickets','Divisiones del trabajo en unidades abordables.','Planificación'],
  ['UX Design','Diseño enfocado en las tareas y necesidades humanas.','Diseño'],
  ['Architecture','Decisiones estructurales y técnicas del software.','Desarrollo'],
  ['QA y Code Review','Pruebas y revisión para detectar defectos y riesgos.','Desarrollo'],
  ['Party Mode','Discusión entre distintas perspectivas de agentes, dirigida por una persona.','Colaboración'],
  ['Advanced Elicitation','Preguntas para explorar supuestos y encontrar información faltante.','Colaboración'],
  ['Correct Course','Revisión del plan cuando cambian las condiciones.','Colaboración'],
  ['Retrospective','Reflexión sobre lo sucedido y acciones de mejora.','Aprendizaje'],
  ['Project Context','Información compartida que mantiene decisiones y criterios coherentes.','Fundamentos'],
  ['Customization','Personalización de capacidades o comportamientos del método.','Fundamentos']
 ];
 const filteredLexicon=lexicon.filter(([n,d,g])=>(n+d+g).toLowerCase().includes(term.toLowerCase()));
 return <div className="app-shell">
  <div className="cosmic-backdrop" aria-hidden="true"><i/><i/><i/><i/></div>
  <header className="site-header">
    <button className="logo-button" onClick={()=>navigate('home')} aria-label="Ir al inicio">
      <span className="logo-mark"><span>✦</span>B</span><span className="logo-type"><strong>BMAD<span>QUEST</span></strong><small>STARTUP SIMULATOR</small></span>
    </button>
    <nav className="nav-menu" aria-label="Navegación principal">
      <button className={screen==='home'?'active':''} onClick={()=>navigate('home')}>Inicio</button>
      <button className={screen==='academy'?'active':''} onClick={()=>navigate('academy')}>Academia</button>
      <button disabled={!save} className={screen==='party'?'active':''} onClick={()=>navigate('party')}>◈ Party Mode</button>
      <button disabled={!save} className={screen==='studio'?'active':''} onClick={()=>navigate('studio')}>▣ Estudio</button>
    </nav>
    <div className="nav-actions">
      {save?<button className="header-play" onClick={()=>navigate('game')}>Mi startup <span>↗</span></button>:<button className="header-play" onClick={()=>setShowNew(true)}>Jugar ahora <span>↗</span></button>}
    </div>
  </header>
  <main>
   {screen==='home'&&<div className="screen-in">
    <section className="hero-section">
     <div className="hero-copy">
      <div className="hero-pill"><span className="signal-dot"/> TU PRÓXIMA GRAN IDEA EMPIEZA AQUÍ</div>
      <h1>De cero a <span className="gradient-word">leyenda</span><span className="headline-period">.</span></h1>
      <p className="hero-subtitle">Crea tu startup, reúne a un equipo de agentes expertos y toma decisiones que cambian el futuro. <strong>Aprende BMAD mientras juegas.</strong></p>
      <div className="hero-buttons"><button className="btn-main" onClick={()=>setShowNew(true)}><span>✦</span> Empezar aventura <b>↗</b></button>{save&&<button className="btn-ghost" onClick={()=>navigate('game')}>Continuar partida <span>→</span></button>}</div>
      <div className="hero-proof"><span className="proof-line"/><div className="proof-avatars">{agents.slice(0,4).map(a=><img key={a[0]} src={import.meta.env.BASE_URL+'characters/'+a[0].toLowerCase()+'.svg'} alt="" />)}</div><div><strong>Tu equipo te espera</strong><small>5 agentes · 6 capítulos · 18 decisiones</small></div></div>
     </div>
     <div className="hero-art" aria-label="Centro de operaciones con los agentes BMAD">
       <div className="orbit outer"/><div className="orbit inner"/><div className="art-stars" aria-hidden="true"><i>✦</i><i>✧</i><i>+</i></div>
       <div className="city-floor"><div className="city-grid"/></div>
       <div className="art-office">
        <div className="office-roof"><div className="roof-lights"><i/><i/><i/></div><span>STARTUP HQ</span><span className="online">● ONLINE</span></div>
        <div className="office-window"><div className="window-lines"/><div className="window-chart"><i/><i/><i/><i/><i/></div><div className="window-bars"><i/><i/><i/></div></div>
        <div className="office-console"><div className="console-screen"><span>BMAD</span><small>PLAN • BUILD • LAUNCH</small><div className="console-progress"><i/></div></div><div className="console-stand"/></div>
        <div className="office-table"/>
       </div>
       <div className="agent-float mary"><CharacterArt name="Mary"/><div className="agent-tooltip"><b>Mary</b><span>Analista</span></div></div>
       <div className="agent-float john"><CharacterArt name="John"/><div className="agent-tooltip"><b>John</b><span>Product Manager</span></div></div>
       <div className="agent-float sally"><CharacterArt name="Sally"/><div className="agent-tooltip"><b>Sally</b><span>UX Designer</span></div></div>
       <div className="agent-float winston"><CharacterArt name="Winston"/><div className="agent-tooltip"><b>Winston</b><span>Architect</span></div></div>
       <div className="agent-float amelia"><CharacterArt name="Amelia"/><div className="agent-tooltip"><b>Amelia</b><span>Developer</span></div></div>
       <div className="floating-note"><span>✦ NUEVA MISIÓN</span><b>Construye algo increíble</b><small>+ 120 XP disponibles</small></div>
     </div>
    </section>
    <div className="ticker" aria-hidden="true"><span>✦ IDEAS QUE CAMBIAN EL MUNDO</span><span>◆ EQUIPO DE AGENTES</span><span>✳ PARTY MODE</span><span>✦ TU STARTUP, TUS REGLAS</span></div>
    <section className="features-section">
      <div className="feature-intro"><div><span className="section-kicker">NO ES UNA CLASE ABURRIDA</span><h2>Aprender nunca se vio <em>tan bien.</em></h2></div><p>Una aventura donde cada elección cuenta. Descubre el método BMAD sin quedarte leyendo diapositivas.</p></div>
      <div className="feature-grid">
       <button onClick={()=>setShowNew(true)} className="feature-card feature-purple"><span className="feature-no">01 / ELIGE TU DESTINO</span><span className="feature-icon">◈</span><h3>Construye tu imperio</h3><p>Una startup, un sueño, miles de decisiones. Descubre hasta dónde puedes llegar.</p><span className="feature-arrow">↗</span></button>
       <button onClick={()=>navigate('academy')} className="feature-card feature-blue"><span className="feature-no">02 / APRENDE JUGANDO</span><span className="feature-icon">✦</span><h3>Domina BMAD</h3><p>Misiones con agentes expertos, planificación y desafíos que sí enseñan.</p><span className="feature-arrow">↗</span></button>
       <button disabled={!save} onClick={()=>navigate('party')} className="feature-card feature-orange"><span className="feature-no">03 / REÚNE AL EQUIPO</span><span className="feature-icon">◎</span><h3>Party Mode</h3><p>Escucha perspectivas diferentes, cuestiona ideas y toma la decisión final.</p><span className="feature-arrow">↗</span></button>
      </div>
    </section>
    <section className="crew-section"><div className="feature-intro"><div><span className="section-kicker">CONOCE AL SQUAD</span><h2>No estás <em>solo.</em></h2></div><p>Cinco especialistas con talentos diferentes. Elige a quién escuchar… y cuándo.</p></div><div className="crew-grid">{agents.map((a,i)=><div className={'crew-card crew-'+a[3]} key={a[0]}><CharacterArt name={a[0]}/><div className="crew-copy"><span>AGENTE 0{i+1}</span><h3>{a[0]}</h3><small>{a[1]}</small></div></div>)}</div></section>
    <section className="cta-banner"><span>✦ EL FUTURO ESTÁ EN TUS MANOS</span><h2>¿Listo para crear algo grande?</h2><p>Tu historia empieza con una decisión.</p><button className="btn-main" onClick={()=>setShowNew(true)}>Empezar mi aventura <b>→</b></button></section>
   </div>}
   {showNew&&<div className="modal-cover" onMouseDown={e=>{if(e.target===e.currentTarget)setShowNew(false)}}><section role="dialog" aria-modal="true" aria-label="Crear nueva partida" className="new-game-modal screen-in forge-start-modal"><button className="close-modal" onClick={()=>setShowNew(false)} aria-label="Cerrar">✕</button><span className="section-kicker">✦ CREA TU PROPIA AVENTURA</span><h2>¿Qué quieres <em>construir?</em></h2><p>Elige un proyecto preparado o describe uno con tus palabras para convertirlo en una app interactiva.</p><label htmlFor="founder">Nombre del fundador</label><input id="founder" maxLength={32} value={founder} onChange={e=>setFounder(e.target.value)} placeholder="Tu nombre"/><div className="forge-mode-selector"><button className={creationMode==='preset'?'selected':''} onClick={()=>setCreationMode('preset')}><span>◈</span><strong>Proyecto predeterminado</strong><small>3 proyectos · Presupuesto inicial 100 CR</small></button><button className={creationMode==='prompt'?'selected':''} onClick={()=>setCreationMode('prompt')}><span>✦</span><strong>Crear por instrucción</strong><small>Ideas libres · Versión básica funcional · 250 CR</small></button></div>{creationMode==='preset'?<><div className="choose-label">ESCOGE TU STARTUP <span>100 CR INICIALES</span></div><div className="startup-choices">{startups.map((s,i)=><button key={s[0]} className={'startup-option '+(startup===i?'picked':'')} onClick={()=>setStartup(i)} aria-pressed={startup===i}><span className="startup-symbol">{s[2]}</span><strong>{s[0]}</strong><small>{s[1]}</small><span className="selection-mark">{startup===i?'✓':'+'}</span></button>)}</div></>:<><label htmlFor="forge-instruction">Tu instrucción para los agentes</label><textarea id="forge-instruction" className="forge-prompt-field" maxLength={400} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Ejemplo: Quiero una app que me permita jugar blackjack contra un crupier virtual"/><div className="forge-prompt-examples"><span>Prueba una idea:</span>{[['♠ Blackjack','Quiero un juego de blackjack contra un crupier virtual'],['◈ Reservas','Necesito una app para reservar citas en una barbería'],['✦ Trivia','Quiero una trivia de preguntas de cultura general']].map(([name,text])=><button key={name} onClick={()=>setPrompt(text)}>{name}</button>)}</div>{prompt.trim().length>0&&<div className={'forge-interpretation '+(analyzedIdea.project?'recognized':'unsupported')}>{analyzedIdea.project?<><strong>✓ Motor encontrado: {analyzedIdea.project.title}</strong><p>{analyzedIdea.project.summary}</p></>:<p>{analyzedIdea.error}</p>}</div>}<small className="forge-model-note">El constructor interpreta ideas generales y crea una versión funcional básica con herramientas seguras. La generación de software arbitrario mediante IA todavía necesita un servidor.</small></>}<button className="btn-main modal-go" onClick={begin} disabled={creationMode==='prompt'&&!analyzedIdea.project}>{creationMode==='prompt'?'Crear y probar mi app →':'Fundar mi startup →'}</button>{save&&<small className="overwrite-note">Crear una nueva partida reemplazará el progreso actual.</small>}</section></div>}
      {save&&screen==='game'&&<div className="screen-in play-screen">
     <div className="game-topline"><span>◈ CENTRO DE OPERACIONES</span><span>PARTIDA GUARDADA AUTOMÁTICAMENTE <i className="signal-dot"/></span></div>
     <div className="game-heading"><div><span className="section-kicker">HOLA, {save.founder.toUpperCase()}</span><h1>Tu startup, <em>tu historia.</em></h1><p>{save.mode==='prompt'&&save.project?save.project.title+' · Construido desde tu instrucción':startups[save.startup][0]+' · '+startups[save.startup][1]}</p></div><div className="level-gem"><span>✦</span><div><small>RANGO ACTUAL</small><b>LEVEL {1+Math.floor(save.index/3)}</b></div></div></div>
     <div className="hud">
       <div className="hud-tile"><div className="hud-symbol purple">◎</div><div><small>CRÉDITOS</small><strong>{save.credits}<span> CR</span></strong></div></div>
       <div className="hud-tile"><div className="hud-symbol turquoise">◆</div><div><small>CALIDAD</small><strong>{save.quality}<span> %</span></strong></div></div>
       <div className="hud-tile"><div className="hud-symbol orange">✦</div><div><small>CONOCIMIENTO</small><strong>{save.insight}<span> %</span></strong></div></div>
       <div className="hud-tile"><div className="hud-symbol pink">◉</div><div><small>MISIONES</small><strong>{save.index}<span> / 18</span></strong></div></div>
     </div>
     {save.mode==='prompt'&&<div className="forge-game-banner"><span>✦ APP CREADA DESDE TU INSTRUCCIÓN</span><strong>{save.project?.title} · +{FORGE_MISSION_REWARD} CR por misión · +{FORGE_PARTY_REWARD} CR por debate</strong><button onClick={()=>navigate('studio')}>Abrir app jugable ↗</button></div>}
     <div className="hub-layout">
      <div className="hub-main">
       <div className="hub-card">
        <div className="hub-card-top"><span><i className="signal-dot"/> TU OFICINA DIGITAL</span><span>HQ · NIVEL {1+Math.floor(save.index/3)}</span></div>
        <div className="hub-visual">
         <div className="hub-back-grid"/>
         <div className="hub-neon">BMAD<span>QUEST</span></div>
         <div className="hub-desk"><button className="hub-monitor" type="button" onClick={()=>navigate('studio')} title="Abrir el estudio y probar la web de tu startup"><span>✦</span><small>VER SITIO WEB ↗</small></button><div className="hub-monitor-base"/></div>
         <div className="hub-furniture left"/><div className="hub-furniture right"/>
         <button className="hub-character hub-first" title="Ir a Party Mode" onClick={()=>navigate('party')}><CharacterArt name="John" variant="mini"/><span>PARTY MODE ↗</span></button>
         <button className="hub-character hub-second" title="Ver academia" onClick={()=>navigate('academy')}><CharacterArt name="Sally" variant="mini"/><span>ACADEMIA ↗</span></button>
         <button className="hub-character hub-third" title="Jugar misión" onClick={()=>document.getElementById('mission-panel')?.scrollIntoView({behavior:'smooth'})}><CharacterArt name="Amelia" variant="mini"/><span>MISIONES ↓</span></button>
        </div>
        <div className="hub-footer"><span>✳ EQUIPO ACTIVO <b>5/5 AGENTES</b></span><span>◉ SIGUIENTE OBJETIVO <b>{mission?.title||'Campaña completada'}</b></span></div>
        <button type="button" className="hub-studio-link" onClick={()=>navigate('studio')}><span>▣ ESTUDIO DE DESARROLLO</span><strong>Ver las conversaciones y el progreso de nuestra web →</strong><small>Vista previa interactiva · Se actualiza cada 3 misiones</small></button>
       </div>
       <article id="mission-panel" className="mission-panel">
        {mission?<><div className="mission-banner"><div><span className="section-kicker">CAPÍTULO {chapter+1} · MISIÓN {save.index+1} DE 18</span><h2>{feedback?'¡Misión superada!':mission.title}</h2><span className="concept-chip">✦ {mission.topic}</span></div><CharacterArt name={currentAgent} variant="mini"/></div>
        <div className="mission-story"><CharacterArt name={currentAgent} variant="mini"/><div><span>{currentAgent.toUpperCase()} · TU MENTOR</span><p>{feedback?feedback:mission.brief}</p></div></div>
        {feedback?<div className="mission-reward"><div className="reward-star">★</div><div><strong>¡Una decisión más cerca de tu meta!</strong><p>Conocimiento y experiencia desbloqueados. Tu aventura continúa.</p></div><button className="btn-main" onClick={()=>{setFeedback('');if(save.index>=18)navigate('report')}}>{save.index>=18?'Ver mi resultado ↗':'Siguiente misión →'}</button></div>:<><div className="decision-heading">TU PRÓXIMA DECISIÓN</div><h3>{mission.question}</h3><div className="mission-options">{mission.choices.map((c,i)=><button key={c.label} onClick={()=>decide(i)} disabled={!canAfford(save.credits,Math.max(0,-c.delta[0]))} title={!canAfford(save.credits,Math.max(0,-c.delta[0]))?'Créditos insuficientes':''}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{c.label}<small className="decision-price">{Math.max(0,-c.delta[0])} CR {!canAfford(save.credits,Math.max(0,-c.delta[0]))?'· Saldo insuficiente':'· Disponible'}</small></span><b>↗</b></button>)}</div>{save.mode==='preset'&&mission.choices.every(c=>!canAfford(save.credits,Math.max(0,-c.delta[0])))&&<div className="funding-panel" role="status"><strong>Fondos insuficientes</strong><p>No puedes gastar más créditos de los que tienes. Puedes aceptar un trabajo de emergencia para recuperar 20 CR a cambio de perder 7 puntos de calidad.</p><button className="funding-button" disabled={!canRequestFunding(save.credits,MISSION_COSTS[0],'mission:'+save.index,save.fundingUsed)} onClick={()=>requestFunding('mission:'+save.index,MISSION_COSTS[0])}>Obtener 20 CR · -7 calidad →</button></div>}</>}
        </>:<div className="mission-finish"><span className="section-kicker">✦ OBJETIVO COMPLETADO</span><h2>¡Lanzaste tu startup!</h2><p>Terminaste las 18 misiones. Es hora de conocer los resultados.</p><button className="btn-main" onClick={()=>navigate('report')}>Ver resultados ↗</button></div>}
       </article>
      </div>
      <aside className="quest-side"><div className="quest-map"><div className="side-heading"><span>MAPA DE LA AVENTURA</span><b>{progress}%</b></div><div className="progress-track"><i style={{width:progress+'%'}}/></div>{chapters.map((title,i)=><div key={title} className={'quest-node '+(i===chapter?'current ':'')+(i<chapter?'complete ':'')+(i>chapter?'locked':'')}><div className="node-index">{i<chapter?'✓':('0'+(i+1))}</div><div><strong>{title}</strong><small>{i<chapter?'Completado':i===chapter?'En progreso':'Por desbloquear'}</small></div>{i===chapter&&<span className="playing-dot"/>}</div>)}</div><div className="party-teaser"><span>◈ PARTY MODE</span><h3>Las mejores ideas se debaten.</h3><p>Reúne a los agentes, escucha argumentos y decide.</p><button onClick={()=>navigate('party')}>Entrar a la sala ↗</button></div></aside>
     </div>
   </div>}
   {save&&screen==='studio'&&(save.mode==='prompt'&&save.project?<ForgeApp project={save.project} save={save} missions={missions} debates={debates} onBack={()=>navigate('game')} onEarn={earnCredits}/>:<StudioView save={save} missions={missions} debates={debates} onBack={()=>navigate('game')}/>)}
   {save&&screen==='party'&&<div className="screen-in party-screen"><div className="game-topline"><span>◈ SALA DE REUNIONES</span><span>{save.party.length} / 8 DEBATES TERMINADOS</span></div>
     <div className="game-heading"><div><span className="section-kicker">✦ THINK TOGETHER</span><h1>Welcome to <em>Party Mode.</em></h1><p>Cinco mentes. Distintas perspectivas. La última palabra siempre es tuya.</p></div><button className="btn-ghost" onClick={()=>navigate('game')}>← Volver a la oficina</button></div>
     <div className="party-workspace">
      <div className="roundtable"><div className="round-glow"/><div className="round-head"><span className="signal-dot"/> EN VIVO · EQUIPO BMAD <span>5 AGENTES CONECTADOS</span></div><div className="meeting-table"><div className="table-center"><span>◈</span><b>PARTY MODE</b><small>COLLECTIVE INTELLIGENCE</small></div></div>
       {agents.map((a,i)=><div key={a[0]} className={'round-agent place-'+i}><CharacterArt name={a[0]} variant="mini"/><span>{a[0]}</span></div>)}
       <div className="round-status"><span className="signal-dot"/> EQUIPO LISTO PARA DEBATIR</div>
      </div>
      <div className="meeting-chat"><div className="chat-header"><span>◈ DEBATE ACTIVO</span><span>ESCENARIO {String(selectedDebate+1).padStart(2,'0')}/08</span></div>
       <select aria-label="Elegir escenario de debate" value={selectedDebate} onChange={e=>setSelectedDebate(Number(e.target.value))}>{debates.map((d,i)=><option key={d[0]} value={i}>{d[0]}{save.party.includes(i)?' ✓':''}</option>)}</select>
       <h2>{debates[selectedDebate][0]}</h2>
       <div className="dialogue-scroll">{debates[selectedDebate][1].split(' · ').map((text,i)=>{const [who,...parts]=text.split(':');return <div className="speech" key={i}><CharacterArt name={agents.some(a=>a[0]===who)?who:'Mary'} variant="mini"/><div><strong>{who}</strong><p>{parts.join(':').trim()}</p></div></div>})}</div>
       {save.party.includes(selectedDebate)?<div className="party-complete"><span>★</span><div><strong>Debate completado</strong><small>La decisión se guardó en el historial de tu startup.</small></div></div>:<div className="party-choices"><strong>¿QUÉ HACES COMO FUNDADOR?</strong><button disabled={!canAfford(save.credits,PARTY_COSTS[0])} onClick={()=>debate(0)}><span>01</span> Analizar los argumentos y decidir con evidencia <small>{PARTY_COSTS[0]} CR</small><b>↗</b></button><button disabled={!canAfford(save.credits,PARTY_COSTS[1])} onClick={()=>debate(1)}><span>02</span> Decidir rápido sin revisar las objeciones <small>{PARTY_COSTS[1]} CR</small><b>↗</b></button>{save.mode==='preset'&&!canAfford(save.credits,PARTY_COSTS[0])&&<div className="funding-panel" role="status"><strong>Sin presupuesto para debatir</strong><p>Obtén 20 CR con una actividad de emergencia. El coste es -7 de calidad.</p><button className="funding-button" disabled={!canRequestFunding(save.credits,PARTY_COSTS[0],'party:'+selectedDebate,save.fundingUsed)} onClick={()=>requestFunding('party:'+selectedDebate,PARTY_COSTS[0])}>Obtener 20 CR · -7 calidad →</button></div>}</div>}
       <p className="sim-note">Simulación educativa con diálogos programados. No utiliza modelos de IA reales.</p>
      </div>
     </div>
   </div>}
   {screen==='academy'&&<section className="screen-in academy-screen"><span className="section-kicker">✦ TU CENTRO DE CONOCIMIENTO</span><h1>Academia <em>BMAD.</em></h1><p>Desbloquea el lenguaje de los creadores. Aprende cada concepto a tu ritmo.</p><div className="academy-toolbar"><label className="search-box"><span>⌕</span><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Busca un concepto, skill o técnica…" aria-label="Buscar conceptos"/></label><span>{filteredLexicon.length} CONCEPTOS DISPONIBLES</span></div><div className="academy-grid">{filteredLexicon.map(([name,description,category],i)=><article className="academy-card" key={name}><div className="academy-card-top"><span className="academy-glyph">{['◈','✳','✦','◆','◎','✧'][i%6]}</span><span>{category.toUpperCase()}</span></div><h2>{name}</h2><p>{description}</p><span className="learn-tag">CONCEPTO BMAD ↗</span></article>)}</div><div className="academy-link"><span>¿Quieres ir más allá de la simulación?</span><a target="_blank" rel="noreferrer" href="https://docs.bmad-method.org/">Ver documentación oficial ↗</a></div></section>}
   {save&&screen==='report'&&<section className="screen-in report-screen"><div className="report-rays"/><div className="report-emblem">★</div><span className="section-kicker">✦ EL FINAL DE UNA AVENTURA</span><h1>{save.quality+save.insight>=125?'¡Startup legendaria!':save.quality+save.insight>=85?'¡Gran comienzo!':'¡Aprender también es ganar!'}</h1><p>Has completado {save.index} de 18 misiones. Cada elección te trajo hasta aquí.</p><div className="report-metrics"><div><span>◎</span><small>CRÉDITOS</small><b>{save.credits}</b></div><div><span>◆</span><small>CALIDAD</small><b>{save.quality}%</b></div><div><span>✦</span><small>BMAD XP</small><b>{save.insight}%</b></div><div><span>◈</span><small>DEBATES</small><b>{save.party.length}/8</b></div></div><div className="report-history"><h2>Diario de decisiones</h2><div>{save.log.map((entry,i)=><p key={i}><span>{String(i+1).padStart(2,'0')}</span>{entry}</p>)}</div></div><div className="report-actions"><button className="btn-ghost" onClick={()=>{const blob=new Blob([JSON.stringify(save,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='bmad-quest-partida.json';a.click();URL.revokeObjectURL(url)}}>↓ Exportar progreso</button><button className="btn-main" onClick={()=>setShowNew(true)}>Nueva aventura ↗</button></div></section>}
  </main>
  <footer className="site-footer"><span><span className="footer-symbol">✦</span> BMAD QUEST <small>© 2026 · Experiencia educativa no oficial</small></span><a href="https://docs.bmad-method.org/" target="_blank" rel="noreferrer">Basado en BMAD Method ↗</a></footer>
 </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
