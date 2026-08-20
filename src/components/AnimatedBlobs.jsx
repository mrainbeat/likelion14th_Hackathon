const BLOB_CYCLE_MS = 9000;
const BLOB_EASE = "cubic-bezier(0.45, 0.3, 0.55, 0.7)"; // 거의 등속에 가까운 in-out
const BLOBS = [
  {
    name: "loading-blob-7",
    color: "#FFF0C7",
    blur: 92.3,
    left: 57,
    top: 505,
    w: 149,
    h: 182,
    steps: [
      { t: [0, 0], r: 0, s: [1, 1], o: 1 },
      { t: [86.914, 70.433], r: -75.89, s: [1, 1], o: 1 },
      { t: [160.914, -194.567], r: -75.89, s: [1, 1], o: 1 },
      { t: [-84.086, -190.567], r: -75.89, s: [1, 1], o: 1 },
    ],
  },
  {
    name: "loading-blob-8",
    color: "#C7FFF6",
    blur: 92.3,
    left: 195,
    top: 710,
    w: 169,
    h: 205,
    steps: [
      { t: [0, 0], r: -90, s: [1, 1], o: 1 },
      { t: [-298, -452], r: -90, s: [1, 1], o: 0 },
      { t: [-298, -452], r: -90, s: [1, 1], o: 1 },
      { t: [-74, -117], r: -90, s: [1, 1], o: 1 },
    ],
  },
  {
    name: "loading-blob-9",
    color: "#EDDCF9",
    blur: 81,
    left: 336.82,
    top: 388.22,
    w: 147.055,
    h: 173.193,
    steps: [
      { t: [0, 0], r: -168.32, s: [1, 1], o: 1 },
      { t: [-265.315, -131.867], r: -244.22, s: [0.9709, 1], o: 1 },
      { t: [-303.315, 247.133], r: -244.22, s: [0.9709, 1], o: 1 },
      { t: [0, 0], r: -168.32, s: [1, 1], o: 0 },
    ],
  },
  {
    name: "loading-blob-6",
    color: "#FFCFCF",
    blur: 65.5,
    left: -106.98,
    top: 302.44,
    w: 167,
    h: 217,
    steps: [
      { t: [0, 0], r: 27.85, s: [1, 1], o: 1 },
      { t: [-51.008, 308.695], r: -48.04, s: [1, 1], o: 1 },
      { t: [463.573, 280.249], r: -162.36, s: [0.8624, 0.6432], o: 1 },
      { t: [440.665, -109.355], r: -123.1, s: [0.8704, 0.8704], o: 1 },
    ],
  },
];

function blobTransform(step) {
  return `translate(${step.t[0]}px, ${step.t[1]}px) rotate(${step.r}deg) scale(${step.s[0]}, ${step.s[1]})`;
}

function buildBlobKeyframes(blob) {
  const frames = blob.steps.map(
    (step, i) =>
      `${i * 25}% { transform: ${blobTransform(step)}; opacity: ${step.o}; animation-timing-function: ${BLOB_EASE}; }`,
  );
  const first = blob.steps[0];
  frames.push(
    `100% { transform: ${blobTransform(first)}; opacity: ${first.o}; }`,
  );
  return `@keyframes ${blob.name} { ${frames.join(" ")} }`;
}

export default function AnimatedBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {BLOBS.map((blob) => (
        <div
          key={blob.name}
          className="absolute rounded-[50%]"
          style={{
            left: blob.left,
            top: blob.top,
            width: blob.w,
            height: blob.h,
            backgroundColor: blob.color,
            filter: `blur(${blob.blur}px)`,
            willChange: "transform, opacity",
            animation: `${blob.name} ${BLOB_CYCLE_MS}ms infinite`,
          }}
        />
      ))}
      <style>{BLOBS.map(buildBlobKeyframes).join("\n")}</style>
    </div>
  );
}
