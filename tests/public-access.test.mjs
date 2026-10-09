import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizePaid,publicModeEnabled,betaAuthorized,LIMITS} from '../api/_access.ts';
import {GET} from '../api/access.ts';
const keys=['OPENAI_API_KEY','FORGE_BETA_CODE','FORGE_PUBLIC_ENABLED','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','TURNSTILE_SECRET_KEY','TURNSTILE_SITE_KEY','FORGE_LIMIT_SALT','VERCEL'];
const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
function configure(){
 process.env.OPENAI_API_KEY='mock-key';
 process.env.FORGE_BETA_CODE='private-test';
 process.env.FORGE_PUBLIC_ENABLED='1';
 process.env.UPSTASH_REDIS_REST_URL='https://redis.example';
 process.env.UPSTASH_REDIS_REST_TOKEN='redis-token';
 process.env.TURNSTILE_SECRET_KEY='captcha-secret';
 process.env.TURNSTILE_SITE_KEY='site-key';
 process.env.FORGE_LIMIT_SALT='unpublished-hmac-salt';
 process.env.VERCEL='1';
}
function req(ip='203.0.113.11',origin='https://bmad-quest.vercel.app'){
 return new Request('https://bmad-quest.vercel.app/api/generate',{method:'POST',
  headers:{origin,'x-vercel-forwarded-for':ip,'x-forge-beta-code':'private-test'}});
}
test('without protections configured, public access remains disabled and beta is required',async()=>{
 for(const k of keys)delete process.env[k];
 process.env.OPENAI_API_KEY='mock-key';process.env.FORGE_BETA_CODE='private-test';
 assert.equal(publicModeEnabled(),false);
 assert.equal(betaAuthorized('wrong'),false);assert.equal(betaAuthorized('private-test'),true);
 assert.equal((await authorizePaid(req(),'generate')).ok,true);
 const without=new Request('https://bmad-quest.vercel.app/api/generate',{method:'POST'});
 const denied=await authorizePaid(without,'generate');
 assert.equal(denied.ok,false);assert.equal(denied.status,401);
 assert.equal(JSON.parse(await GET(req()).text()).mode,'private');
});
test('public requests must pass Turnstile and Redis atomic quota; never use beta bypass',async()=>{
 configure();
 assert.equal(publicModeEnabled(),true);
 const previous=globalThis.fetch;
 let captchaCalls=0,redisCalls=0;
 globalThis.fetch=async (url,opts)=>{
  if(String(url).includes('siteverify')){captchaCalls++;return Response.json({success:true,hostname:'bmad-quest.vercel.app'})}
  if(String(url).includes('redis.example')){
   redisCalls++;
   const command=JSON.parse(opts.body);
   assert.equal(command[0],'EVAL');
   assert.ok(String(command[1]).includes('INCR'));
   assert.equal(command[2],'5');
   assert.equal(command[6].includes('203.0.113.11'),false,'raw IP must never become redis key');
   assert.equal(Number(command[command.length-1]),120);
   return Response.json({result:0});
  }
  throw Error('Unexpected network call');
 };
 try{
  const access=await authorizePaid(req(),'generate','turnstile-token');
  assert.equal(access.ok,true);assert.equal(access.mode,'public');
  assert.equal(captchaCalls,1);assert.equal(redisCalls,1);
  const status=JSON.parse(await GET(req()).text());
  assert.equal(status.mode,'public');assert.equal(status.siteKey,'site-key');assert.equal(status.limits.generations,LIMITS.generationsDaily);
  assert.ok(!JSON.stringify(status).includes('redis-token'));
  assert.ok(!JSON.stringify(status).includes('captcha-secret'));
 }finally{globalThis.fetch=previous}
});
test('quota exhaustion and datastore outage deny requests before calling OpenAI',async()=>{
 configure();const previous=globalThis.fetch;
 let quota=1;
 globalThis.fetch=async (url)=>{
  if(String(url).includes('siteverify'))return Response.json({success:true,hostname:'bmad-quest.vercel.app'});
  if(String(url).includes('redis.example'))return Response.json(quota===1?{result:3}:{error:'down'});
  throw Error('unexpected');
 };
 try{
  const full=await authorizePaid(req(),'refine','token');
  assert.equal(full.ok,false);assert.equal(full.status,429);
  quota=2;
  const down=await authorizePaid(req(),'generate','token');
  assert.equal(down.ok,false);assert.equal(down.status,503);
 }finally{globalThis.fetch=previous}
});
test('captcha failures, missing trusted IP and wrong hostname fail closed',async()=>{
 configure();const previous=globalThis.fetch;
 globalThis.fetch=async()=>Response.json({success:true,hostname:'evil.example'});
 try{
  assert.equal((await authorizePaid(req(),'generate','fake')).status,403);
  assert.equal((await authorizePaid(req('spoofed-ip'),'generate','fake')).status,503);
  delete process.env.VERCEL;
  assert.equal((await authorizePaid(req(),'generate','fake')).status,503);
 }finally{globalThis.fetch=previous}
});
test.after(()=>{for(const k of keys){if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k]}});
