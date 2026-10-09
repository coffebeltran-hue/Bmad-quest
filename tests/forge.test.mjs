import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretIdea,FORGE_START_CREDITS,FORGE_MISSION_REWARD,FORGE_PARTY_REWARD,claimGig} from '../src/forge-engine.ts';

test('blackjack descriptions become an actual playable blueprint',()=>{
 for(const idea of ['Quiero una app para jugar blackjack contra un crupier virtual','Crea un juego de veintiuno con cartas']){
  const out=interpretIdea(idea);
  assert.equal(out.project?.kind,'blackjack');
  assert.equal(out.project?.mode,'prompt');
 }
});
test('supports different genuine app templates and declines unsupported prompts',()=>{
 const examples=[
  ['Hazme un juego de tres en raya contra la computadora','tictactoe'],
  ['Necesito una trivia de preguntas de ciencias','quiz'],
  ['Quiero una app de lista de tareas pendientes','tasks'],
  ['Quiero una agenda para reservar citas en barbería','booking'],
  ['Quiero una tienda online con productos y carrito','shop']
 ];
 for(const [q,kind] of examples)assert.equal(interpretIdea(q).project?.kind,kind);
 assert.equal(interpretIdea('Haz una plataforma de inteligencia artificial que controle robots').project,null);
 assert.equal(interpretIdea('hola').project,null);
 assert.equal(interpretIdea('Quiero hackear contraseñas con phishing').project,null);
});
test('prompt credit economy is independent from preset starting budget',()=>{
 assert.equal(FORGE_START_CREDITS,250);
 assert.ok(FORGE_MISSION_REWARD>0);
 assert.ok(FORGE_PARTY_REWARD>0);
 const won=claimGig(250,'prompt',0,'research',[]);
 assert.ok(won);
 assert.equal(won.credits,285);
 assert.equal(claimGig(won.credits,'prompt',0,'research',won.earned),null);
 assert.equal(claimGig(100,'preset',0,'research',[]),null);
 const next=claimGig(won.credits,'prompt',3,'research',won.earned);
 assert.ok(next);
 assert.equal(next.credits,320);
});
