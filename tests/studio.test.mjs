import test from 'node:test';
import assert from 'node:assert/strict';
import {studioStage,studioPercent,buildConversation,RELEASES,SITE_VARIANTS} from '../src/studio-engine.ts';

test('seven phases unlock deterministically as missions progress',()=>{
 assert.equal(studioStage(0),0);
 assert.equal(studioStage(2),0);
 assert.equal(studioStage(3),1);
 assert.equal(studioStage(9),3);
 assert.equal(studioStage(12),4);
 assert.equal(studioStage(18),6);
 assert.equal(studioStage(900),6);
 assert.equal(studioStage(-1),0);
 assert.equal(studioPercent(9),50);
 assert.equal(studioPercent(18),100);
 assert.equal(RELEASES.length,7);
});
test('all three startups have usable, distinct visual catalog data',()=>{
 assert.equal(SITE_VARIANTS.length,3);
 for(const site of SITE_VARIANTS){
  assert.ok(site.products.length>=3);
  assert.equal(new Set(site.products.map(p=>p.id)).size,site.products.length);
  assert.ok(site.products.every(p=>site.categories.includes(p.category)));
 }
});
test('transcript incorporates stored choice, debate and funding chronologically',()=>{
 const missions=[{title:'Brief',topic:'PRD',lead:'Mary',brief:'Exploramos usuarios.',choices:[{label:'Validar',note:'Gran aprendizaje'},{label:'Asumir',note:'Puede salir mal'}]}];
 const debates=[['Debate del MVP','John: primero validar.']];
 const transcript=buildConversation(['Brief: Asumir (13 CR)','Debate del MVP: Analizar perspectivas (2 CR)','Financiación de emergencia: +20 CR / -7 calidad (mission:1)'],missions,debates,'EduConnect');
 assert.ok(transcript.some(m=>m.content==='Elegí: Asumir.'));
 assert.ok(transcript.some(m=>m.content.includes('Puede salir mal')));
 assert.ok(transcript.some(m=>m.content.includes('Debate del MVP')));
 assert.ok(transcript.some(m=>m.content.includes('financiación temporal')));
 assert.ok(transcript.findIndex(m=>m.id==='m-0-plan')<transcript.findIndex(m=>m.id==='p-1-start'));
});
test('three completed missions announce precisely the next release',()=>{
 const missions=Array.from({length:3},(_,i)=>({title:'M'+i,topic:'Diseño',lead:'Amelia',brief:'Trabajo',choices:[{label:'A',note:'Bien'},{label:'B',note:'Revisar'}]}));
 const transcript=buildConversation(['M0: A','M1: B','M2: A'],missions,[],'FoodFlow');
 const update=transcript.find(m=>m.id==='m-2-version');
 assert.ok(update);
 assert.equal(update.speaker,'Amelia');
 assert.ok(update.content.includes('Encabezado y portada'));
});
