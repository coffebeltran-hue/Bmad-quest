import {useEffect,useRef,useState} from 'react';
import {BET_AMOUNTS,STARTING_CHIPS,WHEEL_NUMBERS,randomRouletteIndex,rouletteColor,settleRoulette,validRouletteBet,wheelIndexFor} from './roulette';
import type {RouletteBet,RouletteResult} from './roulette';
import './roulette.css';

function polar(radius:number,angle:number){
 const radians=angle*Math.PI/180;
 return {x:180+Math.cos(radians)*radius,y:180+Math.sin(radians)*radius};
}
function sector(index:number){
 const d=360/WHEEL_NUMBERS.length;
 const start=-90+index*d, end=start+d;
 const a=polar(164,start),b=polar(164,end);
 return 'M 180 180 L '+a.x+' '+a.y+' A 164 164 0 0 1 '+b.x+' '+b.y+' Z';
}
const label=(bet:RouletteBet)=>{
 switch(bet.type){case 'red':return 'Rojo';case 'black':return 'Negro';case 'even':return 'Par';case 'odd':return 'Impar';default:return 'Número '+String(bet.number??0)}
};
export default function RouletteGame(){
 const [chips,setChips]=useState(STARTING_CHIPS);
 const [stake,setStake]=useState<number>(10);
 const [bet,setBet]=useState<RouletteBet>({type:'red'});
 const [rotation,setRotation]=useState(0);
 const [spinning,setSpinning]=useState(false);
 const [result,setResult]=useState<RouletteResult|null>(null);
 const [history,setHistory]=useState<number[]>([]);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 const canSpin=!spinning&&validRouletteBet(bet)&&stake<=chips;
 function spin(){
  if(!canSpin)return;
  const number=WHEEL_NUMBERS[randomRouletteIndex()];
  const settled=settleRoulette(chips,bet,stake,number);
  if(!settled)return;
  setSpinning(true);setResult(null);
  // Rotate the selected slice under the top, fixed ball marker.
  const idx=wheelIndexFor(number),slice=360/WHEEL_NUMBERS.length;
  setRotation(prev=>Math.ceil(prev/360)*360+7*360-(idx+.5)*slice);
  if(timer.current)clearTimeout(timer.current);
  timer.current=setTimeout(()=>{
   setChips(settled.chips);setResult(settled);setHistory(h=>[number,...h].slice(0,8));setSpinning(false);timer.current=null;
  },3900);
 }
 function choose(type:RouletteBet['type']){
  if(!spinning)setBet(type==='number'?{type,number:bet.number??17}:{type});
 }
 return <div className="roulette-app">
  <div className="roulette-topbar"><div><span className="roulette-live">● MESA DE DEMOSTRACIÓN</span><h2>ROULETTE <em>ROYAL</em></h2><small>RULETA EUROPEA · 0–36 · FICHAS FICTICIAS</small></div><div className="roulette-balance"><small>FICHAS DE JUEGO</small><strong>{chips}<span> ●</span></strong></div></div>
  <div className="roulette-felt">
   <div className="roulette-table-heading"><span>✦ BMAD CASINO ARCADE ✦</span><small>CASINO SIMULADO · SIN DINERO REAL</small></div>
   <div className="roulette-wheel-frame">
    <div className="roulette-pointer" aria-hidden="true">▼</div>
    <svg className="roulette-wheel" viewBox="0 0 360 360" role="img" aria-label={'Ruleta europea con 37 números; '+(result?'último resultado '+result.winningNumber:'lista para girar')} style={{transform:'rotate('+rotation+'deg)',transition:spinning?'transform 3.8s cubic-bezier(.12,.7,.13,1)':'none'}}>
     <circle cx="180" cy="180" r="179" fill="#ad7934" stroke="#e4c383" strokeWidth="2"/>
     <circle cx="180" cy="180" r="169" fill="#0c201f" stroke="#0c1016" strokeWidth="7"/>
     {WHEEL_NUMBERS.map((number,i)=>{
      const pos=polar(138,-90+(i+.5)*360/WHEEL_NUMBERS.length);
      return <g key={number}><path d={sector(i)} fill={rouletteColor(number)==='red'?'#bd253c':rouletteColor(number)==='black'?'#172333':'#16906c'} stroke="#efd49b" strokeWidth="1.1"/><text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontFamily="Arial,sans-serif" fill="white" fontSize="13" fontWeight="bold" transform={'rotate('+((i+.5)*360/WHEEL_NUMBERS.length)+' '+pos.x+' '+pos.y+')'}>{number}</text></g>
     })}
     <circle cx="180" cy="180" r="114" fill="#0d623f" stroke="#e0bc72" strokeWidth="6"/>
     <circle cx="180" cy="180" r="95" fill="url(#felt-gold-grad)" stroke="#043e30" strokeWidth="3"/>
     <defs><radialGradient id="felt-gold-grad"><stop offset="0%" stopColor="#eacb83"/><stop offset="72%" stopColor="#b48843"/><stop offset="100%" stopColor="#795626"/></radialGradient></defs>
     <circle cx="180" cy="180" r="69" fill="#145b46" stroke="#eed7a7" strokeWidth="3"/>
     <text x="180" y="172" fill="#f8e3ac" textAnchor="middle" fontSize="24" fontFamily="Georgia,serif" fontWeight="bold">BMAD</text>
     <text x="180" y="195" fill="#dfc68e" textAnchor="middle" fontSize="10" letterSpacing="2">ROULETTE</text>
     <circle cx="180" cy="180" r="9" fill="#e8cd83" stroke="#846025" strokeWidth="3"/>
    </svg>
   </div>
   <div className="roulette-result-slot" role="status">
    {spinning?<><span className="roulette-loading"/> LA BOLA ESTÁ GIRANDO...</>:
     result?<><span className={'roulette-winning-ball '+result.color}>{result.winningNumber}</span><strong>{result.won?'¡ACERTASTE!':'SIN PREMIO ESTA VEZ'}</strong><span>{result.won?'+'+result.net:result.net} fichas</span></>:
     <><span>◈</span> ELIGE TU APUESTA Y HAZ GIRAR LA RULETA</>}
   </div>
  </div>
  <section className="roulette-controls">
   <div className="roulette-control-heading"><div><small>PASO 01</small><strong>¿A qué quieres jugar?</strong></div><span>PREMIO POR NÚMERO 35:1 · SIMPLE 1:1</span></div>
   <div className="roulette-bet-buttons">
    <button className={'roulette-bet red '+(bet.type==='red'?'selected':'')} disabled={spinning} onClick={()=>choose('red')}>◆ ROJO</button>
    <button className={'roulette-bet black '+(bet.type==='black'?'selected':'')} disabled={spinning} onClick={()=>choose('black')}>◆ NEGRO</button>
    <button className={'roulette-bet '+(bet.type==='even'?'selected':'')} disabled={spinning} onClick={()=>choose('even')}>PAR</button>
    <button className={'roulette-bet '+(bet.type==='odd'?'selected':'')} disabled={spinning} onClick={()=>choose('odd')}>IMPAR</button>
    <button className={'roulette-bet '+(bet.type==='number'?'selected':'')} disabled={spinning} onClick={()=>choose('number')}>NÚMERO</button>
   </div>
   {bet.type==='number'&&<label className="roulette-number-picker">Número seleccionado
     <select disabled={spinning} value={bet.number??17} onChange={e=>setBet({type:'number',number:Number(e.target.value)})}>
      {Array.from({length:37},(_,i)=><option value={i} key={i}>{i} · {rouletteColor(i)==='red'?'Rojo':rouletteColor(i)==='black'?'Negro':'Verde'}</option>)}
     </select>
   </label>}
   <div className="roulette-control-heading"><div><small>PASO 02</small><strong>Selecciona tus fichas</strong></div><span>FICHAS SIN VALOR ECONÓMICO</span></div>
   <div className="roulette-stakes">{BET_AMOUNTS.map((amount,i)=><button key={amount} disabled={spinning||amount>chips} className={'roulette-stake chip-'+i+(stake===amount?' active':'')} onClick={()=>setStake(amount)}>{amount}</button>)}</div>
   <div className="roulette-summary"><span>Selección: <b>{label(bet)}</b></span><span>Valor: <b>{stake} fichas</b></span><span>Saldo: <b>{chips}</b></span></div>
   <button className="roulette-spin-button" disabled={!canSpin} onClick={spin}>{spinning?'◌ GIRANDO RULETA...':'✦ GIRAR RULETA →'}</button>
   {!spinning&&chips<BET_AMOUNTS[0]&&<button className="roulette-reset" onClick={()=>{setChips(STARTING_CHIPS);setResult(null)}}>↻ Reiniciar fichas virtuales gratis</button>}
   {history.length>0&&<div className="roulette-history"><strong>ÚLTIMOS RESULTADOS</strong><div>{history.map((number,i)=><span key={i+'-'+number} className={'roulette-winning-ball '+rouletteColor(number)}>{number}</span>)}</div></div>}
   <p className="roulette-disclaimer">Demo lúdica de ruleta europea. Las fichas son puntos ficticios, no se compran, retiran ni canjean por dinero. No hay apuestas ni servicios de casino reales. Este juego no modifica los créditos de BMAD Quest.</p>
  </section>
 </div>;
}
