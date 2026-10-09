import {useEffect,useMemo,useState} from 'react';
import type {UniversalBlueprint} from './universal-engine';
import './universal.css';

type Item={id:string;text:string;details:string;status:boolean;value:number;created:number};
type Props={blueprint:UniversalBlueprint;disabled?:boolean};
const allowedStore=(value:unknown):Item[]=>{
 if(!Array.isArray(value))return [];
 return value.filter(x=>x&&typeof x.id==='string'&&typeof x.text==='string'&&x.text.length<301&&typeof x.details==='string'&&typeof x.status==='boolean'&&typeof x.value==='number'&&Number.isFinite(x.value)&&typeof x.created==='number').slice(0,100);
};
function useItems(blueprint:UniversalBlueprint){
 const storageKey='bmad-universal-'+blueprint.description.toLowerCase().slice(0,130);
 const [items,setItems]=useState<Item[]>(()=>{
  try{return allowedStore(JSON.parse(localStorage.getItem(storageKey)||'[]'))}catch{return []}
 });
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(items))}catch{ /* private mode or quota */ }},[items,storageKey]);
 return [items,setItems] as const;
}
export default function UniversalApp({blueprint,disabled=false}:Props){
 const [items,setItems]=useItems(blueprint);
 const [input,setInput]=useState(''),[details,setDetails]=useState(''),[number,setNumber]=useState(''),[query,setQuery]=useState(''),[filter,setFilter]=useState<'all'|'open'|'done'>('all');
 const [editing,setEditing]=useState<string|null>(null);
 const [flashIndex,setFlashIndex]=useState(0),[revealed,setRevealed]=useState(false);
 const [calcA,setCalcA]=useState('100'),[calcB,setCalcB]=useState('15'),[operator,setOperator]=useState<'+'|'-'|'×'|'÷'|'%'>('%');
 const [calcHistory,setCalcHistory]=useState<string[]>([]);
 const [seconds,setSeconds]=useState(300),[active,setActive]=useState(false),[duration,setDuration]=useState(5),[sessions,setSessions]=useState(0);
 const [score,setScore]=useState(0),[round,setRound]=useState(0),[picked,setPicked]=useState<number|null>(null);
 const total=items.reduce((n,item)=>n+item.value,0),completed=items.filter(i=>i.status).length;
 const filtered=useMemo(()=>items.filter(item=>(filter==='all'||(filter==='done'?item.status:!item.status))&&(item.text+' '+item.details).toLowerCase().includes(query.toLowerCase())),[items,filter,query]);
 useEffect(()=>{if(!active)return;if(seconds<=0){setActive(false);setSessions(n=>n+1);return}const t=window.setTimeout(()=>setSeconds(n=>Math.max(0,n-1)),1000);return()=>window.clearTimeout(t)},[active,seconds]);
 function saveItem(){
  const name=input.trim();
  if(!name)return;
  if(editing){setItems(arr=>arr.map(i=>i.id===editing?{...i,text:name.slice(0,120),details:details.slice(0,300),value:Number(number)||0}:i));setEditing(null)}
  else setItems(arr=>[{id:Date.now()+'-'+Math.random().toString(16).slice(2),text:name.slice(0,120),details:details.slice(0,300),status:false,value:Number(number)||0,created:Date.now()},...arr].slice(0,100));
  setInput('');setDetails('');setNumber('');setRevealed(false);
 }
 function startEdit(item:Item){setEditing(item.id);setInput(item.text);setDetails(item.details);setNumber(item.value?String(item.value):'')}
 function exportCSV(){
  const rows=[['Título','Detalle','Valor','Estado'],...items.map(x=>[x.text,x.details,String(x.value),x.status?'Terminado':'Pendiente'])];
  const content=rows.map(row=>row.map(s=>'"'+s.replaceAll('"','""')+'"').join(',')).join('\r\n');
  const blob=new Blob(['\uFEFF'+content],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mi-app-datos.csv';a.click();URL.revokeObjectURL(url);
 }
 const calculate=()=>{
  const a=Number(calcA),b=Number(calcB);
  if(!Number.isFinite(a)||!Number.isFinite(b))return;
  const result=operator==='+'?a+b:operator==='-'?a-b:operator==='×'?a*b:operator==='÷'?(b===0?NaN:a/b):a*b/100;
  if(!Number.isFinite(result)){setCalcHistory(h=>['No es posible dividir entre cero.',...h].slice(0,8));return}
  setCalcHistory(h=>[a+' '+operator+' '+b+' = '+Number(result.toFixed(5)),...h].slice(0,8));
 };
 const questionList=[
  {text:'¿Qué hace que una idea se convierta en producto?',answers:['Solo un logo','Resolver una necesidad real','Usar muchos colores'],right:1},
  {text:'¿Qué conviene validar antes de programar?',answers:['Los supuestos del usuario','La cantidad de anuncios','El color de la silla'],right:0},
  {text:'¿Qué representa una versión MVP?',answers:['Un prototipo útil y mínimo','Un producto sin pruebas','Una idea sin objetivos'],right:0},
  {text:'¿Qué hacemos con el feedback?',answers:['Ignorarlo','Priorizar cambios útiles','Borrar la app'],right:1},
 ];
 const challenge=questionList[round%questionList.length];
 return <div className="universal-runtime" style={{'--uni-accent':blueprint.primaryColor} as React.CSSProperties} data-mode={blueprint.mode}>
  <header className="uni-header"><span className="uni-symbol">✦</span><div><strong>{blueprint.title}</strong><small>APP PERSONALIZADA · DEMO INTERACTIVA</small></div><span className="uni-live">● LOCAL</span></header>
  <div className="uni-cover"><span className="uni-kicker">HECHA A PARTIR DE TU IDEA</span><h2>{blueprint.title}</h2><p>{blueprint.description}</p><div className="uni-capabilities">{blueprint.capabilities.slice(0,4).map(x=><span key={x}>✓ {x}</span>)}</div></div>
  {blueprint.mode==='calculator'?<section className="uni-calculator">
   <div className="uni-section-title"><span>◎</span><h3>Centro de cálculos</h3></div>
   <div className="uni-calculator-inputs"><label>Primer valor<input type="number" value={calcA} onChange={e=>setCalcA(e.target.value)} disabled={disabled}/></label><label>Operación<select value={operator} onChange={e=>setOperator(e.target.value as typeof operator)} disabled={disabled}>{['+','-','×','÷','%'].map(op=><option key={op}>{op}</option>)}</select></label><label>Segundo valor<input type="number" value={calcB} onChange={e=>setCalcB(e.target.value)} disabled={disabled}/></label></div>
   <button className="uni-primary" onClick={calculate} disabled={disabled}>Calcular resultado →</button><div className="uni-results">{calcHistory.map((h,i)=><div key={i}>{h}</div>)}{!calcHistory.length&&<p>Ingresa valores y realiza tu primer cálculo.</p>}</div>
  </section>:blueprint.mode==='timer'?<section className="uni-timer"><div className="uni-section-title"><span>◷</span><h3>Sesión de concentración</h3></div><div className="uni-timer-face">{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}<small>SESIONES TERMINADAS: {sessions}</small></div><div className="uni-timer-actions"><label>Minutos<input type="number" min={1} max={180} value={duration} onChange={e=>setDuration(Math.min(180,Math.max(1,Number(e.target.value)||1)))} disabled={disabled||active}/></label><button className="uni-primary" disabled={disabled} onClick={()=>{if(seconds===0)setSeconds(duration*60);setActive(v=>!v)}}>{active?'Ⅱ Pausar':'▷ Empezar'}</button><button disabled={disabled} onClick={()=>{setActive(false);setSeconds(duration*60)}}>↺ Reiniciar</button></div></section>:blueprint.mode==='game'?<section className="uni-game"><span className="uni-kicker">MINIJUEGO DE DECISIONES</span><h3>{challenge.text}</h3><div className="uni-game-options">{challenge.answers.map((answer,i)=><button disabled={disabled||picked!==null} className={picked!==null?(i===challenge.right?'good':i===picked?'bad':''):''} onClick={()=>{setPicked(i);if(i===challenge.right)setScore(s=>s+10)}} key={i}>{answer}</button>)}</div><div className="uni-game-status"><span>✦ PUNTOS: {score}</span><span>RETO {round+1}</span>{picked!==null&&<button disabled={disabled} onClick={()=>{setRound(i=>i+1);setPicked(null)}}>Siguiente reto ↗</button>}</div><p className="uni-limit">Juego básico ilustrativo. Las mecánicas específicas descritas en tu idea no se han generado automáticamente.</p></section>:<>
   <section className="uni-stats"><div><small>REGISTROS</small><strong>{items.length}</strong></div><div><small>{blueprint.mode==='goals'?'METAS LOGRADAS':'FINALIZADOS'}</small><strong>{completed}</strong></div><div><small>{blueprint.mode==='dashboard'?'TOTAL REGISTRADO':'EN CURSO'}</small><strong>{blueprint.mode==='dashboard'?Number(total.toFixed(1)):items.length-completed}</strong></div></section>
   <section className="uni-forms">
    <div className="uni-section-title"><span>✦</span><h3>{editing?'Editar '+blueprint.entity:blueprint.action}</h3></div>
    <form onSubmit={e=>{e.preventDefault();saveItem()}}>
     <label>{blueprint.mode==='flashcards'?'Pregunta o concepto':blueprint.mode==='journal'?'Título de la nota':'Nombre de '+blueprint.entity}<input value={input} maxLength={120} onChange={e=>setInput(e.target.value)} placeholder={'Escribe tu '+blueprint.entity+'...'} disabled={disabled}/></label>
     <label>{blueprint.mode==='flashcards'?'Respuesta':blueprint.mode==='journal'?'Entrada del diario':'Detalles'}<textarea rows={3} maxLength={300} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Agrega detalles..." disabled={disabled}/></label>
     {['dashboard','goals','records'].includes(blueprint.mode)&&<label>Valor / cantidad (opcional)<input type="number" value={number} onChange={e=>setNumber(e.target.value)} disabled={disabled}/></label>}
     <button className="uni-primary" disabled={disabled||!input.trim()} type="submit">{editing?'Guardar cambios':'✦ Crear '+blueprint.entity}</button>
     {editing&&<button type="button" onClick={()=>{setEditing(null);setInput('');setDetails('');setNumber('')}}>Cancelar edición</button>}
    </form>
   </section>
   {blueprint.mode==='flashcards'&&items.length>0&&<section className="uni-flash"><span>REPASO INTERACTIVO</span><h3>{items[flashIndex%items.length].text}</h3>{revealed?<p>{items[flashIndex%items.length].details||'Sin respuesta todavía'}</p>:<p>Intenta recordar la respuesta antes de revelarla.</p>}<div><button disabled={disabled} onClick={()=>setRevealed(v=>!v)}>{revealed?'Ocultar':'Ver respuesta'}</button><button disabled={disabled} onClick={()=>{setFlashIndex(i=>i+1);setRevealed(false)}}>Siguiente tarjeta →</button></div></section>}
   <section className="uni-list"><div className="uni-section-title"><span>▤</span><h3>{blueprint.mode==='journal'?'Mis entradas':'Mis '+blueprint.entity+'s'}</h3></div><div className="uni-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar..." aria-label="Buscar registros" disabled={disabled}/><select aria-label="Filtrar" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} disabled={disabled}><option value="all">Todos</option><option value="open">En curso</option><option value="done">Terminados</option></select><button disabled={disabled||!items.length} onClick={exportCSV}>↓ CSV</button></div><div className="uni-items">{filtered.map(item=><article className="uni-item" key={item.id}><button className={item.status?'uni-check done':'uni-check'} aria-label={item.status?'Reabrir':'Marcar terminado'} disabled={disabled} onClick={()=>setItems(a=>a.map(v=>v.id===item.id?{...v,status:!v.status}:v))}>{item.status?'✓':'○'}</button><div><strong>{item.text}</strong><p>{item.details}</p>{item.value!==0&&<small>Valor: {item.value}</small>}</div><button disabled={disabled} onClick={()=>startEdit(item)} title="Editar">✎</button><button disabled={disabled} onClick={()=>setItems(a=>a.filter(v=>v.id!==item.id))} title="Eliminar">✕</button></article>)}{!filtered.length&&<p className="uni-empty">Todavía no hay registros aquí. Añade el primero para comenzar.</p>}</div></section>
  </>}
  <footer className="uni-disclaimer"><strong>Versión funcional básica.</strong> {blueprint.caveat} Los datos se guardan en este navegador; no se conectan servicios externos.</footer>
 </div>;
}
