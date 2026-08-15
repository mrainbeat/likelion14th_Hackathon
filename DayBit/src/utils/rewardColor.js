const L_THRESHOLD = 0.92;
const CHROMA_GAIN = 0.6;
const MAX_CHROMA_BOOST = 0.04;

export function getTodayColorPalette(hex) {
  const todayColorRGB = hexToRgb(hex);
  const todayColor = rgbToHex(todayColorRGB);
  const { l, c, h } = rgbToOklch(todayColorRGB);

  const isAdjusted = l > L_THRESHOLD;

  const uiAccentColorRGB = isAdjusted
    ? adjustForUi({ l, c, h })
    : todayColorRGB;
  const uiAccentColor = rgbToHex(uiAccentColorRGB);

  return {
    todayColor,
    uiAccentColor,
    isAdjusted,
    todayColorRGB,
    uiAccentColorRGB,
    lightness: l,
  };
}

export function getUiAccentColor(hex) {
  return getTodayColorPalette(hex).uiAccentColor;
}

export function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustForUi({ l, c, h }) {
  const deltaL = l - L_THRESHOLD;
  const chromaBoost = Math.min(deltaL * CHROMA_GAIN, MAX_CHROMA_BOOST);
  return oklchToSrgb({ l: L_THRESHOLD, c: c + chromaBoost, h });
}

function oklchToSrgb({ l, c, h }) {
  if (isInSrgbGamut(oklchToLinearRgb({ l, c, h }))) {
    return toRgb255(oklchToLinearRgb({ l, c, h }));
  }

  let low = 0;
  let high = c;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (isInSrgbGamut(oklchToLinearRgb({ l, c: mid, h }))) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return toRgb255(oklchToLinearRgb({ l, c: low, h }));
}

function toRgb255({ r, g, b }) {
  return {
    r: Math.round(clamp(r, 0, 1) * 255),
    g: Math.round(clamp(g, 0, 1) * 255),
    b: Math.round(clamp(b, 0, 1) * 255),
  };
}

function rgbToOklch(rgb) {
  const r = srgbToLinear(rgb.r / 255);
  const g = srgbToLinear(rgb.g / 255);
  const b = srgbToLinear(rgb.b / 255);

  const lms1 = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const lms2 = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const lms3 = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(lms1);
  const m_ = Math.cbrt(lms2);
  const s_ = Math.cbrt(lms3);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bb * bb);
  let H = Math.atan2(bb, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

function oklchToLinearRgb({ l: L, c: C, h: H }) {
  const hRad = H * (Math.PI / 180);
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const lms1 = l_ ** 3;
  const lms2 = m_ ** 3;
  const lms3 = s_ ** 3;

  return {
    r: linearToSrgb(
      4.0767416621 * lms1 - 3.3077115913 * lms2 + 0.2309699292 * lms3,
    ),
    g: linearToSrgb(
      -1.2684380046 * lms1 + 2.6097574011 * lms2 - 0.3413193965 * lms3,
    ),
    b: linearToSrgb(
      -0.0041960863 * lms1 - 0.7034186147 * lms2 + 1.707614701 * lms3,
    ),
  };
}

function srgbToLinear(value) {
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

function linearToSrgb(value) {
  return value <= 0.0031308
    ? 12.92 * value
    : 1.055 * Math.pow(Math.max(value, 0), 1 / 2.4) - 0.055;
}

function isInSrgbGamut({ r, g, b }) {
  const EPS = 1e-6;
  return (
    r >= -EPS && r <= 1 + EPS && g >= -EPS && g <= 1 + EPS && b >= -EPS && b <= 1 + EPS
  );
}

function hexToRgb(hex) {
  const clean = String(hex).replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    throw new Error("6자리 HEX 색상을 입력해주세요.");
  }
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) =>
    clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
