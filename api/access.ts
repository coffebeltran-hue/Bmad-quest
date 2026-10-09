import {publicModeEnabled,LIMITS} from './_access.ts';
export function GET(req:Request):Response{
 const origin=req.headers.get('origin');
 const self=new URL(req.url).origin;
 const allowed=[self,'https://coffebeltran-hue.github.io','http://localhost:5173',...(process.env.FORGE_ALLOWED_ORIGIN||'').split(',').map(s=>s.trim()).filter(Boolean)];
 if(origin&&!allowed.includes(origin))return new Response(null,{status:403});
 const ready=publicModeEnabled();
 return new Response(JSON.stringify({
  mode:ready?'public':'private',
  siteKey:ready?process.env.TURNSTILE_SITE_KEY:null,
  limits:ready?{generations:LIMITS.generationsDaily,refinements:LIMITS.refinementsDaily,shared:LIMITS.visitorDaily}:null
 }),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origin?{'Access-Control-Allow-Origin':origin}:{})}});
}
