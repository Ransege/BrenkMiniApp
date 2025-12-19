window.game = {
  bc: 0,
  hackLevel: 1,
  limitLevel: 0,
  todayMined: 0,
  minedDate: new Date().toISOString().slice(0,10),
  streak: 0,
  lastClaim: null,
  fieldsUnlocked: 1,
  resetData: { resetsToday: 0, lastResetTime: 0, cycleStartTime: 0 },
  minerLevel: 0,
  lastMinerClaim: Date.now(),

  getCurrentLimit() {
    let total = BASE_LIMIT;
    for (let i = 1; i <= this.limitLevel; i++) {
      total += limitIncreases[i];
    }
    return total;
  },

  getPerTap(level = this.hackLevel) {
    if (level === 1) return 1;
    return Math.pow(2, level - 1) * 2 + (level - 2) * 4;
  },

  calculatePendingMiner() {
    if (this.minerLevel === 0) return 0;
    const rate = minerRates[this.minerLevel];
    const elapsed = (Date.now() - this.lastMinerClaim) / 3600000;
    const pending = Math.floor(rate * elapsed);
    return Math.min(pending, rate * 6);
  },

  save() {
    saveProgress();
  }
};