import test from 'node:test';
import assert from 'node:assert/strict';
import {agentProfiles} from '../src/agent-profiles.ts';

test('five specialists have distinct, substantial profiles and specialties',()=>{
 const agents=Object.values(agentProfiles);
 assert.equal(agents.length,5);
 assert.equal(new Set(agents.map(a=>a.name)).size,5);
 for(const agent of agents){
  assert.ok(agent.description.length>240,agent.name+' lacks meaningful description');
  assert.ok(agent.short.length>60,agent.name+' lacks card description');
  assert.ok(agent.specialties.length>=4);
  assert.ok(agent.mission.length>45);
  assert.ok(agent.tagline.length>20);
 }
});
