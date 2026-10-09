import {useMemo,useState} from 'react';
import type {GeneratedBundle} from './generated-app';
import {buildGeneratedDocument} from './generated-app';
import './generated-preview.css';
type Props={bundle:GeneratedBundle;stage:number};
export default function GeneratedPreview({bundle,stage}:Props){
 const [source,setSource]=useState<'preview'|'html'|'css'|'javascript'>('preview');
 const [layout,setLayout]=useState<'desktop'|'mobile'>('desktop');
 const [refresh,setRefresh]=useState(0);
 const doc=useMemo(()=>buildGeneratedDocument(bundle,stage),[bundle,stage]);
 const isReady=stage>=6;
 return <div className="generated-shell">
  <div className="generated-toolbar"><div><span className="generated-mark">✦</span><strong>{bundle.title}</strong><small>{isReady?'APP IA · INTERACTIVA':'IA · CONSTRUYENDO VISTA'}</small></div><div className="generated-actions">
    <button className={layout==='desktop'?'selected':''} onClick={()=>setLayout('desktop')} aria-label="Vista de escritorio" title="Escritorio">▣</button>
    <button className={layout==='mobile'?'selected':''} onClick={()=>setLayout('mobile')} aria-label="Vista móvil" title="Móvil">▯</button>
    <button onClick={()=>setRefresh(n=>n+1)} aria-label="Reiniciar la aplicación" title="Reiniciar app">↻</button>
   </div></div>
  <div className="generated-source-tabs">
   {(['preview','html','css','javascript'] as const).map(tab=><button key={tab} className={source===tab?'active':''} onClick={()=>setSource(tab)}>{tab==='preview'?'◈ Vista jugable':tab==='html'?'HTML':tab==='css'?'CSS':'JavaScript'}</button>)}
  </div>
  {source==='preview'?<div className={'generated-viewport '+(layout==='mobile'?'mobile':'desktop')}>
    <div className="generated-device">
      <iframe key={stage+'-'+refresh} sandbox="allow-scripts" referrerPolicy="no-referrer" title={'Vista previa aislada de '+bundle.title} srcDoc={doc}/>
    </div>
   </div>:<div className="generated-code-view"><div className="generated-code-caption"><span>{source==='javascript'?'app.js':source==='css'?'styles.css':'index.html'} · código generado por IA</span><button onClick={()=>navigator.clipboard?.writeText(bundle.files[source])}>Copiar código</button></div><pre><code>{bundle.files[source]}</code></pre></div>}
  <div className="generated-info"><span className="generated-safe">● SANDBOX ACTIVO</span><p>{isReady?'El código funciona solo dentro de esta vista aislada. No tiene acceso a la red ni al almacenamiento de BMAD.':'Se están mostrando los componentes por etapas; la lógica JavaScript se activará al terminar.'}</p></div>
 </div>;
}
