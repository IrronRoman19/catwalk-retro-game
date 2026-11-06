const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const positionReadout = document.querySelector('#position-readout');
const scoreReadout = document.querySelector('#score-readout');
const foodReadout = document.querySelector('#food-readout');
const motionReadout = document.querySelector('#motion-readout');
const pauseButton = document.querySelector('#pause-button');
const pauseMenu = document.querySelector('#pause-menu');
const resumeButton = document.querySelector('#resume-button');
const muteButton = document.querySelector('#mute-button');
const pauseMuteButton = document.querySelector('#pause-mute-button');
const gameOverMenu = document.querySelector('#game-over-menu');
const gameOverSummary = document.querySelector('#game-over-summary');
const playAgainButton = document.querySelector('#play-again-button');
const healthValue = document.querySelector('#health-value');
const healthFill = document.querySelector('#health-fill');
const healthBar = document.querySelector('.health-bar');

const keys = new Set();
const cat = { x: canvas.width / 2, y: canvas.height / 2, speed: 235, direction: 'down', walking: false, frame: 0 };
const collectibles = [];
const hazards = [];
const MAX_HEALTH = 100;
const MUSHROOM_DAMAGE = 25;
let score = 0;
let foodCount = 0;
let spawnTimer = 4;
let hazardTimer = 15;
let health = MAX_HEALTH;
let pickupMessage = '';
let audioContext;
let stepTimer = 0;
let isPaused = false;
let isGameOver = false;
let isMuted = false;
let lastTime = performance.now();
const boardPalette = {
  background: '#183d2b',
  grid: '#24543a',
  border: '#6f9b72',
  label: '#9fc89c'
};

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    togglePause();
    return;
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    if (isPaused) return;
    startAudio();
    keys.add(event.key);
    canvas.focus();
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.key));
pauseButton.addEventListener('click', togglePause);
resumeButton.addEventListener('click', togglePause);
muteButton.addEventListener('click', toggleMute);
pauseMuteButton.addEventListener('click', toggleMute);
playAgainButton.addEventListener('click', resetGame);

function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;
  keys.clear();
  pauseMenu.hidden = !isPaused;
  pauseButton.textContent = isPaused ? 'PLAY' : 'PAUSE';
  motionReadout.textContent = isPaused ? 'PAUSED // PRESS ESC TO RESUME' : 'STANDING BY';
  if (!isPaused) lastTime = performance.now();
}

function startAudio() {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
}

function toggleMute() {
  if (!isMuted) startAudio();
  isMuted = !isMuted;
  const label = isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO';
  muteButton.textContent = label;
  pauseMuteButton.textContent = label;
  muteButton.setAttribute('aria-label', isMuted ? 'Unmute game audio' : 'Mute game audio');
  pauseMuteButton.setAttribute('aria-label', isMuted ? 'Unmute game audio' : 'Mute game audio');
}

function playTone(frequency, duration, type = 'square', volume = 0.035, delay = 0) {
  if (!audioContext || isMuted) return;
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
  updateCollectibles(delta);
  updateHazards(delta);
  collectItems();
  checkHazardCollisions();
  updateHealthReadout();
  positionReadout.textContent = `X ${String(Math.round(cat.x)).padStart(4, '0')} / Y ${String(Math.round(cat.y)).padStart(4, '0')}`;
  scoreReadout.textContent = `SCORE ${String(score).padStart(4, '0')}`;
  foodReadout.textContent = `FOOD ${String(foodCount).padStart(4, '0')}`;
  if (!isGameOver) motionReadout.textContent = cat.walking ? `WALKING // FACING ${cat.direction.toUpperCase()}` : 'STANDING BY';
}

function updateHazards(delta) {
  hazardTimer -= delta;
  if (hazardTimer <= 0) {
    spawnMushroom();
    hazardTimer = 15;
  }
}

function checkHazardCollisions() {
  hazards.forEach((hazard) => {
    if (isGameOver || !hazard.active || Math.hypot(cat.x - hazard.x, cat.y - hazard.y) > 34) return;
    hazard.active = false;
    health = Math.max(0, health - MUSHROOM_DAMAGE);
    playTone(180, 0.12, 'sawtooth', 0.04);
    if (health === 0) {
      playTone(110, 0.2, 'square', 0.05);
      playTone(82, 0.35, 'square', 0.05, 0.2);
      showGameOver();
    }
  });
}

function spawnMushroom() {
  const minimumDistance = 3 * 40;
  let x;
  let y;
  do {
    x = 50 + Math.random() * (canvas.width - 100);
    y = 70 + Math.random() * (canvas.height - 120);
  } while (Math.hypot(cat.x - x, cat.y - y) < minimumDistance);
  hazards.push({ x, y, active: true });
}

function updateHealthReadout() {
  healthValue.textContent = String(health);
  healthFill.style.width = `${health}%`;
  healthFill.style.backgroundColor = health <= 25 ? '#f05a47' : 'var(--acid)';
  healthBar.setAttribute('aria-valuenow', String(health));
}

function showGameOver() {
  isGameOver = true;
  keys.clear();
  gameOverSummary.textContent = `SCORE ${String(score).padStart(4, '0')} // FOOD ${String(foodCount).padStart(4, '0')}`;
  gameOverMenu.hidden = false;
  motionReadout.textContent = 'GAME OVER // PLAY AGAIN TO RESTART';
}

function resetGame() {
  cat.x = canvas.width / 2;
  cat.y = canvas.height / 2;
  cat.direction = 'down';
  cat.walking = false;
  cat.frame = 0;
  collectibles.length = 0;
  hazards.length = 0;
  spawnInitialFood();
  score = 0;
  foodCount = 0;
  pickupMessage = '';
  health = MAX_HEALTH;
  spawnTimer = 4;
  hazardTimer = 15;
  isPaused = false;
  isGameOver = false;
  pauseMenu.hidden = true;
  gameOverMenu.hidden = true;
  pauseButton.textContent = 'PAUSE';
  motionReadout.textContent = 'STANDING BY';
  updateHealthReadout();
  lastTime = performance.now();
}

function updateCollectibles(delta) {
  spawnTimer -= delta;
  if (spawnTimer <= 0) {
    spawnFood(Math.random() < 0.5 ? 'fish' : 'water');
    spawnTimer = 4;
  }
}

function collectItems() {
  collectibles.forEach((item) => {
    if (!item.active || Math.hypot(cat.x - item.x, cat.y - item.y) > 34) return;
    item.active = false;
    score += item.value;
    foodCount += 1;
    pickupMessage = `${item.type.toUpperCase()} +${item.value}`;
    playPickupSound(item.type);
    item.active = false;
  });
}

function spawnInitialFood() {
  const fish = spawnFood('fish');
  spawnFood('water', fish);
}

function spawnFood(type, avoidItem = null) {
  let x;
  let y;
  do {
    x = 50 + Math.random() * (canvas.width - 100);
    y = 70 + Math.random() * (canvas.height - 120);
  } while (avoidItem && Math.hypot(x - avoidItem.x, y - avoidItem.y) <= 68);
  collectibles.push({
    type,
    x,
    y,
    value: type === 'fish' ? 100 : 150,
    active: true
  });
  return collectibles[collectibles.length - 1];
}

function drawMap() {
  context.fillStyle = boardPalette.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = boardPalette.grid;
  context.lineWidth = 1;
  for (let x = 20; x < canvas.width; x += 40) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); }
  for (let y = 20; y < canvas.height; y += 40) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); }
  context.strokeStyle = boardPalette.border;
  context.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  context.fillStyle = boardPalette.label;
  context.font = '10px monospace';
  context.fillText('OPEN TERRAIN', 28, 38);
  context.fillText('NO WALLS / NO LIMITS', canvas.width - 158, canvas.height - 25);
  collectibles.filter((item) => item.active).forEach(drawCollectible);
  hazards.filter((hazard) => hazard.active).forEach(drawMushroom);
  if (pickupMessage) {
    context.fillStyle = '#171717';
    context.font = '700 14px monospace';
    context.fillText(pickupMessage, canvas.width / 2 - 48, 38);
    pickupMessage = '';
  }

  function drawMushroom(hazard) {
    context.save();
    context.translate(hazard.x, hazard.y);
    context.fillStyle = '#f05a47';
    context.strokeStyle = '#171717';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(0, 0, 15, Math.PI, 0);
    context.lineTo(13, 14);
    context.lineTo(-13, 14);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = '#f5f2e9';
    context.fillRect(-7, -7, 4, 4);
    context.fillRect(4, -4, 4, 4);
    context.fillStyle = '#f5f2e9';
    context.fillRect(-8, 10, 16, 10);
    context.restore();
  }
}

function drawCollectible(item) {
  context.save();
  context.translate(item.x, item.y);
  context.fillStyle = item.type === 'fish' ? '#f5f2e9' : '#4aa3df';
  context.strokeStyle = '#171717';
  context.lineWidth = 3;
  if (item.type === 'fish') {
    context.beginPath();
    context.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2);
    context.fill();
    context.beginPath(); context.moveTo(-13, 0); context.lineTo(-26, -10); context.lineTo(-26, 10); context.closePath(); context.fill();
    context.fillStyle = '#d7ed47'; context.fillRect(6, -3, 3, 3);
  } else {
    context.beginPath();
    context.moveTo(0, -17);
    context.lineTo(12, 3);
    context.arc(0, 3, 12, 0, Math.PI);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = '#d7ed47';
    context.fillRect(-4, -1, 4, 4);
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
function loop(now) {
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  if (!isPaused) update(delta);
  spawnInitialFood();
  render();
  updateHealthReadout();
  requestAnimationFrame(loop);
}

render();
requestAnimationFrame(loop);