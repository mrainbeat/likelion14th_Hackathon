import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingHeader from "./components/OnboardingHeader";
import { ProgressBar, Chip, BottomButton } from "./components/OnboardingUi";
import JobInputModal from "./components/JobInputModal";

const PRESET_JOBS = ["직장인", "대학생", "구직중", "쉬는중", "프리랜서"];
const CUSTOM = "직접입력";

export default function OnboardingJob() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [customJob, setCustomJob] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

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
    if (job === CUSTOM) {
      setModalOpen(true);
      return;
    }
    setSelectedJob(job);
    setCustomJob("");
    localStorage.setItem("job", job);
  };

  const handleConfirm = (value) => {
    setSelectedJob(CUSTOM);
    setCustomJob(value);
    localStorage.setItem("job", value);
    setModalOpen(false);
  };

  const isValid = selectedJob !== "";

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
        <p className="whitespace-nowrap text-[20px] font-semibold leading-[1.19] tracking-[-0.4px] text-grey-90">
          현재 어떤 일을 하고 있나요?
        </p>
        <div className="flex w-full flex-wrap items-center gap-[8px]">
          {[...PRESET_JOBS, CUSTOM].map((job) => (
            <Chip
              key={job}
              label={job === CUSTOM && customJob ? customJob : job}
              selected={selectedJob === job}
              onClick={() => handleSelect(job)}
            />
          ))}
        </div>
      </div>

      <BottomButton disabled={!isValid} onClick={handleNext}>
        다음
      </BottomButton>

      <JobInputModal
        open={modalOpen}
        initialValue={customJob}
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
