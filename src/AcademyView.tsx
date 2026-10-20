import {useState} from 'react';
import {filterAcademyTopics} from './academy-data';
import type {AcademyTopic} from './academy-data';
import './academy.css';

type Shell='cmd'|'powershell'|'bash';
type Version='v7'|'v6';
const setups:Record<Shell,{label:string;create:string;tool:string}>={
 cmd:{label:'CMD · Windows',create:'mkdir mi-proyecto-bmad\ncd mi-proyecto-bmad',tool:'code .'},
 powershell:{label:'PowerShell · Windows',create:'New-Item -ItemType Directory -Force mi-proyecto-bmad\nSet-Location mi-proyecto-bmad',tool:'code .'},
 bash:{label:'Bash · Git Bash / Linux / macOS',create:'mkdir -p mi-proyecto-bmad && cd mi-proyecto-bmad',tool:'code .'}
};
function Copyable({code,label}:{code:string;label:string}){
 const [copied,setCopied]=useState(false);
 async function copy(){try{await navigator.clipboard.writeText(code);setCopied(true)}catch{setCopied(false)}}
 return <div className="academy-code"><span className="academy-code-label">{label}</span><pre><code>{code}</code></pre><button type="button" onClick={copy} aria-label={'Copiar '+label}>{copied?'✓ Copiado':'⧉ Copiar'}</button></div>;
}
function InstallGuide(){
 const [shell,setShell]=useState<Shell>('powershell');
 const [version,setVersion]=useState<Version>('v7');
 return <section className="academy-install-panel" aria-labelledby="academy-install-title">
  <div className="academy-install-heading"><div><span className="academy-install-kicker">◈ PRIMEROS PASOS</span><h2 id="academy-install-title">Instala BMAD en tu computador</h2><p>Desde cero, paso a paso. Elige tu terminal y la versión antes de copiar los comandos.</p></div><span className="academy-install-tag">GUÍA PRÁCTICA</span></div>
  <div className="academy-terminal-select" role="group" aria-label="Elegir terminal">{(Object.keys(setups) as Shell[]).map(option=><button key={option} type="button" className={shell===option?'active':''} aria-pressed={shell===option} onClick={()=>setShell(option)}>{setups[option].label}</button>)}</div>
  <div className="academy-version-select" role="group" aria-label="Elegir versión de BMAD">
   <button type="button" className={version==='v7'?'active':''} aria-pressed={version==='v7'} onClick={()=>setVersion('v7')}><strong>BMAD v7</strong><small>Skills nuevos · versión preliminar</small></button>
   <button type="button" className={version==='v6'?'active':''} aria-pressed={version==='v6'} onClick={()=>setVersion('v6')}><strong>BMAD v6.12</strong><small>Versión estable</small></button>
  </div>
  <div className="academy-version-notice">{version==='v7'?'La versión v7 descrita en la documentación oficial todavía se presenta como vista previa. Los 18 comandos de la Academia corresponden a esta ruta y pueden cambiar.':'La v6.12 es la opción estable documentada. Los nombres de comandos y agentes de esta versión pueden ser distintos a los skills v7 mostrados en las tarjetas de abajo.'}</div>
  <div className="academy-install-steps">
   <div className="academy-step"><span className="academy-step-n">01</span><div><h3>Comprueba los requisitos</h3><p>Instala Node.js 20.12 o posterior, Git, Python 3.10+ y <a href="https://docs.astral.sh/uv/getting-started/installation/" target="_blank" rel="noopener noreferrer">uv</a>. Comprueba que tu terminal reconoce las herramientas.</p><Copyable label="Comprobar herramientas" code={'node --version\nnpm --version\ngit --version\n'+(shell==='bash'?'python3 --version':'python --version')+'\nuv --version'}/></div></div>
   <div className="academy-step"><span className="academy-step-n">02</span><div><h3>Crea o abre la carpeta del proyecto</h3><p>Ejecuta esto en {setups[shell].label}. Si ya tienes un proyecto, entra en su carpeta con <code>cd</code> en vez de crear otra.</p><Copyable label={'Carpeta · '+setups[shell].label} code={setups[shell].create}/></div></div>
   <div className="academy-step"><span className="academy-step-n">03</span><div><h3>Instala las skills de BMAD</h3><p>{version==='v7'?'La Skills CLI ofrece la colección completa y te pregunta qué herramienta de IA utilizar. Selecciona tu editor, por ejemplo Codex o Claude Code.':'El instalador de la versión estable configura BMAD en la carpeta actual. Sigue sus preguntas de módulos y herramienta de IA.'}</p><Copyable label={version==='v7'?'Instalación v7 (vista previa)':'Instalación estable v6.12'} code={version==='v7'?(shell==='cmd'?'npx skills add bmad-code-org/BMAD-METHOD --skill "*"':"npx skills add bmad-code-org/BMAD-METHOD --skill '*'"):'npx bmad-method install'}/></div></div>
   <div className="academy-step"><span className="academy-step-n">04</span><div><h3>Abre el proyecto con tu asistente de programación</h3><p>En VS Code, abre la carpeta y entra en el chat de Codex/Copilot si instalaste BMAD allí. Si utilizas Claude Code, abre su aplicación. El siguiente paso se hace <strong>dentro del chat de IA</strong>, no en CMD.</p><Copyable label="Abrir VS Code (si está instalado)" code={setups[shell].tool}/></div></div>
   <div className="academy-step"><span className="academy-step-n">05</span><div><h3>Configura y verifica BMAD</h3><p>{version==='v7'?'Invoca la skill bmad en el chat, pide setup y luego status. Esta configuración crea el runtime y carpetas de trabajo en el proyecto.':'Completa el instalador y revisa el menú de comandos que ofrece tu versión. Para trabajar con skills v7, instala esa versión en vez de copiar sus nombres sobre v6.'}</p>{version==='v7'?<Copyable label="Escribe en el chat de IA, no en la terminal" code={'bmad setup\nbmad status'}/>:<p className="academy-version-help">Los comandos de los 18 conceptos de abajo utilizan v7. Para tu instalación estable sigue la referencia oficial de v6.12.</p>}</div></div>
   <div className="academy-step"><span className="academy-step-n">06</span><div><h3>Invoca tu primera función</h3><p>{version==='v7'?'Prueba con brainstorming o abre bmad y pregunta por el siguiente paso. Algunos chats usan / o $ delante de la skill.':'Abre la documentación de v6.12 y usa los comandos que haya instalado tu herramienta.'}</p>{version==='v7'&&<Copyable label="En el chat de IA" code="bmad-brainstorming"/>}</div></div>
  </div>
  <div className="academy-install-footer"><span>¡Importante! La terminal instala BMAD. Las skills y códigos de agentes se invocan después en el chat de tu herramienta IA.</span><a href="https://docs.bmad-method.org/start/install-bmad/" target="_blank" rel="noopener noreferrer">Instalación oficial ↗</a></div>
 </section>;
}
function ConceptCard({topic,index}:{topic:AcademyTopic;index:number}){
 return <article className="academy-card academy-lesson">
  <div className="academy-card-top"><span className="academy-glyph">{['◈','✳','✦','◆','◎','✧'][index%6]}</span><span>{topic.category.toUpperCase()}</span></div>
  <h2>{topic.name}</h2>
  <p className="academy-lesson-summary">{topic.summary}</p>
  <p className="academy-lesson-detail">{topic.detail}</p>
  <div className="academy-lesson-command"><span>COMANDO · CHAT DE IA</span><Copyable code={topic.command} label={topic.name}/></div>
  {topic.alternative&&<p className="academy-alt-command">Otra opción: <code>{topic.alternative}</code></p>}
  {topic.trigger&&<p className="academy-alt-command">Menú del agente: <code>{topic.trigger}</code></p>}
  <details className="academy-lesson-more"><summary>¿Cómo lo utilizo y qué obtengo? <span>⌄</span></summary><p>{topic.usage}</p><div className="academy-lesson-output"><strong>RESULTADO</strong><span>{topic.output}</span></div></details>
 </article>;
}
export default function AcademyView({query,onQuery}:{query:string;onQuery:(value:string)=>void}){
 const filtered=filterAcademyTopics(query);
 return <section className="screen-in academy-screen">
  <span className="section-kicker">✦ TU CENTRO DE CONOCIMIENTO</span><h1>Academia <em>BMAD.</em></h1>
  <p>Aprende los conceptos, instala BMAD y descubre cómo activar sus funciones en un proyecto real.</p>
  <InstallGuide/>
  <div className="academy-concepts-heading"><div><span className="section-kicker">✦ DICCIONARIO DE SKILLS</span><h2>Funciones y conceptos de BMAD</h2><p>Explicaciones, comandos y ejemplos para trabajar desde tu asistente de programación. Referencia de skills v7.</p></div></div>
  <div className="academy-toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={e=>onQuery(e.target.value)} placeholder="Buscar concepto, skill o comando…" aria-label="Buscar conceptos"/></label><span>{filtered.length} CONCEPTOS DISPONIBLES</span></div>
  {filtered.length?<div className="academy-grid">{filtered.map((topic,index)=><ConceptCard topic={topic} key={topic.name} index={index}/>)}</div>:<div className="academy-no-results"><strong>No encontramos esa skill.</strong><p>Prueba con “PRD”, “brainstorming”, “Mary” o “Party Mode”.</p><button type="button" onClick={()=>onQuery('')}>Mostrar todos</button></div>}
  <div className="academy-link"><span>¿Quieres conocer más funciones o verificar los nombres de tu versión?</span><a target="_blank" rel="noreferrer" href="https://docs.bmad-method.org/reference/skills-and-agents/">Ver catálogo oficial de skills ↗</a></div>
 </section>;
}
