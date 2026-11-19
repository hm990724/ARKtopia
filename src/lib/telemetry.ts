import type {V10} from './game-v10';

export type TelemetryEvent={id:number;label:string;delta:number;unit:string;bad:boolean;kind:'operator'|'animal'|'facility'|'resource';subject?:string};
const STATS:[keyof V10,string,string,boolean,'operator'|'facility'|'resource'][]=[
 ['hp','HP','',false,'operator'],['stamina','활동 체력 ST','',false,'operator'],['mind','정신','',false,'operator'],
 ['power','시설 전력','%',false,'facility'],['eve','EVE 코어','',false,'facility'],['facility','시설 내구','%',false,'facility'],
 ['infection','감염','%',true,'operator'],['threat','외부 위협','%',true,'facility'],['ap','행동력 AP','',false,'operator'],
 ['scrap','고철','',false,'resource'],['food','식량','',false,'resource'],['parts','부품','',false,'resource'],
 ['credits','CR','',false,'resource'],['knowledge','지식','',false,'resource'],['clues','단서','',false,'resource']
];
export function telemetryChanges(before:V10,after:V10):TelemetryEvent[]{
 const changes:TelemetryEvent[]=[];let serial=0;
 for(const [key,label,unit,badOnIncrease,kind] of STATS){
  const a=Number(before[key]),b=Number(after[key]);if(!Number.isFinite(a)||!Number.isFinite(b)||a===b)continue;
  const delta=b-a;
  changes.push({id:serial++,label,unit,delta,bad:badOnIncrease?delta>0:delta<0,kind});
 }
 for(const afterAnimal of after.animals){const old=before.animals.find(a=>a.id===afterAnimal.id&&a.specimenId===afterAnimal.specimenId);if(!old)continue;
  for(const [key,label,badOnIncrease] of [['hp','HP',false],['stress','스트레스',true],['bond','유대',false],['contamination','오염',true]] as const){
   const delta=afterAnimal[key]-old[key];if(!delta)continue;
   changes.push({id:serial++,label:`${afterAnimal.name} ${label}`,delta,unit:'',bad:badOnIncrease?delta>0:delta<0,kind:'animal',subject:afterAnimal.id});
  }
 }
 return changes.sort((a,b)=>Number(b.bad)-Number(a.bad));
}
