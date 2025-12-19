let bubbleInterval = null;
const tg = window.Telegram.WebApp;

async function initGame() {
  const serverData = await loadFromServer();
  let localData = loadLocal();

  if (serverData && (serverData.balance > 0 || serverData.today_mined > 0)) {
    if (!localData || localData.bc < (serverData.balance || 0)) {
      document.getElementById('server-balance').textContent = (serverData.balance || 0).toLocaleString();
      document.getElementById('server-mined').textContent = (serverData.today_mined || 0).toLocaleString();
      document.getElementById('sync-modal').style.display = 'flex';
      document.getElementById('loader').classList.add('hidden');
      window.serverProgress = serverData;
      return;
    }
  }

  if (localData) {
    Object.assign(window.game, localData);
  }

  updateBalance();
  updateDailyMined();
  unlockFields();
  updateHackUpgrade();
  updateLimitUpgrade();
  updateMinerDisplay();

  document.getElementById('loader').classList.add('hidden');
}

function loadServerProgress() {
  Object.assign(window.game, window.serverProgress);
  window.game.save();
  showMessage("Прогресс загружен с сервера ♡");
  updateBalance();
  updateDailyMined();
  unlockFields();
  updateHackUpgrade();
  updateLimitUpgrade();
  updateMinerDisplay();
  document.getElementById('sync-modal').style.display = 'none';
}

function continueLocal() {
  showMessage("Продолжаем локально ♡");
  document.getElementById('sync-modal').style.display = 'none';
}

function createBubble() {
  if (document.getElementById('tap-overlay').style.display !== 'flex') return;
  const b = document.createElement('div');
  b.className = 'bubble';
  const size = Math.random() * 20 + 10;
  b.style.width = b.style.height = `${size}px`;
  b.style.left = `${Math.random() * 260 + 10}px`;
  b.style.animationDuration = `${Math.random() * 4 + 4}s`;
  document.getElementById('tap-circle').appendChild(b);
  setTimeout(() => b.remove(), 8000);
}

function startBubbles() {
  if (bubbleInterval) clearInterval(bubbleInterval);
  bubbleInterval = setInterval(createBubble, 800);
}

function createCoinParticle(x, y) {
  const p = document.createElement('div');
  p.className = 'coin-particle';
  p.textContent = '🪙';
  p.style.left = `${x}px`;
  p.style.top = `${y}px`;
  p.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
  p.style.setProperty('--dy', `${(Math.random() - 0.5) * 200 - 100}px`);
  p.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1200);
}

document.querySelectorAll('.field').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!btn.classList.contains('unlocked')) return;
    document.getElementById('tap-overlay').style.display = 'flex';
    document.getElementById('tap-gain').textContent = window.game.getPerTap();
    document.getElementById('tap-level').textContent = window.game.hackLevel;
    tg.HapticFeedback.impactOccurred('medium');
    startBubbles();
  });
});

function closeTap() {
  document.getElementById('tap-overlay').style.display = 'none';
  if (bubbleInterval) clearInterval(bubbleInterval);
  document.querySelectorAll('.bubble').forEach(b => b.remove());
}

let lastTapTime = 0;
document.getElementById('tap-circle').addEventListener('click', e => {
  const now = Date.now();
  if (now - lastTapTime < 100) {
    showMessage("Слишком быстро... ;)");
    tg.HapticFeedback.impactOccurred('heavy');
    return;
  }
  lastTapTime = now;

  if (window.game.todayMined >= window.game.getCurrentLimit()) {
    showMessage("Лимит на сегодня исчерпан ♡");
    return;
  }

  const gain = window.game.getPerTap();
  window.game.bc += gain;
  window.game.todayMined += gain;
  updateBalance();
  updateDailyMined();
  unlockFields();

  const x = e.clientX;
  const y = e.clientY;
  for (let i = 0; i < window.game.hackLevel; i++) {
    setTimeout(() => createCoinParticle(x, y), i * 50);
  }

  tg.HapticFeedback.impactOccurred('light');
  showMessage(`+${gain} BC ♡`);
  window.game.save();
});

document.getElementById('hack-upgrade').addEventListener('click', () => {
  if (document.getElementById('hack-upgrade').disabled) return;
  const cost = hackCosts[window.game.hackLevel];
  window.game.bc -= cost;
  window.game.hackLevel++;
  updateBalance();
  updateHackUpgrade();
  showMessage(`Уровень взлома повышен до ${window.game.hackLevel}! +${window.game.getPerTap()} BC за тап ♡`);
  window.game.save();
});

document.getElementById('limit-upgrade').addEventListener('click', () => {
  if (document.getElementById('limit-upgrade').disabled) return;
  const cost = limitCosts[window.game.limitLevel + 1];
  window.game.bc -= cost;
  window.game.limitLevel++;
  updateBalance();
  updateDailyMined();
  updateLimitUpgrade();
  showMessage(`Лимит повышен до ${window.game.getCurrentLimit()} BC/день ♡`);
  window.game.save();
});

document.getElementById('miner-upgrade').addEventListener('click', () => {
  if (document.getElementById('miner-upgrade').disabled) return;
  const next = window.game.minerLevel + 1;
  const cost = minerCosts[next];
  window.game.bc -= cost;
  window.game.minerLevel = next;
  if (next === 1) window.game.lastMinerClaim = Date.now();
  updateBalance();
  updateMinerDisplay();
  showMessage(`Майнер улучшен до уровня ${next}! ${minerRates[next]} BC/час ♡`);
  window.game.save();
});

document.getElementById('claim-miner').addEventListener('click', () => {
  const pending = window.game.calculatePendingMiner();
  if (pending > 0) {
    window.game.bc += pending;
    window.game.lastMinerClaim = Date.now();
    updateBalance();
    updateMinerDisplay();
    showMessage(`Забрано ${pending.toLocaleString()} BC ♡`);
    tg.HapticFeedback.impactOccurred('light');
    window.game.save();
  }
});

setInterval(updateMinerDisplay, 1000);

initGame();