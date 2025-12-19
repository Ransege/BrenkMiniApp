function showMessage(text) {
  const msg = document.getElementById('brenk-msg');
  msg.textContent = text;
  setTimeout(() => msg.textContent = '', 4000);
}

function updateBalance() {
  document.getElementById('bc-amount').textContent = window.game.bc.toLocaleString();
}

function updateDailyMined() {
  const today = new Date().toISOString().slice(0,10);
  if (window.game.minedDate !== today) {
    window.game.todayMined = 0;
    window.game.minedDate = today;
    window.game.resetData = { resetsToday: 0, lastResetTime: 0, cycleStartTime: 0 };
  }
  document.getElementById('daily-mined').textContent = window.game.todayMined.toLocaleString();
  const limit = window.game.getCurrentLimit();
  document.getElementById('daily-limit').textContent = limit.toLocaleString();
  document.getElementById('progress-fill').style.width = `${Math.min(100, (window.game.todayMined / limit) * 100)}%`;
  const fillPercent = 100 - (window.game.todayMined / limit) * 100;
  document.getElementById('liquid').style.height = `${Math.max(0, fillPercent)}%`;
}

function updateHackUpgrade() {
  const btn = document.getElementById('hack-upgrade');
  const cost = hackCosts[window.game.hackLevel];
  const nextTap = window.game.getPerTap(window.game.hackLevel + 1);
  if (window.game.hackLevel >= 10) {
    btn.innerHTML = "🔓 Максимальный уровень взлома достигнут!";
    btn.disabled = true;
  } else if (window.game.bc < cost) {
    btn.innerHTML = `🔓 Недостаточно BC (${cost.toLocaleString()} нужно)`;
    btn.disabled = true;
  } else {
    btn.innerHTML = `
      🔓 Уровень взлома: ${window.game.hackLevel} → ${window.game.hackLevel + 1}<br>
      <small>За тап: ${window.game.getPerTap()} → ${nextTap} BC</small><br>
      <strong>Стоимость: ${cost.toLocaleString()} BC</strong>
    `;
    btn.disabled = false;
  }
}

function updateLimitUpgrade() {
  const btn = document.getElementById('limit-upgrade');
  if (window.game.limitLevel >= 5) {
    btn.innerHTML = "⬆️ Максимальный лимит достигнут!";
    btn.disabled = true;
    return;
  }
  const cost = limitCosts[window.game.limitLevel + 1];
  const nextLimit = window.game.getCurrentLimit() + limitIncreases[window.game.limitLevel + 1];
  if (window.game.bc < cost) {
    btn.innerHTML = `⬆️ Недостаточно BC (${cost.toLocaleString()} нужно)`;
    btn.disabled = true;
  } else {
    btn.innerHTML = `
      ⬆️ Уровень лимита: ${window.game.limitLevel} → ${window.game.limitLevel + 1}<br>
      <small>Лимит: ${window.game.getCurrentLimit().toLocaleString()} → ${nextLimit.toLocaleString()} BC</small><br>
      <strong>Стоимость: ${cost.toLocaleString()} BC</strong>
    `;
    btn.disabled = false;
  }
}

function updateMinerDisplay() {
  const rate = minerRates[window.game.minerLevel];
  document.getElementById('miner-rate').textContent = rate.toLocaleString();
  const pending = window.game.calculatePendingMiner();
  document.getElementById('pending-miner').textContent = pending.toLocaleString();

  const claimBtn = document.getElementById('claim-miner');
  claimBtn.textContent = pending > 0 ? `Забрать ${pending.toLocaleString()} BC` : 'Ничего не накоплено';
  claimBtn.disabled = pending === 0;

  const upgradeBtn = document.getElementById('miner-upgrade');
  if (window.game.minerLevel >= 5) {
    upgradeBtn.innerHTML = "⛏️ Максимальный уровень майнера достигнут!";
    upgradeBtn.disabled = true;
  } else {
    const next = window.game.minerLevel + 1;
    const cost = minerCosts[next];
    const nextRate = minerRates[next];
    upgradeBtn.innerHTML = `
      ⛏️ Уровень майнера: ${window.game.minerLevel} → ${next}<br>
      <small>Добыча: ${rate} → ${nextRate} BC/час</small><br>
      <strong>Стоимость: ${cost.toLocaleString()} BC</strong>
    `;
    upgradeBtn.disabled = window.game.bc < cost;
  }
}

function unlockFields() {
  const thresholds = [0, 5000, 20000, 100000, 500000];
  let unlocked = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (window.game.bc >= thresholds[i]) unlocked = i + 1;
  }
  window.game.fieldsUnlocked = Math.max(window.game.fieldsUnlocked, unlocked);
  document.querySelectorAll('.field').forEach((f, i) => {
    f.classList.toggle('unlocked', i + 1 <= window.game.fieldsUnlocked);
    f.classList.toggle('locked', i + 1 > window.game.fieldsUnlocked);
  });
}