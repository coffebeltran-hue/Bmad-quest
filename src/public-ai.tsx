import {useEffect,useRef,useState} from 'react';
type PublicStatus={mode:'public'|'private';siteKey?:string|null;limits?:{generations:number;refinements:number;shared:number}|null};
type TurnstileApi={
 render:(target:HTMLElement,opts:Record<string,unknown>)=>string;
 remove:(id:string)=>void;
};
function widgetApi():TurnstileApi|undefined{
 return (window as Window&{turnstile?:TurnstileApi}).turnstile;
}
export function usePublicAccess(endpoint:string):PublicStatus{
 const [value,setValue]=useState<PublicStatus>({mode:'private'});
 useEffect(()=>{
  let live=true;
  if(!endpoint){setValue({mode:'private'});return}
  const url=endpoint.replace(/\/api\/(generate|forge|refine)\/?$/,'/api/access');
  fetch(url,{cache:'no-store'}).then(async r=>{
   if(!r.ok)throw Error('access');
   const data=await r.json() as PublicStatus;
   if(live)setValue(data.mode==='public'&&typeof data.siteKey==='string'&&data.siteKey?data:{mode:'private'});
  }).catch(()=>{if(live)setValue({mode:'private'})});
  return()=>{live=false};
 },[endpoint]);
 return value;
}
/** A fresh challenge is required for each paid model request. */
export function TurnstileChallenge({siteKey,onToken,resetKey}:{siteKey:string;onToken:(token:string)=>void;resetKey:number}){
 const div=useRef<HTMLDivElement|null>(null);
 const callback=useRef(onToken);
 callback.current=onToken;
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  let active=true;
  let widgetId:string|null=null;
  let script:HTMLScriptElement|null=null;
  setFailed(false);callback.current('');
  function display(){
   if(!active||!div.current||!widgetApi())return;
   try{
    widgetId=widgetApi()!.render(div.current,{
     sitekey:siteKey,theme:'dark',
     callback:(token:string)=>{if(active)callback.current(token)},
     'expired-callback':()=>{if(active)callback.current('')},
     'error-callback':()=>{if(active){callback.current('');setFailed(true)}}
    });
   }catch{if(active)setFailed(true)}
  }
  if(widgetApi())display();
  else{
   script=document.querySelector<HTMLScriptElement>('script[data-bmad-turnstile]');
   if(!script){
    script=document.createElement('script');
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;script.defer=true;script.dataset.bmadTurnstile='1';
    document.head.appendChild(script);
   }
   script.addEventListener('load',display);
   script.addEventListener('error',()=>{if(active)setFailed(true)},{once:true});
  }
  return()=>{
   active=false;
   if(script)script.removeEventListener('load',display);
   if(widgetId!==null){try{widgetApi()?.remove(widgetId)}catch{/* best effort */}}
   callback.current('');
  };
 },[siteKey,resetKey]);
 return <div className="forge-turnstile"><div ref={div}/>{failed&&<p role="alert">No se pudo cargar el control antibots. Recarga la página y comprueba la conexión.</p>}</div>;
}
