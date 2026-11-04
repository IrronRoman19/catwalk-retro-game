const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const positionReadout = document.querySelector('#position-readout');
const scoreReadout = document.querySelector('#score-readout');
const motionReadout = document.querySelector('#motion-readout');

const keys = new Set();
const cat = { x: canvas.width / 2, y: canvas.height / 2, speed: 235, direction: 'down', walking: false, frame: 0 };
const collectibles = [
  { type: 'fish', x: 180, y: 145, value: 100, active: true },
  { type: 'milk', x: 760, y: 420, value: 150, active: true },
  { type: 'fish', x: 610, y: 160, value: 100, active: true }
];
let score = 0;
let respawnTimer = 0;
let respawnsPending = 0;
let pickupMessage = '';
let audioContext;
let stepTimer = 0;
let lastTime = performance.now();

window.addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    startAudio();
    keys.add(event.key);
    canvas.focus();
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.key));

function startAudio() {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
}

function playTone(frequency, duration, type = 'square', volume = 0.035, delay = 0) {
  if (!audioContext) return;
  const start = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playPickupSound(type) {
  const notes = type === 'fish' ? [520, 780] : [392, 523, 659];
  notes.forEach((note, index) => playTone(note, 0.12, 'square', 0.045, index * 0.08));
}

function update(delta) {
  let horizontal = 0;
  let vertical = 0;
  if (keys.has('ArrowLeft')) horizontal -= 1;
  if (keys.has('ArrowRight')) horizontal += 1;
  if (keys.has('ArrowUp')) vertical -= 1;
  if (keys.has('ArrowDown')) vertical += 1;
  cat.walking = horizontal !== 0 || vertical !== 0;
  if (horizontal !== 0 && vertical !== 0) { horizontal *= 0.707; vertical *= 0.707; }
  if (horizontal) cat.direction = horizontal < 0 ? 'left' : 'right';
  else if (vertical) cat.direction = vertical < 0 ? 'up' : 'down';
  cat.x = Math.max(34, Math.min(canvas.width - 34, cat.x + horizontal * cat.speed * delta));
  cat.y = Math.max(48, Math.min(canvas.height - 44, cat.y + vertical * cat.speed * delta));
  if (cat.walking) {
    cat.frame = (cat.frame + delta * 9) % 2;
    stepTimer -= delta;
    if (stepTimer <= 0) {
      playTone(105, 0.045, 'square', 0.018);
      stepTimer = 0.22;
    }
  } else stepTimer = 0;
  collectItems();
  if (respawnTimer > 0) {
    respawnTimer -= delta;
    if (respawnTimer <= 0) {
      spawnItem();
      respawnsPending -= 1;
      if (respawnsPending > 0) respawnTimer = 1.5 + Math.random() * 2.5;
    }
  }
  positionReadout.textContent = `X ${String(Math.round(cat.x)).padStart(4, '0')} / Y ${String(Math.round(cat.y)).padStart(4, '0')}`;
  scoreReadout.textContent = `SCORE ${String(score).padStart(4, '0')}`;
  motionReadout.textContent = cat.walking ? `WALKING // FACING ${cat.direction.toUpperCase()}` : 'STANDING BY';
}

function collectItems() {
  collectibles.forEach((item) => {
    if (!item.active || Math.hypot(cat.x - item.x, cat.y - item.y) > 34) return;
    item.active = false;
    score += item.value;
    pickupMessage = `${item.type.toUpperCase()} +${item.value}`;
    playPickupSound(item.type);
    respawnsPending += 1;
    if (respawnTimer <= 0) respawnTimer = 1.5 + Math.random() * 2.5;
  });
}

function spawnItem() {
  const inactiveItems = collectibles.filter((item) => !item.active);
  const item = inactiveItems[Math.floor(Math.random() * inactiveItems.length)];
  if (!item) return;
  item.type = Math.random() > 0.5 ? 'fish' : 'milk';
  item.value = item.type === 'fish' ? 100 : 150;
  item.x = 50 + Math.random() * (canvas.width - 100);
  item.y = 70 + Math.random() * (canvas.height - 120);
  item.active = true;
}

function drawMap() {
  context.fillStyle = '#e8e5dc';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#d1cec4';
  context.lineWidth = 1;
  for (let x = 20; x < canvas.width; x += 40) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); }
  for (let y = 20; y < canvas.height; y += 40) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); }
  context.strokeStyle = '#b7b5ab';
  context.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  context.fillStyle = '#b7b5ab';
  context.font = '10px monospace';
  context.fillText('OPEN TERRAIN', 28, 38);
  context.fillText('NO WALLS / NO LIMITS', canvas.width - 158, canvas.height - 25);
  collectibles.filter((item) => item.active).forEach(drawCollectible);
  if (pickupMessage) {
    context.fillStyle = '#171717';
    context.font = '700 14px monospace';
    context.fillText(pickupMessage, canvas.width / 2 - 48, 38);
    pickupMessage = '';
  }
}

function drawCollectible(item) {
  context.save();
  context.translate(item.x, item.y);
  context.fillStyle = item.type === 'fish' ? '#171717' : '#f5f2e9';
  context.strokeStyle = '#171717';
  context.lineWidth = 3;
  if (item.type === 'fish') {
    context.beginPath();
    context.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2);
    context.fill();
    context.beginPath(); context.moveTo(-13, 0); context.lineTo(-26, -10); context.lineTo(-26, 10); context.closePath(); context.fill();
    context.fillStyle = '#d7ed47'; context.fillRect(6, -3, 3, 3);
  } else {
    context.fillRect(-12, -13, 24, 25);
    context.strokeRect(-12, -13, 24, 25);
    context.fillStyle = '#d7ed47'; context.fillRect(-9, -18, 18, 5);
    context.fillStyle = '#171717'; context.fillRect(-5, -4, 10, 3);
  }
  context.restore();
}

function drawCat() {
  const step = cat.walking && Math.floor(cat.frame) === 1 ? 4 : 0;
  const facingLeft = cat.direction === 'left';
  context.save();
  context.translate(cat.x, cat.y);
  if (facingLeft) context.scale(-1, 1);
  context.fillStyle = '#aaa79e';
  context.fillRect(-18, 30, 36, 3);
  context.fillStyle = '#171717';
  context.beginPath(); context.ellipse(0, 4, 18, 24, 0, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#f5f2e9';
  context.beginPath(); context.ellipse(0, 7, 11, 17, 0, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#171717';
  context.beginPath(); context.moveTo(-14, -12); context.lineTo(-13, -31); context.lineTo(-3, -23); context.lineTo(3, -31); context.lineTo(15, -12); context.closePath(); context.fill();
  context.fillStyle = '#f5f2e9'; context.fillRect(-7, -21, 4, 4); context.fillRect(5, -21, 4, 4);
  context.fillStyle = '#171717'; context.fillRect(8, -14, 3, 3);
  context.strokeStyle = '#171717'; context.lineWidth = 2; context.beginPath(); context.moveTo(-3, -11); context.lineTo(3, -11); context.stroke();
  context.fillStyle = '#171717';
  context.fillRect(-11, 25 + step, 6, 12 - step); context.fillRect(6, 25 + (4 - step), 6, 12 - (4 - step));
  context.fillRect(13, 5, 15, 5); context.fillRect(24, 4, 5, 14);
  context.restore();
}

function render() { drawMap(); drawCat(); }
function loop(now) { const delta = Math.min((now - lastTime) / 1000, 0.05); lastTime = now; update(delta); render(); requestAnimationFrame(loop); }

render();
requestAnimationFrame(loop);