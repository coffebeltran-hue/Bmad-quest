import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretIdea} from '../src/forge-engine.ts';
import {BUILD_STAGES,buildForgeScript,forgeFrame} from '../src/forge-replay.ts';
const prompts=[
 'Quiero jugar blackjack contra un crupier virtual',
 'Quiero una ruleta de casino con fichas virtuales',
 'Crea un juego de tres en raya contra la computadora',
 'Necesito una trivia con preguntas y respuestas',
 'Quiero una lista de tareas pendientes',
 'Necesito una agenda para reservar citas',
 'Quiero una tienda con productos y carrito'
];
test('all supported instruction-app engines receive distinct seven-step build sequences',()=>{
 for(const prompt of prompts){
  const project=interpretIdea(prompt).project;
  assert.ok(project, prompt);
  const messages=buildForgeScript(project);
  assert.equal(messages.length,21);
  assert.deepEqual([...new Set(messages.map(m=>m.stage))],[0,1,2,3,4,5,6]);
  assert.equal(forgeFrame(messages,0).stage,0);
  assert.equal(forgeFrame(messages,6).stage,1);
  assert.equal(forgeFrame(messages,9).stage,2);
  assert.equal(forgeFrame(messages,21).stage,6);
  assert.equal(forgeFrame(messages,21).complete,true);
  assert.equal(BUILD_STAGES.length,7);
  assert.ok(messages.every(m=>m.content&&m.task&&m.file&&m.speaker));
 }
});
test('replaying never changes the stored mission decisions',()=>{
 const project=interpretIdea(prompts[0]).project;
 assert.ok(project);
 const log=Object.freeze(['Misión: buena decisión']);
 const history=[{id:'m-0-choice',speaker:'Fundador',content:'Elegí prueba.',phase:'UX',kind:'decision'}];
 const s=JSON.stringify({log,history});
 const messages=buildForgeScript(project,history);
 const frame=forgeFrame(messages,1);
 assert.equal(frame.message?.speaker,'Mary');
 assert.equal(forgeFrame(messages,999).visible,messages.length);
 assert.equal(forgeFrame(messages,999).stage,6);
 assert.equal(JSON.stringify({log,history}),s);
 assert.equal(messages[messages.length-1].id,'history-m-0-choice');
});

test('a custom instruction also receives a full synchronized build transcript',()=>{
 const project=interpretIdea('Quiero una app para registrar las visitas al veterinario de mis mascotas').project;
 assert.ok(project);
 assert.equal(project.kind,'custom');
 const messages=buildForgeScript(project);
 assert.equal(messages.length,21);
 assert.equal(forgeFrame(messages,21).complete,true);
 assert.ok(messages.some(m=>m.content.includes(project.title)));
});
