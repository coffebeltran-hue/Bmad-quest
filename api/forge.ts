/**
 * Vercel serverless endpoint for an AI-assisted declarative prototype.
 * Secret material stays on the server. This is a private beta, NOT an open
 * code-generation sandbox or an unlimited public API.
 */
import {timingSafeEqual} from 'node:crypto';
import {validateBlueprint} from '../src/universal-engine.ts';
import {interpretIdea} from '../src/forge-engine.ts';

const schema={
 type:'object',
 additionalProperties:false,
 required:['mode','title','description','entity','action','fieldLabel','tags','primaryColor','capabilities','caveat'],
 properties:{
  mode:{type:'string',enum:['records','tasks','calculator','timer','flashcards','journal','goals','dashboard','game']},
  title:{type:'string'},
  description:{type:'string'},
  entity:{type:'string'},
  action:{type:'string'},
  fieldLabel:{type:'string'},
  tags:{type:'array',items:{type:'string'}},
  primaryColor:{type:'string'},
  capabilities:{type:'array',items:{type:'string'}},
  caveat:{type:'string'}
 }
};
const capabilitiesByMode:Record<string,string[]>={
 records:['Crear, editar y borrar registros','Buscar y filtrar','Exportar CSV'],
 tasks:['Crear, editar y borrar tareas','Marcar como completadas','Buscar y filtrar'],
 calculator:['Sumar, restar, multiplicar y dividir','Calcular porcentajes','Consultar resultados recientes'],
 timer:['Iniciar, pausar y reiniciar','Configurar minutos','Contar sesiones terminadas'],
 flashcards:['Crear tarjetas de estudio','Revelar respuestas','Avanzar entre tarjetas'],
 journal:['Escribir, editar y borrar notas','Buscar entradas','Exportar CSV'],
 goals:['Crear objetivos','Registrar avances','Buscar y filtrar'],
 dashboard:['Registrar indicadores','Consultar cifras agregadas','Exportar CSV'],
 game:['Responder preguntas','Acumular puntos','Continuar a nuevos retos']
};
function authorized(value:string,expected:string):boolean{
 const a=Buffer.from(value),b=Buffer.from(expected);
 return a.length===b.length&&timingSafeEqual(a,b);
}
function reply(body:unknown,status:number,origin?:string):Response{
 return new Response(JSON.stringify(body),{status,headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff','Vary':'Origin',
  ...(origin?{'Access-Control-Allow-Origin':origin}:{})
 }});
}
function originAllowed(req:Request):{ok:boolean;origin?:string}{
 const origin=req.headers.get('origin');
 if(!origin)return {ok:true};
 let self:string;
 try{self=new URL(req.url).origin}catch{return {ok:false}};
 const origins=[self,'https://coffebeltran-hue.github.io','http://localhost:5173',...(process.env.FORGE_ALLOWED_ORIGIN||'').split(',').map(s=>s.trim()).filter(Boolean)];
 return origins.includes(origin)?{ok:true,origin}:{ok:false};
}
export function OPTIONS(req:Request):Response{
 const check=originAllowed(req);
 if(!check.ok)return reply({error:'Origen no permitido'},403);
 return new Response(null,{status:204,headers:{
  ...(check.origin?{'Access-Control-Allow-Origin':check.origin}:{}),
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type, X-Forge-Beta-Code',
  'Access-Control-Max-Age':'600',
  'Vary':'Origin'
 }});
}
export async function POST(req:Request):Promise<Response>{
 const check=originAllowed(req);
 if(!check.ok)return reply({error:'Origen no permitido'},403);
 const origin=check.origin;
 if(!process.env.OPENAI_API_KEY||!process.env.FORGE_BETA_CODE){
  return reply({error:'La generación con IA aún no está configurada en el servidor.'},503,origin);
 }
 if(!authorized(req.headers.get('x-forge-beta-code')||'',process.env.FORGE_BETA_CODE)){
  return reply({error:'Código de acceso beta incorrecto.'},401,origin);
 }
 if(req.headers.get('content-type')?.split(';')[0].trim()!=='application/json'){
  return reply({error:'Se requiere JSON.'},415,origin);
 }
 const length=Number(req.headers.get('content-length')||0);
 if(length>1500)return reply({error:'Solicitud demasiado grande.'},413,origin);
 let prompt='';
 try {
  const payload=await req.json();
  if(!payload||typeof payload.prompt!=='string')throw Error('prompt');
  prompt=payload.prompt.trim();
 }catch {return reply({error:'Cuerpo inválido.'},400,origin)}
 if(prompt.length<12||prompt.length>400)return reply({error:'Describe tu idea en 12 a 400 caracteres.'},400,origin);
 const localInterpretation=interpretIdea(prompt);
 if(!localInterpretation.project)return reply({error:localInterpretation.error},422,origin);
 const model=process.env.OPENAI_FORGE_MODEL||'gpt-5-mini';
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{
   method:'POST',
   headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({
    model,store:false,max_output_tokens:1200,
    instructions:[
     'Eres el analista de BMAD App Forge. Devuelve SOLO un blueprint JSON válido.',
     'Convierte la idea en una de las modalidades existentes del motor React.',
     'No prometas GPS, pagos, IA en tiempo real, multijugador, base de datos, redes o mecánicas no soportadas.',
     'Las únicas modalidades son records,tasks,calculator,timer,flashcards,journal,goals,dashboard,game.',
     'Adapta título, nombre de entidad y textos al contexto concreto.',
     'capabilities solo debe incluir prestaciones que REALMENTE ejecute el modo. No inventes controles nuevos.',
     'En caveat aclara con precisión qué partes del pedido no quedan cubiertas.',
     'No generes código, HTML, JavaScript, URLs ni instrucciones para ejecutar código del usuario.',
     'Títulos y etiquetas en español, máximo 80 caracteres. Color hex #RRGGBB.'
    ].join(' '),
    input:[{role:'user',content:[{type:'input_text',text:prompt}]}],
    text:{format:{type:'json_schema',name:'bmad_forge_plan',strict:true,schema}}
   }),
   signal:AbortSignal.timeout(25000)
  });
  if(!response.ok){
   return reply({error:response.status===429?'Servicio de IA ocupado, inténtalo después.':'No se pudo generar el plan con IA.'},502,origin);
  }
  const raw=await response.json() as {output?:{type?:string;content?:{type?:string;text?:string}[]}[];status?:string};
  const text=raw.output?.flatMap(item=>item.content||[]).find(part=>part.type==='output_text')?.text;
  if(!text)return reply({error:'El modelo no produjo un plan utilizable.'},502,origin);
  let candidate:unknown;
  try{candidate=JSON.parse(text)}catch{return reply({error:'Respuesta no válida del modelo.'},502,origin)}
  const plan=validateBlueprint(candidate);
  if(!plan)return reply({error:'El plan no pasó la validación de seguridad.'},502,origin);
  // The model helps interpret the brief; supported specialist engines override generic UI.
  // This prevents e.g. a request for roulette being rendered as a form or generic quiz.
  if(localInterpretation.project.kind!=='custom'){
   return reply({project:{...localInterpretation.project,source:'ai'}},200,origin);
  }
  // Do not trust AI-supplied capabilities: only show actions the runtime actually implements.
  const clean={
   ...plan,
   title:plan.title.slice(0,80),entity:plan.entity.slice(0,50),action:plan.action.slice(0,80),
   fieldLabel:plan.fieldLabel.slice(0,80),description:prompt,
   tags:plan.tags.slice(0,5),capabilities:capabilitiesByMode[plan.mode],
   caveat:plan.caveat.slice(0,280)
  };
  return reply({project:{kind:'custom',mode:'prompt',prompt,title:clean.title,summary:clean.caveat,blueprint:clean,source:'ai'}},200,origin);
 }catch{
  return reply({error:'La generación tardó demasiado o el servicio no respondió.'},504,origin);
 }
}
