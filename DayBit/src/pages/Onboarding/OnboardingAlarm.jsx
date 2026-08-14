import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingHeader from "./components/OnboardingHeader";
import AlarmTimeModal, { formatAlarmLabel } from "./components/AlarmTimeModal";
import {
  ProgressBar,
  BackButton,
  Chip,
  BottomButton,
} from "./components/OnboardingUi";
const PRESET_TIMES = ["오후8시", "오후9시", "오후10시", "오후11시"];
const CUSTOM = "직접입력";

export default function OnboardingAlarm() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) setNickname(savedNickname);

    const savedTime = localStorage.getItem("alarmTime");
    if (savedTime) {
      if (PRESET_TIMES.includes(savedTime)) {
        setSelectedTime(savedTime);
      } else {
        setSelectedTime(CUSTOM);
        setCustomTime(savedTime);
      }
    }
  }, []);

  const handleSelect = (time) => {
    if (time === CUSTOM) {
      setModalOpen(true);
      return;
    }
    setSelectedTime(time);
    setCustomTime("");
    localStorage.setItem("alarmTime", time);
  };

  const handleConfirm = (picked) => {
    const label = formatAlarmLabel(picked);
    setSelectedTime(CUSTOM);
    setCustomTime(label);
    localStorage.setItem("alarmTime", label);
    setModalOpen(false);
  };

  const isValid = selectedTime !== "";

  const handleNext = () => {
    if (isValid) navigate("/onboarding/consent", { replace: true });
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-background">
      <ProgressBar step={2} />
      <BackButton onClick={() => navigate(-1)} />
      <OnboardingHeader
        lines={[
          `좋아요 ${nickname || "회원"}님!`,
          "일기작성을 돕기 위한 질문을 몇개 할게요!",
        ]}
        caption="설정에서 언제든지 변경 가능해요."
      />

      <div className="absolute left-[9.23%] right-[9.23%] top-[288px] flex flex-col gap-[16px]">
        <div className="flex flex-col items-start gap-[6px]">
          <p className="whitespace-nowrap text-[20px] font-semibold leading-[1.19] tracking-[-0.4px] text-grey-90">
            하루를 잊기 전에 가볍게 알려드릴게요.
          </p>
          <p className="whitespace-nowrap text-[12px] font-normal leading-[1.19] tracking-[-0.12px] text-grey-60">
            정한 시간에 알림을 보내드려요 :)
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-[8px]">
          {[...PRESET_TIMES, CUSTOM].map((time) => (
            <Chip
              key={time}
              label={time === CUSTOM && customTime ? customTime : time}
              selected={selectedTime === time}
              onClick={() => handleSelect(time)}
            />
          ))}
        </div>
      </div>

      <BottomButton disabled={!isValid} onClick={handleNext}>
        다음
      </BottomButton>

      <AlarmTimeModal
        open={modalOpen}
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
