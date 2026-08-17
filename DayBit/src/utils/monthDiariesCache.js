const CACHE_PREFIX = "home_month_diaries_";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function monthItemsCacheKey(year, month) {
  return `${CACHE_PREFIX}${year}_${pad2(month)}`;
}

export function loadCachedMonthItems(year, month) {
  try {
    const raw = localStorage.getItem(monthItemsCacheKey(year, month));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedMonthItems(year, month, items) {
  try {
    localStorage.setItem(
      monthItemsCacheKey(year, month),
      JSON.stringify(items),
    );
  } catch {
    return;
  }
}

export function clearCachedMonthItems() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    return;
  }
}
