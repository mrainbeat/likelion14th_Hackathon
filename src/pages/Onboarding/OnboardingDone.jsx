import { useNavigate } from "react-router-dom";
import OnboardingHeader from "./components/OnboardingHeader";
import { BottomButton } from "./components/OnboardingUi";
import AnimatedBlobs from "../../components/AnimatedBlobs";

const KEYFRAMES = `
@keyframes blob-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .blobs { animation: none !important; opacity: 1 !important; }
}
`;

export default function OnboardingDone() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/diary", { replace: true });
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <style>{KEYFRAMES}</style>
      <div
        className="blobs pointer-events-none absolute inset-0"
        style={{ animation: "blob-in 1.4s ease-out both" }}
      >
        <AnimatedBlobs />
      </div>
      <OnboardingHeader
        step={4}
        lines={[
          "좋아요 :) 바로 기록을 시작할까요?",
          "기록 후에 어울리는 색을 만들게요!",
        ]}
      />
      <BottomButton onClick={handleStart}>시작하기</BottomButton>
    </div>
  );
}
