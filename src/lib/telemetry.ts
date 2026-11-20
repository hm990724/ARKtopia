import type {V10} from './game-v10';

export type TelemetryEvent={id:number;label:string;delta:number;before:number;after:number;unit:string;bad:boolean;kind:'operator'|'animal'|'facility'|'resource';subject?:string};
const STATS:[keyof V10,string,string,boolean,'operator'|'facility'|'resource'][]=[
 ['mind','정신력','',false,'operator'],['stamina','현장 ST','',false,'operator'],
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
  changes.push({id:serial++,label,before:a,after:b,unit,delta,bad:badOnIncrease?delta>0:delta<0,kind});
 }
 for(const afterAnimal of after.animals){const old=before.animals.find(a=>a.id===afterAnimal.id&&a.specimenId===afterAnimal.specimenId);if(!old)continue;
  for(const [key,label,badOnIncrease] of [['hp','건강',false],['stress','스트레스',true],['bond','유대',false],['contamination','오염',true]] as const){
   const delta=afterAnimal[key]-old[key];if(!delta)continue;
   changes.push({id:serial++,label:`${afterAnimal.name} ${label}`,before:old[key],after:afterAnimal[key],delta,unit:'',bad:badOnIncrease?delta>0:delta<0,kind:'animal',subject:afterAnimal.id});
  }
 }
 const posts:Record<string,string>={rabbit:'의무관',fox:'보급관',wolf:'보안관',deer:'서기관'};
 for(const member of after.crew?.members??[]){
  const old=before.crew?.members.find(x=>x.id===member.id);
  if(!old||old.mind===member.mind)continue;
  const delta=member.mind-old.mind;
  changes.push({id:serial++,label:`${posts[member.id]??'직원'} 정신력`,before:old.mind,after:member.mind,delta,unit:'',bad:delta<0,kind:'operator',subject:member.id});
 }
 return changes.sort((a,b)=>Number(b.bad)-Number(a.bad));
}
