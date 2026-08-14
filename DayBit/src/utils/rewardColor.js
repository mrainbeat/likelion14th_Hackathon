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

function fromHsl(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = hue / 60;
  const mid = chroma * (1 - Math.abs((segment % 2) - 1));
  const base = lightness - chroma / 2;
  const wheel = [
    [chroma, mid, 0],
    [mid, chroma, 0],
    [0, chroma, mid],
    [0, mid, chroma],
    [mid, 0, chroma],
    [chroma, 0, mid],
  ];
  const toHex = (channel) =>
    Math.round((channel + base) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${wheel[Math.floor(segment) % 6].map(toHex).join("")}`;
}

// 밝은 색은 흰 배경에서 글자가 안 읽혀서 색상만 남기고 중간 톤으로 낮춘다.
// #FFEFEF -> #BE6363 (피그마 시안 기준)
export function getReadableColor(hex) {
  if (!isHighLightness(hex)) return hex;
  return fromHsl(getHue(hex), 0.412, 0.567);
}

// 밝은 색은 그림자로 깔면 안 보여서 한 단계만 진하게 쓴다.
// #FFEFEF -> #FFE0E0 (피그마 시안 기준)
export function getGlowColor(hex) {
  if (!isHighLightness(hex)) return hex;
  return fromHsl(getHue(hex), 1, 0.939);
}
