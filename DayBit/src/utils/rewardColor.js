const WHITE = { r: 255, g: 255, b: 255 };

// 오늘의 색 하나로 메인/소프트 배경과 그 위에 얹을 텍스트 색까지 한 세트로 만든다.
// mainColor: 원본 그대로 (버튼 배경 등 강조용)
// softColor: 같은 색상(hue)의 옅은 배경 (보조 버튼·말풍선·칩 배경용)
export function getTodayColorPalette(hex) {
  const mainColorRGB = hexToRgb(hex);
  const mainColor = rgbToHex(mainColorRGB);
  const brightness = getBrightness(mainColorRGB);

  let mainTextColorRGB;
  let mode;
  if (brightness < 220) {
    mainTextColorRGB = WHITE;
    mode = "white-text";
  } else {
    mainTextColorRGB = getDerivedTextColor(mainColorRGB);
    mode = "derived-text";
  }
  const mainTextColor = rgbToHex(mainTextColorRGB);

  const softColorRGB = getSoftColor(mainColorRGB);
  const softColor = rgbToHex(softColorRGB);

  // 소프트 배경 위 텍스트는 기본적으로 메인 컬러를 그대로 쓰되,
  // 대비가 부족하면 메인 텍스트 컬러(진한 동계열)로 대체한다
  const softColorBrightness = getBrightness(softColorRGB);
  const mainOnSoftContrast = getContrastRatio(mainColorRGB, softColorRGB);
  let softTextColorRGB;
  if (mainOnSoftContrast >= 3) {
    softTextColorRGB = mainColorRGB;
  } else if (softColorBrightness < 220) {
    softTextColorRGB = WHITE;
  } else {
    softTextColorRGB = getDerivedTextColor(softColorRGB);
  }
  const softTextColor = rgbToHex(softTextColorRGB);

  return {
    mainColor,
    mainTextColor,
    softColor,
    softTextColor,
    mainColorRGB,
    mainTextColorRGB,
    softColorRGB,
    softTextColorRGB,
    mode,
  };
}

// mainTextColor는 mainColor로 "칠한 면" 위에 얹는 텍스트라 어두운/진한 색일 땐
// 흰색이 나온다. 흰 페이지 배경 위에 얹는 텍스트(헤드라인, 아이콘 등)는 그 흰색이
// 그대로 안 보이게 되므로, 이 경우엔 진하면 원본색을 그대로 쓰고 너무 밝을 때만
// mainTextColor(파생된 진한 동계열)를 쓴다.
export function getOnPageTextColor(palette) {
  return palette.mode === "white-text" ? palette.mainColor : palette.mainTextColor;
}

export function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ==================================================
   메인 텍스트 컬러 생성
   ================================================== */
function getDerivedTextColor(backgroundRGB) {
  const original = rgbToOklch(backgroundRGB);
  const saturation = getHslSaturation(backgroundRGB);

  const TEXT_LIGHTNESS = 0.64;
  let textChroma;

  if (original.c < 0.03) {
    if (saturation >= 0.45) {
      // 깨끗한 파스텔
      textChroma = 0.12;
    } else {
      // 베이지 / 그레이 / 저채도 뉴트럴
      textChroma = original.c;
    }
  } else if (original.c < 0.12) {
    if (saturation >= 0.4) {
      textChroma = 0.12;
    } else {
      textChroma = Math.min(original.c * 1.15, 0.08);
    }
  } else {
    textChroma = original.c;
  }

  const textHue = original.h;

  let candidate = oklchToRgbRaw({
    l: TEXT_LIGHTNESS,
    c: textChroma,
    h: textHue,
  });

  while (!isInSrgbGamut(candidate) && textChroma > 0) {
    textChroma = Math.max(0, textChroma - 0.005);
    candidate = oklchToRgbRaw({
      l: TEXT_LIGHTNESS,
      c: textChroma,
      h: textHue,
    });
  }

  return {
    r: Math.round(clamp(candidate.r, 0, 1) * 255),
    g: Math.round(clamp(candidate.g, 0, 1) * 255),
    b: Math.round(clamp(candidate.b, 0, 1) * 255),
  };
}

/* ==================================================
   소프트 배경 컬러 생성
   ================================================== */
function getSoftColor(mainRGB) {
  const original = rgbToOklch(mainRGB);
  let softL;
  let softC;

  const brightness = getBrightness(mainRGB);
  if (brightness < 220) {
    // 원본이 중간/진한 색이면 확실히 연한 톤으로 생성
    softL = 0.92;
    softC = clamp(original.c * 0.45, 0.03, 0.1);
  } else {
    // 원본이 이미 밝은 색이면 원본과 유사한 soft 영역 유지
    softL = Math.max(original.l, 0.95);
    softC = original.c < 0.03 ? original.c : clamp(original.c * 0.75, 0.03, 0.1);
  }

  const softH = original.h;

  let candidate = oklchToRgbRaw({ l: softL, c: softC, h: softH });

  while (!isInSrgbGamut(candidate) && softC > 0) {
    softC = Math.max(0, softC - 0.005);
    candidate = oklchToRgbRaw({ l: softL, c: softC, h: softH });
  }

  return {
    r: Math.round(clamp(candidate.r, 0, 1) * 255),
    g: Math.round(clamp(candidate.g, 0, 1) * 255),
    b: Math.round(clamp(candidate.b, 0, 1) * 255),
  };
}

/* ==================================================
   유틸
   ================================================== */
function getBrightness({ r, g, b }) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function getHslSaturation({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  if (delta === 0) return 0;

  const lightness = (max + min) / 2;
  return delta / (1 - Math.abs(2 * lightness - 1));
}

function getContrastRatio(a, b) {
  const l1 = getRelativeLuminance(a);
  const l2 = getRelativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance({ r, g, b }) {
  const rs = srgbChannelToLinear(r / 255);
  const gs = srgbChannelToLinear(g / 255);
  const bs = srgbChannelToLinear(b / 255);
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function srgbChannelToLinear(v) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/* ==================================================
   RGB → OKLCH
   ================================================== */
function rgbToOklch(rgb) {
  const r = srgbToLinear(rgb.r / 255);
  const g = srgbToLinear(rgb.g / 255);
  const b = srgbToLinear(rgb.b / 255);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bb * bb);
  let H = Math.atan2(bb, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

/* ==================================================
   OKLCH → RGB
   ================================================== */
function oklchToRgbRaw({ l: L, c: C, h: H }) {
  const hRad = H * (Math.PI / 180);
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const rLinear = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return {
    r: linearToSrgb(rLinear),
    g: linearToSrgb(gLinear),
    b: linearToSrgb(bLinear),
  };
}

/* ==================================================
   Helper
   ================================================== */
function srgbToLinear(value) {
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

function linearToSrgb(value) {
  return value <= 0.0031308
    ? 12.92 * value
    : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function isInSrgbGamut(rgb) {
  return (
    rgb.r >= 0 && rgb.r <= 1 && rgb.g >= 0 && rgb.g <= 1 && rgb.b >= 0 && rgb.b <= 1
  );
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
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
