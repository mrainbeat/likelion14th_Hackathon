import LogoSymbol from "../../../assets/logos/logo-symbol.svg";
import { ProgressBar, BackButton } from "./OnboardingUi";

export default function OnboardingHeader({
  lines = [],
  caption,
  titleSize = 20,
  step,
  totalSteps = 4,
  onBack,
}) {
  const titleClass =
    titleSize === 22
      ? "text-[22px] tracking-[-0.44px]"
      : "text-[20px] tracking-[-0.4px]";

  return (
    <div className="absolute left-0 right-0 top-0 flex flex-col items-start gap-[60px] px-[16px] py-[16px]">
      {" "}
      <div className="flex w-full flex-col items-start gap-[16px]">
        <ProgressBar step={step} total={totalSteps} />
        {onBack && <BackButton onClick={onBack} />}
      </div>
      <div className="flex flex-col items-start gap-[17px] px-[16px]">
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
            <p className="whitespace-nowrap text-[12px] font-normal leading-[1.19] tracking-[-0.12px] text-[#787E8C]">
              {" "}
              {caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
