import { useNavigate } from "react-router-dom";
import OnboardingHeader from "./components/OnboardingHeader";
import { ProgressBar, BottomButton } from "./components/OnboardingUi";

const BLOBS = [
  // 하단 왼쪽, 노랑
  {
    cx: 131.5,
    cy: 548,
    w: 149,
    h: 182,
    rotate: 0,
    blur: 92.3,
    color: "#FFF0C7",
  },
  // 하단 중앙, 민트
  {
    cx: 279.5,
    cy: 764.5,
    w: 169,
    h: 205,
    rotate: -90,
    blur: 92.3,
    color: "#C7FFF6",
  },
  // 오른쪽 중단, 라벤더
  {
    cx: 412.44,
    cy: 427.25,
    w: 142.78,
    h: 173.19,
    rotate: -168.32,
    blur: 81,
    color: "#DCCDE6",
  },
  // 왼쪽 중단, 분홍
  {
    cx: -23.45,
    cy: 362.95,
    w: 167,
    h: 217,
    rotate: 27.85,
    blur: 65.5,
    color: "#FFCFCF",
  },
];

// 진입 시 애니메이션
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

      {/* 진입 시 색 진해지기 */}
      <div
        className="blobs pointer-events-none absolute inset-0 overflow-hidden"
        style={{ animation: "blob-in 1.4s ease-out both" }}
      >
        {BLOBS.map(({ cx, cy, w, h, rotate, blur, color }, i) => (
          <div
            key={i}
            className="absolute rounded-[50%]"
            style={{
              left: cx - w / 2,
              top: cy - h / 2,
              width: w,
              height: h,
              backgroundColor: color,
              transform: `rotate(${rotate}deg)`,
              filter: `blur(${blur}px)`,
            }}
          />
        ))}
      </div>

      <ProgressBar step={4} />

      <OnboardingHeader
        lines={[
          "좋아요 :) 바로 기록을 시작할까요?",
          "기록 후에 어울리는 색을 만들게요!",
        ]}
      />

      <BottomButton onClick={handleStart}>시작하기</BottomButton>
    </div>
  );
}
