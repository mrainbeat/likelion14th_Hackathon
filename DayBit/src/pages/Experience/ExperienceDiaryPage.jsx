import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FeedbackModal from "./components/FeedbackModal";
import CancelConfirmModal from "./components/CancelConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";

const MOCK_DIARY_BLOCKS = [
  {
    time: "AM 11:47",
    text: "오전에는 집중이 잘 안 돼서 계속 딴짓만 했다. 결국 할 일은 오후에 몰아서 끝냈는데 생각보다 금방 끝나더라. 괜히 미리 걱정했던 것 같다. 저녁에는 좋아하는 플레이리스트 틀어놓고 방 정리까지 하고 나니 하루가 조금 정돈된 느낌이었다. 잠들기 전에 이렇게 기록을 남기니까 오늘이 조금 더 의미 있게 느껴진다.",
  },
  {
    time: "PM 6:23",
    text: "오늘은 평소보다 조금 일찍 일어났다. 점심에는 오랜만에 친구를 만나 카페에서 이런저런 이야기를 나눴다. 특별한 일은 없었지만 웃을 일이 많아서 기분이 괜찮았다. 집으로 돌아오는 길에 노을이 예뻐서 잠깐 걸음을 멈췄다. 하루가 금방 지나간 것 같아 아쉽지만, 오늘 정도면 충분히 좋은 하루였다.",
  },
  { time: "PM 9:41", text: "이제 자려고 누ㅇ" },
];

export default function ExperienceDiaryPage() {
  const navigate = useNavigate();
  const { pieceId } = useParams();
  const location = useLocation();
  const mode = location.state?.mode ?? "incoming"; // "incoming" | "pending"

  const [showFeedback, setShowFeedback] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const handleFeedbackComplete = () => {
    setShowFeedback(false);
    navigate("/experience/gotten", { replace: true });
  };

  const handleCancelDelivery = () => {
    setShowCancelConfirm(false);
    navigate("/experience", { replace: true });
  };

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#f6f8fa] px-[16px] py-[16px] scrollbar-hide">
      <div className="flex w-full flex-col items-start gap-[12px] pb-[100px]">
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="size-[32px] shrink-0 cursor-pointer"
          >
            <img
              src={backIcon}
              alt="뒤로가기"
              className="h-full w-full object-contain"
            />
          </button>
          <button className="size-[38px] shrink-0 cursor-pointer bg-transparent border-none p-0">
            <img
              src={profileIcon}
              alt="프로필"
              className="h-full w-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
            />
          </button>
        </div>

        <div className="flex items-center gap-[6px]">
          <p className="text-heading-28 whitespace-nowrap drop-shadow-[0px_0px_1px_rgba(0,0,0,0.05)] text-grey-80">
            9월 24일
          </p>
          {mode === "incoming" && (
            <span className="shrink-0 rounded-[8px] bg-grey-60 px-[6px] py-[2px] text-[14px] font-medium tracking-[-0.28px] text-grey-0">
              알바
            </span>
          )}
        </div>

        <div className="flex w-full flex-col gap-[26px] rounded-[12px] bg-grey-0 px-[16px] py-[20px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          {mode === "pending" && (
            <button
              type="button"
              onClick={() => setShowOriginal((prev) => !prev)}
              className={
                showOriginal
                  ? "w-fit rounded-[12px] bg-grey-70 px-[16px] py-[10px] text-[14px] font-medium tracking-[-0.28px] text-grey-0"
                  : "w-fit rounded-[12px] border-[1.5px] border-grey-60 bg-grey-0 px-[16px] py-[10px] text-[14px] font-medium tracking-[-0.28px] text-[#414450]"
              }
            >
              {showOriginal ? "익명화보기" : "원문보기"}
            </button>
          )}
          {MOCK_DIARY_BLOCKS.map((block, i) => (
            <div key={i} className="flex w-full flex-col items-start gap-[6px]">
              <p className="whitespace-nowrap text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                {block.time}
              </p>
              <p className="text-16 w-full text-grey-90">{block.text}</p>
            </div>
          ))}
        </div>

        {mode === "pending" && (
          <div className="flex w-full items-center gap-[16px]">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="h-[49px] flex-1 rounded-[12px] border-[1.5px] border-grey-60 bg-grey-0 px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-80"
            >
              전달 취소하기
            </button>
            <button
              type="button"
              onClick={() => navigate("/experience", { replace: true })}
              className="h-[49px] flex-1 rounded-[12px] bg-grey-70 px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
            >
              전달하기
            </button>
          </div>
        )}
      </div>

      {mode === "incoming" && (
        <button
          type="button"
          onClick={() => setShowFeedback(true)}
          className="absolute bottom-[16px] left-[16px] right-[16px] h-[49px] rounded-[12px] bg-grey-70 text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
        >
          반응 보내기
        </button>
      )}

      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          onComplete={handleFeedbackComplete}
        />
      )}

      {showCancelConfirm && (
        <CancelConfirmModal
          onKeepSharing={() => setShowCancelConfirm(false)}
          onCancelDelivery={handleCancelDelivery}
        />
      )}
    </div>
  );
}
