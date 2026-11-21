import './globals.css';
import './field-v71.css';
import ClickFeedback from '@/components/ClickFeedback';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'잔향보존구역 | ECHO WARD',description:'80억분의 1의 가능성. 폐허의 생체 기억 보존 시설을 배경으로 한 다크 선택형 픽셀아트 비주얼 노벨.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}<ClickFeedback/></body></html>}
