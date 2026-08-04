import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingHeader from "./components/OnboardingHeader";
import { ProgressBar, BottomButton } from "./components/OnboardingUi";
import ClearIcon1 from "../../assets/icons/clear1.svg";
import ClearIcon2 from "../../assets/icons/clear2.svg";

export default function OnboardingName() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("nickname");
    if (saved) setNickname(saved);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 8) {
      setNickname(value);
      localStorage.setItem("nickname", value);
    }
  };

  const handleClear = () => {
    setNickname("");
    localStorage.removeItem("nickname");
  };

  const isValid = nickname.length >= 2 && nickname.length <= 8;

  const handleNext = () => {
    if (isValid) navigate("/onboarding/job", { replace: true });
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-background">
      <ProgressBar step={0} />

      <OnboardingHeader
        titleSize={22}
        lines={["안녕하세요, 전 데이빗이에요 :)", "뭐라고 부르면 될까요?"]}
        caption="설정에서 언제든지 변경 가능해요."
      />

      <div className="absolute left-[36px] top-[292px] flex w-[318px] flex-col gap-[8px]">
        <div className="flex w-full flex-col gap-[6px]">
          <label className="w-full text-[14px] font-medium leading-[1.19] text-grey-70">
            닉네임
          </label>

          <div className="flex w-full flex-col gap-[6px]">
            <div className="flex w-full items-center justify-between">
              <input
                type="text"
                value={nickname}
                onChange={handleChange}
                placeholder="제임스"
                className="min-w-0 flex-1 bg-transparent text-[18px] font-medium leading-[1.19] tracking-[-0.36px] text-grey-90 placeholder-grey-30 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleClear}
                disabled={!nickname}
                aria-label="닉네임 지우기"
                className="ml-[8px] flex size-[16px] shrink-0 items-center justify-center transition-opacity active:opacity-60 disabled:pointer-events-none"
              >
                <img
                  src={nickname ? ClearIcon2 : ClearIcon1}
                  alt=""
                  className="size-full"
                />
              </button>
            </div>
            <div className="h-px w-full bg-grey-30" />
          </div>
        </div>

        <p className="w-full text-[14px] font-normal leading-[1.19] text-grey-50">
          2~ 8자로 입력해주세요.
        </p>
      </div>

      <BottomButton disabled={!isValid} onClick={handleNext}>
        다음
      </BottomButton>
    </div>
  );
}
