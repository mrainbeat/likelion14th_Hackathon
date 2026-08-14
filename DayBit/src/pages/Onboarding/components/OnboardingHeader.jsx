import LogoSymbol from "../../../assets/logos/logo-symbol.svg";
export default function OnboardingHeader({
  lines = [],
  caption,
  titleSize = 20,
}) {
  const titleClass =
    titleSize === 22
      ? "text-[22px] tracking-[-0.44px]"
      : "text-[20px] tracking-[-0.4px]";

  return (
    <div className="absolute left-[9.23%] top-[76px] flex flex-col items-start gap-[17px]">
      {" "}
      <img
        src={LogoSymbol}
        alt="DAY BIT"
        className="h-[61px] w-[48px] shrink-0 object-cover"
      />
      <div className="flex flex-col items-start gap-[6px]">
        <div className="flex flex-col items-start gap-[2px]">
          {lines.map((line, i) => (
            <p
              key={i}
              className={`whitespace-nowrap font-semibold leading-[1.19] text-[#2D3038] ${titleClass}`}
            >
              {line}
            </p>
          ))}
        </div>
        {caption && (
          <p className="whitespace-nowrap text-[12px] font-normal leading-[1.19] tracking-[-0.12px] text-[#858C9C]">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
