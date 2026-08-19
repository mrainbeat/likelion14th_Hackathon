const DAY_START_KEY = "dayStartTime";
const DEFAULT_DAY_START = "00:00";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function getDayStartTime() {
  try {
    return localStorage.getItem(DAY_START_KEY) || DEFAULT_DAY_START;
  } catch {
    return DEFAULT_DAY_START;
  }
}

export function saveDayStartTime(value) {
  if (!value) return;
  try {
    localStorage.setItem(DAY_START_KEY, value);
  } catch {
    return;
  }
}

function getSeoulNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
  };
}

export function getServiceToday(dayStartTime = getDayStartTime()) {
  const { year, month, day, hour, minute } = getSeoulNow();
  const [rawHour, rawMinute] = String(dayStartTime).split(":").map(Number);
  const startHour = Number.isFinite(rawHour) ? rawHour : 0;
  const startMinute = Number.isFinite(rawMinute) ? rawMinute : 0;

  const beforeDayStart =
    hour < startHour || (hour === startHour && minute < startMinute);

  const base = new Date(Date.UTC(year, month - 1, day));
  if (beforeDayStart) base.setUTCDate(base.getUTCDate() - 1);

  const y = base.getUTCFullYear();
  const m = base.getUTCMonth() + 1;
  const d = base.getUTCDate();
  return { year: y, month: m, day: d, dateStr: `${y}-${pad2(m)}-${pad2(d)}` };
}

export function getServiceTodayStr(dayStartTime) {
  return getServiceToday(dayStartTime).dateStr;
}
