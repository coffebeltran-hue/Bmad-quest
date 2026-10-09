import {authorizePaid} from './_access.ts';
import {validateGeneratedBundle} from '../src/generated-app.ts';
/** Refines generated sources; prebuilt engines are explicitly RECREATED, not patched. */
export const maxDuration=60;
const schema={
 type:'object',additionalProperties:false,required:['title','summary','features','files'],
 properties:{
  title:{type:'string'},summary:{type:'string'},
  features:{type:'array',items:{type:'string'}},
  files:{type:'object',additionalProperties:false,required:['html','css','javascript'],
   properties:{html:{type:'string'},css:{type:'string'},javascript:{type:'string'}}}
 }
};
type Incoming={instruction?:unknown;app?:unknown;original?:unknown;turnstileToken?:unknown};
function reply(status:number,data:unknown,origin?:string):Response{
 return new Response(JSON.stringify(data),{status,headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff',
  ...(origin?{'Access-Control-Allow-Origin':origin}:{})
 }});
}
function allowed(req:Request):{ok:boolean;origin?:string}{
 const origin=req.headers.get('origin');if(!origin)return {ok:true};
 let own='';try{own=new URL(req.url).origin}catch{return {ok:false}};
 return [own,'https://coffebeltran-hue.github.io','http://localhost:5173',...(process.env.FORGE_ALLOWED_ORIGIN||'').split(',').map(x=>x.trim()).filter(Boolean)].includes(origin)
  ?{ok:true,origin}:{ok:false};
}
export function OPTIONS(req:Request){
 const check=allowed(req);if(!check.ok)return reply(403,{error:'Origen no permitido'});
 return new Response(null,{status:204,headers:{...(check.origin?{'Access-Control-Allow-Origin':check.origin}:{}),
  'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Forge-Beta-Code',
  'Access-Control-Max-Age':'600','Vary':'Origin'}});
}
export async function POST(req:Request):Promise<Response>{
 const origin=allowed(req);
 if(!origin.ok)return reply(403,{error:'Origen no permitido'});
 if(req.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return reply(415,{error:'Se requiere JSON.'},origin.origin);
 if(Number(req.headers.get('content-length')||0)>100000)return reply(413,{error:'Aplicación demasiado grande para editar.'},origin.origin);
 let data:Incoming;
 try{data=await req.json() as Incoming}catch{return reply(400,{error:'Solicitud inválida.'},origin.origin)}
 if(!data||typeof data.instruction!=='string'||data.instruction.trim().length<8||data.instruction.length>450)
  return reply(400,{error:'Describe el cambio en 8–450 caracteres.'},origin.origin);
 const bundle=data.app===undefined?null:validateGeneratedBundle(data.app);
 let original:{title:string;prompt:string;kind:string;summary:string}|null=null;
 if(data.app!==undefined&&!bundle)return reply(422,{error:'Los archivos actuales no son válidos.'},origin.origin);
 if(!bundle){
  if(!data.original||typeof data.original!=='object')return reply(422,{error:'No se encontraron archivos ni proyecto original.'},origin.origin);
  const p=data.original as Record<string,unknown>;
  if(typeof p.title!=='string'||typeof p.prompt!=='string'||typeof p.summary!=='string'||typeof p.kind!=='string'||
   p.title.length>120||p.prompt.length>450||p.summary.length>650||p.kind.length>30)return reply(422,{error:'Información del proyecto inválida.'},origin.origin);
  original={title:p.title,prompt:p.prompt,summary:p.summary,kind:p.kind};
 }
 const current=bundle?JSON.stringify(bundle):JSON.stringify(original);
 if(current.length>85000)return reply(413,{error:'El código actual supera el límite de edición.'},origin.origin);
 const access=await authorizePaid(req,'refine',data.turnstileToken);
 if(!access.ok)return reply(access.status,{error:access.error},origin.origin);
 const prompt=data.instruction.trim();
 const instruction=bundle?
  'EDITA esta miniapp existente. Conserva todas las características y la lógica que funcionaban, salvo lo que cambie el usuario. Envía el archivo completo actualizado, nunca un diff.' :
  'RECREA esta miniapp de un motor React predefinido como una implementación original standalone en HTML, CSS y JS. Conserva las características esenciales del juego original y añade el cambio. No puedes editar el código React original; esta es una NUEVA versión independiente.';
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{
   method:'POST',
   headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({
    model:process.env.OPENAI_CODE_MODEL||'gpt-5-mini',store:false,max_output_tokens:13500,
    reasoning:{effort:'low'},
    instructions:[
      'Eres Amelia, desarrolladora frontend senior del estudio BMAD.',
      instruction,
      'Desarrolla código que funcione: HTML body fragment sin script/style/link/iframe/head, CSS independiente, JS vanilla independiente.',
      'No uses import/export ni dependencias. Usa SVG/canvas/CSS para gráficos, sin recursos externos ni fuentes web.',
      'NO uses fetch, XHR, WebSocket, storage, navigator APIs, document.cookie ni comunicación con marcos externos.',
      'El código correrá únicamente en un iframe con sandbox allow-scripts y CSP que bloquea redes.',
      'Nunca realices pagos, apuestas monetarias o retiros. Si hay fichas de casino, solo puntos virtuales.',
      'Implementa realmente la mejora solicitada: crea elementos visuales y la lógica correspondiente, no botones decorativos.',
      'Asegúrate de que los ids, clases y selectores del JS existan en HTML.',
      'Mantén funcionalidades anteriores si existe fuente; evita regresiones y no olvides reinicio/estados límite.',
      'Devuelve JSON del schema con title, summary, features y files completos.',
      'La salida debe ser original, funcional en navegador y visualmente cuidada. Texto visible en español.'
    ].join(' '),
    input:[{role:'user',content:[{type:'input_text',text:
     'APLICACIÓN EXISTENTE:\n'+current+'\n\nNUEVA SOLICITUD DEL FUNDADOR:\n'+prompt}]}],
    text:{format:{type:'json_schema',name:'bmad_refined_app',strict:true,schema}}
   }),
   signal:AbortSignal.timeout(55000)
  });
  if(!response.ok)return reply(response.status===429?429:502,{
   error:response.status===429?'Se alcanzó un límite de generación; prueba más tarde.':'No se pudo actualizar la app con IA. Revisa tu cuenta API.'
  },origin.origin);
  const raw=await response.json() as {output?:{content?:{type?:string;text?:string}[]}[]};
  const content=raw.output?.flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text;
  if(!content)return reply(502,{error:'La IA no devolvió los archivos actualizados.'},origin.origin);
  let parsed:unknown;try{parsed=JSON.parse(content)}catch{return reply(502,{error:'La respuesta no contenía JSON válido.'},origin.origin)}
  const app=validateGeneratedBundle(parsed);
  if(!app)return reply(502,{error:'El resultado no pasó la validación. La versión anterior se conserva.'},origin.origin);
  return reply(200,{generated:app,recreated:!bundle},origin.origin);
 }catch{
  return reply(504,{error:'La edición tardó demasiado o el servidor no respondió. La versión anterior sigue intacta.'},origin.origin);
 }
}
