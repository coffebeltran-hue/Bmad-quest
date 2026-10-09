import {timingSafeEqual} from 'node:crypto';
import {validateGeneratedBundle} from '../src/generated-app.ts';
/**
 * Private beta: generate original HTML/CSS/JavaScript for one browser-only miniapp.
 * The model code is NEVER executed on the server; the client renders it only in a
 * restricted iframe with an opaque origin and network-blocking Content Security Policy.
 */
export const maxDuration=60;
const schema={
 type:'object',additionalProperties:false,
 required:['title','summary','features','files'],
 properties:{
  title:{type:'string',description:'Nombre del producto, breve y en español'},
  summary:{type:'string',description:'Qué hace la app y qué limitaciones tiene'},
  features:{type:'array',items:{type:'string'},description:'Hasta seis funciones realmente implementadas'},
  files:{type:'object',additionalProperties:false,required:['html','css','javascript'],
   properties:{
    html:{type:'string',description:'Solo contenido de body, sin <script>, <style>, html ni dependencias externas'},
    css:{type:'string',description:'CSS local, responsive y visualmente detallado'},
    javascript:{type:'string',description:'JavaScript vanilla completo, sin import/export, para interacción real'}
   }}
 }
};
function respond(status:number,data:unknown,origin?:string){
 return new Response(JSON.stringify(data),{status,headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
  'Vary':'Origin','X-Content-Type-Options':'nosniff',
  ...(origin?{'Access-Control-Allow-Origin':origin}:{})
 }});
}
function checkOrigin(req:Request):{allowed:boolean;origin?:string}{
 const origin=req.headers.get('origin');if(!origin)return {allowed:true};
 let self='';
 try{self=new URL(req.url).origin}catch{return {allowed:false}};
 const origins=[self,'https://coffebeltran-hue.github.io','http://localhost:5173',
  ...(process.env.FORGE_ALLOWED_ORIGIN||'').split(',').map(v=>v.trim()).filter(Boolean)];
 return origins.includes(origin)?{allowed:true,origin}:{allowed:false};
}
export function OPTIONS(req:Request){
 const status=checkOrigin(req);if(!status.allowed)return respond(403,{error:'Origen no permitido'});
 return new Response(null,{status:204,headers:{
  ...(status.origin?{'Access-Control-Allow-Origin':status.origin}:{}),
  'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Forge-Beta-Code',
  'Access-Control-Max-Age':'600','Vary':'Origin'
 }});
}
export async function POST(req:Request):Promise<Response>{
 const origin=checkOrigin(req);
 if(!origin.allowed)return respond(403,{error:'Origen no permitido'});
 if(!process.env.OPENAI_API_KEY||!process.env.FORGE_BETA_CODE)
  return respond(503,{error:'Configura OPENAI_API_KEY y FORGE_BETA_CODE en Vercel.'},origin.origin);
 const received=Buffer.from(req.headers.get('x-forge-beta-code')||'');
 const expected=Buffer.from(process.env.FORGE_BETA_CODE);
 if(received.length!==expected.length||!timingSafeEqual(received,expected))
  return respond(401,{error:'Código beta incorrecto.'},origin.origin);
 if(req.headers.get('content-type')?.split(';')[0].trim()!=='application/json')
  return respond(415,{error:'Se requiere JSON.'},origin.origin);
 if(Number(req.headers.get('content-length')||0)>1800)
  return respond(413,{error:'Solicitud demasiado grande.'},origin.origin);
 let prompt='';
 try{
  const payload=await req.json();
  if(!payload||typeof payload.prompt!=='string')throw Error('missing prompt');
  prompt=payload.prompt.trim();
 }catch{return respond(400,{error:'Solicitud JSON inválida.'},origin.origin)}
 if(prompt.length<12||prompt.length>400)
  return respond(400,{error:'Describe tu idea entre 12 y 400 caracteres.'},origin.origin);
 const model=process.env.OPENAI_CODE_MODEL||'gpt-5-mini';
 try{
  const res=await fetch('https://api.openai.com/v1/responses',{
   method:'POST',
   headers:{'Authorization':'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({
    model,store:false,max_output_tokens:13500,
    reasoning:{effort:'low'},
    instructions:[
      'Eres un ingeniero senior frontend y diseñador de videojuegos experto de BMAD App Forge.',
      'Debes escribir una miniaplicación ORIGINAL Y REALMENTE FUNCIONAL adaptada al deseo del usuario, no reutilizar formularios genéricos.',
      'Genera HTML, CSS y JavaScript independientes con estilos coherentes y una interfaz de aspecto profesional.',
      'Si pide ruleta: rueda animada de números, selección de apuestas ficticias, giro, resultado, actualización de puntos.',
      'Si pide plataformas: personaje, suelo, gravedad, salto, colisiones y objetivos; si pide juego de cartas: mazo, turnos y reglas.',
      'Prioriza una experiencia jugable y concreta sobre funcionalidades incompletas.',
      'El HTML será insertado como body fragment; NO incluyas etiquetas script, style, link, iframe, meta, head, body ni html.',
      'Todo el CSS va en files.css. Toda la lógica en files.javascript: JavaScript vanilla, sin import/export, sin dependencias, sin frameworks.',
      'Usa SVG inline, canvas o formas CSS para gráficos; no solicites imágenes, APIs, fuentes o archivos externos.',
      'Incluye event listeners, lógica de estado, condiciones de victoria, reinicio o funcionalidades verificables según la idea.',
      'No uses fetch, XMLHttpRequest, WebSocket, localStorage, sessionStorage, navigator API, document.cookie ni red externa.',
      'No generes código malicioso, minería, espionaje, fraudes ni apuestas con dinero real. Los saldos de juego son puntos ficticios.',
      'No realices transacciones monetarias ni manejes datos sensibles. Incluye avisos claros cuando sea necesario.',
      'Tu salida será código mostrado SOLO en un iframe sandbox aislado y sin acceso a red.',
      'Todo el texto visible debe estar en español. Si alguna funcionalidad requiere servidores o no es viable, explica el límite en summary.',
      'Asegúrate de que los identificadores de HTML que usas en JS existan; código autocontenido, sin errores.',
      'Devuelve un objeto JSON válido que cumpla el schema; NO markdown.',
      'Diferencia de verdad apps diferentes: estructura, paleta, controles y reglas deben responder a la instrucción exacta.'
    ].join(' '),
    input:[{role:'user',content:[{type:'input_text',text:'Construye esta aplicación: '+prompt}]}],
    text:{format:{type:'json_schema',name:'bmad_generated_app',strict:true,schema}}
   }),
   signal:AbortSignal.timeout(55000)
  });
  if(!res.ok){
   return respond(res.status===429?429:502,{
    error:res.status===429?'La IA está ocupada o se alcanzó el límite; prueba más tarde.':'Error al generar la app. Revisa tu configuración del modelo o tu saldo de API.'
   },origin.origin);
  }
  const raw=await res.json() as {output?:{content?:{type?:string;text?:string}[]}[];status?:string};
  const content=raw.output?.flatMap(m=>m.content||[]).find(m=>m.type==='output_text')?.text;
  if(!content)return respond(502,{error:'La IA no pudo completar el código. Intenta una idea más concreta.'},origin.origin);
  let parsed:unknown;
  try{parsed=JSON.parse(content)}catch{return respond(502,{error:'La respuesta de IA no era JSON válido.'},origin.origin)}
  const app=validateGeneratedBundle(parsed);
  if(!app)return respond(502,{error:'El código devuelto está incompleto o no pasó la validación. Intenta de nuevo.'},origin.origin);
  return respond(200,{project:{
   kind:'generated',mode:'prompt',source:'ai',title:app.title,summary:app.summary,prompt,
   generated:app
  }},origin.origin);
 }catch{
  return respond(504,{error:'La IA tardó demasiado o hubo un problema de conexión. Vuelve a intentarlo.'},origin.origin);
 }
}
