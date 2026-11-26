/** Canonical asset-route audit. Checks local files and their actual image signatures. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, filename);
};

const root = path.resolve(__dirname, '../public/assets');
const { storyArtworkCandidates } = require('../src/lib/story-art.ts');
const { GAME_EVENT_ART_ORDER, incidentArtworkCandidates, incidentArtFiles } = require('../src/lib/incident-art.ts');
const { staffDialogueArtworkCandidates, staffStatusPortrait } = require('../src/lib/character-art.ts');
const { specs } = require('../src/lib/sim.ts');
const { animalSprite } = require('../src/lib/animal-art.ts');
let issues = 0;
let checked = 0;

function check(relative, label, required = true) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    console.log(`${required ? 'MISS' : 'OPTIONAL'} ${label}: /${relative}`);
    if (required) issues++;
    return false;
  }
  const bytes = fs.readFileSync(full);
  const png = bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  const webp = bytes.subarray(0, 4).toString('ascii') === 'RIFF'
    && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  const valid = relative.endsWith('.png') ? png : relative.endsWith('.webp') ? webp : true;
  checked++;
  console.log(`${valid ? 'OK' : 'INVALID'} ${label}: /${relative} (${(bytes.length / 1024 / 1024).toFixed(2)} MiB)`);
  if (!valid) issues++;
  return valid;
}

const crew = ['rabbit', 'fox', 'deer', 'wolf'];
const arrivals = {
  rabbit: 'cinematics/origin-zero/story/SCN_04_rabbit_medic_arrival.png',
  fox: 'cinematics/origin-zero/story/SCN_05_fox_supply_arrival.webp',
  deer: 'cinematics/origin-zero/story/SCN_06_deer_archive_arrival.png',
  wolf: 'cinematics/origin-zero/story/SCN_07_wolf_guard_arrival.webp'
};
const farewells = {
  rabbit: 'cinematics/origin-zero/farewells/FAREWELL_01_rabbit.png',
  fox: 'cinematics/origin-zero/farewells/FAREWELL_02_fox.png',
  deer: 'cinematics/origin-zero/farewells/FAREWELL_03_deer.png',
  wolf: 'cinematics/origin-zero/farewells/FAREWELL_04_wolf.png'
};
const termination = {
  rabbit: 'staff/rabbit/critical.png',
  fox: 'cinematics/staff-terminations/fox/scene.webp',
  deer: 'cinematics/staff-terminations/deer/scene.webp',
  wolf: 'cinematics/staff-terminations/wolf/scene.png'
};
const route = url => url.replace(/^\/assets\//, '');

for (const id of crew) {
  check(arrivals[id], `${id} arrival cinematic`);
  check(farewells[id], `${id} farewell cinematic`);
  check(termination[id], `${id} collapse/termination art`);
  for (const mood of ['neutral', 'smile', 'crying', 'angry', 'unstable', 'critical']) {
    const filename = id === 'deer' && mood === 'neutral' ? 'netural.png' : `${mood}.png`;
    check(`staff/${id}/${filename}`, `${id} ${mood} portrait`);
  }
  check(`staff/combat/${id}.png`, `${id} combat sprite`);
  for (const [mood, condition, line] of [
    ['neutral', 'safe', '처음 뵙겠습니다.'],
    ['anxious', 'unstable', '기억이 흔들립니다.'],
    ['critical', 'critical', '정체성이 무너지고 있습니다.'],
    ['resolve', 'safe', '함께 이곳을 지키겠습니다.']
  ]) {
    const selected = staffDialogueArtworkCandidates(id, mood, condition, line)[0];
    check(route(selected), `${id} dialogue portrait · ${mood}`);
  }
  check(route(staffStatusPortrait(id, 'safe')), `${id} stable roster portrait`);
  check(route(staffStatusPortrait(id, 'unstable')), `${id} unstable roster portrait`);
  check(route(staffStatusPortrait(id, 'critical')), `${id} critical roster portrait`);
  const criticalLine = id === 'wolf'
    ? '관리자님, 저는 변하고 싶지 않습니다. 무서워요.'
    : id === 'fox'
      ? '다 제 거예요. 제 물건을 가져가지 마세요.'
      : id === 'rabbit'
        ? '담당자님~ 어디가 아프신가요? 제가 치료해드릴게요.'
        : '기록을 지키지 못했어요. 미안해요.';
  const collapsePortrait = staffDialogueArtworkCandidates(id, 'critical', 'critical', criticalLine)[0];
  check(route(collapsePortrait), `${id} story-specific critical portrait`);
}

for (const species of specs) {
  check(route(animalSprite(species.id)), `${species.id} animal sprite`);
  check(route(animalSprite(species.id, true)), `${species.id} mutant sprite`);
}

for (let scene = 1; scene <= 19; scene++) {
  for (const candidate of storyArtworkCandidates(scene)) check(route(candidate), `story scene ${String(scene).padStart(2, '0')}`);
}
for (const incident of GAME_EVENT_ART_ORDER) {
  for (const candidate of incidentArtworkCandidates(incident)) check(route(candidate), `event ${incident}`);
}
for (const fallback of incidentArtFiles) check(`events/${fallback}`, `shared event fallback ${fallback}`);

check('cinematics/origin-zero/events/EVT_15_medic_memory.png', 'Rabbit memory event cinematic');
check('gameplay/cinematics/CAPTURE_01_success.png', 'capture success cinematic');
check('gameplay/cinematics/CAPTURE_02_failure.png', 'capture failure cinematic');
check('cinematics/origin-zero/story/SCN_02_eve_first_meeting.webp', 'EVE first-meeting cinematic');

for (let variant = 1; variant <= 20; variant++) {
  const id = String(variant).padStart(2, '0');
  check(`monsters/mutant${variant}_mutant.png`, `mutant M-${id} combat art`);
  check(`cinematics/field-threats/mutant${variant}/reveal.png`, `mutant M-${id} encounter art`);
}
for (const mood of ['neutral', 'anxious', 'critical', 'resolve']) {
  check(`characters/protagonist_${mood}.webp`, `protagonist ${mood} portrait`);
}
for (const mood of ['anxious', 'critical', 'resolve']) {
  check(`characters/eve_${mood}.webp`, `EVE ${mood} portrait`);
}

for (const obsolete of ['animals/mutant_mutant.png', 'field/enemy_echo.png', 'field/enemy_smile.png']) {
  if (fs.existsSync(path.join(root, obsolete))) {
    console.log(`OBSOLETE legacy mutant asset remains: /${obsolete}`);
    issues++;
  } else {
    console.log(`OK obsolete mutant asset removed: /${obsolete}`);
  }
}

console.log(`\nAsset audit: ${checked} files checked, ${issues} required-asset or format issue(s).`);
if (issues) process.exitCode = 1;
