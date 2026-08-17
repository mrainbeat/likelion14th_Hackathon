import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingHeader from "./components/OnboardingHeader";
import { BottomButton } from "./components/OnboardingUi";

const PRESET_TIMES = [
  { label: "오전12시", value: "00:00" },
  { label: "오전1시", value: "01:00" },
  { label: "오전2시", value: "02:00" },
  { label: "오전3시", value: "03:00" },
  { label: "오전4시", value: "04:00" },
  { label: "오전5시", value: "05:00" },
];

export default function OnboardingDayStartTime() {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("dayStartTime");
    if (saved) setSelectedTime(saved);
  }, []);

  const handleSelect = (value) => {
    setSelectedTime(value);
    localStorage.setItem("dayStartTime", value);
  };

  const isValid = selectedTime !== "";

  const handleNext = () => {
    if (isValid) navigate("/onboarding/alarm", { replace: true });
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <OnboardingHeader
        step={1}
        onBack={() => navigate("/onboarding")}
        lines={["일기작성이 초기화 되는", "하루 전환시간을 설정할게요."]}
        caption="설정에서 언제든지 변경 가능해요."
      />

      <div className="absolute left-[9.23%] right-[9.23%] top-[332px] flex flex-col gap-[16px]">
        <div className="flex flex-col items-start gap-[6px]">
          <p className="whitespace-nowrap text-[20px] font-semibold leading-[1.19] tracking-[-0.4px] text-[#2D3038]">
            몇시에 하루를 전환할까요?
          </p>
          <p className="whitespace-nowrap text-[12px] font-normal leading-[1.19] tracking-[-0.12px] text-[#787E8C]">
            마이페이지에서 언제든지 변경할 수 있어요.
          </p>
        </div>

        <div className="flex w-full flex-col items-start gap-[8px]">
          {[PRESET_TIMES.slice(0, 3), PRESET_TIMES.slice(3, 6)].map(
            (row, rowIdx) => (
              <div key={rowIdx} className="flex w-full items-center gap-[8px]">
                {row.map((time) => {
                  const isSelected = selectedTime === time.value;
                  const widthClass =
                    time.value === "01:00" ? "w-[75px]" : "w-[79px]";
                  return (
                    <button
                      key={time.value}
                      type="button"
                      onClick={() => handleSelect(time.value)}
                      className={`flex shrink-0 items-center justify-center whitespace-nowrap rounded-[38px] border px-[12px] py-[8px] text-[16px] leading-[normal] ${
                        isSelected
                          ? "border-grey-80 font-semibold text-grey-90"
                          : `${widthClass} border-grey-30 font-medium tracking-[-0.32px] text-grey-50`
                      }`}
                    >
                      {time.label}
                    </button>
                  );
                })}
              </div>
            ),
          )}
        </div>
      </div>

      <BottomButton disabled={!isValid} onClick={handleNext}>
        다음
      </BottomButton>
    </div>
  );
}
