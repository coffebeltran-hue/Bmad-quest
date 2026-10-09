import React,{useEffect,useMemo,useRef,useState} from 'react';
import {buildConversation,RELEASES,SITE_VARIANTS,studioPercent,studioStage} from './studio-engine';
import type {StudioMessage,StudioMission} from './studio-engine';
import './studio.css';

type StudioProps={
 save:{startup:number;index:number;founder:string;credits:number;quality:number;insight:number;log:string[]};
 missions:readonly StudioMission[];
 debates:readonly (readonly string[])[];
 onBack:()=>void;
};
type WebTab='home'|'catalog'|'about';
type ChatFilter='all'|'decisions'|'releases';
const characterSrc=(name:string)=>import.meta.env.BASE_URL+'characters/'+name.toLowerCase()+'.svg';

export default function StudioView({save,missions,debates,onBack}:StudioProps){
 const site=SITE_VARIANTS[save.startup]||SITE_VARIANTS[0];
 const stage=studioStage(save.index);
 const percent=studioPercent(save.index);
 const [selectedStage,setSelectedStage]=useState(stage);
 const [filter,setFilter]=useState<ChatFilter>('all');
 const [playing,setPlaying]=useState(false);
 const [visibleCount,setVisibleCount]=useState(Infinity);
 const [webTab,setWebTab]=useState<WebTab>('home');
 const [query,setQuery]=useState('');
 const [category,setCategory]=useState('Todos');
 const [selected,setSelected]=useState<string[]>([]);
 const [showCheckout,setShowCheckout]=useState(false);
 const [visitorName,setVisitorName]=useState('');
 const [notice,setNotice]=useState('');
 const [feedback,setFeedback]=useState('');
 const bottomRef=useRef<HTMLDivElement|null>(null);
 const messages=useMemo(()=>buildConversation(save.log,missions,debates,site.name),[save.log,missions,debates,site.name]);
 const transcript=useMemo(()=>messages.filter(m=>filter==='all'||(filter==='decisions'&&m.kind==='decision')||(filter==='releases'&&m.kind==='milestone')),[messages,filter]);
 const visible=transcript.slice(0,visibleCount);
 const filteredProducts=[...site.products].filter(product=>(category==='Todos'||product.category===category)&&(product.title+' '+product.detail).toLowerCase().includes(query.toLowerCase()));
 useEffect(()=>{setSelectedStage(stage)},[stage]);
 useEffect(()=>{
   if(!playing)return;
   if(visibleCount>=transcript.length){setPlaying(false);return}
   const timer=window.setTimeout(()=>setVisibleCount(c=>c+1),760);
   return ()=>window.clearTimeout(timer);
 },[playing,visibleCount,transcript.length]);
 useEffect(()=>{if(playing)bottomRef.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[visibleCount,playing]);
 function changeFilter(next:ChatFilter){setPlaying(false);setVisibleCount(Infinity);setFilter(next)}
 function replay(){setVisibleCount(1);setPlaying(true)}
 function toggleSelection(id:string){
   setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
   setNotice('');
 }
 function commitAction(){
   if(!selected.length)return;
   if(!visitorName.trim()){setNotice('Escribe tu nombre para probar el formulario.');return}
   setNotice(site.done+' Esto es una demostración visual; no se realizó ninguna transacción.');
   setSelected([]);
   setShowCheckout(false);
   setVisitorName('');
 }
 const completed=RELEASES.filter(r=>r.unlock<=save.index).length;
 const current=RELEASES[selectedStage];
 return <section className="studio-screen screen-in">
  <div className="studio-breadcrumb"><span>✦ BMAD STUDIO / PROYECTO ACTIVO</span><button onClick={onBack}>← Volver a la oficina</button></div>
  <div className="studio-hero">
   <div><span className="section-kicker">CONSTRUCCIÓN EN TIEMPO DE PARTIDA</span><h1>Tu equipo está <em>creando.</em></h1><p>Sigue la conversación, observa cada entrega y prueba la web que toma forma gracias a tus decisiones.</p></div>
   <div className="studio-progress-badge"><span>PROGRESO DE LA WEB</span><strong>{percent}<small>%</small></strong><span>{save.index} de 18 misiones completadas</span></div>
  </div>
  <div className="studio-progress-track" role="progressbar" aria-label="Progreso de la página web" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{width:percent+'%'}}/></div>
  <div className="studio-milestones">
   {RELEASES.map((release,i)=><button key={release.name} className={'studio-milestone '+(selectedStage===i?'selected ':'')+(stage>=i?'unlocked':'locked')} disabled={stage<i} onClick={()=>{setSelectedStage(i);setNotice('');setWebTab('home')}} title={stage<i?'Completa '+release.unlock+' misiones para desbloquear esta versión':release.detail}><span className="milestone-dot">{stage>i?'✓':String(i+1).padStart(2,'0')}</span><strong>{release.name}</strong><small>{stage<i?'Bloqueado':i===stage?'Actual':'Ver versión'}</small></button>)}
  </div>
  <div className="studio-columns">
   <div className="studio-chat-panel">
    <div className="studio-panel-header"><div className="studio-panel-icon">◈</div><div><strong>Canal #desarrollo</strong><span>Conversaciones del equipo BMAD</span></div><div className="studio-online"><i/> 5 agentes</div></div>
    <div className="studio-chat-controls">
     <div className="studio-chat-filters"><button className={filter==='all'?'chosen':''} onClick={()=>changeFilter('all')}>Todo</button><button className={filter==='decisions'?'chosen':''} onClick={()=>changeFilter('decisions')}>Decisiones</button><button className={filter==='releases'?'chosen':''} onClick={()=>changeFilter('releases')}>Avances</button></div>
     <button className="studio-replay" onClick={()=>playing?setPlaying(false):replay()}>{playing?'Ⅱ Pausar':'▷ Reproducir'}</button>
    </div>
    <div className="studio-chat-feed" role="log" aria-label="Historial narrativo del equipo">
     {visible.map((msg:StudioMessage)=><div className={'studio-message '+msg.kind+' '+(msg.speaker==='Fundador'?'owner':'')} key={msg.id}>
       {msg.speaker==='Fundador'?<span className="studio-founder-avatar">YO</span>:<img src={characterSrc(msg.speaker)} alt="" className="studio-chat-avatar"/>}
       <div className="studio-message-main"><div className="studio-message-title"><strong>{msg.speaker==='Fundador'?save.founder:msg.speaker}</strong><span>{msg.phase}</span>{msg.kind==='milestone'&&<small>✦ ENTREGA</small>}</div><p>{msg.content}</p></div>
      </div>)}
     <div ref={bottomRef}/>
    </div>
    <div className="studio-chat-footer"><span className="studio-status-dot"/> Las conversaciones recrean las decisiones guardadas; no son mensajes de IA en vivo. <b>{transcript.length} mensajes</b></div>
   </div>
   <div className="studio-preview-panel">
    <div className="studio-panel-header"><div className="studio-panel-icon teal">▣</div><div><strong>Vista previa del producto</strong><span>Versión {selectedStage+1}.0 · {site.name}</span></div><span className="studio-build-tag">● DEMO LOCAL</span></div>
    <div className="studio-browser"><div className="studio-browser-top"><div className="browser-dots"><i/><i/><i/></div><div className="browser-address">🔒 demo.local/{site.name.toLowerCase()}/{current.name.toLowerCase().replace(/ /g,'-')}</div><span>↻</span></div>
      <div className="site-demo">
       {selectedStage===0?<div className="demo-wireframe"><div className="wire-label">ETAPA 0 — BOCETO INICIAL</div><div className="wire-header"/><div className="wire-hero"><i/><i/><i/></div><div className="wire-card-row"><i/><i/><i/></div><strong>Mary y John están definiendo el producto...</strong><span>Completa tres misiones para desbloquear la primera portada.</span></div>:<>
        <div className="demo-nav"><button onClick={()=>setWebTab('home')} className="demo-logo">✳ {site.name}</button><div className="demo-links"><button className={webTab==='home'?'active':''} onClick={()=>setWebTab('home')}>Inicio</button><button className={webTab==='catalog'?'active':''} onClick={()=>setWebTab('catalog')} disabled={selectedStage<2}>Explorar</button><button className={webTab==='about'?'active':''} onClick={()=>setWebTab('about')} disabled={selectedStage<5}>Nosotros</button></div><button className="demo-account" onClick={()=>selectedStage>=4?setShowCheckout(true):setNotice('El flujo de selección se desbloquea en la versión Interactividad.')}><span>◈</span> {selectedStage>=4?selected.length:'—'}</button></div>
        {webTab==='about'&&selectedStage>=5?<div className="demo-about"><span className="demo-overline">HECHO PARA PERSONAS</span><h2>Una mejor experiencia empieza aquí.</h2><p>En {site.name} creemos que la tecnología debe simplificar tu día. Nuestro prototipo mejoró gracias a investigación, pruebas y decisiones de diseño.</p><div className="demo-about-metric"><b>{save.quality}%</b><span>Calidad de producto simulada</span></div></div>:<>
        {webTab==='home'&&<div className="demo-hero"><div className="demo-hero-copy"><span className="demo-overline">✦ BIENVENIDO A {site.name.toUpperCase()}</span><h2>{site.type}<span>.</span></h2><p>{site.pitch}</p><button onClick={()=>selectedStage>=2?setWebTab('catalog'):setNotice('El catálogo aparecerá al completar seis misiones.')}>{site.action} <b>↗</b></button></div><div className="demo-hero-art" aria-hidden="true"><div className="demo-art-orb"/><span>{save.startup===0?'∑':save.startup===1?'☕':'◷'}</span><div className="demo-art-bubble">✦ 100% a tu ritmo</div></div></div>}
        {selectedStage>=2&&<div className="demo-catalog"><div className="demo-catalog-header"><div><span className="demo-overline">DESCUBRE TU PRÓXIMA OPCIÓN</span><h3>{save.startup===0?'Aprende algo nuevo':save.startup===1?'Pide algo delicioso':'Encuentra tu momento'}</h3></div><span>{filteredProducts.length} {site.noun}</span></div>
          {selectedStage>=3&&<div className="demo-filters"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={'Buscar '+site.noun+'...'} aria-label={'Buscar '+site.noun}/><select aria-label={site.categoryLabel} value={category} onChange={e=>setCategory(e.target.value)}>{site.categories.map(c=><option key={c}>{c}</option>)}</select></div>}
          <div className="demo-products">{filteredProducts.map((product,i)=><div className="demo-product" key={product.id}><div className={'demo-product-image art-'+i}><span>{product.symbol}</span><small>{product.tag}</small></div><div className="demo-product-body"><small>{product.category}</small><strong>{product.title}</strong><p>{product.detail}</p><div className="demo-product-price"><b>$ {product.price}</b>{selectedStage>=4?<button onClick={()=>toggleSelection(product.id)} className={selected.includes(product.id)?'chosen':''}>{selected.includes(product.id)?'✓ Añadido':'+ '+site.select}</button>:<span className="demo-coming">En construcción</span>}</div></div></div>)}{filteredProducts.length===0&&<p className="demo-empty">No encontramos coincidencias. Prueba otra búsqueda.</p>}</div>
         </div>}
        {selectedStage<2&&<div className="demo-placeholder"><span>◌</span><p>El catálogo se desbloquea en la etapa «Oferta».</p></div>}
        {selectedStage>=5&&<div className="demo-feedback"><div><span className="demo-overline">VERSIÓN BETA</span><h3>¿Qué te parece esta experiencia?</h3><p>Tu opinión ayuda a seguir mejorando.</p></div><div><button onClick={()=>setFeedback('¡Gracias! Tomamos nota de tu valoración positiva.')}>★ Me gusta</button><button onClick={()=>setFeedback('Gracias. Revisaremos cómo mejorar esta pantalla.')}>✎ Puede mejorar</button></div>{feedback&&<small role="status">{feedback}</small>}</div>}
        </>}
        <div className="demo-footer">© {site.name} · Demo visual e interactiva · No procesa pedidos, pagos ni reservas reales</div>
       </>}
      </div>
    </div>
    {notice&&<div className="demo-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Cerrar aviso">✕</button></div>}
    {selectedStage>=4&&selected.length>0&&<button className="demo-floating-cart" onClick={()=>setShowCheckout(true)}>◈ {site.fave} · {selected.length} seleccionados <span>Continuar ↗</span></button>}
    {showCheckout&&<div className="demo-modal-cover" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCheckout(false)}}><div className="demo-modal" role="dialog" aria-modal="true" aria-label="Confirmar selección visual"><button className="demo-close" aria-label="Cerrar" onClick={()=>setShowCheckout(false)}>✕</button><span className="demo-overline">SIMULACIÓN — SIN TRANSACCIÓN REAL</span><h3>{site.fave}</h3><p>{selected.length?selected.length+' elemento(s) elegido(s).':'Aún no has seleccionado nada.'}</p><input value={visitorName} onChange={e=>setVisitorName(e.target.value)} placeholder="Tu nombre" aria-label="Nombre para la demostración"/><button disabled={!selected.length} className="demo-confirm" onClick={commitAction}>Confirmar demostración →</button><small>Esta acción solo funciona dentro del videojuego.</small>{notice&&<small role="alert">{notice}</small>}</div></div>}
    <div className="studio-browser-footer"><div><span className="studio-status-dot"/> <b>{current.name}</b> · {current.detail}</div><span>{completed} / 7 versiones desbloqueadas</span></div>
   </div>
  </div>
  <div className="studio-footnote"><span>✦ CÓMO FUNCIONA</span><p>El prototipo es una página React real dentro del juego. Las funciones aparecen por etapas conforme completas misiones. Puedes explorar versiones anteriores, buscar, filtrar y probar solicitudes simuladas; no hay backend ni agentes generando código en tiempo real.</p></div>
 </section>;
}
