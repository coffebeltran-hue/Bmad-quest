import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCreditDelta, canAfford, canRequestFunding, fundEmergency,
  MISSION_COSTS, PARTY_COSTS, EMERGENCY_GRANT
} from '../src/economy.ts';

test('a purchase never succeeds without sufficient funds', () => {
  assert.equal(applyCreditDelta(0, -5), null);
  assert.equal(applyCreditDelta(4, -5), null);
  assert.equal(applyCreditDelta(1, -2), null);
  assert.equal(canAfford(0, 5), false);
});
test('exact funds pay the entire cost and a free action remains free', () => {
  assert.equal(applyCreditDelta(5, -5), 0);
  assert.equal(applyCreditDelta(8, -8), 0);
  assert.equal(applyCreditDelta(0, 0), 0);
  assert.equal(applyCreditDelta(3, 4), 7);
  assert.equal(applyCreditDelta(10, NaN), null);
});
test('mission and debate choices use known positive costs', () => {
  assert.deepEqual(MISSION_COSTS, [5, 13]);
  assert.deepEqual(PARTY_COSTS, [2, 8]);
});
test('assistance prevents a soft-lock and charges a permanent quality penalty', () => {
  const baseline = {credits: 0, quality: 30, fundingUsed: []};
  assert.equal(canRequestFunding(0, 5, 'mission:12', []), true);
  const funded = fundEmergency(baseline, 'mission:12', 5);
  assert.ok(funded);
  assert.equal(funded.credits, EMERGENCY_GRANT);
  assert.equal(funded.quality, 23);
  assert.deepEqual(funded.fundingUsed, ['mission:12']);
  assert.equal(fundEmergency(funded, 'mission:12', 5), null);
  assert.equal(fundEmergency({ credits: 5, quality: 30, fundingUsed: [] }, 'mission:12', 5), null);
});
test('assistance also works for party mode and never produces negative quality', () => {
  const funded = fundEmergency({credits: 1, quality: 2, fundingUsed: []}, 'party:0', 2);
  assert.ok(funded);
  assert.equal(funded.credits, 21);
  assert.equal(funded.quality, 0);
});
