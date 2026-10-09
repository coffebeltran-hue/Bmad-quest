import test from 'node:test';import assert from 'node:assert/strict';
import {applyRevision,undoRevision} from '../src/forge-revisions.ts';
const base={kind:'roulette',mode:'prompt',prompt:'Juego de ruleta de casino',title:'Roulette Royal',summary:'Juego local'};
const created=(name)=>({kind:'generated',mode:'prompt',source:'ai',prompt:'generado',title:name,summary:'Nueva versión',generated:{
 title:name,summary:'Nueva versión',features:['Girar'],
 files:{html:'<main><button id="spin">Girar</button></main>',css:'body{color:white}',javascript:'document.querySelector("#spin").onclick=()=>{}'}
}});
test('a revision preserves credits, mission history and original idea, and can be undone',()=>{
 const original={project:base,edits:[],revisions:[],index:4,credits:190,quality:42,log:['Misión 1']};
 const version=applyRevision(original,created('Versión con historial'),'Agregar historial',123);
 assert.equal(version.credits,190);assert.equal(version.index,4);assert.deepEqual(version.log,['Misión 1']);
 assert.equal(version.project.prompt,base.prompt);assert.equal(version.project.kind,'generated');
 assert.equal(version.edits.length,1);assert.equal(version.revisions.length,1);
 const restore=undoRevision(version,456);
 assert.deepEqual(restore.project,base);assert.equal(restore.credits,190);assert.equal(restore.revisions.length,0);
 assert.equal(restore.edits.at(-1).title,base.title);
});
test('invalid revisions do not replace an existing app or consume progress',()=>{
 const original={project:base,edits:[],revisions:[],credits:100};
 assert.strictEqual(applyRevision(original,{...created('bad'),generated:{files:{html:'<iframe></iframe>'}}},'Cambio',1),original);
 assert.strictEqual(undoRevision(original,2),original);
});
test('revision history bounded while retaining ability to restore latest previous version',()=>{
 let state={project:base,edits:[],revisions:[],credits:250};
 for(let i=0;i<6;i++)state=applyRevision(state,created('App v'+i),'Cambio '+i,i);
 assert.equal(state.revisions.length,3);assert.equal(state.edits.length,6);
 const restore=undoRevision(state,99);assert.equal(restore.project.title,'App v4');assert.equal(restore.credits,250);
});
