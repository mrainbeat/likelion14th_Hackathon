import progressbarMini from "../../../assets/components/progressbar-mini.svg";

export default function MiniProgressBar({ current }) {
  const fillWidth = current * 16 + 8;

  return (
    <div className="relative h-[4px] w-[56px]">
      <img src={progressbarMini} alt="" className="block h-full w-full" />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: fillWidth }}
      >
        <div
          className="h-[4px] w-[56px]"
          style={{
            backgroundColor: "#5F6473",
            maskImage: `url("${progressbarMini}")`,
            WebkitMaskImage: `url("${progressbarMini}")`,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        />
      </div>
    </div>
  );
}
