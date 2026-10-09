import test from 'node:test';
import assert from 'node:assert/strict';
import {POST,OPTIONS} from '../api/generate.ts';
const saved={key:process.env.OPENAI_API_KEY,beta:process.env.FORGE_BETA_CODE};
const req=(prompt,code='test-beta',origin='https://coffebeltran-hue.github.io')=>new Request('https://demo.vercel.app/api/generate',{method:'POST',headers:{origin,'content-type':'application/json','x-forge-beta-code':code},body:JSON.stringify({prompt})});
const example={title:'Carreras Pixel',summary:'Mini juego de carreras',features:['Mover un automóvil','Ganar puntos'],files:{html:'<main><h1>Carreras</h1><button id="go">Acelerar</button></main>',css:'body{background:black;color:yellow}',javascript:'document.querySelector("#go").addEventListener("click",()=>{document.querySelector("h1").textContent="Vuela"})'}};
test('secretless and unauthenticated calls do not invoke paid model',async()=>{
 delete process.env.OPENAI_API_KEY;delete process.env.FORGE_BETA_CODE;
 assert.equal((await POST(req('Quiero un juego de carreras'))).status,503);
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='test-beta';
 assert.equal((await POST(req('Quiero un juego de carreras','bad'))).status,401);
 assert.equal((await POST(req('Quiero un juego de carreras','test-beta','https://evil.example'))).status,403);
 assert.equal(OPTIONS(new Request('https://demo.vercel.app/api/generate',{method:'OPTIONS',headers:{origin:'https://coffebeltran-hue.github.io'}})).status,204);
});
test('AI request generates distinct executable HTML CSS JS, not prebuilt form',async()=>{
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='test-beta';
 const orig=globalThis.fetch;
 let called=0;
 globalThis.fetch=async(_url,options)=>{called++;const request=JSON.parse(options.body);assert.ok(request.input[0].content[0].text.includes('carreras'));return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify(example)}]}]})};
 try{
  const r=await POST(req('Quiero un juego de carreras con obstáculos'));
  assert.equal(r.status,200);
  const data=await r.json();
  assert.equal(called,1);assert.equal(data.project.kind,'generated');assert.equal(data.project.source,'ai');
  assert.match(data.project.generated.files.javascript,/addEventListener/);
 }finally{globalThis.fetch=orig}
});
test('unsafe generated payload is rejected',async()=>{
 process.env.OPENAI_API_KEY='fake';process.env.FORGE_BETA_CODE='test-beta';
 const orig=globalThis.fetch;
 globalThis.fetch=async()=>Response.json({output:[{content:[{type:'output_text',text:JSON.stringify({...example,files:{...example.files,html:'<iframe src="https://evil.example"></iframe>'}})}]}]});
 try{assert.equal((await POST(req('Quiero un simulador de aviones'))).status,502)}finally{globalThis.fetch=orig}
});
test.after(()=>{
 if(saved.key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=saved.key;
 if(saved.beta===undefined)delete process.env.FORGE_BETA_CODE;else process.env.FORGE_BETA_CODE=saved.beta;
});
