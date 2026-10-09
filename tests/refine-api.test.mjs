import test from 'node:test';
import assert from 'node:assert/strict';
import {POST,OPTIONS} from '../api/refine.ts';
const former={key:process.env.OPENAI_API_KEY,beta:process.env.FORGE_BETA_CODE};
const app={title:'Juego de ruleta',summary:'Rueda animada.',features:['Girar rueda'],files:{html:'<div id="wheel"><button id="spin">Girar</button></div>',css:'#wheel{color:red}',javascript:'document.querySelector("#spin").onclick=()=>alert("girar")'}};
const make=(body,code='test-beta',origin='https://coffebeltran-hue.github.io')=>new Request('https://demo.vercel.app/api/refine',{method:'POST',headers:{origin,'content-type':'application/json','x-forge-beta-code':code},body:JSON.stringify(body)});
test('requires authorization and rejects untrusted origins',async()=>{
 delete process.env.OPENAI_API_KEY;delete process.env.FORGE_BETA_CODE;
 assert.equal((await POST(make({app,instruction:'Agrega historial de giros'}))).status,503);
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='test-beta';
 assert.equal((await POST(make({app,instruction:'Agrega historial de giros'},'bad'))).status,401);
 assert.equal((await POST(make({app,instruction:'Agrega historial de giros'},'test-beta','https://evil.example'))).status,403);
 assert.equal(OPTIONS(new Request('https://demo.vercel.app/api/refine',{method:'OPTIONS',headers:{origin:'https://coffebeltran-hue.github.io'}})).status,204);
});
test('passes original files and modification instructions to model',async()=>{
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='test-beta';
 const previous=globalThis.fetch;
 let saw=false;
 globalThis.fetch=async(_url,options)=>{
  const message=JSON.parse(options.body).input[0].content[0].text;
  saw=message.includes('historial de giros')&&message.includes('#wheel');
  return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify({...app,files:{...app.files,html:app.files.html+'<div id="history"></div>'}})}]}]});
 };
 try{
  const response=await POST(make({app,instruction:'Agrega historial de giros'}));
  assert.equal(response.status,200);assert.ok(saw);
  const body=await response.json();
  assert.equal(body.recreated,false);assert.match(body.generated.files.html,/history/);
 }finally{globalThis.fetch=previous}
});
test('recreates prebuilt template with description and change',async()=>{
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='test-beta';
 const previous=globalThis.fetch;
 globalThis.fetch=async()=>Response.json({output:[{content:[{type:'output_text',text:JSON.stringify(app)}]}]});
 try{
  const response=await POST(make({original:{title:'Roulette Royal',prompt:'Ruleta de casino',kind:'roulette',summary:'Apuestas ficticias'},instruction:'Agrega apuestas a docenas'}));
  const body=await response.json();assert.equal(response.status,200);assert.equal(body.recreated,true);
 }finally{globalThis.fetch=previous}
});
test('rejects invalid source without calling paid model',async()=>{
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='test-beta';
 const previous=globalThis.fetch;let called=0;globalThis.fetch=async()=>{called++;return Response.json({})};
 try{
  assert.equal((await POST(make({app:{...app,files:{...app.files,html:'<iframe></iframe>'}},instruction:'Agregar puntuación'}))).status,422);
  assert.equal((await POST(make({app,instruction:'corto'}))).status,400);
  assert.equal(called,0);
 }finally{globalThis.fetch=previous}
});
test.after(()=>{
 if(former.key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=former.key;
 if(former.beta===undefined)delete process.env.FORGE_BETA_CODE;else process.env.FORGE_BETA_CODE=former.beta;
});
