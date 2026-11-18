import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'마지막 우리 | THE LAST ENCLOSURE',description:'80억분의 1의 가능성. 마지막 동물원을 배경으로 한 다크 선택형 픽셀아트 비주얼 노벨.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
