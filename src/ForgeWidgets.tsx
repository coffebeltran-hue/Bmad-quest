import {useState} from 'react';
import type {Card,BlackJackState} from './blackjack';
import {handScore,hitCard,nextRound,standCards,startBlackjack} from './blackjack';
import './forge.css';
function PlayingCard({card,hidden=false}:{card?:Card;hidden?:boolean}){
 return <div className={'play-card '+(hidden?'back':'face')+' '+(card?.suit==='♥'||card?.suit==='♦'?'red':'')} aria-label={hidden?'Carta oculta':card?card.rank+' de '+card.suit:'Carta'}>
  {hidden?<div className="card-logo">✦<small>BMAD</small></div>:<><div className="card-corner">{card?.rank}<span>{card?.suit}</span></div><div className="card-center">{card?.suit}</div><div className="card-corner reverse">{card?.rank}<span>{card?.suit}</span></div></>}
 </div>;
}
export function BlackjackGame(){
 const [game,setGame]=useState<BlackJackState>(()=>startBlackjack());
 const revealed=game.outcome!=='playing'||game.standing;
 const pending=game.outcome==='playing';
 const value=revealed?handScore(game.dealer):handScore(game.dealer.slice(0,1));
 const result=game.outcome==='win'?'VICTORIA':game.outcome==='lose'?'DERROTA':game.outcome==='push'?'EMPATE':'TU TURNO';
 return <div className="casino-shell">
 <div className="casino-top"><div><span className="casino-live">● MESA ABIERTA</span><strong>BLACKJACK <em>ARENA</em></strong><small>CRUPIER VIRTUAL · SOLO FICHAS DE JUEGO</small></div><div className="casino-score"><span>RONDA {game.round}</span><b>{game.chips}<small> FICHAS</small></b></div></div>
 <div className="casino-table"><div className="wood-rim"><div className="felt">
  <div className="felt-lines"/><div className="table-halo"/>
  <div className="dealer-position"><span className="hand-tag">◈ CRUPIER</span><span className="hand-value">{revealed?value:value+' + ?'}</span></div>
  <div className="card-hand dealer-hand">{game.dealer.map((card,i)=><PlayingCard key={game.round+'d'+i} card={card} hidden={i===1&&!revealed}/>)}</div>
  <div className="table-center-copy"><span>EL OBJETIVO ES 21</span><strong>✦ 21 ✦</strong><small>LA BANCA SE PLANTA EN 17</small></div>
  <div className="arc-line"/>
  <div className="player-position"><span className="hand-tag">◉ JUGADOR</span><span className="hand-value">{handScore(game.player)}</span></div>
  <div className="card-hand player-hand">{game.player.map((card,i)=><PlayingCard key={game.round+'p'+i} card={card}/>)}</div>
  <div className="casino-chips"><i>5</i><i>10</i><i>25</i><i>50</i></div>
 </div></div></div>
 <div className={'casino-status '+(game.outcome==='win'?'win':game.outcome==='lose'?'loss':'')}>
   <span className="status-medal">{game.outcome==='win'?'★':game.outcome==='lose'?'✕':game.outcome==='push'?'＝':'♠'}</span>
   <div><strong>{result}</strong><p>{game.message}</p></div><span className="status-kind">PUNTOS {handScore(game.player)} / 21</span>
 </div>
 <div className="casino-buttons"><button disabled={!pending} onClick={()=>setGame(g=>hitCard(g))} className="casino-hit"><b>+</b> PEDIR CARTA</button><button disabled={!pending} onClick={()=>setGame(g=>standCards(g))} className="casino-stand">✋ PLANTARSE</button><button disabled={pending} onClick={()=>setGame(g=>nextRound(g))} className="casino-deal">↻ NUEVA RONDA</button></div>
 <div className="casino-note">Fichas virtuales de puntuación, sin apuestas monetarias, premios ni retiros. No afectan tus créditos BMAD.</div>
 </div>;
}
const QUESTIONS=[
 {q:'¿Qué planeta es conocido como el planeta rojo?',answers:['Mercurio','Marte','Saturno','Neptuno'],correct:1},
 {q:'¿Cuánto es 9 × 7?',answers:['56','72','63','64'],correct:2},
 {q:'¿Qué se necesita antes de escribir software de calidad?',answers:['Una hipótesis clara','Solo un logo','Más anuncios','Ignorar errores'],correct:0},
 {q:'¿Cuál es el océano más grande?',answers:['Índico','Ártico','Atlántico','Pacífico'],correct:3},
 {q:'¿Qué significa MVP en desarrollo?',answers:['Máximo valor posible','Producto mínimo viable','Modelo visual premium','Máquina virtual portátil'],correct:1},
];
export function QuizGame({prompt}:{prompt:string}){
 const [index,setIndex]=useState(0),[answer,setAnswer]=useState<number|null>(null),[points,setPoints]=useState(0);
 const finished=index>=QUESTIONS.length;
 const question=QUESTIONS[index];
 return <div className="mini-app quiz-app"><div className="mini-app-top"><span>◉ QUIZ ARENA</span><span>{finished?'COMPLETADO':(index+1)+' / '+QUESTIONS.length} · {points} PTS</span></div>
 {finished?<div className="quiz-finish"><span>🏆</span><h2>Desafío terminado</h2><p>Respondiste {points} de {QUESTIONS.length} correctamente.</p><button onClick={()=>{setIndex(0);setPoints(0);setAnswer(null)}}>↻ Volver a jugar</button></div>:<><span className="quiz-prompt">PREGUNTA {index+1} · {prompt.slice(0,55)}</span><h2>{question.q}</h2><div className="quiz-answers">{question.answers.map((text,i)=><button className={answer!==null?(i===question.correct?'right':i===answer?'wrong':''):''} disabled={answer!==null} onClick={()=>{setAnswer(i);if(i===question.correct)setPoints(v=>v+1)}} key={i}><span>{String.fromCharCode(65+i)}</span>{text}</button>)}</div>{answer!==null&&<div className="quiz-next"><p>{answer===question.correct?'¡Correcto!':'La respuesta correcta era: '+question.answers[question.correct]}</p><button onClick={()=>{setIndex(i=>i+1);setAnswer(null)}}>Siguiente →</button></div>}</>}
 </div>;
}
type Task={id:number;label:string;done:boolean;priority:boolean};
export function TasksApp(){
 const [list,setList]=useState<Task[]>([{id:1,label:'Definir el objetivo del producto',done:false,priority:true},{id:2,label:'Diseñar primera pantalla',done:false,priority:false}]);
 const [input,setInput]=useState(''),[filter,setFilter]=useState<'all'|'open'|'done'>('all');
 const shown=list.filter(item=>filter==='all'||(filter==='done'?item.done:!item.done));
 return <div className="mini-app tasks-app"><div className="mini-app-top"><span>◆ MI ESPACIO DE TRABAJO</span><span>{list.filter(t=>t.done).length} / {list.length} LISTAS</span></div><h2>Haz que suceda.</h2><p>Organiza tu día, prioriza y marca el progreso.</p><form onSubmit={e=>{e.preventDefault();if(!input.trim())return;setList(s=>[...s,{id:Math.max(0,...s.map(t=>t.id))+1,label:input.trim().slice(0,100),done:false,priority:false}]);setInput('')}} className="task-form"><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Nueva tarea..." maxLength={100}/><button type="submit">+ Añadir</button></form><div className="task-filters">{(['all','open','done'] as const).map(f=><button className={filter===f?'active':''} key={f} onClick={()=>setFilter(f)}>{f==='all'?'Todas':f==='open'?'Pendientes':'Completadas'}</button>)}</div><div className="task-list">{shown.map(t=><div className="task-row" key={t.id}><button aria-label={t.done?'Reabrir tarea':'Completar tarea'} className={'task-check '+(t.done?'checked':'')} onClick={()=>setList(l=>l.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>{t.done?'✓':'○'}</button><span className={t.done?'done':''}>{t.label}</span><button title="Alternar prioridad" className={t.priority?'priority':''} onClick={()=>setList(l=>l.map(x=>x.id===t.id?{...x,priority:!x.priority}:x))}>★</button><button onClick={()=>setList(l=>l.filter(x=>x.id!==t.id))} aria-label="Eliminar tarea">✕</button></div>)}{!shown.length&&<p>Sin tareas en esta sección.</p>}</div></div>;
}
type Mark='X'|'O'|null;
function win(b:Mark[]):Mark{for(const [a,c,d] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]])if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return null}
export function TicTacToeGame(){
 const [board,setBoard]=useState<Mark[]>(Array(9).fill(null));
 const result=win(board),draw=!result&&board.every(Boolean);
 function pick(index:number){
   if(board[index]||result||draw)return;
   const b=board.slice();b[index]='X';
   if(!win(b)&&b.some(x=>!x)){
     const options=b.map((value,i)=>value===null?i:-1).filter(i=>i>=0);
     const winning=options.find(i=>{const candidate=b.slice();candidate[i]='O';return win(candidate)==='O'});
     const blocking=options.find(i=>{const candidate=b.slice();candidate[i]='X';return win(candidate)==='X'});
     const choice=winning??blocking??(b[4]===null?4:options[0]);
     if(choice!==undefined)b[choice]='O';
   }
   setBoard(b);
 }
 return <div className="mini-app ttt-app"><div className="mini-app-top"><span>✦ TRIQUE ARCADE</span><span>JUGADOR VS BOT</span></div><h2>{result?result==='X'?'¡Ganaste!':'El bot ganó':draw?'¡Empate!':'Tu turno: X'}</h2><p>Un rival virtual bloquea jugadas y busca ganar.</p><div className="ttt-grid">{board.map((v,i)=><button key={i} className={v==='X'?'x':v==='O'?'o':''} onClick={()=>pick(i)} disabled={!!v||!!result||draw}>{v||'·'}</button>)}</div><button className="app-primary" onClick={()=>setBoard(Array(9).fill(null))}>↻ Nueva partida</button></div>;
}
export function BookingApp({title}:{title:string}){
 const services=['Sesión inicial','Servicio estándar','Atención premium'];
 const times=['09:00','10:30','12:00','14:00','15:30','17:00'];
 const [service,setService]=useState(0),[time,setTime]=useState(''),[name,setName]=useState(''),[saved,setSaved]=useState<string[]>([]);
 const [message,setMessage]=useState('');
 function reserve(){if(!name.trim()||!time){setMessage('Escribe tu nombre y selecciona un horario.');return}setSaved(s=>[...s,time]);setMessage('¡Listo! Reserva visual a nombre de '+name.trim()+'.');setTime('')}
 return <div className="mini-app booking-app"><div className="mini-app-top"><span>◈ BOOKING STUDIO</span><span>AGENDA INTERACTIVA</span></div><h2>{title}</h2><p>Encuentra el horario que mejor se adapte a ti.</p><div className="booking-card"><label>Servicio<select value={service} onChange={e=>{setService(Number(e.target.value));setMessage('')}}>{services.map((s,i)=><option value={i} key={s}>{s}</option>)}</select></label><label>Fecha de demostración<input type="date" value="2026-11-02" readOnly/></label><div className="booking-time">Horario disponible<div>{times.map(t=><button key={t} className={time===t?'picked':''} disabled={saved.includes(t)} onClick={()=>setTime(t)}>{saved.includes(t)?'Reservado':t}</button>)}</div></div><label>Nombre<input placeholder="Tu nombre" value={name} onChange={e=>setName(e.target.value)}/></label><button className="app-primary" onClick={reserve}>Confirmar reserva visual →</button>{message&&<p role="status">{message}</p>}</div></div>;
}
export function ShopApp({title}:{title:string}){
 const items:[string,string,number,string][]=[['Aurora','Edición premium',39000,'✦'],['Órbita','Producto popular',29000,'◎'],['Nébula','Edición especial',54000,'❖'],['Cosmos','Paquete básico',19000,'◇']];
 const [q,setQ]=useState(''),[cart,setCart]=useState<number[]>([]),[ordered,setOrdered]=useState(false);
 const visible=items.map((item,i)=>({item,i})).filter(v=>v.item[0].toLowerCase().includes(q.toLowerCase()));
 const sum=cart.reduce((s,i)=>s+items[i][2],0);
 return <div className="mini-app shop-app"><div className="mini-app-top"><span>✦ MARKET STUDIO</span><span>{cart.length} EN CARRITO</span></div><h2>{title}</h2><p>Explora productos y construye una compra ficticia.</p><input placeholder="Buscar productos..." value={q} onChange={e=>setQ(e.target.value)}/><div className="shop-grid">{visible.map(({item,i})=><div key={i} className="shop-card"><div>{item[3]}</div><strong>{item[0]}</strong><small>{item[1]}</small><b>$ {item[2].toLocaleString('es-CO')}</b><button onClick={()=>{setCart(c=>[...c,i]);setOrdered(false)}}>+ Añadir</button></div>)}</div><div className="shop-total"><strong>Total visual: $ {sum.toLocaleString('es-CO')}</strong><button disabled={!cart.length} onClick={()=>{setCart([]);setOrdered(true)}}>Confirmar carrito →</button></div>{ordered&&<p role="status">¡Pedido simulado! No se cobró dinero real.</p>}</div>;
}
