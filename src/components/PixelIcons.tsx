import type {SVGProps} from 'react';
export * from 'lucide-react';
type Props=SVGProps<SVGSVGElement>&{size?:number|string;strokeWidth?:number;absoluteStrokeWidth?:boolean};
const glyphs={
 search:['00111000','01000100','10000010','10000010','10000010','01000100','00111010','00000001'],
 paw:['01001000','11111110','01001010','00000000','00111000','01111100','11111110','01101100'],
 battery:['00111100','01111110','01000010','01011010','01011010','01011010','01000010','01111110'],
 bag:['00111000','01000100','01111110','11000011','11000011','11000011','11111111','01111110'],
 shield:['01111110','11011011','10011001','10011001','01011010','01000010','00100100','00011000'],
 eye:['00000000','00111100','01000010','10011001','10011001','01000010','00111100','00000000'],
 alert:['00011000','00111100','00111100','01100110','01100110','11011011','11111111','11111111'],
 heart:['01100110','11111111','11111111','11111111','01111110','00111100','00011000','00000000'],
 flask:['00111100','00011000','00011000','00100100','01000010','01111110','11111111','01111110'],
 radio:['00001000','00010000','01111110','11000011','11011011','11000011','11111111','01000010'],
 clock:['00111100','01000010','10010001','10010001','10011101','10000001','01000010','00111100'],
 map:['01100110','10011001','10011001','10011001','10011001','10011001','10011001','01100110'],
 arrow:['00010000','00011000','00011100','11111110','11111110','00011100','00011000','00010000'],
 lock:['00111100','01000010','01000010','11111111','11011011','11011011','11111111','01111110'],
 check:['00000001','00000011','00000110','10001100','11011000','01110000','00100000','00000000'],
 pin:['00111100','01111110','11000011','11011011','01111110','00111100','00011000','00011000'],
 bolt:['00001100','00011000','00110000','01111110','00011100','00110000','01100000','01000000'],
 book:['11100111','10011001','10011001','10111101','10011001','10111101','10011001','11111111'],
 home:['00011000','00111100','01111110','11111111','01000010','01011010','01011010','01111110']
};
function icon(kind:keyof typeof glyphs,flip=false){return function PixelIcon({size=18,strokeWidth,absoluteStrokeWidth,...props}:Props){return <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" {...props}><g transform={flip?'translate(16 0) scale(-1 1)':undefined}>{glyphs[kind].flatMap((row,y)=>[...row].map((v,x)=>v==='1'?<rect key={`${x}-${y}`} x={x*2} y={y*2} width="2" height="2"/>:null))}</g></svg>}}
export const Search=icon('search'),ScanEye=icon('eye'),Eye=icon('eye'),PawPrint=icon('paw'),Footprints=icon('paw'),Package=icon('bag'),ShoppingBag=icon('bag'),Shield=icon('shield'),ShieldAlert=icon('shield'),AlertTriangle=icon('alert'),Heart=icon('heart'),HeartPulse=icon('heart'),FlaskConical=icon('flask'),Radio=icon('radio'),Clock=icon('clock'),Clock3=icon('clock'),Map=icon('map'),Compass=icon('map'),ArrowRight=icon('arrow'),MoveRight=icon('arrow'),ArrowUpRight=icon('arrow'),ChevronRight=icon('arrow'),ArrowLeft=icon('arrow',true),ChevronLeft=icon('arrow',true),Lock=icon('lock'),UnlockKeyhole=icon('lock'),CheckCircle2=icon('check'),MapPin=icon('pin'),Target=icon('eye'),Zap=icon('bolt'),BatteryCharging=icon('battery'),BookOpen=icon('book'),House=icon('home');
