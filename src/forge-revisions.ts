import type {ForgeProject} from './forge-engine.ts';
import {validateGeneratedBundle} from './generated-app.ts';
export type ProjectEdit={instruction:string;title:string;at:number};
export type ProjectRevision={instruction:string;previous:ForgeProject};
export type RevisionState={project?:ForgeProject;edits:ProjectEdit[];revisions:ProjectRevision[]};
/** Updates only the project/history. Story progress, BMAD credits and earned missions stay unchanged. */
export function applyRevision<T extends RevisionState>(current:T,project:ForgeProject,instruction:string,now:number):T {
 if(!current.project||project.kind!=='generated'||!validateGeneratedBundle(project.generated)||!instruction.trim())return current;
 const prior=current.project;
 return {...current,project:{...project,prompt:prior.prompt},
  edits:[...current.edits,{instruction:instruction.trim(),title:project.title,at:now}].slice(-12),
  revisions:[...current.revisions,{instruction:instruction.trim(),previous:prior}].slice(-3)};
}
export function undoRevision<T extends RevisionState>(current:T,now:number):T{
 if(!current.project||!current.revisions.length)return current;
 const previous=current.revisions[current.revisions.length-1].previous;
 return {...current,project:previous,revisions:current.revisions.slice(0,-1),
  edits:[...current.edits,{instruction:'Restauré la versión anterior del producto.',title:previous.title,at:now}].slice(-12)};
}
