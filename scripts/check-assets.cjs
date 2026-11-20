// No downloads or modifications. Check the actual local filenames used by the UI.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const staff={rabbit:'의무관',fox:'보급관',wolf:'보안관',deer:'서기관'};
let issues=0;
function check(rel,label,required=false){
 const full=path.resolve('public',rel);
 if(fs.existsSync(full)&&fs.statSync(full).isFile()) {
  let tracked=false;
  try {execFileSync('git',['ls-files','--error-unmatch','--',path.join('public',rel).replaceAll('\\','/')],{stdio:'ignore'});tracked=true;}catch{}
  const signature=fs.readFileSync(full).subarray(0,8).toString('hex');
  const validPng=signature==='89504e470d0a1a0a';
  console.log(`${tracked?'OK':'LOCAL ONLY'} ${label}: ${rel} ${validPng?'[PNG 확인]':'[주의: PNG 헤더가 아닙니다]'}`);
  if(!validPng)console.log('   → 파일 이름은 PNG지만 실제 인코딩이 PNG가 아닙니다. 이미지 편집기에서 PNG로 다시 내보내세요.');
  if(!tracked)console.log('   → 로컬 이미지가 있어도 GitHub에 없으면 배포에서 404입니다. git add -f public/'+rel.replaceAll('\\','/'));
  return true;
 }
 const parent=path.dirname(full);
 const near=fs.existsSync(parent)?fs.readdirSync(parent).join(', '):'폴더 없음';
 console.log(`${required?'MISS':'INFO'} ${label}: ${rel} (실제 폴더: ${near})`);
 if(required)issues++;
 return false;
}
for(const [id,role] of Object.entries(staff)){
 const arrival=check(`assets/cinematics/staff-arrivals/${id}/scene.png`,`${role} 도착 장면`);
 const portrait=check(`assets/staff/${id}/portrait.png`,`${role} 초상`);
 if(!portrait && arrival)console.log(`     → ${role}: 초상 대신 도착 장면을 보여줍니다.`);
}
check('assets/cinematics/eve-first-meeting/scene.png','EVE 첫 만남');
console.log('\n주의: 로컬 파일이 있어도 GitHub에 커밋되지 않으면 Vercel에 배포되지 않습니다.');
console.log('예: git add public/assets && git commit -m "Add character art" && git push');
process.exitCode=issues?1:0;

console.log("배포 사이트에서 /assets/cinematics/staff-arrivals/rabbit/scene.png 를 직접 열어 200 응답을 확인하세요.");
