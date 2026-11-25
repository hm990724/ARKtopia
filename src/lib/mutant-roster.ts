export type MutantAbility='sound-hunt'|'route-lock'|'armor'|'unpredictable'|'spore'|'spawn'|'reverse'|'mind'|'resonance'|'slip'|'impact'|'obscure'|'charge'|'regenerate'|'infect'|'false-signal'|'eve-jam'|'molt'|'light-drain'|'apex';
export type MutantArchetype={variant:number;name:string;ability:MutantAbility;fieldTell:string;hpScale:number;damageScale:number};
export const MUTANT_ARCHETYPES:readonly MutantArchetype[]=[
 {variant:1,name:'MAW',ability:'sound-hunt',fieldTell:'소리를 따라 턱을 끌며 접근합니다.',hpScale:.9,damageScale:1.16},
 {variant:2,name:'ROOT',ability:'route-lock',fieldTell:'가느다란 관절이 퇴로를 더듬습니다.',hpScale:1.12,damageScale:.9},
 {variant:3,name:'HUSK',ability:'armor',fieldTell:'속이 빈 껍질이 둔탁하게 울립니다.',hpScale:1.42,damageScale:.78},
 {variant:4,name:'FOLD',ability:'unpredictable',fieldTell:'접힌 신체가 불규칙한 각도로 펼쳐집니다.',hpScale:.92,damageScale:1.04},
 {variant:5,name:'VESSEL',ability:'spore',fieldTell:'주황빛 주머니가 부풀며 포자를 모읍니다.',hpScale:1.04,damageScale:1.02},
 {variant:6,name:'CRADLE',ability:'spawn',fieldTell:'갈비뼈 안쪽에서 작은 움직임이 번집니다.',hpScale:1.24,damageScale:.94},
 {variant:7,name:'INVERSE',ability:'reverse',fieldTell:'몸의 앞뒤를 알 수 없는 역방향 움직임입니다.',hpScale:.88,damageScale:1.12},
 {variant:8,name:'BLOOM',ability:'mind',fieldTell:'감각 꽃잎이 열리며 정신 신호를 흔듭니다.',hpScale:.96,damageScale:.98},
 {variant:9,name:'HOLLOW',ability:'resonance',fieldTell:'빈 몸체가 낮은 공명음을 토해 냅니다.',hpScale:1.18,damageScale:1.04},
 {variant:10,name:'THREAD',ability:'slip',fieldTell:'섬유 다발이 틈새로 풀려 들어옵니다.',hpScale:.82,damageScale:.96},
 {variant:11,name:'BURDEN',ability:'impact',fieldTell:'무거운 등이 지면을 눌러 진동을 일으킵니다.',hpScale:1.48,damageScale:1.18},
 {variant:12,name:'VEIL',ability:'obscure',fieldTell:'생체막 아래 관절이 시야를 가립니다.',hpScale:1.02,damageScale:.96},
 {variant:13,name:'SPIRAL',ability:'charge',fieldTell:'나선형 척추가 돌진 직전 회전합니다.',hpScale:1.08,damageScale:1.2},
 {variant:14,name:'STITCH',ability:'regenerate',fieldTell:'서로 다른 조직이 상처를 꿰매듯 붙습니다.',hpScale:1.28,damageScale:.92},
 {variant:15,name:'WOMB',ability:'infect',fieldTell:'반투명한 복부가 감염 신호를 축적합니다.',hpScale:1.1,damageScale:.9},
 {variant:16,name:'ECHO',ability:'false-signal',fieldTell:'여러 방향에서 가짜 발소리가 겹칩니다.',hpScale:.94,damageScale:1.02},
 {variant:17,name:'CROWN',ability:'eve-jam',fieldTell:'뼈 왕관이 EVE의 추적 신호를 깨뜨립니다.',hpScale:1.2,damageScale:1.02},
 {variant:18,name:'MOLT',ability:'molt',fieldTell:'허물이 찢어지며 새 형태가 드러납니다.',hpScale:1.16,damageScale:1.08},
 {variant:19,name:'ABYSS',ability:'light-drain',fieldTell:'빛이 검은 표면에 닿자 주변 조명이 약해집니다.',hpScale:1.12,damageScale:1.14},
 {variant:20,name:'ORPHAN',ability:'apex',fieldTell:'불완전한 몸체가 다른 위협의 움직임을 지휘합니다.',hpScale:1.55,damageScale:1.28}
];
export function mutantArchetype(variant:number|undefined):MutantArchetype{return MUTANT_ARCHETYPES[Math.max(0,Math.min(19,Math.floor((variant??1)-1)))]}
