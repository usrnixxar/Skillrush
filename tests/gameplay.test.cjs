const {test, mock} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Compile the project's pure TypeScript systems using its existing compiler.
require.extensions['.ts'] = (module, filename) => {
  const {outputText} = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  });
  module._compile(outputText, filename);
};
const {WordManager} = require('../src/game/systems/WordManager.ts');
const {JumpPhysics} = require('../src/game/systems/JumpPhysics.ts');
const {GAME_CONFIG} = require('../src/game/config/GameConfig.ts');

test('solved words cannot be edited or scored twice', () => {
  const manager = new WordManager();
  manager.setTargetWord('GATE');
  for (const letter of 'GATE') manager.handleKeyInput(letter);
  const before = manager.getStats();
  for (const key of ['Backspace', 'E', 'X', 'Backspace']) assert.equal(manager.handleKeyInput(key), 'IGNORED');
  assert.deepEqual(manager.getStats(), before);
  manager.setTargetWord('RUN');
  assert.equal(manager.handleKeyInput('r'), 'CORRECT');
});

test('pause time is excluded from typing speed', () => {
  let now = 0;
  const clock = mock.method(performance, 'now', () => now);
  try {
    const manager = new WordManager();
    manager.setTargetWord('GATES');
    now = 1000; manager.pause();
    now = 61000; manager.resume();
    now = 62000;
    for (const key of 'GATES') manager.handleKeyInput(key);
    assert.equal(manager.getSmoothedWPM(), 30);
  } finally { clock.mock.restore(); }
});

test('queued gaps remain reachable at minimum runner speed after WPM falls', () => {
  const gap = JumpPhysics.getSafeGapWidth(GAME_CONFIG.PLAYER.BASE_SPEED);
  assert(gap + 40 < JumpPhysics.getMaxJumpDistance(GAME_CONFIG.PLAYER.BASE_SPEED));
  assert(gap >= GAME_CONFIG.WORLD.MIN_GAP);
});

test('real saved runs appear in all periods without demo names or duplicate rows', () => {
  const data = new Map();
  global.localStorage = {getItem: key => data.get(key) ?? null, setItem: (key, val) => data.set(key, val)};
  const {leaderboardService:s} = require('../src/services/leaderboardService.ts');
  assert.deepEqual(s.getEntries('all-time'), []);
  const base = {name:'Explorer', isStudent:false, highestWPM:45, score:500, distance:70, category:'daily'};
  s.addEntry(base); s.addEntry({...base,score:750});
  for (const category of ['daily','weekly','all-time']) {
    assert.equal(s.getEntries(category).length,1);
    assert.equal(s.getEntries(category)[0].score,750);
    assert.equal(s.getEntries(category)[0].rank,1);
  }
  const saved = JSON.parse(data.values().next().value);
  saved[0].date = '2020-01-01'; saved[0].name = 'Old explorer';
  data.set('skillence_type_runner_leaderboard',JSON.stringify(saved));
  assert.equal(s.getEntries('daily').length,1);
  assert.equal(s.getEntries('weekly').length,1);
  assert.equal(s.getEntries('all-time').length,2);
});
