/** User-requested AI miniapps: constrained to a separate, opaque-origin iframe. */
export type GeneratedFiles={html:string;css:string;javascript:string};
export type GeneratedBundle={title:string;summary:string;features:string[];files:GeneratedFiles};
const size={html:26000,css:24000,javascript:30000,title:90,summary:420};
export function validateGeneratedBundle(value:unknown):GeneratedBundle|null{
 if(!value||typeof value!=='object')return null;
 const v=value as Record<string,unknown>;
 if(typeof v.title!=='string'||!v.title.trim()||v.title.length>size.title||
    typeof v.summary!=='string'||v.summary.length>size.summary||
    !Array.isArray(v.features)||v.features.length>8||
    !v.features.every(x=>typeof x==='string'&&x.length<=100))return null;
 const f=v.files;
 if(!f||typeof f!=='object')return null;
 const files=f as Record<string,unknown>;
 if(Object.keys(files).some(k=>!['html','css','javascript'].includes(k)))return null;
 for(const key of ['html','css','javascript'] as const){
  if(typeof files[key]!=='string'||(files[key] as string).length>size[key])return null;
 }
 if(!(files.html as string).trim()||!(files.javascript as string).trim())return null;
 if(/<script\b|<iframe\b|<object\b|<embed\b|<base\b|<meta\b|<link\b/i.test(files.html as string))return null;
 if(/<\/\s*(?:style|script)/i.test(files.css as string))return null;
 // Scripts and styles live in a sandbox; disallow attempts to escape the document.
 return {title:v.title as string,summary:v.summary as string,
  features:v.features as string[],files:files as GeneratedFiles};
}
export function escapeDocumentText(value:string):string{
 return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function closeTagSafe(text:string):string{
 return text.replace(/<\/script/gi,'<\\/script').replace(/<\/style/gi,'<\\/style');
}
/** Return inert preview markup for stages 1-5; only stage 6 evaluates the generated JS. */
export function buildGeneratedDocument(bundle:GeneratedBundle,stage:number):string{
 const valid=validateGeneratedBundle(bundle);
 if(!valid)return '<!doctype html><html><body><p>La aplicación no superó la validación.</p></body></html>';
 const phase=Math.min(6,Math.max(0,Math.floor(stage)));
 const markup=phase<2?'<main class="bmad-draft"><h1>'+escapeDocumentText(valid.title)+'</h1><div class="line"></div><div class="box"></div><div class="line short"></div><p>Estructurando pantalla…</p></main>':valid.files.html;
 const draftCss='.bmad-draft{padding:36px;font-family:system-ui;color:#29385e}.bmad-draft .line{height:20px;background:#bdc8e9;border-radius:12px;margin:24px 0}.bmad-draft .box{height:210px;background:#e0e6f5;border-radius:20px}.bmad-draft .short{width:65%}';
 const css=phase<3?draftCss:valid.files.css;
 const active=phase>=6;
 // The generated document has an opaque origin (iframe sandbox allow-scripts without allow-same-origin).
 // CSP blocks external resources, network connections, child frames, popups, forms and base URLs.
 const policy=["default-src 'none'",active?"script-src 'unsafe-inline'":"script-src 'none'","style-src 'unsafe-inline'","img-src data: blob:","font-src 'none'","media-src 'none'","connect-src 'none'","frame-src 'none'","object-src 'none'","form-action 'none'","base-uri 'none'"].join('; ');
 const safeTitle=escapeDocumentText(valid.title);
 const safeCss=closeTagSafe(css);
 const safeJs=closeTagSafe(valid.files.javascript);
 // JS source appears only when the build animation reaches the final stage.
 return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="'+policy+'"><meta name="referrer" content="no-referrer"><title>'+safeTitle+'</title><style>html,body{min-height:100%;margin:0}body{overflow-x:hidden}button,input,select,textarea{font:inherit}'+safeCss+'</style></head><body>'+markup+(active?'<script>'+safeJs+'</script>':'<style>button,input,textarea,select{pointer-events:none!important;opacity:.85}</style>')+'</body></html>';
}
