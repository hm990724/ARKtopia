// No downloads or modifications. Check the actual local filenames used by the UI.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const staff={rabbit:'의무관',fox:'보급관',wolf:'보안관',deer:'서기관'};
const hasGit=fs.existsSync('.git');
let issues=0;
function check(rel,label,required=false){
 const full=path.resolve('public',rel);
 if(fs.existsSync(full)&&fs.statSync(full).isFile()) {
  let tracked=!hasGit;
  if(hasGit)try {execFileSync('git',['ls-files','--error-unmatch','--',path.join('public',rel).replaceAll('\\','/')],{stdio:'ignore'});tracked=true;}catch{}
  const signature=fs.readFileSync(full).subarray(0,8).toString('hex');
  const validPng=signature==='89504e470d0a1a0a';
  const validWebp=fs.readFileSync(full).subarray(0,12).toString('ascii').startsWith('RIFF')&&fs.readFileSync(full).subarray(8,12).toString('ascii')==='WEBP';
  const valid=rel.endsWith('.webp')?validWebp:validPng;
  console.log(`${tracked?'OK':'LOCAL ONLY'} ${label}: ${rel} ${valid?'[파일 형식 확인]':'[주의: 이미지 헤더가 잘못되었습니다]'}`);
  if(!valid)console.log('   → 이미지 파일의 확장자와 인코딩을 확인하세요.');
  if(hasGit&&!tracked)console.log('   → 배포 전에 Git에 추가하세요: git add public/'+rel.replaceAll('\\','/'));
  return true;
 }
 const parent=path.dirname(full);
 const near=fs.existsSync(parent)?fs.readdirSync(parent).join(', '):'폴더 없음';
 console.log(`${required?'MISS':'INFO'} ${label}: ${rel} (실제 폴더: ${near})`);
 if(required)issues++;
 return false;
}
for(const [id,role] of Object.entries(staff)){
 const arrival=check(`assets/cinematics/staff-arrivals/${id}/scene.webp`,`${role} 도착 장면`);
 const portrait=check(`assets/staff/${id}/portrait.webp`,`${role} 초상`);
 if(!portrait && arrival)console.log(`     → ${role}: 초상 대신 도착 장면을 보여줍니다.`);
}
check('assets/cinematics/eve-first-meeting/scene.webp','EVE 첫 만남');
console.log('\n로컬 실행용 에셋 검사 완료. 배포 전 Git 추적 여부도 별도 확인하세요.');
console.log('예: git add public/assets && git commit -m "Add character art" && git push');
process.exitCode=issues?1:0;

console.log("배포 사이트에서 /assets/cinematics/staff-arrivals/rabbit/scene.webp 를 직접 열어 200 응답을 확인하세요.");
