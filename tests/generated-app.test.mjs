import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGeneratedBundle,buildGeneratedDocument} from '../src/generated-app.ts';
const mock={title:'Juego de naves',summary:'Controla una nave y consigue puntos.',features:['Mover','Sumar puntos'],files:{html:'<main><h1>Naves</h1><button id="go">Despegar</button></main>',css:'body{background:#101c34;color:white}',javascript:'document.getElementById("go").onclick=()=>{document.querySelector("h1").textContent="Volando"}'}};
test('generated preview is isolated, script only at playable stage',()=>{
 assert.deepEqual(validateGeneratedBundle(mock),mock);
 const intro=buildGeneratedDocument(mock,1);
 assert.match(intro,/Estructurando pantalla/);
 assert.doesNotMatch(intro,/Volando/);
 const design=buildGeneratedDocument(mock,4);
 assert.match(design,/#101c34/);assert.doesNotMatch(design,/Volando/);
 const live=buildGeneratedDocument(mock,6);
 assert.match(live,/Volando/);
 assert.match(live,/connect-src 'none'/);
 assert.match(live,/form-action 'none'/);
 assert.match(live,/frame-src 'none'/);
});
test('rejects unsafe markup and oversized output',()=>{
 assert.equal(validateGeneratedBundle({...mock,files:{...mock.files,html:'<iframe src="bad"></iframe>'}}),null);
 assert.equal(validateGeneratedBundle({...mock,files:{...mock.files,html:'<script>bad()</script>'}}),null);
 assert.equal(validateGeneratedBundle({...mock,files:{...mock.files,javascript:'x'.repeat(31000)}}),null);
 assert.equal(validateGeneratedBundle({...mock,features:new Array(12).fill('fake')}),null);
});
test('generated scripts cannot close the surrounding script tag',()=>{
 const attack={...mock,files:{...mock.files,javascript:'const x="</script><div id=\"escape\"></div>";'}};
 const doc=buildGeneratedDocument(attack,6);
 assert.ok(!doc.includes('</script><div'));
 assert.ok(doc.includes('<\\/script>'));
});
