const fs=require('node:fs');
const path=require('node:path');
const out=path.join(__dirname,'../public/assets/endings');
const portrait=(file,mime)=>`data:${mime};base64,${fs.readFileSync(path.join(__dirname,'../public/assets/characters',file)).toString('base64')}`;
const evePortrait=portrait('eve_hologram.webp','image/webp');
const managerPortrait=portrait('protagonist_neutral.webp','image/webp');
const endings=[
 ['seed_ark','#9d395d','#351e36','DAWN / PRESERVATION','EVE carries the final instructions into the next morning.'],
 ['eden','#73575e','#294536','AFTER / RECLAMATION','A human witness watches an empty garden take root.'],
 ['eternal_experiment','#ad2d54','#211d2b','LOOP / EXPERIMENT','The researcher and the manager face the sealed archive.'],
 ['last_zoo','#9b4a62','#172c2a','EXIT / SANCTUARY','The manager leaves the gate open and turns away.'],
 ['successor','#b63e58','#232034','HQ / SUCCESSION','EVE hands the control room to its human successor.'],
 ['humane_restoration','#9c536a','#263d3b','CONSENT / RESTORATION','A careful research choice keeps the people in the room alive.'],
 ['spring_outside_records','#b56c74','#294a3c','OUTSIDE / RECORDS','A survivor steps beyond the archive doors.'],
 ['late_gate','#9b3049','#28232d','TOO LATE / GATE','The manager records the names the open gate cannot bring back.'],
 ['empty_shiftroom','#81546a','#22212e','SHIFT / ABSENCE','EVE reads the final roster in an empty staff room.'],
 ['silent_automation','#684e76','#171a2a','AUTO / NO RESPONSE','The machine completes a shift after its last human signal.'],
 ['last_signal','#bb4055','#252539','TRANSMISSION / OUT','The manager sends the final call from the relay room.'],
 ['first_sentence','#547f91','#31463e','FIRST / VOICE','EVE and the manager record a new beginning.'],
 ['incomplete_revival','#9a4158','#272333','FAILED / RETURN','The manager sees the unfinished restoration result.'],
 ['subject_000','#a13852','#241d2c','SUBJECT / 000','The manager faces the record that names him as a subject.'],
 ['spring_beyond_cage','#a67b63','#314b39','CHOICE / OPEN','A human witness leaves the unlocked gate behind.'],
 ['scattered_names','#885675','#252138','NAMES / REMEMBERED','EVE preserves the names of those who did not return.'],
 ['two_caretakers','#527c91','#2d3544','LAST WATCH / TWO','EVE and the manager share one last quiet watch.'],
 ['quiet_automation','#786c82','#19252a','QUIET / ROUTINE','EVE remains with the records and the empty console.'],
 ['final_transmission','#b23c4f','#1d2131','END / SIGNAL','The last human transmission fades from the control room.']
];
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
for(let i=0;i<endings.length;i++){
 const [slug,a,b,stamp,caption]=endings[i], eve=i%3!==1, manager=i%3!==2;
 const figures=[];
 if(eve)figures.push(`<image href="${evePortrait}" x="72" y="114" width="390" height="680" preserveAspectRatio="xMidYMid slice" clip-path="url(#left)"/>`);
 if(manager)figures.push(`<image href="${managerPortrait}" x="1015" y="75" width="450" height="760" preserveAspectRatio="xMidYMid slice" clip-path="url(#right)"/>`);
 const center=eve&&manager?`<path d="M475 0V864M490 0V864" stroke="#f0a6bd" stroke-opacity=".12" stroke-width="2"/><circle cx="770" cy="432" r="214" fill="none" stroke="#f0a6bd" stroke-opacity=".12"/><circle cx="770" cy="432" r="174" fill="none" stroke="#78cee2" stroke-opacity=".15"/>`:'';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1536" height="864" viewBox="0 0 1536 864" role="img" aria-label="${esc(caption)}">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${a}"/><stop offset=".48" stop-color="#241d2b"/><stop offset="1" stop-color="${b}"/></linearGradient><linearGradient id="shade"><stop stop-color="#110f19" stop-opacity=".94"/><stop offset=".58" stop-color="#17141f" stop-opacity=".15"/><stop offset="1" stop-color="#101019" stop-opacity=".8"/></linearGradient><linearGradient id="beam"><stop stop-color="#ef9bb8" stop-opacity=".18"/><stop offset="1" stop-color="#ef9bb8" stop-opacity="0"/></linearGradient><clipPath id="left"><path d="M20 70h430v794H20z"/></clipPath><clipPath id="right"><path d="M1030 0h506v864h-506z"/></clipPath></defs>
<rect width="1536" height="864" fill="url(#bg)"/><path d="M0 720 430 300 800 720 1090 205 1536 690V864H0Z" fill="#12141d" fill-opacity=".62"/><path d="M0 650 470 0h200L135 864H0Z" fill="url(#beam)"/><path d="M1080 0h456v864h-170z" fill="#0c111a" fill-opacity=".24"/>
<g stroke="#e7a2b8" stroke-opacity=".18" fill="none"><path d="M0 112H1536M0 744H1536M510 0v864M1018 0v864"/><path d="M548 78h420v640H548z" stroke-dasharray="8 12"/><path d="M590 132h336M590 154h198M590 176h250"/></g>${figures.join('')}${center}
<rect width="1536" height="864" fill="url(#shade)"/><path d="M80 675H820" stroke="#ef9bb8" stroke-opacity=".45"/><text x="96" y="724" fill="#f3b7cc" font-family="Arial,sans-serif" font-size="22" letter-spacing="7">ARKTOPIA // ${esc(stamp)}</text><text x="1450" y="810" fill="#f3b7cc" fill-opacity=".7" font-family="monospace" font-size="18">${String(i+1).padStart(2,'0')} / 19</text></svg>`;
 fs.writeFileSync(path.join(out,`ending_${slug}_draft.svg`),svg);
}
console.log(`Created ${endings.length} official-cast ending cards.`);
