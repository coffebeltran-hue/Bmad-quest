import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import './style.css';
type Choice={label:string;note:string;delta:[number,number,number]};
type Mission={title:string;topic:string;lead:string;brief:string;question:string;choices:[Choice,Choice]};
type Save={startup:number;founder:string;index:number;credits:number;quality:number;insight:number;log:string[];party:number[]};
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
const initial=(startup:number,founder:string):Save=>({startup,founder,index:0,credits:100,quality:35,insight:0,log:[],party:[]});
const key='bmad-quest-save-1';
function load():Save|null{try{const x=JSON.parse(localStorage.getItem(key)||'null');return x&&Number.isInteger(x.index)&&x.index>=0&&x.index<=18&&Number.isInteger(x.startup)&&x.startup>=0&&x.startup<=2&&Array.isArray(x.log)&&Array.isArray(x.party)?x:null}catch{return null}}
function App(){
 const [save,setSave]=useState<Save|null>(load);
 const [screen,setScreen]=useState<'home'|'game'|'academy'|'party'|'report'>('home');
 const [founder,setFounder]=useState('Fundador/a');
 const [startup,setStartup]=useState(0);
 const [showNew,setShowNew]=useState(false);
 const [feedback,setFeedback]=useState('');
 const [selectedDebate,setSelectedDebate]=useState(0);
 const [term,setTerm]=useState('');
 useEffect(()=>{if(save)localStorage.setItem(key,JSON.stringify(save));else localStorage.removeItem(key)},[save]);
 const mission=save&&save.index<missions.length?missions[save.index]:null;
 const chapter=save?Math.min(5,Math.floor(save.index/3)):0;
 function begin(){setSave(initial(startup,founder));setScreen('game');setFeedback('');setShowNew(false)}
 function decide(i:number){
  if(!save||!mission||feedback)return;
  const c=mission.choices[i];
  setSave({...save,index:save.index+1,credits:Math.max(0,save.credits+c.delta[0]),quality:Math.min(100,Math.max(0,save.quality+c.delta[1])),insight:Math.min(100,save.insight+c.delta[2]),log:[...save.log,mission.title+': '+c.label]});
  setFeedback(c.note);
 }
 function debate(i:number){
  if(!save||save.party.includes(selectedDebate))return;
  const wins=i===0;
  setSave({...save,party:[...save.party,selectedDebate],credits:Math.max(0,save.credits+(wins?-2:-8)),insight:Math.min(100,save.insight+(wins?7:2)),quality:Math.min(100,Math.max(0,save.quality+(wins?5:-4))),log:[...save.log,debates[selectedDebate][0]+': '+(wins?'Analizar perspectivas':'Decidir sin analizar')]})
 }
 const lexicon=[
 ['Agentes','Roles especializados que ayudan a explorar, planificar, diseñar y construir.'],
 ['Skills y workflows','Capacidades y secuencias de trabajo para alcanzar un objetivo.'],
 ['Brainstorming','Generación y exploración de varias ideas antes de seleccionarlas.'],
 ['Product Brief','Resumen de problema, público y propuesta de valor.'],
 ['PRD','Documento de requisitos del producto y criterios verificables.'],
 ['MVP','Producto mínimo que permite validar una hipótesis.'],
 ['Epics y tickets','Divisiones del trabajo en unidades abordables.'],
 ['UX Design','Diseño enfocado en las tareas y necesidades humanas.'],
 ['Architecture','Decisiones estructurales y técnicas del software.'],
 ['QA y Code Review','Pruebas y revisión para detectar defectos y riesgos.'],
 ['Party Mode','Discusión entre distintas perspectivas de agentes, dirigida por una persona.'],
 ['Advanced Elicitation','Preguntas para explorar supuestos y encontrar información faltante.'],
 ['Correct Course','Revisión del plan cuando cambian las condiciones.'],
 ['Retrospective','Reflexión sobre lo que pasó y acciones de mejora.']
 ];
 return <div className="app"><div className="ambient a"/><div className="ambient b"/>
 <header className="top"><button className="brand" onClick={()=>setScreen('home')} aria-label="Inicio"><span className="brand-icon">B<span>✦</span></span><span>BMAD <b>STARTUP QUEST</b></span></button><nav><button onClick={()=>setScreen('home')}>Inicio</button><button onClick={()=>setScreen('academy')}>Academia</button><button disabled={!save} onClick={()=>setScreen('party')}>Party Mode</button>{save&&<button onClick={()=>setScreen('game')}>Mi empresa</button>}</nav></header>
 <main>
 {screen==='home'&&<section className="hero"><div className="hero-copy"><div className="eyebrow">✦ APRENDE BMAD JUGANDO</div><h1>Convierte una <em>idea</em> en una <span>startup.</span></h1><p>Una aventura de decisiones, agentes y grandes ideas. Construye tu producto desde cero y descubre cómo funciona BMAD Method.</p><div className="hero-actions"><button className="primary" onClick={()=>setShowNew(true)}>✦ Nueva aventura <span>→</span></button>{save&&<button className="outline" onClick={()=>setScreen('game')}>Continuar partida →</button>}</div><div className="stats-intro"><div><strong>05</strong><span>Agentes</span></div><div><strong>18</strong><span>Misiones</span></div><div><strong>06</strong><span>Capítulos</span></div></div></div><div className="scene"><div className="planet"/><div className="office"><div className="office-title"><span className="live-dot"/> <span>STARTUP HQ</span><span>LEVEL 01</span></div><div className="wall"><div className="chart-lines"><i/><i/><i/><i/><i/></div><div className="code-line">const idea = <b>'future'</b></div></div><div className="desk"><div className="screen-glow"><span>BMAD</span><small>BUILD SOMETHING GREAT</small></div><div className="desk-base"/></div><div className="avatars">{agents.map(a=><div key={a[0]} className={'avatar '+a[3]} title={a[0]+' · '+a[1]}>{a[2]}</div>)}</div></div><div className="float-card">✦ TU EQUIPO ESTÁ LISTO <b>5 agentes online</b></div></div></section>}
 {showNew&&<div className="overlay"><div className="modal"><button className="close" onClick={()=>setShowNew(false)}>✕</button><div className="eyebrow">CONFIGURACIÓN DE PARTIDA</div><h2>Tu historia empieza aquí</h2><label>Nombre del fundador<input maxLength={32} value={founder} onChange={e=>setFounder(e.target.value)}/></label><p>Elige tu primer proyecto</p><div className="startup-grid">{startups.map((s,i)=><button key={s[0]} className={'startup '+(startup===i?'chosen':'')} onClick={()=>setStartup(i)}><span>{s[2]}</span><strong>{s[0]}</strong><small>{s[1]}</small></button>)}</div><button className="primary wide" onClick={begin}>Fundar mi startup →</button></div></div>}
 {save&&screen==='game'&&<section className="dashboard"><div className="section-head"><div><div className="eyebrow">CENTRO DE OPERACIONES / {startups[save.startup][0]}</div><h2>Bienvenido, {save.founder}.</h2><p>Tu equipo está listo para la siguiente decisión.</p></div><span className="level">✦ NIVEL {1+Math.floor(save.index/3)}</span></div><div className="meters"><div><small>CRÉDITOS</small><strong>◎ {save.credits}</strong></div><div><small>CALIDAD</small><strong>{save.quality}%</strong></div><div><small>CONOCIMIENTO</small><strong>{save.insight}%</strong></div><div><small>PROGRESO</small><strong>{Math.round(save.index/18*100)}%</strong></div></div><div className="layout"><aside className="map"><h3>Mapa de campaña</h3>{chapters.map((c,i)=><div className={'map-node '+(i===chapter?'current':'')+(i<chapter?' done':'')} key={c}><span>{i<chapter?'✓':String(i+1).padStart(2,'0')}</span><div><b>{c}</b><small>{i<chapter?'Completado':i===chapter?'En curso':'Bloqueado'}</small></div></div>)}<button className="outline wide" onClick={()=>setScreen('party')}>◈ Ir a Party Mode</button></aside><article className="mission">{mission?<><div className="mission-kicker">CAPÍTULO {chapter+1} · MISIÓN {save.index+1}/18</div><h2>{feedback?'¡Decisión tomada!':mission.title}</h2><div className="mission-concept">✦ {mission.topic}</div><div className="agent-box"><span className="avatar blue">{agents.find(a=>a[0]===mission.lead)?.[2]||'BM'}</span><div><strong>{mission.lead}</strong><p>{feedback?feedback:mission.brief}</p></div></div>{feedback?<button className="primary" onClick={()=>{setFeedback('');if(save.index>=18)setScreen('report')}}>{save.index>=18?'Ver resultado final →':'Continuar aventura →'}</button>:<><h3>{mission.question}</h3><div className="choices">{mission.choices.map((c,i)=><button key={c.label} onClick={()=>decide(i)}><span>{String.fromCharCode(65+i)}</span>{c.label}<b>→</b></button>)}</div></>}</>:<><div className="eyebrow">CAMPAÑA COMPLETADA</div><h2>¡Lanzamiento realizado!</h2><p>Tu startup llegó al final del recorrido. Revisa lo aprendido.</p><button className="primary" onClick={()=>setScreen('report')}>Ver mi resultado →</button></>}</article></div></section>}
 {save&&screen==='party'&&<section className="section"><div className="section-head"><div><div className="eyebrow">◈ COLABORACIÓN ENTRE AGENTES</div><h2>Party Mode</h2><p>Debate con cinco perspectivas. La decisión final es tuya.</p></div></div><div className="party-layout"><div className="party-room"><div className="table-ring"><span>BMAD</span></div>{agents.map((a,i)=><div style={{left:(50+38*Math.sin(i*2*Math.PI/5))+'%',top:(50-39*Math.cos(i*2*Math.PI/5))+'%'}} className={'seat avatar '+a[3]} key={a[0]} title={a[0]}>{a[2]}</div>)}</div><div className="debate"><label htmlFor="scenario">Tema del debate</label><select id="scenario" value={selectedDebate} onChange={e=>setSelectedDebate(Number(e.target.value))}>{debates.map((d,i)=><option value={i} key={i}>{d[0]}</option>)}</select><div className="chat"><p>{debates[selectedDebate][1]}</p></div>{save.party.includes(selectedDebate)?<div className="notice">✓ Debate resuelto y guardado en tu diario.</div>:<><h3>¿Qué decides como fundador?</h3><button className="choice-party" onClick={()=>debate(0)}>Analizar los argumentos y decidir con evidencia →</button><button className="choice-party" onClick={()=>debate(1)}>Decidir rápido sin revisar las objeciones →</button></>}<small className="muted">Simulación educativa basada en escenarios; no ejecuta agentes IA reales.</small></div></div></section>}
 {screen==='academy'&&<section className="section"><div className="eyebrow">CENTRO DE APRENDIZAJE</div><h2>Academia BMAD</h2><p>Conceptos clave, sin discursos interminables.</p><input className="search" placeholder="Buscar conceptos..." value={term} onChange={e=>setTerm(e.target.value)} aria-label="Buscar conceptos"/><div className="lexicon">{lexicon.filter(([name,desc])=>(name+desc).toLowerCase().includes(term.toLowerCase())).map(([name,desc])=><div className="term" key={name}><span>✦</span><h3>{name}</h3><p>{desc}</p></div>)}</div><a href="https://docs.bmad-method.org/" target="_blank" rel="noreferrer">Consultar documentación oficial ↗</a></section>}
 {save&&screen==='report'&&<section className="section result"><div className="eyebrow">INFORME FINAL</div><h2>{save.quality+save.insight>=125?'¡Tu startup tiene futuro!':save.quality+save.insight>=85?'Una startup con potencial':'Cada fracaso enseña algo'}</h2><p>Terminaste {save.index} de 18 misiones y participaste en {save.party.length} debates.</p><div className="meters"><div><small>CRÉDITOS</small><strong>{save.credits}</strong></div><div><small>CALIDAD</small><strong>{save.quality}%</strong></div><div><small>BMAD</small><strong>{save.insight}%</strong></div></div><h3>Tu diario de decisiones</h3><div className="journal">{save.log.map((l,i)=><p key={i}><span>{String(i+1).padStart(2,'0')}</span>{l}</p>)}</div><button className="outline" onClick={()=>{const blob=new Blob([JSON.stringify(save,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='bmad-quest-partida.json';a.click();URL.revokeObjectURL(u)}}>Exportar partida ↓</button><button className="primary" onClick={()=>setShowNew(true)}>Jugar otra vez →</button></section>}
 </main><footer>Proyecto educativo no oficial · Inspirado en BMAD Method · <a href="https://docs.bmad-method.org/" target="_blank" rel="noreferrer">Documentación ↗</a></footer></div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
