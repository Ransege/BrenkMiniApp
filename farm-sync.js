let userId = 'guest';
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

if (tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) {
  userId = tg.initDataUnsafe.user.id;
  localStorage.setItem('brenkUser', JSON.stringify(tg.initDataUnsafe.user));
} else {
  const saved = localStorage.getItem('brenkUser');
  if (saved) userId = JSON.parse(saved).id;
}

const STORAGE_KEY = `brenkFarm_${userId}`;
const API_URL = 'https://10311.dscrd.ru/api/farm';

async function loadFromServer() {
  if (userId === 'guest') return null;
  try {
    const res = await fetch(`${API_URL}?user_id=${userId}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.log('Сервер недоступен');
  }
  return null;
}

async function syncToServer() {
  if (userId === 'guest') return;
  const data = {
    balance: window.game.bc,
    hack_level: window.game.hackLevel,
    limit_level: window.game.limitLevel,
    today_mined: window.game.todayMined,
    mined_date: window.game.minedDate,
    streak: window.game.streak,
    last_claim: window.game.lastClaim,
    fields_unlocked: window.game.fieldsUnlocked,
    reset_data: window.game.resetData,
    miner_level: window.game.minerLevel,
    last_miner_claim: window.game.lastMinerClaim
  };
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...data })
    });
  } catch (e) {
    console.log('Ошибка отправки');
  }
}

function loadLocal() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

function saveProgress() {
  const data = {
    bc: window.game.bc,
    hackLevel: window.game.hackLevel,
    limitLevel: window.game.limitLevel,
    todayMined: window.game.todayMined,
    minedDate: window.game.minedDate,
    streak: window.game.streak,
    lastClaim: window.game.lastClaim,
    fieldsUnlocked: window.game.fieldsUnlocked,
    resetData: window.game.resetData,
    minerLevel: window.game.minerLevel,
    lastMinerClaim: window.game.lastMinerClaim
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  syncToServer();
}