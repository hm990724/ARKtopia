/** Deterministic, bounded minigames. All quality values are normalized to [0,1]. */
export const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
export function shuffle<T>(values:T[],seed:number):T[]{
 const a=[...values];let x=(seed>>>0)||1;
 for(let i=a.length-1;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;const j=(x>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]];}
 return a;
}
export type CacheCell='supply'|'hazard'|'empty';
export const SEARCH_WIDTH=5,SEARCH_SIZE=20,SEARCH_SCANS=5,SEARCH_PICKS=2;
export function searchBoard(seed:number):CacheCell[]{return shuffle<CacheCell>([...Array<CacheCell>(4).fill('supply'),...Array<CacheCell>(4).fill('hazard'),...Array<CacheCell>(12).fill('empty')],seed);}
export function searchSignal(board:CacheCell[],i:number){
 const x=i%SEARCH_WIDTH,y=Math.floor(i/SEARCH_WIDTH);
 const area=board.filter((_,j)=>Math.abs(j%SEARCH_WIDTH-x)+Math.abs(Math.floor(j/SEARCH_WIDTH)-y)<=1);
 return {supply:area.filter(c=>c==='supply').length,hazard:area.filter(c=>c==='hazard').length};
}
export function searchSector(board:CacheCell[],axis:'row'|'column',index:number){
 return board.filter((c,i)=>c==='supply'&&(axis==='row'?Math.floor(i/SEARCH_WIDTH):i%SEARCH_WIDTH)===index).length;
}
export function searchQuality(board:CacheCell[],picks:number[]){return clamp(picks.reduce((n,i)=>n+(board[i]==='supply'?1:board[i]==='hazard'?-.5:0),0)/SEARCH_PICKS);}
export type CrankAction='drive'|'steady'|'vent';
export type Generator={step:number;pressure:number;heat:number;output:number;trips:number};
export const initialGenerator:Generator={step:0,pressure:2,heat:0,output:0,trips:0};
export function generatorDemand(seed:number){return shuffle([1,1,1,2,2,2,2,3],seed);}
export function crankStep(s:Generator,action:CrankAction,demand:number[]):Generator{
 if(s.step>=demand.length)return s;
 const [gain,warm]=action==='drive'?[3,3]:action==='steady'?[2,1]:[-1,-4];
 const pressure=clamp(s.pressure+gain,0,6),heat=clamp(s.heat+warm,0,9);
 const trip=heat>=8,output=trip?0:Math.min(pressure,demand[s.step]);
 return {step:s.step+1,pressure:trip?0:pressure-output,heat:trip?4:heat,output:s.output+output,trips:s.trips+Number(trip)};
}
export function generatorQuality(s:Generator,demand:number[]){return clamp(s.output/demand.reduce((a,b)=>a+b,0)-s.trips*.15);}
export const FLOW_CAPACITY=8;
export function flowTargets(seed:number){return [0,1,2].map(i=>shuffle([2,3,4],seed+i*7919));}
export function flowScore(allocation:number[],target:number[],critical=0){
 return clamp((target.reduce((sum,t,i)=>sum+Math.min(t,allocation[i]),0)-allocation.reduce((sum,v,i)=>sum+Math.max(0,v-target[i])*.75,0)-Math.max(0,target[critical]-allocation[critical])*.8)/FLOW_CAPACITY);
}
export function adjustFlow(allocation:number[],index:number,delta:number){
 const next=[...allocation];if(index<0||index>=3||Math.abs(delta)!==1)return next;
 if(delta>0&&next.reduce((a,b)=>a+b,0)>=FLOW_CAPACITY)return next;
 next[index]=clamp(next[index]+delta,0,5);return next;
}
export function shiftWave(wave:number[],phase:number,bias=0){
 return wave.map((_,i)=>wave[((i+phase)%wave.length+wave.length)%wave.length]+bias);
}
export function calibrationRound(seed:number,round:number){
 const ref=shuffle([1,2,3,4,5,3,2],seed+round*101);
 const phase=1+((seed+round*3)>>>0)%6,bias=((seed+round)>>>0)%2===0?1:-1;
 return {ref,raw:shiftWave(ref,phase,bias)};
}
export function signalQuality(ref:number[],wave:number[]){
 return clamp(1-ref.reduce((sum,v,i)=>sum+Math.abs(v-wave[i]),0)/(ref.length*3));
}
