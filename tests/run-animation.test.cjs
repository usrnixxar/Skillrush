const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const EventEmitter = require('eventemitter3');
const path = require('node:path');
const phaserRoot = path.resolve(path.dirname(require.resolve('phaser')), '..');
const AnimationManager = require(path.join(phaserRoot, 'src/animations/AnimationManager.js'));
const AnimationState = require(path.join(phaserRoot, 'src/animations/AnimationState.js'));

require.extensions['.ts'] = (module, filename) => {
  const {outputText} = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  });
  module._compile(outputText, filename);
};

// Only stub the browser Scene base; exercise Phaser's actual animation engine.
const originalLoad = Module._load;
let PreloadScene;
try {
  Module._load = function (name, ...rest) {
    if (name === 'phaser') return {__esModule: true, default: {Scene: class {}}};
    return originalLoad.call(this, name, ...rest);
  };
  ({PreloadScene} = require('../src/game/scenes/PreloadScene.ts'));
} finally {
  Module._load = originalLoad;
}

test('runner plays all 48 frames and loops at an 800ms cadence', () => {
  const game = {events: new EventEmitter(), textures: {
    getFrame: key => ({texture: {key}, name: '__BASE'}),
  }};
  const manager = new AnimationManager(game);
  manager.boot();
  const scene = new PreloadScene();
  scene.anims = manager;
  scene.registerAnimations();
  const actor = new EventEmitter();
  actor.scene = {sys: {anims: manager}};
  actor.setSizeToFrame = () => {};
  const state = new AnimationState(actor);
  state.play('anim_character_run');
  assert.equal(state.currentAnim.duration, 800);
  const seen = new Set([actor.texture.key]);
  let repeats = 0;
  actor.on('animationrepeat', () => repeats++);
  for (let t = 0; t < 1700; t += 5) {
    state.update(t, 5);
    seen.add(actor.texture.key);
  }
  assert.equal(seen.size, 48);
  assert.equal(repeats, 2);
  assert.equal(state.isPlaying, true);
  state.pause();
  const pausedKey = actor.texture.key;
  state.update(1800, 100);
  assert.equal(actor.texture.key, pausedKey);
  state.resume();
  state.update(1850, 50);
  assert.notEqual(actor.texture.key, pausedKey);
});
