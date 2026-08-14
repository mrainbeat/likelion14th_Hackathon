import tailTriangle from "../assets/icons/tail-rounded.svg";

export default function BubbleTail({ color, mirror = false, className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-[-9px] flex h-[18.739px] w-[15.307px] items-center justify-center ${className}`}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      <div style={{ transform: "rotate(-29.36deg)" }}>
        <div
          className="h-[12.75px] w-[6.9282px]"
          style={{
            backgroundColor: color,

            maskImage: `url("${tailTriangle}")`,

            WebkitMaskImage: `url("${tailTriangle}")`,

            maskRepeat: "no-repeat",

            WebkitMaskRepeat: "no-repeat",

            maskSize: "contain",

            WebkitMaskSize: "contain",
          }}
        />
      </div>
    </div>
  );
}
