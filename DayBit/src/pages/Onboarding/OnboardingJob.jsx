import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingHeader from "./components/OnboardingHeader";
import { ProgressBar, Chip, BottomButton } from "./components/OnboardingUi";
import ClearIcon1 from "../../assets/icons/clear1.svg";
import ClearIcon2 from "../../assets/icons/clear2.svg";

const PRESET_JOBS = ["직장인", "대학생", "구직중", "쉬는중", "프리랜서"];
const CUSTOM = "직접입력";
const MAX_LENGTH = 40;

export default function OnboardingJob() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [customJob, setCustomJob] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) setNickname(savedNickname);

    const savedJob = localStorage.getItem("job");
    if (savedJob) {
      if (PRESET_JOBS.includes(savedJob)) {
        setSelectedJob(savedJob);
      } else {
        setSelectedJob(CUSTOM);
        setCustomJob(savedJob);
      }
    }
  }, []);

  const handleSelect = (job) => {
    setSelectedJob(job);
    if (job === CUSTOM) {
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }
    setCustomJob("");
    localStorage.setItem("job", job);
  };

  const handleCustomChange = (e) => {
    const nextValue = e.target.value;
    setCustomJob(nextValue);
    if (nextValue.trim()) {
      localStorage.setItem("job", nextValue);
    } else {
      localStorage.removeItem("job");
    }
  };

  const handleClearCustom = () => {
    setCustomJob("");
    localStorage.removeItem("job");
    inputRef.current?.focus();
  };

  const isValid =
    selectedJob !== "" &&
    (selectedJob !== CUSTOM || customJob.trim().length > 0);

  const handleNext = () => {
    if (isValid) navigate("/onboarding/alarm", { replace: true });
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <ProgressBar step={1} />

      <OnboardingHeader
        lines={[
          `좋아요 ${nickname || "회원"}님!`,
          "일기작성을 돕기 위한 질문을 몇개 할게요!",
        ]}
        caption="설정에서 언제든지 변경 가능해요."
      />

      <div className="absolute left-[9.23%] right-[9.23%] top-[288px] flex flex-col gap-[16px]">
        <p className="whitespace-nowrap text-[20px] font-semibold leading-[1.19] tracking-[-0.4px] text-[#2D3038]">
          현재 어떤 일을 하고 있나요?
        </p>

        <div className="flex w-full flex-col items-start gap-[8px]">
          <div className="flex w-full flex-wrap items-center gap-[8px]">
            {PRESET_JOBS.map((job) => (
              <Chip
                key={job}
                label={job}
                selected={selectedJob === job}
                onClick={() => handleSelect(job)}
              />
            ))}
          </div>

          <div className="flex w-full flex-col items-start gap-[12px]">
            <button
              type="button"
              onClick={() => handleSelect(CUSTOM)}
              className={`flex h-[35px] shrink-0 items-center rounded-[17px] border border-solid px-[12px] text-[16px] leading-none transition-colors ${
                selectedJob === CUSTOM
                  ? "border-grey-80 font-semibold text-grey-90"
                  : "border-grey-30 font-medium text-grey-50"
              }`}
            >
              직접 입력
            </button>

            {selectedJob === CUSTOM && (
              <div className="flex w-full flex-col items-center gap-[6px]">
                <div className="flex w-full items-center justify-between">
                  <input
                    ref={inputRef}
                    type="text"
                    value={customJob}
                    onChange={handleCustomChange}
                    placeholder="직업을 입력해주세요."
                    maxLength={MAX_LENGTH}
                    className="min-w-0 flex-1 bg-transparent text-[16px] font-medium tracking-[-0.32px] text-grey-90 placeholder-grey-40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleClearCustom}
                    disabled={!customJob}
                    aria-label="직업 입력 지우기"
                    className="ml-[8px] flex size-[16px] shrink-0 items-center justify-center transition-opacity active:opacity-60 disabled:pointer-events-none"
                  >
                    <img
                      src={customJob ? ClearIcon2 : ClearIcon1}
                      alt=""
                      className="size-full"
                    />
                  </button>
                </div>
                <div className="h-px w-full bg-grey-30" />
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomButton disabled={!isValid} onClick={handleNext}>
        다음
      </BottomButton>
    </div>
  );
}
