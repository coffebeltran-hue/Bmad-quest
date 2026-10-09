import test from 'node:test';import assert from 'node:assert/strict';
import {newDeck,shuffle,handScore,compareHands,startBlackjack,hitCard,standCards,nextRound} from '../src/blackjack.ts';
const c=(rank,suit='♠')=>({rank,suit});
test('a legal deck has 52 unique cards and Fisher-Yates retains them',()=>{
 const deck=newDeck();assert.equal(deck.length,52);assert.equal(new Set(deck.map(c=>c.rank+c.suit)).size,52);
 assert.equal(shuffle(deck,()=>.25).length,52);
});
test('aces count as 11 or 1 without busting early',()=>{
 assert.equal(handScore([c('A'),c('9')]),20);
 assert.equal(handScore([c('A'),c('A'),c('9')]),21);
 assert.equal(handScore([c('A'),c('A'),c('9'),c('K')]),21);
 assert.equal(handScore([c('K'),c('Q'),c('2')]),22);
});
test('dealer draws until 17, compares scores and settles virtual chips',()=>{
 const game=startBlackjack(1,100,[c('2'),c('10'),c('5'),c('8'),c('7'),c('10'),c('9')]);
 assert.equal(handScore(game.player),19);
 assert.equal(handScore(game.dealer),15);
 const won=standCards(game);assert.equal(handScore(won.dealer),20);
 assert.equal(won.outcome,'lose');assert.equal(won.chips,90);
 assert.equal(hitCard(won),won);
 const another=nextRound(won,[c('4'),c('5'),c('6'),c('8'),c('7'),c('9')]);assert.equal(another.round,2);
});
test('natural 21 resolves, game never permits more moves after conclusion',()=>{
 const natural=startBlackjack(1,100,[c('8'),c('5'),c('9'),c('A'),c('K')]);
 assert.equal(natural.outcome,'win');assert.equal(natural.chips,120);
 assert.equal(standCards(natural),natural);
});
test('blackjack outcomes cover dealer bust and ties',()=>{
 assert.equal(compareHands([c('K'),c('8')],[c('K'),c('8')]),'push');
 assert.equal(compareHands([c('9'),c('8')],[c('K'),c('8'),c('9')]),'win');
 assert.equal(compareHands([c('K'),c('Q'),c('5')],[c('K'),c('2')]),'lose');
});
