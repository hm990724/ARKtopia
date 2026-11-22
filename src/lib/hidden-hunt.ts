/** ECHO WARD 35 — fog-of-war observations and stale evidence tracking.
 * Invariant: exact position is exposed only inside permanently searched clearings. Regular searched
 * observations show historical footprints; a paid 'wait' action now grants only
 * a broad half-board bearing after the animal moves, not its precise tile.
 * Pure state transitions, deterministic seeded noise, serializable saves.
 */
import type {AnimalId} from './sim';
export const HUNT_SIZE=6;
export const huntSize=(s:Pick<HuntState,'size'|'terrain'>)=>s.size??(s.terrain.length===36?6:8);
export const HUNT_CELLS=HUNT_SIZE*HUNT_SIZE;
export type HuntTool='bait'|'sound'|'light'|'barrier';
export type HuntMode='search'|'net'|HuntTool|'wait'|'reveal';
export type Terrain='thicket'|'path'|'mud'|'water'|'ruin'|'root';
export type HuntObject={cell:number;kind:HuntTool;life:number};
export type HuntLog={turn:number;message:string;kind:'hint'|'warning'|'event'|'error'};
/** Evidence is a snapshot taken BEFORE the animal moves; it never updates passively.
 * Unknown squares have no observation record, even if the hidden engine knows
 * their footprints and rustle. Historical observations remain stale until rescanned.
 */
export type HuntEvidence='footprint'|'rustle'|'empty'|'caught';
export type HuntObservation={kind:HuntEvidence;turn:number};
export function observedEvidence(state:HuntState,cell:number):HuntObservation|null{
 if(!Number.isInteger(cell)||cell<0||cell>=huntSize(state)**2||!Object.hasOwn(state.searchedAt??{},String(cell)))return null;
 if(cell===state.position)return {kind:'caught',turn:state.turn};
 const trace=state.trail?.filter(t=>t.cell===cell&&state.turn-t.turn<=6).at(-1);
 if(trace)return {kind:'footprint',turn:trace.turn};
 if(state.footprints.includes(cell))return {kind:'footprint',turn:Math.max(0,state.turn-1)};
 if(ring8(state.position,huntSize(state)).includes(cell))return {kind:'rustle',turn:state.turn};
 return {kind:'empty',turn:state.turn};
}
export function observationAge(state:HuntState,cell:number):number{
 const evidence=observedEvidence(state,cell);
 return evidence?Math.max(0,state.turn-evidence.turn):-1;
}

export type HuntState={
 version:35;size?:6|8;trail?:{cell:number;turn:number}[];species:AnimalId;tutorial:boolean;seed:number;turn:number;actions:number;maxActions:number;
 // Hidden except in searched clearings; the creature moves after an action.
 position:number;previous:number;footprints:number[];shaking:number[];
 terrain:Terrain[];objects:HuntObject[];revealed:boolean[];
 // Opened clearing remains marked forever. Only searches within the last two
 // turns contribute fear/avoidance; clearings are NOT solid obstacles.
 searchedAt:Record<string,number>;
 observations:Record<string,HuntObservation>;
 lastSearch:{cell:number;found:boolean;turn:number}|null;
 habits:Partial<Record<HuntTool,number>>;fear:number;predator:number;
 outcome:'playing'|'caught'|'escaped';resultText:string;lastEvent:string;log:HuntLog[];
 selectedCell:number|null;lastCommand:HuntMode|null;misses:number;
 // Broad sonar quadrant, never an exact animal location. Nullable for older saves.
 scanZone?:number|null;scanTurn?:number;
 // A four-cell snapshot earned through patient tracking; expires after movement.
 trailZone?:number|null;trailTurn?:number;
};
export type HuntResult={state:HuntState;changed:boolean;won:boolean;lost:boolean;penalty:{hp:number;parts:number;food:number;infection:number;threat:number}};
export type HuntTraits={title:string;short:string;hints:[string,string,string];speed:1|2|3;likes:HuntTool[];hates:HuntTool[];risk:string;};
export const HUNT_TRAITS:Record<AnimalId,HuntTraits>={
 rabbit:{title:'연속 도약',short:'위협을 느끼면 두 칸을 뛰어 달아납니다.',hints:['귀가 서 있으면 큰 소리 쪽을 피합니다.','일반 이동은 두 칸 도약하며, 먹이를 맡으면 한 칸만 다가갑니다.','풀숲에서 기다릴 때는 먹이 냄새를 확인하느라 움직임이 느려집니다.'],speed:2,likes:['bait'],hates:['sound','light'],risk:'도주 외 추가 불이익 없음'},
 fox:{title:'우회 흔적',short:'열린 길로 되돌아오며 같은 미끼를 학습합니다.',hints:['여우는 오래전에 조사한 빈 곳을 우회 경로로 이용합니다.','반복해서 같은 종류의 먹이를 놓으면 함정으로 간주합니다.','빛을 싫어하지만 낮고 일정한 소리에는 관심을 보입니다.'],speed:1,likes:['bait','sound'],hates:['light'],risk:'실패 시 부품 하나를 훔쳐 갑니다'},
 deer:{title:'군집 도주',short:'소리에 놀라면 세 칸까지 이동합니다.',hints:['사슴은 소리에 민감해 위험 시 먼 거리로 달아납니다.','진입할 수 없는 칸 앞에서는 방향을 크게 바꿉니다.','냄새 자극을 오래 유지하면 접근 속도를 줄입니다.'],speed:3,likes:['bait'],hates:['sound','light'],risk:'위협도 상승 및 시설 인근 소란'},
 owl:{title:'그림자 사냥',short:'빛을 피해 어두운 이동 경로를 고릅니다.',hints:['올빼미는 밝은 조명을 피합니다.','짧은 규칙음이 반복되면 잠시 경계합니다.','습지와 숲 경계에서 흔적이 짧게 남습니다.'],speed:1,likes:[],hates:['light','sound'],risk:'단서 일부 유실'},
 wolf:{title:'추적자',short:'소리를 단서로 담당자 쪽으로 접근할 수 있습니다.',hints:['늑대는 소리 자극에 반응해 경계하며 접근합니다.','막힌 길을 여러 번 확인하면 우회로를 학습합니다.','압박 신호가 최대치에 가까워지면 다음 탐색 실패에 공격합니다.'],speed:2,likes:['sound'],hates:['light'],risk:'추적 실패 시 HP 손상'},
 crow:{title:'미끼 절도',short:'반짝이는 광원과 소리를 교대로 추적합니다.',hints:['까마귀는 깜빡이는 불빛에 관심을 보입니다.','같은 소리에 두 번 이상 노출되면 반응이 약해집니다.','한 곳에 오래 놓인 먹이를 먼저 건드립니다.'],speed:2,likes:['light','sound'],hates:[],risk:'전지 또는 작은 부품 손실'},
 otter:{title:'물길 우회',short:'수로를 타면 육상 흔적이 희미합니다.',hints:['수달은 먹이에 강하게 반응합니다.','습지 타일에서는 긴 소리보다 먹이를 선호합니다.','물길에서 벗어나면 한 칸씩 조심스럽게 이동합니다.'],speed:1,likes:['bait','sound'],hates:['light'],risk:'회수 물자 일부 유실'},
 lynx:{title:'측면 기습',short:'소리 반대편으로 우회하며 움직입니다.',hints:['스라소니는 소리의 반대쪽을 우선 확인합니다.','차단막 옆에는 잠깐 머무르지 않습니다.','발자국 근처를 무턱대고 뒤지면 기습 경계가 올라갑니다.'],speed:2,likes:['bait'],hates:['sound','light'],risk:'기습 시 HP 손실'},
 axolotl:{title:'수중 잠복',short:'습한 칸에 머물며 아주 천천히 움직입니다.',hints:['아홀로틀은 물길을 선호합니다.','먹이에 반응하지만 자극이 너무 강하면 멈춥니다.','발자국 대신 진흙 흔적을 남길 때가 있습니다.'],speed:1,likes:['bait'],hates:['sound'],risk:'감염 위험 상승'},
 moth:{title:'광원 주회',short:'빛을 중심으로 돌다가 방향을 바꿉니다.',hints:['나방은 밝은 빛이 있으면 그쪽으로 이동합니다.','먹이 냄새에는 거의 반응하지 않습니다.','같은 광원을 오래 사용하면 다른 광원을 찾습니다.'],speed:2,likes:['light'],hates:['sound'],risk:'장비 전력 손실'},
 mutant:{title:'역방향 기억',short:'자극을 학습해 유리한 방향에서 역습합니다.',hints:['변이 개체는 불규칙한 두 칸 이동을 반복합니다.','같은 신호를 반복하면 선호가 반대로 바뀝니다.','다음 탐색에 실패하면 공격 위험이 급증합니다.'],speed:2,likes:['sound','light'],hates:[],risk:'심각한 HP 손상'},
 specter:{title:'백색 잔향',short:'잔향을 남기며 약한 빛을 따라갑니다.',hints:['빛에 천천히 다가옵니다.','갑작스러운 소리를 피합니다.','열린 구역의 잔향은 실제 지나간 경로입니다.'],speed:1,likes:['light'],hates:['sound'],risk:'신호 교란으로 위협 상승'},
 chimera:{title:'교란된 두 기억',short:'서로 다른 신호가 충돌할 때 가장 불규칙합니다.',hints:['접합체는 두 가지 자극이 겹치는 곳을 경계합니다.','동일한 빛을 반복하면 반대편으로 이동합니다.','기억 교란이 심해지면 한 번에 세 칸 이동합니다.'],speed:2,likes:['bait','sound'],hates:['light'],risk:'HP·감염 동시 상승'}
};
const mix=(n:number)=>{let x=n>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0};
const randomAt=(seed:number,turn:number,salt:number)=>mix(seed+turn*1013+salt*9176)/4294967296;
const coord=(i:number,size=8):[number,number]=>[i%size,Math.floor(i/size)];
export const huntDistance=(a:number,b:number,size=8)=>{const [ax,ay]=coord(a,size),[bx,by]=coord(b,size);return Math.abs(ax-bx)+Math.abs(ay-by)};
const ring8=(i:number,size=8)=>{const [x,y]=coord(i,size);const out:number[]=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx>=0&&nx<size&&ny>=0&&ny<size)out.push(ny*size+nx)}return out};
function generatedTerrain(seed:number,size:number):Terrain[]{return Array.from({length:size*size},(_,i)=>{const r=mix(seed+i*309)%100;return r<41?'thicket':r<56?'mud':r<72?'path':r<82?'root':r<91?'water':'ruin';});}
export function huntGrassMotion(footprints:number[],size=8):number[]{return [...new Set(footprints.flatMap(i=>ring8(i,size)))]};
/** -1 = never searched; 0/1/2 = recent, older numbers = historical search. */
export function huntSearchAge(state:HuntState,cell:number):number{
 const stamp=state.searchedAt?.[String(cell)];
 return typeof stamp==='number'&&Number.isFinite(stamp)?Math.max(0,state.turn-stamp):-1;
}
export function huntSearchedCount(state:HuntState):number{return Object.keys(state.searchedAt??{}).length;}
export function freshTrailCells(state:HuntState):number[]{
 const z=state.trailZone,size=huntSize(state),blocks=size/2;
 if(!Number.isInteger(z)||z!<0||z!>=blocks*blocks||state.trailTurn!==state.turn)return [];
 const start=Math.floor(z!/blocks)*size*2+(z!%blocks)*2;
 return [start,start+1,start+size,start+size+1];
}
/** Behavioural bias, not collision. An inspected cell remains traversable and searchable. */
export function huntClearingBias(state:HuntState,cell:number):number{
 const age=huntSearchAge(state,cell);
 if(age<0)return 0;
 if(age<=2){
  if(state.species==='fox')return -1.3; // cautious now, returns to old clearings later
  if(state.species==='wolf')return -0.5; // predator studies the searcher's route
  if(state.species==='mutant'||state.species==='chimera')return 1.1;
  if(state.species==='deer')return -7;
  if(state.species==='rabbit')return -6.8;
  return -4;
 }
 if(state.species==='fox')return 5.1;
 if(state.species==='wolf'||state.species==='lynx')return 2.7;
 if(state.species==='mutant'||state.species==='chimera')return 3.5;
 return 0; // older cleared spots become normal passages for other species
}
/** Upgrades active v33 hunts without resetting moves, hidden position or hints. */
export function normalizeHunt(raw:HuntState):HuntState {
 const size=huntSize(raw),cells=size*size;
 const searchedAt:Record<string,number>={};
 for(const [key,value] of Object.entries(raw.searchedAt??{})){
  const cell=Number(key);
  if(Number.isInteger(cell)&&cell>=0&&cell<cells&&typeof value==='number'&&Number.isFinite(value))searchedAt[String(cell)]=Math.max(0,Math.min(raw.turn,value));
 }
 const previous=raw.lastSearch;
 const lastSearch=previous&&Number.isInteger(previous.cell)&&previous.cell>=0&&previous.cell<cells&&typeof previous.found==='boolean'
  ?{cell:previous.cell,found:previous.found,turn:Math.min(raw.turn,Math.max(0,previous.turn??raw.turn))}:null;
 const observations:Record<string,HuntObservation>={};
 for(const [key,val] of Object.entries(raw.observations??{})){
  const cell=Number(key);
  if(!Number.isInteger(cell)||cell<0||cell>=cells||!val||typeof val!=='object')continue;
  const evidence=val as HuntObservation;
  if(!['footprint','rustle','empty','caught'].includes(evidence.kind)||!Number.isFinite(evidence.turn))continue;
  if(!Object.hasOwn(searchedAt,key))continue; // a clue must have been personally inspected
  observations[key]={kind:evidence.kind,turn:Math.max(0,Math.min(raw.turn,evidence.turn))};
 }
 // Migrating from v34 intentionally does not reconstruct unseen footprints:
 // the old version exposed them globally, but doing so here would leak positions.
 // v62: 20 basic tracking actions for every non-tutorial animal, including predators.
 // Existing in-progress saves retain spent actions and any equipment/archive bonus.
 const previousBase=['wolf','lynx','mutant','chimera'].includes(raw.species)?9:10;
 const upgradedMax=!raw.tutorial&&raw.maxActions<20?20+Math.max(0,raw.maxActions-previousBase):raw.maxActions;
 const actionBonus=upgradedMax-raw.maxActions;
 return {...raw,version:35,size:size as 6|8,searchedAt,observations,lastSearch,maxActions:upgradedMax,actions:Math.min(upgradedMax,raw.actions+actionBonus),scanZone:Number.isInteger(raw.scanZone)&&raw.scanZone!>=0&&raw.scanZone!<=3?raw.scanZone:null,scanTurn:Number.isFinite(raw.scanTurn)?raw.scanTurn:undefined};
}
function relocateOnCreate(seed:number,species:AnimalId,size:number):{old:number;now:number}{const old=size+Math.floor(randomAt(seed,0,1)*(size*(size-2)));const options=rangeChoices(old,HUNT_TRAITS[species].speed,size);return {old,now:options[Math.floor(randomAt(seed,0,2)*options.length)]??old}}
function rangeChoices(at:number,steps:number,size=8){const [x,y]=coord(at,size);const out:number[]=[];for(let dy=-steps;dy<=steps;dy++)for(let dx=-steps;dx<=steps;dx++){if(Math.abs(dx)+Math.abs(dy)!==steps)continue;const nx=x+dx,ny=y+dy;if(nx>=0&&nx<size&&ny>=0&&ny<size)out.push(ny*size+nx)}return out;}
export function newHunt(species:AnimalId,seed:number,tutorial=false,size:6|8=6):HuntState{
 const start=relocateOnCreate(seed,species,size),footprints=[start.old];
 const maxActions=tutorial?13:20;
 return {version:35,size,trail:[{cell:start.old,turn:0}],species,tutorial,seed,turn:0,actions:maxActions,maxActions,position:start.now,previous:start.old,
  footprints,shaking:ring8(start.now,size),terrain:generatedTerrain(seed,size),objects:[],revealed:[false,false,false],searchedAt:{},observations:{},lastSearch:null,habits:{},fear:tutorial?0:16,predator:0,
  scanZone:null,scanTurn:undefined,outcome:'playing',resultText:'모든 풀숲이 가려져 있습니다. 한 칸을 조사해야 그 시점의 발자국·풀 흔들림·빈칸 여부를 확인할 수 있습니다.',lastEvent:'',log:[],selectedCell:null,lastCommand:null,misses:0};
}
const nil={hp:0,parts:0,food:0,infection:0,threat:0};
const msg=(state:HuntState,message:string,kind:HuntLog['kind']='event'):HuntState=>({...state,lastEvent:message,log:[{turn:state.turn,message,kind},...state.log].slice(0,5)});
function rate(state:HuntState,kind:HuntTool){const b=HUNT_TRAITS[state.species];const learned=(state.habits[kind]??0)>=2;
 const loved=b.likes.includes(kind),hated=b.hates.includes(kind);
 if(state.species==='mutant'&&state.turn%2===1)return loved?-1:hated?1:0;
 return learned?loved?-1:0:loved?1:hated?-1:0;
}
function chooseStep(state:HuntState):number{
 const size=huntSize(state);
 const trait=HUNT_TRAITS[state.species];
 const food=state.objects.filter(o=>o.kind!=='barrier'&&o.life>0);
 let step=trait.speed;
 // Bait never captures: it gently moves a food-motivated creature one square.
 if(food.some(o=>o.kind==='bait'&&rate(state,'bait')>0&&huntDistance(state.position,o.cell,size)<=5))step=1;
 if(state.species==='chimera'&&state.turn%3===2)step=3;
 if(state.species==='deer'&&state.fear>=43)step=3;
 const barred=new Set(state.objects.filter(o=>o.kind==='barrier').map(o=>o.cell));
 let choices=rangeChoices(state.position,step,size).filter(i=>!barred.has(i));
 // A body cannot pass through a blocked tile even if it leaps two/three cells.
 choices=choices.filter(end=>{const [sx,sy]=coord(state.position,size),[ex,ey]=coord(end,size);const dx=Math.sign(ex-sx),dy=Math.sign(ey-sy);if(sx!==ex&&sy!==ey)return true;
  for(let j=1;j<=step;j++){const x=sx+dx*j,y=sy+dy*j;if(x>=0&&y>=0&&x<size&&y<size&&barred.has(y*size+x))return false;}return true;});
 if(!choices.length)choices=rangeChoices(state.position,1,size).filter(i=>!barred.has(i));
 if(!choices.length)return state.position;
 const prev=state.previous;
 const scored=choices.map(cell=>{
  let points=randomAt(state.seed,state.turn,cell+5)*4;
  if(cell===prev)points-=2.8;
  const terrain=state.terrain[cell];
  if(terrain==='thicket')points+=1.2;
  points+=huntClearingBias(state,cell);
  if(['otter','axolotl'].includes(state.species)&&terrain==='water')points+=4;
  if(['owl','lynx'].includes(state.species)&&terrain==='thicket')points+=2;
  if(state.species==='moth'&&terrain==='ruin')points+=.6;
  for(const obj of food){const d=huntDistance(cell,obj.cell,size),prevDist=huntDistance(state.position,obj.cell,size),affinity=rate(state,obj.kind);
   if(affinity>0)points+=(prevDist-d)*(obj.kind==='bait'?13:6.2)/(1+Math.max(0,d-3)*.12);
   if(affinity<0)points+=(d-prevDist)*6;
  }
  // Fox deliberately chooses the less obvious route once it has observed repeated placement.
  if(state.species==='fox'&&(state.habits.bait??0)>=2&&food.some(o=>o.kind==='bait'))points+=huntDistance(cell,food.find(o=>o.kind==='bait')!.cell,size)*2;
  return {cell,points};
 });
 scored.sort((a,b)=>b.points-a.points);
 return scored[0].cell;
}
function finishPenalty(state:HuntState){switch(state.species){case 'rabbit':return {...nil};case 'fox':return {...nil,parts:1};case 'crow':return {...nil,parts:1};case 'deer':return {...nil,threat:7};case 'owl':return {...nil,threat:3};case 'otter':return {...nil,food:2};case 'axolotl':return {...nil,infection:9};case 'moth':return {...nil,threat:4};case 'wolf':return {...nil,hp:22,threat:8};case 'lynx':return {...nil,hp:17};case 'mutant':return {...nil,hp:31,infection:8};case 'specter':return {...nil,threat:6};case 'chimera':return {...nil,hp:26,infection:12};}}
export function performHuntAction(raw:HuntState,action:{type:HuntMode;cell?:number;clue?:number}):HuntResult{
 const size=huntSize(raw),half=size/2;
 const unchanged: HuntResult={state:raw,changed:false,won:false,lost:false,penalty:nil};
 if(raw.outcome!=='playing'||raw.actions<=0)return unchanged;
 if(action.type==='search'||action.type==='net'||['bait','sound','light','barrier'].includes(action.type)){
  if(!Number.isInteger(action.cell)||action.cell!<0||action.cell!>=size*size)return unchanged;
 }
 const current={...raw,objects:raw.objects.map(x=>({...x})),revealed:[...raw.revealed],
  searchedAt:{...(raw.searchedAt??{})},observations:{...(raw.observations??{})},lastSearch:raw.lastSearch??null,habits:{...raw.habits},log:[...raw.log]};
 let text='',kind:HuntLog['kind']='event';
 if(action.type==='net'){
  const target=action.cell!;
  const distance=huntDistance(target,current.position,size);
  const hasFreshObservation=!!current.lastSearch&&current.turn-current.lastSearch.turn<=3&&huntDistance(current.lastSearch.cell,current.position,size)<=3;
  const inScanZone=current.scanZone!==null&&current.scanZone!==undefined&&current.scanTurn!==undefined&&current.turn-current.scanTurn<=2&&((current.position%size>=half?1:0)+(Math.floor(current.position/size)>=half?2:0))===current.scanZone;
  const lured=current.objects.some(o=>o.kind!=='barrier'&&o.life>0&&huntDistance(o.cell,current.position,size)<=2);
  if(distance<=1&&(Object.hasOwn(current.searchedAt,String(current.position))||hasFreshObservation||inScanZone||lured||freshTrailCells(current).includes(current.position))){
   current.actions--;current.turn++;current.outcome='caught';current.selectedCell=target;current.lastCommand='net';
   current.resultText='직접 던진 포획 그물이 이동 경로를 덮었습니다. 개체를 다치게 하지 않고 안전하게 확보했습니다.';
   return {state:msg(current,current.resultText,'hint'),changed:true,won:true,lost:false,penalty:nil};
  }
  current.fear=Math.min(100,current.fear+14);current.misses++;
  current.searchedAt[String(target)]=current.turn+1;
  current.observations[String(target)]={kind:distance<=3?'rustle':'empty',turn:current.turn};
  current.lastSearch={cell:target,found:false,turn:current.turn+1};
  text=distance<=3?'그물이 풀을 스쳤습니다. 바로 근처에 움직임이 있지만 동물은 도망쳤습니다. 새 흔적을 좇으세요.':'그물이 빗나갔습니다. 청음으로 방향을 확인한 뒤 다시 던지세요.';
  kind='warning';
 }else if(action.type==='search'){
  const searchedCell=action.cell!;
  // Mark before testing: both an empty clearing and a successful discovery open the grass.
  current.searchedAt[String(searchedCell)]=current.turn+1;
  const evidence:HuntEvidence=searchedCell===current.position?'caught':current.footprints.includes(searchedCell)?'footprint':current.shaking.includes(searchedCell)?'rustle':'empty';
  // Never expose global footprints/shaking: only the selected square is sampled.
  current.observations[String(searchedCell)]={kind:evidence,turn:current.turn};
  current.lastSearch={cell:searchedCell,found:searchedCell===current.position,turn:current.turn+1};
  if(action.cell===current.position){
   current.actions--;current.turn++;current.outcome='caught';current.selectedCell=action.cell!;current.lastCommand='search';
   current.resultText=current.tutorial?'풀숲에서 토끼를 발견했습니다. EVE의 첫 구조 보정이 활성화됩니다.':'풀숲을 젖히자 개체의 모습이 드러났습니다. 숨은 위치를 정확히 찾아 보호 이송합니다.';
   return {state:msg(current,current.resultText,'hint'),changed:true,won:true,lost:false,penalty:nil};
  }
  current.fear+=8;current.misses++;
  if(evidence==='footprint'){text='도트 발자국 발견. 개체가 이곳에 있었던 것은 이전 턴입니다. 이미 다른 칸으로 이동했을 수 있습니다.';kind='hint';}
  else if(evidence==='rustle'){text='눌린 풀이 흔들립니다. 직전 발자국에서 한 칸 반경의 흔적입니다. 현재 위치를 뜻하지는 않습니다.';kind='hint';}
  else {text='풀숲을 열었지만 흔적이 없습니다. 이 칸은 확인한 기록으로 남고 개체는 다시 들어올 수 있습니다.';kind='warning';}
  // A scan now returns a coarse distance band from the moment of inspection.
  // It is not a guaranteed future position: the creature moves immediately afterward.
  const distance=huntDistance(searchedCell,current.position,size);
  text+=' · 수색 음향: '+(distance<=2?'근접 신호 (당시 2칸 이내)':distance<=4?'중거리 신호':'먼 거리 신호')+'. 다음 턴에는 위치가 바뀝니다.';
 }else if(action.type==='wait'){
  text='바람이 지나갔습니다. 개체가 움직이고 새로운 발자국이 남습니다.';
 }else if(action.type==='barrier'||action.type==='bait'||action.type==='sound'||action.type==='light'){
  const place=action.cell!;
  const prior=current.objects.findIndex(x=>x.cell===place);
  if(prior>=0){current.objects.splice(prior,1);text='기존 장치를 회수했습니다. 한 턴이 지났습니다.';}
  else {
   if(current.objects.length>=3)return unchanged;
   current.objects.push({cell:place,kind:action.type,life:6});
   current.habits[action.type]=(current.habits[action.type]??0)+1;
   text=action.type==='barrier'?'차단막을 전개했습니다. 해당 칸이 붉게 봉쇄되고 우회가 시작됩니다.':
    action.type==='bait'?'먹이를 놓았습니다. 해당 냄새에 반응하는 개체는 한 칸씩 접근할 수 있습니다.':
    action.type==='sound'?'잔향 신호가 퍼집니다. 개체마다 접근 또는 도주 반응이 다릅니다.':'조명을 켰습니다. 광원 주위의 생체 반응이 달라집니다.';
   if((current.habits[action.type]??0)>=3)text+=' 같은 자극을 반복해 개체가 패턴을 학습했습니다.';
  }
 }else if(action.type==='reveal'){
  const clue=action.clue;
  if(clue===undefined||clue<0||clue>2||!Number.isInteger(clue)||current.revealed[clue])return unchanged;
  current.revealed[clue]=true;text=`행동 분석 ${clue+1} 해독 완료. 새로운 이동 습성을 확인했습니다.`;kind='hint';
 }
 current.actions--;current.turn++;current.lastCommand=action.type;current.selectedCell=action.cell??null;
 const from=current.position;
 const next=chooseStep(current);
 current.previous=from;current.position=next;
 current.trail=[...(current.trail??[]),{cell:from,turn:current.turn}].filter(t=>current.turn-t.turn<=6);
 current.footprints=[...new Set(current.trail.map(t=>t.cell))];
 current.shaking=ring8(next,size);
 // Listening is an informed alternative to blind clicking. The animal has ALREADY
 // moved for this turn; the broad signal describes the current half-board only.
 // It costs exactly one tracking action, so it is not a free position reveal.
 if(action.type==='wait'){
  const east=next%size>=half,north=Math.floor(next/size)<half;
  const bearing=`${north?'북':'남'}${east?'동':'서'}쪽 ${half}×${half} 구역`;
  current.scanZone=(east?1:0)+(north?0:2);current.scanTurn=current.turn;
  text=`저주파 청음 결과: ${bearing}에서 움직임 포착. 지도에서 강조된 ${half}×${half} 구역은 이 턴의 추정 영역입니다. 최대 2턴 동안 참고하세요.`;
  kind='hint';
 }
 // Every fifth spent action earns a real clue and a small search area. The
 // snapshot is AFTER movement and valid for the next action only, never a live marker.
 if([5,10,15].includes(current.turn)){
  const index=current.turn/5-1;
  current.revealed[index]=true;
  current.trailZone=Math.floor(Math.floor(next/size)/2)*(size/2)+Math.floor((next%size)/2);
  current.trailTurn=current.turn;
  const note=HUNT_TRAITS[current.species].hints[index];
  text+=` · 추적 성과 ${index+1}/3: ${note} 새 흔적이 2×2 풀숲으로 좁혀졌습니다. 다음 행동에 그물을 던지세요!`;
  kind='hint';
 }
 current.objects=current.objects.map(o=>({...o,life:o.life-1})).filter(o=>o.life>0);
 // Predator escalation is signalled before high-damage failure, never an invisible instant hit.
 const dangerous=['wolf','lynx','mutant','chimera'].includes(current.species);
 current.predator=Math.min(100,current.predator+(dangerous?6:3)+(action.type==='search'?6:0));
 current.fear=Math.min(100,Math.max(0,current.fear+(action.type==='wait'?-8:action.type==='search'?7:3)));
 if(dangerous&&current.predator>=60&&current.actions>0){text+=' EVE 경보: 포식자가 담당자님을 역추적하고 있습니다. 남은 행동이 적습니다.';kind='warning';}
 if(current.actions<=0){
  if(current.tutorial){
   // Explicit scripted tutorial guarantee, cannot be exploited in ordinary hunts.
   current.outcome='caught';current.resultText='최초 구조용 보정 절차 완료. EVE가 위치를 확정해 흰 토끼를 안전하게 확보했습니다.';
   return {state:msg(current,current.resultText,'hint'),changed:true,won:true,lost:false,penalty:nil};
  }
  current.outcome='escaped';const penalty=finishPenalty(current);
  current.resultText=`${HUNT_TRAITS[current.species].title} · 추적 기회를 모두 소비했습니다. ${HUNT_TRAITS[current.species].risk}.`;
  return {state:msg(current,current.resultText,'error'),changed:true,won:false,lost:true,penalty};
 }
 return {state:msg(current,text,kind),changed:true,won:false,lost:false,penalty:nil};
}
