import type {FieldCombat} from './field-combat';
import {newHunt,normalizeHunt,type HuntState} from './hidden-hunt';
/** ECHO WARD v31: deterministic, saveable field exploration and tactical animal behaviour.
 * Tiles are indices in a 7×5 investigation map or a 6×6 capture board.
 */
import type {AnimalId} from './sim';
import type {RegionId} from './game-v10';

export const FIELD_COLUMNS=7;
export const FIELD_ROWS=5;
export const FIELD_START=14;
export const FIELD_EXIT=20;
export type FieldTile='empty'|'wall'|'track'|'cache'|'hazard'|'signal'|'animal'|'exit';
export type Pace='quiet'|'normal'|'fast';
export type FieldChoice={id:string;kind:'cache'|'signal'|'hazard';title:string;description:string;danger:number;reward:number};
export type FieldThreat={position:number;alert:number;mode:'search'|'closing';origin?:number;lastSeen?:number;stage?:'patrol'|'investigate'|'alerted'|'chase'|'search'|'retreat';ticks?:number;warningTicks?:number;cooldown?:number};
export type SporeSwarm={position:number;origin:number;alert:number;target?:number;mode:'drift'|'chase'|'search';ticks:number};
export type FieldState={region?:RegionId;acoustic?:{step:number;serial:number;direction:string;range:string;pan:number;strength:number;kind:'animal'|'exit'|'threat'|'fragment'};originFragments?:Record<number,number>;lightOff?:boolean;sporeTicks?:number;sporeSwarm?:SporeSwarm|null;sporeSpread?:{turn:number;active:number[];cells:number[];lastGrowth?:number[]};worldShift?:{serial:number;nextStep:number;lastStep:number;notice:string};combat?:FieldCombat|null;interruptedCapture?:CaptureState|null;threat?:FieldThreat|null;mutantSpawns?:number;mutantNextStep?:number;previousPosition?:number;discovered?:number[];concealed?:boolean;tiles:FieldTile[];position:number;visited:number[];steps:number;clues:number;loot:number;noise:number;wildlifeIndex:number;wildlifeSpecies?:Record<number,AnimalId>;seenSpecies?:AnimalId[];encountered:boolean;lastEvent:string;pressure?:number;width?:number;height?:number;origin?:number;exitIndex?:number;choice?:FieldChoice|null;sortie?:number};
export type DeviceKind='cage'|'bait'|'sound'|'light'|'barrier';
export type TacticalDevice={position:number;kind:DeviceKind};
export type CaptureState={species:AnimalId;position:number;devices:TacticalDevice[];turn:number;fear:number;trust:number;maxTurns:number;lastEvent:string;tutorial:boolean;outcome:'playing'|'caught'|'escaped';path:number[];gate:number;prediction:number|null;confirmed:number;lastConfirmed:number|null;sealArmed:boolean;focus?:number;hunt?:HuntState;};

const hash=(seed:number)=>{let v=(seed^0x9e3779b9)>>>0;v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0};
const seedFor=(day:number,region:RegionId)=>region.split('').reduce((n,c)=>hash(n+c.charCodeAt(0)),day*313+19);
const distance=(a:number,b:number,width:number)=>Math.abs(a%width-b%width)+Math.abs(Math.floor(a/width)-Math.floor(b/width));
export const fieldDimensions=(region:RegionId):{width:number;height:number}=>({garden:{width:8,height:8},conservatory:{width:8,height:8},rail:{width:9,height:9},archive:{width:10,height:10},vault:{width:11,height:11},tunnels:{width:12,height:12}}[region]);
export const REGION_RULES:Record<RegionId,{title:string;description:string;blind:boolean;sporeRate:number;sporeWake:number;sporeGrowth:number;sporeCap:number}> = {
 garden:{title:'기본 수색',description:'생체 청음과 시야로 개체 신호를 추적한다.',blind:false,sporeRate:0.3,sporeWake:0,sporeGrowth:1,sporeCap:0.45},
 conservatory:{title:'온실 · 급속 오염',description:'포자가 빠르게 번진다. 바이오필터와 빠른 귀환이 유리하다.',blind:false,sporeRate:0.3,sporeWake:0,sporeGrowth:1,sporeCap:0.5},
 rail:{title:'폐역 · 완전 암전',description:'조명은 무용하다. 청음의 방향과 강도로 길을 찾아라. 소음이 적을수록 안전하다.',blind:true,sporeRate:0.3,sporeWake:0,sporeGrowth:2,sporeCap:0.55},
 archive:{title:'관측소 · 혼선 신호',description:'정상 기록과 가짜 신호가 뒤섞인다. 스캐너나 기록관으로 판별할 수 있다.',blind:false,sporeRate:0.3,sporeWake:0,sporeGrowth:2,sporeCap:0.6},
 vault:{title:'연구동 · 봉인 물자',description:'잠긴 보급 설비가 많다. 스캐너 또는 보급관은 안전한 회수에 유리하다.',blind:false,sporeRate:0.3,sporeWake:0,sporeGrowth:2,sporeCap:0.65},
 tunnels:{title:'제0구역 · 복합 위험',description:'시야가 좁고 소음이 증폭되며 포자가 빠르게 퍼진다.',blind:false,sporeRate:0.3,sporeWake:0,sporeGrowth:3,sporeCap:0.7}
};
export function fieldVision(region:RegionId,light:boolean,scanner=false,level=0){return REGION_RULES[region].blind?0:region==='tunnels'?(scanner?2+Math.floor(level/2):1):scanner?3+Math.floor(level/2):light?2:1;}
export function acousticBearing(f:FieldState,kind:'animal'|'exit'|'threat'|'fragment'){
 const fragment=Object.keys(f.originFragments??{}).map(Number).sort((a,b)=>distance(a,f.position,fieldWidth(f))-distance(b,f.position,fieldWidth(f)))[0];
 const target=kind==='fragment'?fragment:kind==='threat'?f.threat?.position:kind==='exit'?f.exitIndex:remainingWildlife(f).sort((a,b)=>distance(a,f.position,fieldWidth(f))-distance(b,f.position,fieldWidth(f)))[0];
 if(target===undefined||target<0)return null;const w=fieldWidth(f),dx=target%w-f.position%w,dy=Math.floor(target/w)-Math.floor(f.position/w),d=Math.abs(dx)+Math.abs(dy);
 return {step:f.steps,serial:(f.acoustic?.serial??0)+1,direction:d===0?'현재 위치':(dy<0?'북':dy>0?'남':'')+(dx<0?'서':dx>0?'동':'')+'쪽',range:d<=2?'근거리':d<=5?'중거리':'원거리',pan:dx===0?0:dx<0?-.85:.85,strength:Math.max(.12,1-d/18),kind};
}
export function metalFloor(f:FieldState,index:number){return (f.region==='rail'||f.region==='tunnels')&&hash((f.sortie??0)*7919+index*313)%100<30;}
export function falseFieldSignal(f:FieldState,index:number){return f.region==='archive'&&hash((f.sortie??0)*5119+index*313)%100<42;}
export const fieldWidth=(f:FieldState)=>f.width??FIELD_COLUMNS;
export const fieldHeight=(f:FieldState)=>f.height??FIELD_ROWS;
export const adjacentField=(a:number,b:number,width=FIELD_COLUMNS,size=FIELD_COLUMNS*FIELD_ROWS)=>a>=0&&a<size&&b>=0&&b<size&&distance(a,b,width)===1;
/** Static contamination sources remain hazardous, independent of the mobile swarm. */
export function fieldSporeNearby(f:FieldState):boolean{
 return f.tiles.some((tile,i)=>(tile==='hazard'||f.sporeSpread?.cells.includes(i))&&(i===f.position||adjacentField(i,f.position,fieldWidth(f),f.tiles.length)));
}
/** A fictional mobile colony follows detectable light, movement and nearby bio-signals. */
function sporePaths(f:FieldState,target:number){
 const w=fieldWidth(f),neighbors=(at:number)=>[at-w,at+w,at-1,at+1].filter(i=>adjacentField(at,i,w,f.tiles.length)&&f.tiles[i]!=='wall');
 const costs=new Map<number,number>([[target,0]]),queue=[target];
 for(let i=0;i<queue.length;i++)for(const next of neighbors(queue[i]))if(!costs.has(next)){costs.set(next,costs.get(queue[i])!+1);queue.push(next);}
 return {costs,neighbors};
}
export function initializeSporeSwarm(f:FieldState){
 if(f.sporeSwarm!==undefined)return;
 const {costs}=sporePaths(f,f.position);
 const candidates=[...costs.entries()].filter(([i,d])=>d>=3&&f.tiles[i]!=='exit'&&f.tiles[i]!=='animal').sort((a,b)=>Math.abs(a[1]-4)-Math.abs(b[1]-4)||(f.tiles[b[0]]==='hazard'?1:0)-(f.tiles[a[0]]==='hazard'?1:0)||a[0]-b[0]);
 const at=candidates[0]?.[0];f.sporeSwarm=at===undefined?null:{position:at,origin:at,alert:0,mode:'drift',ticks:0};
}
export function mobileSporeSignal(f:FieldState){
 const s=f.sporeSwarm;if(!s)return null;
 const w=fieldWidth(f),dx=s.position%w-f.position%w,dy=Math.floor(s.position/w)-Math.floor(f.position/w),distance=Math.abs(dx)+Math.abs(dy);
 return {distance,direction:distance===0?'현재 위치':(dy<0?'북':dy>0?'남':'')+(dx>0?'동':dx<0?'서':'')+'쪽',alert:s.alert,mode:s.mode};
}
export function mobileSporeContact(f:FieldState):boolean{
 const signal=mobileSporeSignal(f);return !!signal&&signal.distance<=1&&fieldLineOfSight(f,f.sporeSwarm!.position,1);
}
export function advanceSporeSwarm(f:FieldState,lightOn=false):void{
 initializeSporeSwarm(f);
 const s=f.sporeSwarm;if(!s)return;
 const d=distance(s.position,f.position,fieldWidth(f));
 s.ticks++;
 const detected=!f.concealed&&((d<=4&&fieldLineOfSight(f,s.position,4))||(lightOn&&fieldLineOfSight(f,s.position,6))||(f.noise>=16&&d<=6));
 if(detected){s.alert=Math.min(100,s.alert+(lightOn?24:18));s.target=f.position;s.mode='chase';}
 else{s.alert=Math.max(0,s.alert-18);s.mode=s.alert>0&&s.target!==undefined?'search':'drift';if(!s.alert)s.target=undefined;}
 const target=s.target??s.origin;
 if(s.position===target||s.mode==='drift'&&s.ticks%2!==0)return;
 const {costs,neighbors}=sporePaths(f,target);
 const next=neighbors(s.position).sort((a,b)=>(costs.get(a)??Infinity)-(costs.get(b)??Infinity))[0];
 if(next!==undefined&&(costs.get(next)??Infinity)<(costs.get(s.position)??Infinity))s.position=next;
}
/** Turn-based stationary contamination. Each connected active colony spreads independently, including in fog. */
export function sporeVisibleCells(f:FieldState):number[]{
 return [...new Set([...f.tiles.flatMap((v,i)=>v==='hazard'?[i]:[]),...(f.sporeSpread?.cells??[])])];
}
/** Dynamic field changes are movement-gated, saveable and never remove a nearby exit. */
export function advanceFieldShift(f:FieldState){
 const shift=f.worldShift??={serial:0,nextStep:6,lastStep:-1,notice:''};
 if(f.steps<shift.nextStep)return;
 shift.nextStep=f.steps+6+hash((f.sortie??0)*7919+f.steps*313)%4;
 const w=fieldWidth(f),{costs,neighbors}=sporePaths(f,f.position);
 const seed=hash((f.sortie??0)*7919+f.steps*313+(shift.serial+1)*1709);
 const safe=(i:number)=>i!==f.position&&i!==f.origin&&i!==f.wildlifeIndex&&i!==f.exitIndex&&i!==f.threat?.position&&f.originFragments?.[i]===undefined&&(costs.get(i)??-1)>=3;
 const clean=(i:number)=>safe(i)&&f.tiles[i]==='empty'&&!f.visited.includes(i)&&!f.sporeSpread?.cells.includes(i);
 const order=(a:number,b:number)=>hash(seed+a*337)-hash(seed+b*337);
 const changes:string[]=[];
 const old=f.exitIndex;
 if(old!==undefined&&f.tiles[old]==='exit'&&(costs.get(old)??Infinity)>2){
  const candidates=[...costs.keys()].filter(i=>clean(i)&&(i%w===0||i%w===w-1||i<w||i>=f.tiles.length-w)&&(costs.get(i)??Infinity)<=Math.min(12,(costs.get(old)??10)+2)).sort(order);
  const at=candidates[0];
  if(at!==undefined){f.tiles[old]='empty';f.tiles[at]='exit';f.exitIndex=at;if(f.acoustic?.kind==='exit')delete f.acoustic;changes.push('귀환 유도 신호 변경 · 다시 청음하십시오');}
 }
 const from=[...costs.keys()].filter(i=>safe(i)&&f.tiles[i]==='cache'&&!f.visited.includes(i)).sort(order)[0];
 const to=[...costs.keys()].filter(clean).sort(order)[0];
 if(from!==undefined&&to!==undefined){f.tiles[from]='empty';f.tiles[to]='cache';changes.push('미회수 보급 신호 이동');}
 const spread=f.sporeSpread;
 if(spread&&spread.turn>3){
  const drift=spread.cells.filter(safe).sort(order).find(i=>neighbors(i).some(j=>clean(j)&&!spread.cells.includes(j)));
  if(drift!==undefined){const at=neighbors(drift).filter(j=>clean(j)&&!spread.cells.includes(j)).sort(order)[0];if(at!==undefined){spread.cells=spread.cells.map(i=>i===drift?at:i);spread.active=spread.active.filter(i=>i!==drift);changes.push('포자 분포 변화');}}
 }
 if(changes.length){shift.serial++;shift.lastStep=f.steps;shift.notice=changes.join(' · ');}
}
/** MUTANT deposits persistent spores; never overwrite loot, wildlife, entry or exit tiles. */
export function depositMutantSpores(f:FieldState,at:number,count=1):number{
 const s=f.sporeSpread??={turn:0,active:[],cells:[]};
 const occupied=new Set(sporeVisibleCells(f)),w=fieldWidth(f),rule=REGION_RULES[f.region??'garden'];
 const allowed=(i:number)=>i>=0&&i<f.tiles.length&&f.tiles[i]!=='wall'&&f.tiles[i]!=='exit'&&i!==f.origin&&i!==f.exitIndex;
 const maximum=Math.floor(f.tiles.filter((_,i)=>allowed(i)).length*rule.sporeCap);
 const pool=[at,...[at-w,at+w,at-1,at+1].filter(i=>adjacentField(at,i,w,f.tiles.length))].filter(i=>allowed(i)&&!occupied.has(i));
 let added=0;for(const i of pool){if(added>=count||occupied.size>=maximum)break;s.cells.push(i);occupied.add(i);added++;}
 return added;
}
export function advanceSporeSpread(f:FieldState,roll?:()=>number):number|null{
 const s=f.sporeSpread??={turn:0,active:[],cells:[]};s.turn++;
 s.lastGrowth=[];
 advanceFieldShift(f);
 f.sporeSwarm=null;
 const sources=f.tiles.flatMap((v,i)=>v==='hazard'?[i]:[]);
 const all=[...new Set([...sources,...s.cells])],w=fieldWidth(f);
 const near=all.filter(i=>distance(i,f.position,w)<=1);
 const rule=REGION_RULES[f.region??'garden'];
 const previous=all;
 s.active=[...new Set([...s.active,...near])];
 if(!previous.length)return null;
 const neighbors=(i:number)=>[i-w,i+w,i-1,i+1].filter(j=>adjacentField(i,j,w,f.tiles.length));
 const allowed=(j:number)=>f.tiles[j]!=='wall'&&f.tiles[j]!=='exit'&&j!==f.exitIndex&&j!==f.origin;
 const occupied=new Set(all);
 const maximum=Math.floor(f.tiles.filter((_,i)=>allowed(i)).length*rule.sporeCap);
 if(occupied.size>=maximum)return null;
 let salt=0;const random=roll??(()=>hash(s.turn*7919+(f.sortie??0)*313+f.position*101+s.cells.length*43+(++salt)*11239)/4294967296);
 // Freeze colonies at the beginning of this turn. New growth cannot chain again until next turn.
 const unseen=new Set(previous),colonies:number[][]=[];
 for(const cell of previous){if(!unseen.delete(cell))continue;const colony=[cell];for(let i=0;i<colony.length;i++)for(const n of neighbors(colony[i]))if(unseen.delete(n))colony.push(n);colonies.push(colony);}
 // Rotate priority to avoid starving colonies at the bottom of the map when approaching the cap.
 const offset=s.turn%colonies.length;
 for(let i=0;i<colonies.length&&occupied.size<maximum;i++){
  const colony=colonies[(i+offset)%colonies.length];
  if(random()>=rule.sporeRate)continue;
  const frontier=[...new Set(colony.flatMap(neighbors))].filter(j=>allowed(j)&&!occupied.has(j));
  for(let count=0;count<rule.sporeGrowth&&frontier.length&&occupied.size<maximum;count++){
   const pick=Math.min(frontier.length-1,Math.floor(random()*frontier.length));
   const at=frontier.splice(pick,1)[0];occupied.add(at);s.cells.push(at);s.lastGrowth.push(at);
  }
 }
 return s.lastGrowth[0]??null;
}
export function fieldHasCover(f:FieldState,index=f.position):boolean{const width=fieldWidth(f);return [index-width,index+width,index-1,index+1].some(i=>adjacentField(index,i,width,f.tiles.length)&&f.tiles[i]==='wall');}
export function fieldLineOfSight(f:FieldState,i:number,range=1):boolean{
 const width=fieldWidth(f);if(distance(f.position,i,width)>range)return false;
 let x=f.position%width,y=Math.floor(f.position/width);const tx=i%width,ty=Math.floor(i/width),dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;let err=dx+dy;
 while(x!==tx||y!==ty){const twice=2*err;if(twice>=dy){err+=dy;x+=sx}if(twice<=dx){err+=dx;y+=sy}if(x===tx&&y===ty)return true;if(f.tiles[y*width+x]==='wall')return false;}return true;
}
export const fieldVisible=(f:FieldState,i:number,range=1)=>f.visited.includes(i)||(f.discovered??[]).includes(i)||fieldLineOfSight(f,i,range);
export function revealField(f:FieldState,range:number){f.discovered=[...new Set([...(f.discovered??[]),...f.tiles.flatMap((_,i)=>fieldLineOfSight(f,i,range)?[i]:[])])];}
/** Coarse CCTV bearing only; never returns the animal's tile or coordinates. */
export function fieldRelayBearing(f:FieldState,level:number):string|null{
 if(level<2)return null;
 const animalAt=remainingWildlife(f).sort((a,b)=>distance(a,f.position,fieldWidth(f))-distance(b,f.position,fieldWidth(f)))[0];if(animalAt===undefined)return null;
 const width=fieldWidth(f),dx=animalAt%width-f.position%width,dy=Math.floor(animalAt/width)-Math.floor(f.position/width),distance=Math.abs(dx)+Math.abs(dy);
 if(distance===0)return '현재 위치에서 생체 신호 확인';
 const direction=`${dy<0?'북':dy>0?'남':''}${dx>0?'동':dx<0?'서':''}`;
 return `${direction}쪽에서 약한 생체 신호${distance>5?' · 원거리':distance>2?' · 중거리':' · 근거리'}`;
}
/** Advance a roaming threat by one real-time step without spending player AP. */
export function fieldThreatSignal(f:FieldState){
 const t=f.threat;if(!t)return null;
 const w=fieldWidth(f),dx=t.position%w-f.position%w,dy=Math.floor(t.position/w)-Math.floor(f.position/w);
 const distance=Math.abs(dx)+Math.abs(dy), strength=Math.max(0,Math.min(100,100-distance*15));
 const direction=distance===0?'바로 근처':(dy<0?'북':dy>0?'남':'')+(dx>0?'동':dx<0?'서':'')+'쪽';
 return {direction,distance:distance<=2?'근거리':distance<=5?'중거리':'원거리',strength,alert:t.alert,warning:(t.warningTicks??0)>0,stage:t.stage??(t.mode==='closing'?'chase':'patrol')};
}
/** Select the farthest reachable cell, without occupying a story object or exit. */
export function farthestThreatCell(f:FieldState):number|null{
 const {costs}=sporePaths(f,f.position);
 const pool=[...costs.entries()].filter(([i,d])=>d>=3&&i!==f.exitIndex&&i!==f.origin&&f.tiles[i]!=='animal'&&f.originFragments?.[i]===undefined).sort((a,b)=>b[1]-a[1]||a[0]-b[0]);
 return pool[0]?.[0]??null;
}
/** Difficulty is tied to the current sector, not the calendar alone. */
export const MUTANT_TIERS=[
 {threshold:82,minSteps:15,respawn:12,escapeGrace:8,maxSpawns:1,basePressure:2,trailEvery:5,damageScale:.65,hp:36,ambiguity:0},
 {threshold:74,minSteps:12,respawn:10,escapeGrace:6,maxSpawns:1,basePressure:3,trailEvery:4,damageScale:.8,hp:42,ambiguity:10},
 {threshold:66,minSteps:9,respawn:8,escapeGrace:5,maxSpawns:2,basePressure:4,trailEvery:3,damageScale:1,hp:48,ambiguity:25},
 {threshold:60,minSteps:7,respawn:6,escapeGrace:4,maxSpawns:2,basePressure:5,trailEvery:3,damageScale:1.08,hp:54,ambiguity:40},
 {threshold:54,minSteps:5,respawn:5,escapeGrace:3,maxSpawns:3,basePressure:6,trailEvery:2,damageScale:1.15,hp:60,ambiguity:60},
 {threshold:48,minSteps:4,respawn:4,escapeGrace:2,maxSpawns:3,basePressure:7,trailEvery:2,damageScale:1.25,hp:66,ambiguity:80}
] as const;
export function mutantTierIndex(region?:RegionId){return Math.max(0,['garden','conservatory','rail','archive','vault','tunnels'].indexOf(region??'garden'));}
export function mutantTier(region?:RegionId){return MUTANT_TIERS[mutantTierIndex(region)];}
export function fieldPressureGain(f:FieldState,day:number,pace:Pace,relay:number,contaminated:boolean){
 const tier=mutantTier(f.region),index=mutantTierIndex(f.region);
 return Math.max(1,tier.basePressure-Math.min(2,Math.floor(relay/2))+(pace==='quiet'?-1:pace==='fast'?3+index:0)+(contaminated?3+index:0)+Math.min(index,Math.floor(day/10)));
}
export function advanceFieldThreat(f:FieldState,_noise=f.noise,_relayLevel=0,_lightOn=false,pace?:Pace):boolean{
 const t=f.threat;if(!t||f.combat)return false;
 const tier=mutantTier(f.region),index=mutantTierIndex(f.region);
 t.ticks=(t.ticks??0)+1;
 if((t.cooldown??0)>0){t.cooldown!--;return false;}
 const {costs,neighbors}=sporePaths(f,f.position);
 const d=costs.get(t.position)??Infinity;
 // Early sectors can lose the administrator's trail in quiet, distant movement.
 if(index<=1&&pace==='quiet'&&d>4&&t.ticks%2===0){t.mode='search';t.stage='search';t.warningTicks=0;return false;}
 t.alert=Math.max(0,Math.min(100,f.pressure??0));t.mode='closing';t.stage='chase';
 // Advanced variants anticipate the next step or cut off the known exit; never pass walls or teleport.
 const prev=f.previousPosition,delta=prev===undefined?0:f.position-prev;
 const predicted=f.position+delta;
 const target=index>=3&&delta&&adjacentField(f.position,predicted,fieldWidth(f),f.tiles.length)&&f.tiles[predicted]!=='wall'?predicted:undefined;
 const intercept=target===undefined?null:sporePaths(f,target).costs;
 const exitCosts=index>=4&&f.exitIndex!==undefined?sporePaths(f,f.exitIndex).costs:null;
 for(let i=0;i<2;i++){
  if((costs.get(t.position)??Infinity)<=1)break;
  const score=(cell:number)=>(costs.get(cell)??Infinity)+(intercept?Math.min(12,intercept.get(cell)??12)*.35:0)+(exitCosts?Math.min(12,exitCosts.get(cell)??12)*.15:0);
  const next=neighbors(t.position).filter(j=>(costs.get(j)??Infinity)<(costs.get(t.position)??Infinity)).sort((a,b)=>score(a)-score(b))[0];
  if(next===undefined)break;
  if(i===0&&t.ticks%tier.trailEvery===0)depositMutantSpores(f,t.position);
  t.position=next;
 }
 const close=(costs.get(t.position)??Infinity)<=1;
 t.warningTicks=close?1:0;return close;
}
/** Each expedition gets its own seeded layout, a new exit and a guaranteed walkable corridor. */
/** Place unique record shards on reachable empty ground, independent of ordinary loot. */
export function placeOriginFragments(f:FieldState,ids:number[],seed:number){const w=fieldWidth(f),q=[f.position],seen=new Set(q);for(let k=0;k<q.length;k++)for(const i of [q[k]-w,q[k]+w,q[k]-1,q[k]+1])if(adjacentField(q[k],i,w,f.tiles.length)&&f.tiles[i]!=='wall'&&!seen.has(i)){seen.add(i);q.push(i);}const candidates=q.filter(i=>i!==f.position&&i!==f.wildlifeIndex&&f.tiles[i]==='empty'&&distance(i,f.position,w)>=2).sort((a,b)=>hash(seed+a*313)-hash(seed+b*313));const fallback=q.filter(i=>i!==f.position&&f.tiles[i]!=='animal'&&f.tiles[i]!=='exit'&&!candidates.includes(i));const pool=[...candidates,...fallback];f.originFragments={};ids.forEach((id,i)=>{if(pool[i]!==undefined)f.originFragments![pool[i]]=id;});}
export function remainingWildlife(f:FieldState):number[]{return f.tiles.flatMap((tile,i)=>tile==='animal'?[i]:[]);}
export function createField(day:number,region:RegionId,sortie=0,guided=day===1&&region==='garden',maxAnimals=3):FieldState {
 const dims=fieldDimensions(region),width=dims.width,height=dims.height,size=width*height;
 const seed=hash(seedFor(day,region)+sortie*7919);
 const tiles:FieldTile[]=Array(size).fill('empty');
 const startingRow=guided?2:1+(hash(seed+113)%(height-2));
 const exitRow=guided?2:(hash(seed+337)%(height));
 const start=startingRow*width;
 const exit=exitRow*width+(width-1);
 for(let i=0;i<size;i++){
  const r=Math.floor(i/width),c=i%width,h=hash(seed+i*337)%100;
  const corePath=r===startingRow || (c===width-1&&r>=Math.min(startingRow,exitRow)&&r<=Math.max(startingRow,exitRow));
  if(!corePath&&h<12)tiles[i]='wall';
  else if(h< (18+mutantTierIndex(region)))tiles[i]='hazard';
  else if(h<46)tiles[i]='empty';
  else if(h<65)tiles[i]='cache';
  else if(h<77)tiles[i]='signal';
 }
 // Most early encounters sit near the protected central route. Later regions hide them farther away.
 const wildlifeCol=guided?3:Math.min(width-2,2+hash(seed+971)%(Math.max(2,width-3)));
 const wildlifeRow=guided?startingRow:Math.min(height-2,Math.max(1,startingRow+(hash(seed+1171)%3)-1));
 const wildlifeIndex=wildlifeRow*width+wildlifeCol;
 // Carve reachable corridors without opening the entire map.
 for(let c=0;c<width;c++)tiles[startingRow*width+c]=c===width-1?tiles[startingRow*width+c]:'empty';
 for(let r=Math.min(startingRow,exitRow);r<=Math.max(startingRow,exitRow);r++)tiles[r*width+width-1]='empty';
 for(let r=Math.min(startingRow,wildlifeRow);r<=Math.max(startingRow,wildlifeRow);r++)tiles[r*width+wildlifeCol]='empty';
 tiles[start]='empty';tiles[exit]='exit';tiles[wildlifeIndex]='animal';
 // Only the introductory mission needs visible footprints.
 if(guided)tiles[start+1]='track';
 const nearby=[start-width+1,start+width+1].filter(i=>i>=0&&i<size&&i!==wildlifeIndex&&i!==exit);for(const i of nearby)tiles[i]='hazard';
 // Each signal is reachable from the entry. Do not overwrite caches, hazards, or story signals.
 const reached=new Set<number>([start]),queue=[start];
 for(let i=0;i<queue.length;i++)for(const n of [queue[i]-width,queue[i]+width,queue[i]-1,queue[i]+1])if(adjacentField(queue[i],n,width,size)&&tiles[n]!=='wall'&&!reached.has(n)){reached.add(n);queue.push(n);}
 const count=guided?1:Math.min(maxAnimals,1+hash(seed+9017)%3);
 if(count===0)tiles[wildlifeIndex]='empty';
 const pool=queue.filter(i=>i!==start&&tiles[i]==='empty'&&distance(i,start,width)>=3).sort((a,b)=>hash(seed+a*733)-hash(seed+b*733));
 const placed=count?[wildlifeIndex]:[];
 while(placed.length<count&&pool.length){const at=pool.shift()!;if(placed.some(i=>distance(i,at,width)<2))continue;tiles[at]='animal';placed.push(at);}

 return {region,tiles,position:start,visited:[start],steps:0,clues:0,loot:0,noise:0,wildlifeIndex,encountered:count===0,threat:null,pressure:0,lastEvent:'손전등과 이동키(WASD)로 현장을 수색하십시오. 귀환 및 미회수 보급 신호는 탐사 중에도 변동될 수 있습니다.',width,height,origin:start,exitIndex:exit,choice:null,sortie};
}

export type Behaviour={name:string;instinct:string;memory:string;favours:DeviceKind[];avoids:DeviceKind[];speed:1|2;patience:number};
export const captureBehaviours:Record<AnimalId,Behaviour>={
  rabbit:{name:'연속 도약',instinct:'큰 소리와 빛을 피하고 먹이 주변에서 멈춥니다.',memory:'의료기기 소리에 멈칫하는 반응이 있습니다.',favours:['bait'],avoids:['sound','light'],speed:2,patience:8},
  fox:{name:'우회 경로 분석',instinct:'케이지를 알아보고 바로 들어가지 않습니다. 유인 신호를 측면에 배치하십시오.',memory:'창고 선반과 상자 배치에 반응합니다.',favours:['bait','sound'],avoids:['light'],speed:1,patience:10},
  deer:{name:'시야 우선 도주',instinct:'밝은 빛을 피해 넓은 경로로 이동합니다. 소리도 경계합니다.',memory:'익숙한 먹이 구역에서 진정합니다.',favours:['bait'],avoids:['light','sound'],speed:2,patience:7},
  owl:{name:'어둠을 따라 이동',instinct:'소음을 피하고 빛이 적은 방향을 고릅니다.',memory:'반복적인 규칙 신호에 관심을 보입니다.',favours:['bait'],avoids:['sound','light'],speed:1,patience:9},
  wolf:{name:'경계선 역추적',instinct:'소리의 방향으로 접근하지만 이송 장치에 바로 들어가지는 않습니다.',memory:'경비 신호에 훈련된 반응을 보입니다.',favours:['sound'],avoids:['light'],speed:1,patience:9},
  crow:{name:'반짝이는 신호 추적',instinct:'깜빡이는 빛과 소리에 접근합니다. 같은 장치에 오래 머물지 않습니다.',memory:'일정한 박자의 신호에 반응합니다.',favours:['sound','light'],avoids:[],speed:2,patience:8},
  otter:{name:'수로를 따라 선회',instinct:'먹이와 낮은 소리를 따라 움직이며 갑작스런 빛은 피합니다.',memory:'규칙적인 밸브 소리를 기억합니다.',favours:['bait','sound'],avoids:['light'],speed:1,patience:9},
  lynx:{name:'사각지대 이동',instinct:'소리 유인에 잘 속지 않고 빛의 반대 방향으로 돌아갑니다.',memory:'누군가를 심문하던 목소리의 리듬이 남아 있습니다.',favours:['bait'],avoids:['sound','light'],speed:2,patience:8},
  axolotl:{name:'습한 구역 고수',instinct:'멀리 이동하지 않고 먹이 신호에 천천히 반응합니다.',memory:'특정 조명 패턴에 신경 반응을 보입니다.',favours:['bait','light'],avoids:['sound'],speed:1,patience:11},
  moth:{name:'광원 추적',instinct:'빛을 향해 빠르게 움직입니다. 먹이 신호를 무시합니다.',memory:'송신기 조명의 반복에 반응합니다.',favours:['light'],avoids:['sound'],speed:2,patience:7},
  mutant:{name:'신경 충돌',instinct:'반응이 예측 불가능합니다. 같은 신호를 계속 사용하면 도주합니다.',memory:'빛과 소리의 선호가 턴마다 역전됩니다.',favours:['sound','light'],avoids:[],speed:2,patience:6},
  specter:{name:'잔향 따라 이동',instinct:'일정한 약한 빛에 접근하며 큰 소리를 피합니다.',memory:'기억의 주인은 아직 확인되지 않았습니다.',favours:['light'],avoids:['sound'],speed:1,patience:10},
  chimera:{name:'두 기억의 간섭',instinct:'인접한 두 신호가 충돌하면 방향을 바꿉니다.',memory:'유인이 서로 다르면 혼란이 증가합니다.',favours:['bait','sound'],avoids:['light'],speed:2,patience:7}
};

/** v32: intercept a live route, verify behaviour twice, then deliberately seal a fixed loading gate.
 * A bait tile alone never captures a specimen. Gate, signal, prediction and timing are distinct inputs.
 */
export const captureWidth=6;
export const captureStart=22;
export const gateForSpecies=(species:AnimalId)=>['deer','owl','otter','axolotl','chimera'].includes(species)?30:5;
export function createCapture(species:AnimalId,tutorial=false,seed=39213+species.length*43,size:6|8=6):CaptureState{
 return {species,position:captureStart,devices:[],turn:0,fear:tutorial?8:23,trust:tutorial?55:28,
  maxTurns:tutorial?10:Math.max(11,captureBehaviours[species].patience+5),
  lastEvent:'황금색 이송구에 케이지를 놓고, 반응을 유도할 신호를 배치해 이동 칸을 예측하십시오.',
  tutorial,outcome:'playing',path:[captureStart],gate:gateForSpecies(species),prediction:null,
  confirmed:0,lastConfirmed:null,sealArmed:false,focus:tutorial?99:9,hunt:newHunt(species,seed,tutorial,tutorial?6:size)};
}
/** Upgrade in-flight legacy saves without destroying an animal or rewriting existing progress. */
export function normalizeCapture(c:CaptureState):CaptureState{
 return {...c,hunt:c.hunt?normalizeHunt(c.hunt):newHunt(c.species,39213+c.species.length*43+c.turn*29,c.tutorial),gate:Number.isInteger(c.gate)?c.gate:gateForSpecies(c.species),
  prediction:c.prediction??null,confirmed:c.confirmed??0,lastConfirmed:c.lastConfirmed??null,
  sealArmed:c.sealArmed??false,focus:c.focus??(c.tutorial?99:9),maxTurns:Math.max(c.maxTurns,c.tutorial?10:12)};
}
export function canPlaceDevice(c:CaptureState,position:number,kind:DeviceKind):boolean{
 if(c.outcome!=='playing'||position<0||position>=36||position===c.position)return false;
 if(kind==='cage'&&position!==c.gate)return false;
 if(kind!=='cage'&&position===c.gate)return false;
 const others=c.devices.filter(d=>d.position!==position);
 return others.length<4&&(kind!=='cage'||!others.some(d=>d.kind==='cage'));
}
export function setDevice(c:CaptureState,position:number,kind:DeviceKind):CaptureState{
 if(!canPlaceDevice(c,position,kind)||(c.focus??9)<1||c.sealArmed)return c;
 return {...c,focus:(c.focus??9)-1,devices:[...c.devices.filter(d=>d.position!==position),{position,kind}],
  lastEvent:kind==='cage'?'안전 이송구에 케이지를 고정했습니다. 경로를 확인한 후 봉쇄해야 합니다.':
  `${kind==='bait'?'먹이':kind==='sound'?'유도음':kind==='light'?'조명':'차단막'}을 배치했습니다.`};
}
export function removeDevice(c:CaptureState,position:number):CaptureState{
 if(!c.devices.some(d=>d.position===position)||c.outcome!=='playing'||c.sealArmed||(c.focus??9)<1)return c;
 return {...c,focus:(c.focus??9)-1,devices:c.devices.filter(d=>d.position!==position),lastEvent:'장치 위치를 다시 지정했습니다.'};
}
function neighbours(pos:number):number[]{
 const r=Math.floor(pos/6),col=pos%6;
 return [[r-1,col],[r+1,col],[r,col-1],[r,col+1]]
  .filter(([y,x])=>y>=0&&y<6&&x>=0&&x<6).map(([y,x])=>y*6+x);
}
const favourite=(species:AnimalId,kind:DeviceKind,turn:number)=>{
 if(kind==='barrier'||kind==='cage')return 0;
 const b=captureBehaviours[species];
 if((species==='mutant'||species==='chimera')&&turn%2===1)return b.favours.includes(kind)?-1:b.avoids.includes(kind)?1:0;
 return b.favours.includes(kind)?1:b.avoids.includes(kind)?-1:0;
};
function scoredMove(c:CaptureState,at:number):number{
 if(c.devices.some(d=>d.kind==='barrier'&&d.position===at))return -10000;
 let score=0;
 for(const d of c.devices){
  const near=distance(at,d.position,6);
  if(d.kind==='barrier')continue;
  if(d.kind==='cage'){
   if(c.sealArmed)score+=(7-near)*8; // A verified, open route is now the leading signal.
   else if(['fox','lynx','wolf'].includes(c.species))score-=near===0?8:near===1?3:0;
   continue;
  }
  const affinity=favourite(c.species,d.kind,c.turn);
  score+=affinity*(7.6-near*1.75);
  if(c.species==='crow'&&d.kind==='light')score+=1;
  if(c.species==='otter'&&d.kind==='bait')score+=1;
 }
 if(c.sealArmed)score-=distance(at,c.gate,6)*3;
 score+=((at*7+c.species.length*13+c.turn*11)%9)*.08;
 if(c.path.length>1&&at===c.path[c.path.length-2])score-=1.7;
 return score;
}
function stepCandidates(c:CaptureState,pos:number){
 return neighbours(pos).filter(i=>!c.devices.some(d=>d.kind==='barrier'&&d.position===i))
  .sort((a,b)=>scoredMove({...c,position:pos},b)-scoredMove({...c,position:pos},a));
}
export function forecastCapture(c:CaptureState):{position:number;alternatives:number[];certainty:number;label:string}{
 const candidates=stepCandidates(c,c.position);
 const isPrepared=c.devices.some(d=>d.kind==='cage')&&c.devices.some(d=>d.kind!=='cage'&&d.kind!=='barrier');
 return {position:candidates[0]??c.position,alternatives:candidates.slice(0,2),
  certainty:isPrepared?Math.min(88,45+c.trust/2):15,
  label:!isPrepared?'이송구와 유도 신호가 모두 필요합니다':`${captureBehaviours[c.species].name} · 인접한 이동 후보를 조사하세요`};
}
export function markCapturePrediction(c:CaptureState,target:number):CaptureState{
 if(c.outcome!=='playing'||c.sealArmed||(c.focus??9)<1||!neighbours(c.position).includes(target))return c;
 return {...c,focus:(c.focus??9)-1,prediction:target,lastEvent:`${Math.floor(target/6)+1}행 ${target%6+1}열을 다음 이동 칸으로 지정했습니다. 예상 경로가 맞으면 행동 기록이 확보됩니다.`};
}
export function armCaptureSeal(c:CaptureState):CaptureState{
 if(c.outcome!=='playing'||!c.devices.some(d=>d.kind==='cage'))return c;
 if(c.confirmed<(c.tutorial?1:2))return {...c,lastEvent:`이동 예측 기록이 부족합니다. ${c.tutorial?1:2}회의 서로 다른 이동을 먼저 검증하십시오.`};
 if(!c.tutorial&&c.trust<38)return {...c,lastEvent:`개체의 신뢰가 ${c.trust}/38로 부족합니다. 선호 신호를 가까이 배치하고 경로를 한 번 더 확인하십시오.`};
 return {...c,sealArmed:true,prediction:null,lastEvent:'봉쇄 승인을 완료했습니다. 개체가 황금색 이송구에 도착하도록 경로를 제어하십시오.'};
}
export function advanceCapture(raw:CaptureState):CaptureState{
 const c=normalizeCapture(raw);
 if(c.outcome!=='playing')return c;
 if(!c.devices.some(d=>d.kind==='cage'))return {...c,lastEvent:'황금색 지정 이송구에 케이지를 먼저 배치하십시오.'};
 if(!c.devices.some(d=>d.kind!=='cage'&&d.kind!=='barrier'))return {...c,lastEvent:'유도 장치가 없습니다. 먹이·소리·조명 중 반응에 맞는 신호를 배치하십시오.'};
 if(!c.sealArmed&&c.prediction===null)return {...c,lastEvent:'다음 이동을 예측해 인접 칸 하나를 선택한 뒤 실행하십시오.'};
 const b=captureBehaviours[c.species],next:CaptureState={...c,turn:c.turn+1,path:[...c.path],devices:c.devices.map(d=>({...d}))};
 const adverseNear=c.devices.some(d=>b.avoids.includes(d.kind)&&distance(c.position,d.position,6)<=2);
 const preferredNear=c.devices.some(d=>b.favours.includes(d.kind)&&distance(c.position,d.position,6)<=2);
 next.fear=Math.min(100,Math.max(0,c.fear+(adverseNear?13:4)-(preferredNear?5:0)));
 next.trust=Math.min(100,Math.max(0,c.trust+(preferredNear?4:0)-(adverseNear?7:0)));
 let pos=c.position;const traversed:number[]=[];
 for(let step=0;step<b.speed;step++){
  const candidates=stepCandidates({...next,position:pos},pos);
  if(!candidates.length)break;
  const selected=(next.fear>=88&&candidates.length>1&&!next.sealArmed)?candidates[1]:candidates[0];
  pos=selected;traversed.push(pos);next.path.push(pos);
  if(pos===next.gate){
   if(next.sealArmed&&next.confirmed>=(next.tutorial?1:2)&& (next.tutorial||next.trust>=38)){
    next.position=pos;next.outcome='caught';next.lastEvent=`${b.name}: 경로 검증과 봉쇄가 맞물렸습니다. 안전 이송 성공.`;return next;
   }
   // Reaching a cage without the seal is a *missed window*, never an automatic capture.
   next.fear=Math.min(100,next.fear+13);
   pos=c.position;
   next.path.push(pos);
   break;
  }
 }
 next.position=pos;
 let hit=false;
 if(!next.sealArmed&&c.prediction!==null){
  hit=traversed.includes(c.prediction)&&c.prediction!==c.lastConfirmed;
  if(hit){next.confirmed=Math.min(3,c.confirmed+1);next.lastConfirmed=c.prediction;next.trust=Math.min(100,next.trust+9);next.fear=Math.max(0,next.fear-5);}
  else {next.fear=Math.min(100,next.fear+9);next.trust=Math.max(0,next.trust-3);}
 }
 next.prediction=null;
 if(c.tutorial&&next.turn>=3&&next.devices.some(d=>d.kind==='cage')){
  // Tutorial has zero RNG / no hard failure. Preserve the feeling of a planned capture.
  next.position=next.gate;next.path.push(next.gate);next.confirmed=Math.max(1,next.confirmed);
  next.sealArmed=true;next.outcome='caught';
  next.lastEvent='EVE가 초회 이송 경로를 교정했습니다. 첫 토끼 확보 성공 (튜토리얼 100%).';return next;
 }
 if(!next.tutorial&&(next.turn>=next.maxTurns||next.fear>=100)){
  next.outcome='escaped';next.lastEvent=`${b.name}: 시한 종료. 개체가 경계 구역 밖으로 이탈했습니다.`;return next;
 }
 const result=next.sealArmed?'봉쇄 중 · 안전 이송구로 유도':hit?'예측 적중 · 경로 기록 +1':'예측 실패 · 경계 상승';
 next.lastEvent=`${result}. ${next.turn}/${next.maxTurns}턴 · 경로 기록 ${next.confirmed}/2 · 경계 ${next.fear}/100.`;
 return next;
}
