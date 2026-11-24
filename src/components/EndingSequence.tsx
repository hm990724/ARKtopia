'use client';
import {useState,type ReactNode} from 'react';
import type {V10} from '@/lib/game-v10';
import {originEndingSequence} from '@/lib/ending-sequence';
import {originEndingSceneArt,crewFarewellArt} from '@/lib/ending-art';
import StoryStill from './StoryStill';
export default function EndingSequence({state,mainArt}:{state:V10;mainArt:ReactNode}){
 const scenes=originEndingSequence(state);
 const [index,setIndex]=useState(0),[step,setStep]=useState(0);
 const scene=scenes[index];if(!scene)return null;
 const current=scene.lines[step];
 const farewellCrew=current.farewellCrew;
 function next(){if(step<scene.lines.length-1)setStep(v=>v+1);else if(index<scenes.length-1){setIndex(v=>v+1);setStep(0);}}
 function prev(){if(step>0)setStep(v=>v-1);else if(index>0){setIndex(v=>v-1);setStep(scenes[index-1].lines.length-1);}}
 return <section className="origin-ending-sequence ark-ending-sequence" data-slot={scene.slot} aria-label="ORIGIN ZERO 마지막 대화 및 후일담"><header><span>END_{String(scene.slot).padStart(2,'0')} · {scene.time==='before'?'생전 기록':'사후 기록'}</span><b>{scene.title}</b><small>장면 {index+1}/{scenes.length} · 대사 {step+1}/{scene.lines.length}</small></header><div className="ark-ending-stage" data-farewell={farewellCrew}>{farewellCrew?<><StoryStill sources={crewFarewellArt(farewellCrew)} alt={current.speaker+'의 마지막 인사'}/><div className="ark-ending-no-art"><span>ARK / PERSONAL FAREWELL</span><b>{current.speaker}의 마지막 인사</b><small>작별 원화 미등록</small></div></>:scene.slot<=8?mainArt:<><StoryStill sources={originEndingSceneArt(scene.slot)} alt={scene.title}/><div className="ark-ending-no-art"><span>ARK / AFTERMATH RECORD</span><b>{scene.title}</b><small>복원된 기록 · 장면 원화 미등록</small></div></>}</div><div className="origin-ending-dialogue" aria-live="polite"><span>{current.speaker}</span><p>{current.text}</p></div><div className="origin-ending-controls"><button type="button" onClick={prev} disabled={index===0&&step===0}>이전 대사</button><button type="button" onClick={next} disabled={index===scenes.length-1&&step===scene.lines.length-1}>{step===scene.lines.length-1?'다음 장면':'다음 대사'}</button><button type="button" onClick={()=>{setIndex(0);setStep(0)}}>처음부터</button></div><details className="ark-ending-chapters"><summary>장면 선택 · {index+1}/{scenes.length}</summary><nav aria-label="엔딩 장면 선택">{scenes.map((item,i)=><button key={item.slot} type="button" aria-current={i===index?'step':undefined} onClick={()=>{setIndex(i);setStep(0)}}>END_{String(item.slot).padStart(2,'0')} · {item.title}</button>)}</nav></details><details><summary>현재 장면의 전체 대사</summary>{scene.lines.map((l,i)=><p key={i}><b>{l.speaker}:</b> {l.text}</p>)}</details></section>;
}
