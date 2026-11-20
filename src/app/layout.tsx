import './globals.css';
import './v68.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'ANOMALY ZOO | 잔향보존구역',description:'CCTV로 변화를 발견하고, 흔적을 추적해 생명을 보호하는 동물원 생존 게임.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
