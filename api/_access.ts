import {createHash,timingSafeEqual} from 'node:crypto';
import {isIP} from 'node:net';
/** Public guest use is opt-in and fails closed without durable limits and Turnstile. */
export const LIMITS={visitorDaily:4,generationsDaily:2,refinementsDaily:3,globalDaily:25,visitorMinute:2,globalMinute:8} as const;
type Mode='public'|'private';
type Decision={ok:true;mode:Mode}|{ok:false;status:number;error:string};
export function publicModeEnabled():boolean {
 return process.env.FORGE_PUBLIC_ENABLED==='1'&&!!(
  process.env.OPENAI_API_KEY&&process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN&&
  process.env.TURNSTILE_SECRET_KEY&&process.env.TURNSTILE_SITE_KEY&&process.env.FORGE_LIMIT_SALT
 );
}
export function betaAuthorized(value:string):boolean{
 const key=process.env.FORGE_BETA_CODE;
 if(!key)return false;
 const a=Buffer.from(value),b=Buffer.from(key);
 return a.length===b.length&&timingSafeEqual(a,b);
}
const LUA=`
local n=#KEYS
for i=1,n do
 local v=tonumber(redis.call('GET',KEYS[i]) or '0')
 if v>=tonumber(ARGV[i]) then return i end
end
for i=1,n do
 redis.call('INCR',KEYS[i])
 if redis.call('TTL',KEYS[i]) < 0 then redis.call('EXPIRE',KEYS[i],tonumber(ARGV[n+i])) end
end
return 0
`;
function utcDay(){
 const date=new Date();
 return date.toISOString().slice(0,10);
}
function clientIp(req:Request):string|null{
 // Vercel injects x-vercel-forwarded-for; ignore attacker-provided custom headers.
 if(process.env.VERCEL!=='1')return null;
 const address=(req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'').split(',')[0].trim();
 return isIP(address)?address:null;
}
async function siteVerify(req:Request,token:string):Promise<boolean>{
 if(!token||token.length>2048)return false;
 try{
  const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY||'',response:token}),
   signal:AbortSignal.timeout(7000)
  });
  if(!res.ok)return false;
  const value=await res.json() as {success?:boolean;hostname?:string};
  const origin=req.headers.get('origin');
  if(!origin||!value.hostname)return false;
  return value.success===true&&new URL(origin).hostname===value.hostname;
 }catch{return false}
}
async function useQuota(ip:string,operation:'generate'|'refine'|'forge'):Promise<boolean|null>{
 try{
  const hash=createHash('sha256').update((process.env.FORGE_LIMIT_SALT||'')+'|'+ip).digest('hex').slice(0,40);
  const day=utcDay();
  const minute=Math.floor(Date.now()/60000);
  const names=[
   'bmad:public:'+day+':ip:'+hash+':total',
   'bmad:public:'+day+':ip:'+hash+':'+operation,
   'bmad:public:'+day+':global',
   'bmad:public:minute:'+minute+':ip:'+hash,
   'bmad:public:minute:'+minute+':global'
  ];
  const caps=[LIMITS.visitorDaily,operation==='generate'?LIMITS.generationsDaily:LIMITS.refinementsDaily,LIMITS.globalDaily,LIMITS.visitorMinute,LIMITS.globalMinute];
  // Counters are atomic even when Vercel runs many serverless instances simultaneously.
  const command=['EVAL',LUA,String(names.length),...names,...caps.map(String),'172800','172800','172800','120','120'];
  const response=await fetch(process.env.UPSTASH_REDIS_REST_URL!,{
   method:'POST',
   headers:{'Authorization':'Bearer '+process.env.UPSTASH_REDIS_REST_TOKEN,'Content-Type':'application/json'},
   body:JSON.stringify(command),
   signal:AbortSignal.timeout(7000)
  });
  if(!response.ok)return null;
  const body=await response.json() as {result?:number|string;error?:string};
  if(body.error||body.result===undefined)return null;
  return Number(body.result)===0;
 }catch{return null}
}
export async function authorizePaid(req:Request,operation:'generate'|'refine'|'forge',token?:unknown):Promise<Decision>{
 if(!process.env.OPENAI_API_KEY)return {ok:false,status:503,error:'La IA no está configurada en el servidor.'};
 if(!publicModeEnabled()){
  if(betaAuthorized(req.headers.get('x-forge-beta-code')||''))return {ok:true,mode:'private'};
  return {ok:false,status:process.env.FORGE_BETA_CODE?401:503,error:process.env.FORGE_BETA_CODE?'Código beta incorrecto.':'El acceso beta aún no está configurado.'};
 }
 const ip=clientIp(req);
 if(!ip)return {ok:false,status:503,error:'No se pudo verificar la identidad de red del visitante.'};
 if(typeof token!=='string'||!(await siteVerify(req,token)))return {ok:false,status:403,error:'Completa de nuevo la verificación antibots.'};
 const quota=await useQuota(ip,operation);
 if(quota===null)return {ok:false,status:503,error:'El servicio de cuotas no está disponible. Intenta más tarde.'};
 if(!quota)return {ok:false,status:429,error:'Alcanzaste el cupo de IA. Vuelve mañana (UTC) o cuando termine el límite de solicitudes.'};
 return {ok:true,mode:'public'};
}
