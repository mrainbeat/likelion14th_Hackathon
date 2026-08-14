import tailTriangle from "../assets/icons/tail-rounded.svg";

export default function BubbleTail({ color, mirror = false, className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute flex items-center justify-center ${className}`}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      <div style={{ transform: "rotate(-29.358deg)" }}>
        <div
          style={{
            width: "8px",
            height: "17px",
            backgroundColor: color,
            maskImage: `url("${tailTriangle}")`,
            WebkitMaskImage: `url("${tailTriangle}")`,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        />
      </div>
    </div>
  );
}
