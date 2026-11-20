from pathlib import Path
p=Path('src/lib/game-v10.ts');s=p.read_text(encoding='utf8')
for a,b in [('n.day>=13&&n.knowledge>=70','n.knowledge>=70'),('n.day>=20&&(n.originZero','(n.originZero'),('&&n.day>=12&&n.clues>=3','&&n.clues>=3'),('&&n.day>=20&&n.flags.humanTruth','&&n.flags.humanTruth'),('&&n.day>=26&&n.flags.mirror','&&n.flags.mirror'),('n.day>=30&&originReadyForFinale(n)','originReadyForFinale(n)')]:s=s.replace(a,b)
# Physical decline is foreshadowing, never input lag or motion distortion.
s=s.replace('if(used===\'rest\')n.mind=cap(n.mind+19);',"if(used==='rest')n.mind=cap(n.mind+19);")
s=s.replace('n.day++;scheduleStaffByDay(n);',"n.day++;if(n.day===2)log(n,'관리자 건강 기록','손끝 떨림과 짧은 기억 공백. EVE는 휴식 시간을 늘리겠다고 기록했다. 원인은 아직 확인되지 않았다.','mystery');if(n.originZero?.photos===11)log(n,'신체 유지 기록','복제 신체의 유지 한계는 누적되어 왔다. 과거의 명령을 반복할지, 남은 시간에 무엇을 지킬지는 관리자 자신의 선택이다.','mystery');scheduleStaffByDay(n);")
p.write_text(s,encoding='utf8')
p=Path('src/lib/specimen-archive.ts');s=p.read_text(encoding='utf8')
s=s.replace("const transferred=s.headquarters?.transferred.includes(a.id)||!!(a as AnimalState&{transferred?:boolean}).transferred;", "const transferred=!!(a as AnimalState&{transferred?:boolean}).transferred||s.archive?.entries[a.specimenId??'']?.status==='transferred'||(!a.alive&&s.headquarters?.transferred.includes(a.id));")
s=s.replace(" log(n,'보존 기록 최종 결산'", " if(!n.ending.includes('사망'))n.ending+=' 관리자는 점진적인 복제 신체 붕괴로 사망했다. 남은 생명과 기록은 그가 선택한 방향으로 이어졌다.';\n log(n,'보존 기록 최종 결산'")
p.write_text(s,encoding='utf8')
p=Path('src/lib/origin-zero.ts');s=p.read_text(encoding='utf8')
a=s.index("export function originEndEpilogue(");b=s.index('\nfunction report(',a)
s=s[:a]+'''export const canonicalEndings=[
 {title:'영원한 실험',file:'ending_subject_000.webp',eve:'다음 관리자 생산을 승인합니다.'},
 {title:'에덴',file:'ending_new_consciousness.webp',eve:'돌아온 이들이 누구였는지보다, 누구로 살아갈지 묻겠습니다.'},
 {title:'방주의 씨앗',file:'ending_two_caretakers.webp',eve:'관리자님, 오늘도 개장 준비를 시작할까요?'},
 {title:'마지막 동물원',file:'ending_open_spring.webp',eve:'오늘부터 개장 시간은 없습니다. 이곳은 살아 있는 이들의 집입니다.'},
 {title:'제000번 우리',file:'ending_incomplete_revival.webp',eve:'당신의 이름을 기록합니다. 그가 남긴 명령이 아닌 당신의 선택으로.'},
 {title:'침묵의 자동화',file:'ending_silent_automation.webp',eve:'관리자 응답 없음. 자동 운영을 계속합니다.'},
 {title:'흩어진 이름들',file:'ending_scattered_names.webp',eve:'완성하지 못한 이름도 지우지 않겠습니다.'},
 {title:'마지막 신호',file:'ending_last_signal.webp',eve:'누군가 듣고 있다면, 이 이름들을 기억해 주세요.'}
] as const;
export function originEndEpilogue(s:V10,goal:'rebuild'|'freedom'|'preserve'):{title:string;text:string}{
 const d=s.originZero;
 let index:number;
 if(s.power<=5||s.facility<=10)index=7;
 else if(s.eve<25||s.trust<25)index=5;
 else if(s.extractions>=3||Object.values(d?.individualRecalls??{}).filter(r=>r.quality<50).length>=3)index=6;
 else if(goal==='rebuild')index=(d?.immunity??0)>=100?1:0;
 else if(goal==='freedom')index=(d?.immunity??0)>=85&&s.trust>=65&&s.eve>=55?2:3;
 else index=4;
 const e=canonicalEndings[index];
 const stories=[
  '본부는 실험을 자동화했다. 죽음을 성공으로 정당화하려던 과학자의 명령 뒤로 다음 복제 관리자 생산이 준비된다.',
  '복제인간 사회가 시작됐다. 돌아온 이들은 원본 인류의 소유물이 아닌 독립적인 존재다. 그들이 살아갈 자리에 희생된 동물들의 이름도 남았다.',
  'EVE: “관리자님. 오늘 작업을 종료해야 합니다.” 관리자: “아직 끝나지 않았어.” EVE: “알고 있어요. 하지만 당신의 시간은 끝나가고 있어요.” 관리자: “그럼 내일은 네가 이어줘.” EVE: “……네. 내일은 제가 할게요.” 연구는 완치를 약속하지 않은 채 이어진다. 다음 날 방송에는 대답하는 사람이 없다.',
  '인류 복원을 위해 다른 생명을 소모하는 명령을 중단했다. 동물원은 인간의 쓸모로 평가받지 않는 생명들의 피난처로 남았다.',
  '관리자는 과학자의 뇌를 물려받았지만 그의 신념을 거절했다. 자신의 이름을 적고 격리 기록을 닫았다.',
  '신뢰가 무너진 시설에는 응답하는 직원도, 스스로 판단하는 안내 방송도 남지 않았다. 문과 급식 장치만 정해진 시간에 작동한다.',
  '불완전한 복원으로 모든 생명을 되돌릴 수는 없었다. 살아남은 직원들은 돌아오지 않은 개체들의 이름을 기록했다.',
  '시설이 꺼지기 직전 남은 전력을 송신기에 모았다. 보호 기록과 기원 자료가 밤하늘로 떠났다. 수신 여부는 끝내 확인되지 않았다.'
 ];
 return {title:e.title,text:stories[index]+` EVE의 마지막 기록: “${e.eve}”`};
}''' +s[b:]
p.write_text(s,encoding='utf8')
p=Path('src/lib/ending-art.ts');s=p.read_text(encoding='utf8')
s="import {canonicalEndings} from './origin-zero';\n"+s
s=s.replace(' return ENDING_ART.find', " const canonical=canonicalEndings.find(item=>ending.startsWith(item.title));if(canonical)return {file:canonical.file,label:canonical.title};\n return ENDING_ART.find")
p.write_text(s,encoding='utf8')
p=Path('src/lib/crew.ts');s=p.read_text(encoding='utf8')
s=s.replace('lastSpokenDay:number};','lastSpokenDay:number;memoryFragments?:number;memoryEvents?:string[]};')
insert='''
export const CREW_MEMORY:Record<CrewId,string[]>={
 rabbit:['빈 우리 앞에서 발을 멈췄어요. 누군가를 밤새 기다렸던 기분이 들어요.','내 손이 닿지 않아, 다친 아이 옆에 몸을 붙였던 것 같아요.','그 토끼였던 시간도 제 삶이에요. 치료를 위해 살아 있는 누군가를 버리고 싶지 않아요.'],
 fox:['창고의 측문이 낯설지 않아요. 출근한 적도 없는데요.','물건을 숨겨 둔 곳의 냄새가 기억나요. 손보다 코가 먼저 찾았어요.','여우의 몸으로 배고픔을 견딘 기억이 돌아왔어요. 보급품 숫자 뒤에 있는 생명을 잊지 않을게요.'],
 wolf:['문을 세 번 두드리면 돌아봐야 할 것 같아요.','작은 개체들 앞을 막아섰던 기억이 있어요. 낮은 시선으로요.','늑대로 지켰던 이들은 아직 여기 있어요. 명령보다 그들을 지키겠습니다.'],
 deer:['이름표의 선을 따라 걷고 싶은 기분이 들어요.','종이를 넘기려 했는데 발굽이 닿았어요. 꿈이라고 생각했어요.','사슴으로 살아온 시간이 제 기록에서도 지워졌어요. 다른 이들의 기록은 지우지 않겠습니다.']
};
/** A trusted conversation remembers only a witnessed personal event. No calendar reveal. */
export function rememberCrew(s:V10,id:CrewId):V10{
 const m=s.crew?.members.find(x=>x.id===id);
 if(!m||m.mind<=0||s.phase!=='day'||m.lastSpokenDay===s.day)return s;
 const n=copy(s) as V10,member=ensureCrew(n).members.find(x=>x.id===id)!;
 member.lastSpokenDay=n.day;member.bond=cap(member.bond+5);member.memoryEvents??=[];
 const event=id==='rabbit'?(n.operations?.correct??0)>0:id==='fox'?n.suppliesCollected>0||n.crew?.supportDay===n.day:id==='wolf'?n.security.resolved>0||n.operations?.night?.status==='success':n.narrative?.choices.shift_report!==undefined||(n.originZero?.photos??0)>0;
 const stage=member.memoryFragments??0;
 const allowed=stage===0?event&&member.bond>=50:stage===1?event&&member.bond>=65&&(n.narrative?.choices.shift_report!==undefined||(n.originZero?.photos??0)>=6):member.bond>=80&&(n.originZero?.photos??0)>=10;
 if(stage<3&&allowed){member.memoryFragments=stage+1;member.memoryEvents.push(`fragment-${stage+1}`);member.mind=cap(member.mind+3);n.trust=cap(n.trust+2);log(n,'직원 기억 조각',CREW_MEMORY[id][stage],'mystery');}
 return n;
}
'''
s=s.replace('export function crewDialog(',insert+'\nexport function crewDialog(')
s=s.replace(" const profile=CREW_PROFILES[id];const days", " if((member.memoryFragments??0)>0)return [{speaker:id,text:CREW_MEMORY[id][member.memoryFragments!-1]},{speaker:'EVE',text:'기억을 말할지, 지금은 멈출지 당신이 선택해도 됩니다.'}];\n const profile=CREW_PROFILES[id];const days")
# Avoid raw animal identity from distress before trusted recall.
s=s.replace("if(s.headquarters.revealStage>=2&&s.flags.humanTruth)return", "if((member.memoryFragments??0)>=3&&s.headquarters.revealStage>=2&&s.flags.humanTruth)return")
s=s.replace('if(member.mind<=22)return [','if(member.mind<=22)return [').replace('text:personal[id][2]},','text:personal[id][0]},')
s=s.replace("else{m.mind=cap(m.mind+12)}", "else{m.mind=cap(m.mind+12);m.bond=cap(m.bond+8)}")
p.write_text(s,encoding='utf8')
p=Path('src/components/Game.tsx');s=p.read_text(encoding='utf8').replace('CREW_PROFILES,crewDialog,','CREW_PROFILES,rememberCrew,crewDialog,')
s=s.replace('onTalk={id=>{dialogue(crewDialog(s,id));beep(400)}}','onTalk={id=>{const next=rememberCrew(s,id);setS(next);dialogue(crewDialog(next,id));beep(400)}}')
p.write_text(s,encoding='utf8')
