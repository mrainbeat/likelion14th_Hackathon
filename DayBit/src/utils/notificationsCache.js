const CACHE_PREFIX = "home_notifications";
const UNREAD_COUNT_KEY = `${CACHE_PREFIX}_unread_count`;
const ITEMS_KEY = `${CACHE_PREFIX}_items`;

export function loadCachedUnreadCount() {
  try {
    const raw = localStorage.getItem(UNREAD_COUNT_KEY);
    if (raw == null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCachedUnreadCount(count) {
  try {
    localStorage.setItem(UNREAD_COUNT_KEY, String(count));
  } catch {
    return;
  }
}

export function loadCachedNotifications() {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedNotifications(items) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    saveCachedUnreadCount(items.filter((item) => !item.read).length);
  } catch {
    return;
  }
}

export function clearCachedNotifications() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    return;
  }
}
