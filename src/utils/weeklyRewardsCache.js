const CACHE_PREFIX = "home_weekly_rewards_";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function cacheKey(year, month) {
  return `${CACHE_PREFIX}${year}_${pad2(month)}`;
}

export function loadCachedWeeklyRewards(year, month) {
  try {
    const raw = localStorage.getItem(cacheKey(year, month));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedWeeklyRewards(year, month, items) {
  try {
    localStorage.setItem(cacheKey(year, month), JSON.stringify(items));
  } catch {
    return;
  }
}

export function clearCachedWeeklyRewards() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    return;
  }
}
