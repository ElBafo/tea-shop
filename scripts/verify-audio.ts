import assert from 'node:assert/strict';
let state = 'suspended';
let starts = 0;
let resumes = 0;
let blocked = true;
const parameter = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
class MockContext {
  get state() { return state; }
  currentTime = 1;
  destination = {};
  async resume() { resumes++; if (blocked) throw new Error('gesture blocked'); state = 'running'; }
  createOscillator() { return { frequency: parameter, connect() {}, disconnect() {}, start() { starts++; }, stop() {} }; }
  createGain() { return { gain: parameter, connect() {}, disconnect() {} }; }
}
Object.assign(globalThis, { window: { AudioContext: MockContext } });
const { playClick, unlockAudio } = await import('../src/game/audio.ts');
await unlockAudio();
assert.equal(starts, 0);
blocked = false;
await playClick(false);
assert.equal(starts, 2, 'a later tap recovers from a blocked first gesture');
state = 'interrupted';
await playClick(false);
assert.equal(starts, 4, 'audio resumes after a Safari interruption');
const previous = resumes;
await playClick(true);
assert.equal(starts, 4);
assert.equal(resumes, previous, 'muted effects do not resume audio');
console.log('Audio retry, interruption recovery, and mute checks passed.');
