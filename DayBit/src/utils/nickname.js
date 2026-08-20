const NICKNAME_KEY = "nickname";

export function loadCachedNickname() {
  try {
    return localStorage.getItem(NICKNAME_KEY) || "";
  } catch {
    return "";
  }
}

export function saveCachedNickname(nickname) {
  if (!nickname) return;
  try {
    localStorage.setItem(NICKNAME_KEY, nickname);
  } catch {
    return;
  }
}

export function clearCachedNickname() {
  try {
    localStorage.removeItem(NICKNAME_KEY);
  } catch {
    return;
  }
}
