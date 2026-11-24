const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const game = require('../src/lib/game-v10.ts');
const voice = require('../src/lib/voice-breach.ts');
const assert = require('node:assert/strict');

// Deterministic no-management baseline: spend no AP and select the no-power standby protocol.
let randomSeed = 0xA70F2026;
Math.random = () => {
  randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0;
  return randomSeed / 0x100000000;
};
let state = game.beginGame('medic', 'generator');
const days = [];
for (let i = 0; i < 10; i += 1) {
  state.ap = 0;
  // The game requires a choice when an event blocks day-end. This baseline performs
  // no operations; it only clears required UI using the first available response.
  for (let guard = 0; guard < 12; guard += 1) {
    const blocker = game.getDayEndBlocker(state);
    if (!blocker) break;
    if (blocker.code === 'incident') {
      const response = [0, 1, 2].find(option => game.previewIncident(state, option).available);
      if (response === undefined) throw new Error(`No incident response is available on DAY ${state.day}: ${state.pendingIncident}`);
      state = game.resolveIncident(state, response);
    }
    else if (blocker.code === 'voice') {
      for (const probe of ['eve', 'enclosure', 'personnel']) state = voice.inspectVoiceBreach(state, probe);
      state = voice.resolveVoiceBreach(state, 'seal');
    } else break;
  }
  state = game.finishDay(state, 'standby');
  days.push({ day: state.day, blocker: game.getDayEndBlocker(state)?.code ?? null, pendingIncident: state.pendingIncident, phase: state.phase, power: state.power, facility: state.facility, threat: state.threat, infection: state.infection, morale: state.mind, food: state.food, eventRisk: state.eventRisk, livingAnimals: state.animals.filter(animal => animal.alive).length });
}
assert.equal(state.day, 11, 'ten neglected day transitions should remain playable through DAY 10');
assert.equal(state.phase, 'day', 'neglect pressure should not be a hard-coded DAY 10 game over');
assert.equal(state.power, 0);
assert.equal(state.facility, 0);
assert.equal(state.threat, 100);
assert.ok(state.infection >= 80, 'neglect must produce severe infection by day ten');
assert.ok(state.mind < 85, 'high infection and neglect should cause meaningful morale damage');
process.stdout.write(`${JSON.stringify(days, null, 2)}\n`);
