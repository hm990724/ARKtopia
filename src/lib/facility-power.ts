import type {FacilityId,V10} from './game-v10';

export type FacilityPowerState={day:number;powered:FacilityId[];shed:FacilityId[];spent:number};
export const FACILITY_POWER_ORDER:FacilityId[]=['cctv','containment','infirmary','synthesis'];
export const FACILITY_POWER_DRAW:Record<FacilityId,number>={cctv:3,containment:2,infirmary:3,synthesis:2};
export const FACILITY_POWER_LABEL:Record<FacilityId,string>={cctv:'CCTV 감시망',containment:'격리 보강',infirmary:'진료·검시실',synthesis:'공명 연구실'};

export function normalizeFacilityPowerOrder(order:unknown):FacilityId[]{
 const valid=Array.isArray(order)?order.filter((id):id is FacilityId=>FACILITY_POWER_ORDER.includes(id as FacilityId)):[];
 return [...new Set([...valid,...FACILITY_POWER_ORDER])];
}

export function setFacilityPowerPriority(s:V10,id:FacilityId,delta:-1|1):V10{
 const order=normalizeFacilityPowerOrder(s.facilityPowerPriority),index=order.indexOf(id),target=index+delta;
 if(target<0||target>=order.length)return s;
 const next=structuredClone(s) as V10;const changed=[...order];[changed[index],changed[target]]=[changed[target],changed[index]];
 next.facilityPowerPriority=changed;next.lastOutcome=`야간 배전 순서 변경: ${changed.map(x=>FACILITY_POWER_LABEL[x]).join(' → ')}`;
 return next;
}

export function previewFacilityPower(s:V10,power:number):FacilityPowerState{
 const order=normalizeFacilityPowerOrder(s.facilityPowerPriority),powered:FacilityId[]=[],shed:FacilityId[]=[];let remaining=Math.max(0,power),spent=0;
 for(const id of order){if(!s.facilities?.[id])continue;const draw=FACILITY_POWER_DRAW[id];if(remaining>=draw){remaining-=draw;spent+=draw;powered.push(id)}else shed.push(id)}
 return {day:s.day,powered,shed,spent};
}

export function allocateFacilityPower(s:V10):FacilityPowerState{
 const result=previewFacilityPower(s,s.power);s.power=Math.max(0,s.power-result.spent);s.facilityPowerState=result;
 if(result.shed.length)logPowerShed(s,result.shed);
 return result;
}

export function isFacilityPowered(s:V10,id:FacilityId):boolean{
 const state=s.facilityPowerState;
 if(state?.day===s.day-1)return state.powered.includes(id);
 // Old saves have no dispatch record. Preserve their prior built-facility behavior until the next settlement.
 return !!s.facilities?.[id];
}

function logPowerShed(s:V10,shed:FacilityId[]){
 const names=shed.map(id=>FACILITY_POWER_LABEL[id]).join(' · ');
 s.eventHistory??=[];s.eventHistory.unshift(`DAY ${s.day} 야간 배전 차단: ${names}`);s.eventHistory=s.eventHistory.slice(0,120);
 s.lastOutcome=`전력 부족으로 ${names}의 야간 가동이 중단되었습니다. 우선순위와 발전량을 조정하세요.`;
}
