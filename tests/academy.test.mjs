import test from 'node:test';import assert from 'node:assert/strict';
import {academyTopics,filterAcademyTopics} from '../src/academy-data.ts';
test('18 Academy concepts provide detailed guide and skill invocation without fabricated shell commands',()=>{
 assert.equal(academyTopics.length,18);
 assert.equal(new Set(academyTopics.map(x=>x.name)).size,18);
 for(const item of academyTopics){assert.ok(item.detail.length>85,item.name);assert.ok(item.usage.length>50,item.name);assert.ok(item.command.startsWith('bmad'),item.name);assert.ok(item.output.length>20,item.name)}
});
test('search includes commands, names and categories',()=>{
 assert.ok(filterAcademyTopics('bmad-prd').some(x=>x.name==='PRD'));
 assert.ok(filterAcademyTopics('exploración').length>0);
 assert.equal(filterAcademyTopics('unknown-zzz-skill').length,0);
});
