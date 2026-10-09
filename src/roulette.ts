/** European-style roulette demo. Virtual, non-redeemable points only. */
export const WHEEL_NUMBERS = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26] as const;
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
export type RouletteColor = 'red'|'black'|'green';
export type BetType = 'red'|'black'|'even'|'odd'|'number';
export type RouletteBet = {type:BetType;number?:number};
export type RouletteResult = {winningNumber:number;color:RouletteColor;won:boolean;payout:number;chips:number;net:number};
export const STARTING_CHIPS=100;
export const BET_AMOUNTS=[5,10,25,50] as const;
export function rouletteColor(value:number):RouletteColor {
 if(!Number.isInteger(value)||value<0||value>36)throw Error('Número no válido');
 return value===0?'green':RED_NUMBERS.has(value)?'red':'black';
}
export function validRouletteBet(bet:RouletteBet):boolean {
 if(bet.type==='number')return Number.isInteger(bet.number)&&bet.number!>=0&&bet.number!<=36;
 return bet.number===undefined&&['red','black','even','odd'].includes(bet.type);
}
export function winsRouletteBet(bet:RouletteBet,result:number):boolean {
 if(!validRouletteBet(bet)||!Number.isInteger(result)||result<0||result>36)return false;
 if(bet.type==='number')return bet.number===result;
 if(result===0)return false;
 if(bet.type==='red'||bet.type==='black')return rouletteColor(result)===bet.type;
 return bet.type==='even'?result%2===0:result%2===1;
}
export function settleRoulette(chips:number,bet:RouletteBet,stake:number,winningNumber:number):RouletteResult|null {
 if(!Number.isSafeInteger(chips)||chips<0||!validRouletteBet(bet)||!BET_AMOUNTS.some(v=>v===stake)||stake>chips)return null;
 if(!Number.isInteger(winningNumber)||winningNumber<0||winningNumber>36)return null;
 const won=winsRouletteBet(bet,winningNumber);
 // Straight-up number: 35:1 profit; even-money outside bets: 1:1 profit.
 const payout=won?stake*(bet.type==='number'?36:2):0;
 return {winningNumber,color:rouletteColor(winningNumber),won,payout,chips:chips-stake+payout,net:payout-stake};
}
/** Use rejection sampling over a crypto random 32-bit integer when available. */
export function randomRouletteIndex():number {
 if(typeof crypto!=='undefined'&&typeof crypto.getRandomValues==='function'){
  const values=new Uint32Array(1);
  const limit=Math.floor(4294967296/37)*37;
  do{crypto.getRandomValues(values)}while(values[0]>=limit);
  return values[0]%37;
 }
 return Math.floor(Math.random()*37);
}
export function wheelIndexFor(value:number):number{return WHEEL_NUMBERS.indexOf(value as typeof WHEEL_NUMBERS[number]);}
