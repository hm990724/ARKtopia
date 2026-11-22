import type {CSSProperties} from 'react';
import {WALK_ROW,type WalkDirection} from '@/lib/character-art';
export default function RangerSprite({direction='down',walking=false}:{direction?:WalkDirection;walking?:boolean}){
 return <span className={'v72-ranger '+(walking?'is-walking':'is-idle')} role="img" aria-label={walking?'걷는 관리자':'관리자'} data-facing={direction} style={{'--walk-row':`${WALK_ROW[direction]*100/3}%`,'--walk-flip':direction==='left'?-1:1} as CSSProperties}><span/></span>;
}
