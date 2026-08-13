// 오늘의 보상 색을 화면 전반에 적용할 때 쓰는 색 계산 코드
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

export function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getLightness(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
}

export function isHighLightness(hex) {
  return getLightness(hex) >= 0.5;
}

function getHue(hex) {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return 0;

  let hue;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

function tint(hex, floor) {
  const segment = getHue(hex) / 60;
  const span = 255 - floor;
  const mid = span * (1 - Math.abs((segment % 2) - 1));
  const wheel = [
    [span, mid, 0],
    [mid, span, 0],
    [0, span, mid],
    [0, mid, span],
    [mid, 0, span],
    [span, 0, mid],
  ];
  const toHex = (channel) =>
    Math.round(channel + floor)
      .toString(16)
      .padStart(2, "0");
  return `#${wheel[Math.floor(segment) % 6].map(toHex).join("")}`;
}

export function getFillTint(hex) {
  return tint(hex, 0xef);
}

export function getGlowTint(hex) {
  return tint(hex, 0xe0);
}
