'use client';
import {useState} from 'react';
import type {V10} from '@/lib/game-v10';
import {contactTiles,startOriginContact,moveOriginContact,retreatOriginContact} from '@/lib/origin-contact';
export default function OriginContactField({state:s,onUpdate}:{state:V10;onUpdate:(n:V10)=>void}){
 const [pace,setPace]=useState<'quiet'|'normal'|'fast'>('quiet');const f=s.originZero?.contactField;
 if(!f?.active)return <section className="origin-contact"><p>지상 CCTV 사각지대입니다. 관제실에서 정찰 드론을 발진시키세요.</p><button disabled={s.ap<1} onClick={()=>onUpdate(startOriginContact(s))}>정찰 드론 발진 · AP 1</button></section>;
 const distance=(i:number)=>Math.abs(i%5-f.position%5)+Math.abs(Math.floor(i/5)-Math.floor(f.position/5));
 return <section className="origin-contact ark-drone-contact"><header><b>DRONE / 외곽 열영상 정찰</b><span>흔적 {f.clues.length}/3 · 배터리 {f.stamina}% · 노출 {f.noise}%</span></header><p>드론 반경 두 칸의 조사 지점을 클릭하세요. 장애물은 회색, 조사 가능 지점은 청록색으로 표시됩니다.</p><div className="origin-contact-grid">{contactTiles.map((tile,i)=>{const visible=f.visited.includes(i)||distance(i)<=2;return <button key={i} aria-label={'드론 조사 좌표 '+(i+1)} disabled={distance(i)>2||distance(i)===0||tile==='wall'||tile==='contact'&&f.clues.length<3} data-tile={visible?tile:'fog'} onClick={()=>onUpdate(moveOriginContact(s,i,pace))}>{i===f.position?'✥':!visible?'':tile==='wall'?'▩':tile==='track'?(f.clues.includes(i)?'✓':'◈'):tile==='contact'?'?':tile==='entry'?'↵':tile==='cover'?'▣':'·'}</button>})}</div><div className="origin-contact-controls">{(['quiet','normal','fast'] as const).map((id,i)=><button key={id} aria-pressed={pace===id} onClick={()=>setPace(id)}>{['저소음','일반','고속'][i]}</button>)}<button onClick={()=>onUpdate(retreatOriginContact(s))}>드론 회수</button></div><p role="status">{s.lastOutcome}</p></section>;
}
