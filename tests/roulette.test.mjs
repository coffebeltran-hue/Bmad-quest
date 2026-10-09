import test from 'node:test';
import assert from 'node:assert/strict';
import {WHEEL_NUMBERS,rouletteColor,validRouletteBet,winsRouletteBet,settleRoulette,STARTING_CHIPS, wheelIndexFor} from '../src/roulette.ts';
test('wheel has the 37 unique European slots and accurate red/black/green colors',()=>{
 assert.equal(WHEEL_NUMBERS.length,37);
 assert.equal(new Set(WHEEL_NUMBERS).size,37);
 assert.equal(rouletteColor(0),'green');assert.equal(rouletteColor(32),'red');assert.equal(rouletteColor(15),'black');
 assert.equal(wheelIndexFor(0),0);assert.equal(wheelIndexFor(26),36);
});
test('zero loses for all even money wagers and number 0 wins straight up',()=>{
 for(const type of ['red','black','even','odd'])assert.equal(winsRouletteBet({type},0),false);
 assert.equal(winsRouletteBet({type:'number',number:0},0),true);
 assert.equal(winsRouletteBet({type:'number',number:9},5),false);
});
test('bets charge virtual chips and calculate exact even money and straight-up returns',()=>{
 assert.equal(STARTING_CHIPS,100);
 const red=settleRoulette(100,{type:'red'},10,32);
 assert.ok(red);assert.equal(red.won,true);assert.equal(red.payout,20);assert.equal(red.chips,110);
 const lose=settleRoulette(100,{type:'black'},25,0);
 assert.ok(lose);assert.equal(lose.chips,75);
 const number=settleRoulette(100,{type:'number',number:17},5,17);
 assert.ok(number);assert.equal(number.payout,180);assert.equal(number.chips,275);
});
test('invalid, unaffordable and negative wagers cannot be executed',()=>{
 assert.equal(settleRoulette(3,{type:'red'},5,3),null);
 assert.equal(settleRoulette(100,{type:'red'},7,3),null);
 assert.equal(settleRoulette(-10,{type:'red'},5,3),null);
 assert.equal(settleRoulette(100,{type:'number',number:37},5,3),null);
 assert.equal(settleRoulette(100,{type:'number'},5,3),null);
 assert.equal(settleRoulette(100,{type:'red'},5,37),null);
 assert.equal(validRouletteBet({type:'number',number:0}),true);
});
