import test from 'node:test';import assert from 'node:assert/strict';
import {planUniversal,validateBlueprint} from '../src/universal-engine.ts';
const cases=[
 ['Quiero una app para guardar recetas de cocina','records'],
 ['Necesito un cronómetro para estudiar','timer'],
 ['Diseña una calculadora de descuentos e impuestos','calculator'],
 ['Haz un diario para registrar mis sentimientos','journal'],
 ['Quiero memorizar vocabulario alemán con tarjetas','flashcards'],
 ['Quiero una aplicación para medir metas de ejercicio','goals'],
 ['Quiero un dashboard con estadísticas de usuarios','dashboard'],
 ['Necesito un juego de aventuras','game'],
 ['Quiero llevar el registro de mis mascotas','records']
];
test('flexible generator yields a safe blueprint for disparate instructions',()=>{
 for(const [prompt,mode] of cases){
  const blueprint=planUniversal(prompt);
  assert.equal(blueprint.mode,mode,prompt);
  assert.ok(blueprint.title&&blueprint.capabilities.length);
  assert.deepEqual(validateBlueprint(blueprint),blueprint);
 }
});
test('unsafe or malformed blueprints cannot enter the renderer',()=>{
 const x=planUniversal('Quiero un diario de actividades');
 assert.equal(validateBlueprint({...x,mode:'script'}),null);
 assert.equal(validateBlueprint({...x,primaryColor:'url(javascript:alert(1))'}),null);
 assert.equal(validateBlueprint({...x,capabilities:['a'.repeat(300)]}),null);
 assert.equal(validateBlueprint(null),null);
});
