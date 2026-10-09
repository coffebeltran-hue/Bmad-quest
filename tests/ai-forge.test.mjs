import test from 'node:test';
import assert from 'node:assert/strict';
import {POST,OPTIONS} from '../api/forge.ts';

const oldKey=process.env.OPENAI_API_KEY,oldCode=process.env.FORGE_BETA_CODE;
const make=(prompt,code='beta-test',origin='https://coffebeltran-hue.github.io')=>new Request('https://demo.vercel.app/api/forge',{method:'POST',headers:{origin,'content-type':'application/json','x-forge-beta-code':code},body:JSON.stringify({prompt})});

test('AI endpoint is unavailable without server credentials and never publishes secrets',async()=>{
 delete process.env.OPENAI_API_KEY;delete process.env.FORGE_BETA_CODE;
 const r=await POST(make('Crea una agenda para mis visitas'));
 assert.equal(r.status,503);
 const s=await r.text();assert.ok(!s.includes('beta-test'));
});
test('AI endpoint rejects untrusted origins and unauthorized users before calls',async()=>{
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='beta-test';
 assert.equal((await POST(make('Crea una app de notas','wrong'))).status,401);
 assert.equal((await POST(make('Crea una app de notas','beta-test','https://malicioso.example'))).status,403);
 const opt=OPTIONS(new Request('https://demo.vercel.app/api/forge',{method:'OPTIONS',headers:{origin:'https://coffebeltran-hue.github.io'}}));
 assert.equal(opt.status,204);
});
test('valid model JSON gets parsed and capabilities enforced',async()=>{
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='beta-test';
 const original=globalThis.fetch;
 let calls=0;
 globalThis.fetch=async()=>{calls++;return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({
  mode:'journal',title:'Diario de viajes',description:'arbitrary',entity:'viaje',action:'Guardar viaje',fieldLabel:'Contenido',tags:['Todos'],primaryColor:'#8866aa',capabilities:['Pagos con tarjeta','Control GPS'],caveat:'El GPS no está incluido.'
 })}]}]})};
 try{
  const r=await POST(make('Quiero un diario para recordar mis viajes'));
  const payload=await r.json();
  assert.equal(r.status,200);assert.equal(calls,1);
  assert.equal(payload.project.kind,'custom');assert.equal(payload.project.source,'ai');
  assert.ok(!payload.project.blueprint.capabilities.includes('Pagos con tarjeta'));
  assert.ok(payload.project.blueprint.capabilities.includes('Escribir, editar y borrar notas'));
 }finally{globalThis.fetch=original}
});
test.after(()=>{
 if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;
 if(oldCode===undefined)delete process.env.FORGE_BETA_CODE;else process.env.FORGE_BETA_CODE=oldCode;
});

test('AI endpoint chooses the specialized roulette renderer instead of records or generic game',async()=>{
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='beta-test';
 const previous=globalThis.fetch;
 globalThis.fetch=async()=>Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({
  mode:'game',title:'Juego de ruleta',description:'Una ruleta virtual',entity:'giro',
  action:'Girar',fieldLabel:'Resultado',tags:['Todos'],primaryColor:'#116b4c',
  capabilities:['Puntos','Rondas'],caveat:'Sin apuestas de dinero real.'
 })}]}]});
 try{
  const res=await POST(make('Quiero una app como la ruleta en los casinos'));
  const parsed=await res.json();
  assert.equal(res.status,200);
  assert.equal(parsed.project.kind,'roulette');
  assert.equal(parsed.project.source,'ai');
  assert.equal(parsed.project.blueprint,undefined);
 }finally{globalThis.fetch=previous}
});
test('AI endpoint rejects unsupported casino mechanics before model costs',async()=>{
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='beta-test';
 const previous=globalThis.fetch;
 let called=0;
 globalThis.fetch=async()=>{called++;return Response.json({})};
 try{
  const res=await POST(make('Quiero un casino con máquinas tragamonedas'));
  assert.equal(res.status,422);
  assert.equal(called,0);
 }finally{globalThis.fetch=previous}
});
