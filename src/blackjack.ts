export type Suit='♠'|'♥'|'♦'|'♣';
export type Rank='A'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K';
export type Card={suit:Suit;rank:Rank};
export type Outcome='playing'|'win'|'lose'|'push';
export type BlackJackState={deck:Card[];player:Card[];dealer:Card[];outcome:Outcome;standing:boolean;round:number;chips:number;message:string};
export const SUITS:Suit[]=['♠','♥','♦','♣'];
export const RANKS:Rank[]=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export function newDeck():Card[]{return SUITS.flatMap(suit=>RANKS.map(rank=>({suit,rank})))}
export function shuffle(cards:Card[],random:()=>number=Math.random):Card[]{
 const deck=cards.slice();
 for(let i=deck.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));[deck[i],deck[j]]=[deck[j],deck[i]]}
 return deck;
}
export function handScore(hand:readonly Card[]):number{
 let score=0;let aces=0;
 for(const card of hand){
  if(card.rank==='A'){score+=11;aces++} else if(['K','Q','J'].includes(card.rank))score+=10;else score+=Number(card.rank);
 }
 while(score>21&&aces){score-=10;aces--}
 return score;
}
export function compareHands(player:readonly Card[],dealer:readonly Card[]):Exclude<Outcome,'playing'> {
 const p=handScore(player),d=handScore(dealer);
 if(p>21)return 'lose';
 if(d>21)return 'win';
 if(p>d)return 'win';
 if(d>p)return 'lose';
 return 'push';
}
function settled(state:BlackJackState,outcome:Exclude<Outcome,'playing'>):BlackJackState{
 const chips=Math.max(0,state.chips+(outcome==='win'?20:outcome==='lose'?-10:0));
 return {...state,outcome,chips,message:outcome==='win'?'¡Ganaste la ronda! +20 fichas':outcome==='lose'?'La banca ganó. -10 fichas':'Empate: tus fichas se conservan'};
}
export function startBlackjack(round=1,chips=100,deck:Card[]=shuffle(newDeck())):BlackJackState{
 if(deck.length<5)throw Error('Se requiere un mazo suficiente.');
 const copy=deck.slice();
 const player=[copy.pop()!,copy.pop()!];
 const dealer=[copy.pop()!,copy.pop()!];
 const game:BlackJackState={deck:copy,player,dealer,outcome:'playing',standing:false,round,chips,message:'Tu turno: pide carta o plántate.'};
 if(handScore(player)===21||handScore(dealer)===21)return settled(game,compareHands(player,dealer));
 return game;
}
export function hitCard(game:BlackJackState):BlackJackState{
 if(game.outcome!=='playing'||game.standing||!game.deck.length)return game;
 const deck=game.deck.slice();
 const player=[...game.player,deck.pop()!];
 const next={...game,deck,player};
 if(handScore(player)>21)return settled(next,'lose');
 if(handScore(player)===21)return standCards(next);
 return {...next,message:'Puntuación actual: '+handScore(player)+'. Puedes pedir otra o plantarte.'};
}
export function standCards(game:BlackJackState):BlackJackState{
 if(game.outcome!=='playing'||game.standing)return game;
 const deck=game.deck.slice(),dealer=game.dealer.slice();
 while(handScore(dealer)<17&&deck.length){dealer.push(deck.pop()!)}
 const next={...game,deck,dealer,standing:true};
 return settled(next,compareHands(game.player,dealer));
}
export function nextRound(game:BlackJackState,deck:Card[]=shuffle(newDeck())):BlackJackState{
 if(game.outcome==='playing')return game;
 return startBlackjack(game.round+1,game.chips,deck);
}
