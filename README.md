# ECHO WARD — 현재 실행용 소스 / v54

이 압축에는 **실행에 필요한 소스와 설정만** 있습니다. 이전 버전 릴리스 문서, 임시 타입 출력물, 기존 이미지(`public/assets`)는 넣지 않았습니다. 기존 저장 데이터 키 `last-enclosure-ark-v10`은 유지됩니다.

## 적용

1. 현재 `ARKtopia/public/assets`는 그대로 보존합니다. **해당 폴더를 지우지 마세요.**
2. ZIP의 `src/`, `package.json`, `tsconfig.json`, `next-env.d.ts`, `scripts/`를 프로젝트 루트에 덮어씁니다.
3. 로컬에서 `npm install`, `npm run check:assets`, `npm run typecheck`, `npm run build`를 실행합니다.
4. 검증 후 변경 사항과 신규 이미지를 GitHub에 커밋·푸시합니다.

## 새 보상 규칙

| 경로 | 즉시 보상 | 장기 결과 |
|---|---|---|
| **살아 있는 개체 본부 인계** | 고철 +3, 식량 +2 | 개체 이탈, 해당 종 직원 영입 가능. **고급 지원권 없음** |
| **해부·병리 표본 1개 본부 송신** | CR +180, 고급 지원권 +1 | 신경 조직 송신 기록에 남음, 결말 조건에 반영 |
| 사후 부검 | 표본 +1, 지식 +10 | 사망 개체에 한정 |
| 생존 개체 강제 회수 | 표본 +2, 지식 +25 | 개체 영구 소실, 정신·신뢰 하락, 결말에 기록 |

예전 저장 파일에 **생체 이송만으로 발생한 미사용 고급 보상권**은 불러오기 시 정리합니다. 이미 사용한 보너스는 취소하지 않습니다. 표본 송신으로 얻은 미사용 보상권은 유지합니다.

## `scene.png` 인식 문제 점검

게임이 요청하는 도착 장면 URL은 `/assets/cinematics/staff-arrivals/rabbit/scene.png`입니다. Windows 파일 탐색기에 이미지가 보여도 **그것만으로 실제 배포 사이트에서 접근 가능한 것은 아닙니다.**

* 대화 인물 초상: `public/assets/staff/rabbit/portrait.png`
* 도착 시네마틱: `public/assets/cinematics/staff-arrivals/rabbit/scene.png`
* 의무관 외 보급관·보안관·서기관도 같은 패턴으로 `fox`, `wolf`, `deer` 사용
* 직원은 살아 있는 개체를 본부에 인계해 영입할 때 연출이 발생하며, **직원 명단 → 본부 도착 기록 재생**으로 다시 확인할 수 있습니다.

확인 명령(프로젝트 루트 / PowerShell):

```powershell
npm run check:assets
Get-Item .\public\assets\cinematics\staff-arrivals\rabbit\scene.png | Select-Object FullName,Length
git ls-files public/assets/cinematics/staff-arrivals/rabbit/scene.png
```

`git ls-files` 결과가 비어 있으면 파일이 GitHub에 올라가지 않은 것입니다. `.gitignore` 때문에 제외된 경우에는 다음과 같이 강제로 추가할 수 있습니다.

```powershell
git add -f public/assets/cinematics/staff-arrivals/rabbit/scene.png
git add -f public/assets/staff/rabbit/portrait.png
git commit -m "Add staff cinematic and portrait"
git push origin main
```

**실제 서비스 도메인** 뒤에 `/assets/cinematics/staff-arrivals/rabbit/scene.png`를 붙여 직접 열어 보세요. 이미지가 로드되지 않으면 서버에 배포되지 않았거나 잘못된 파일/경로입니다. 새 시네마틱 UI에서도 이미지가 실패하면 재생 화면에 URL 확인 링크가 나타납니다. 코드에서는 PNG 헤더 확인 기능도 제공합니다.

## 엔딩

마지막 세 선택(복원 / 개방 / 보존)은 지식, 신뢰, EVE 상태, 생존 개체 수, 생체 이송 건수, 표본 송신 건수, 강제 회수 건수, 직원 소실 수에 따라 분기합니다. 기존 엔딩 일러스트 파일명을 유지하고, 추가 분기에도 기존 일러스트를 연결했습니다. 특정 행동을 강요하지 않아도 다른 결말에 접근할 수 있습니다.

## 검증

전달 전 **게임 로직 전체 TypeScript 검사**, 생체 이송·직원 영입·표본 송신·구형 저장 데이터 마이그레이션·엔딩 이미지 매칭 단위 검증, TSX 구문 및 CSS 구문 검사를 수행했습니다. **Next.js 전체 `npm run build`와 실제 Vercel·이미지 파일 접속 결과는 여기서 최종 검증하지 못했습니다.**
