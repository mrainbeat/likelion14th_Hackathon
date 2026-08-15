import SpeechBubble from "../../../components/SpeechBubble";

export default function ExperienceNotificationBubble({
  message,
  relativeTime,
  isToday,
  onConfirm,
}) {
  return (
    <div className="flex w-full flex-col items-end gap-[4px]">
      <SpeechBubble
        color={isToday ? "#858C9C" : "#EFF1F6"}
        direction="left"
        bordered={!isToday}
        className="flex w-full items-center gap-[10px] px-[16px] py-[10px]"
      >
        <p
          className={`text-[16px] font-medium tracking-[-0.32px] ${
            isToday ? "text-grey-0" : "text-grey-70"
          }`}
        >
          {message}
        </p>
      </SpeechBubble>
      <div className="flex w-full items-start justify-between">
        <p className="whitespace-nowrap text-[14px] font-semibold text-grey-60">
          {relativeTime}
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="shrink-0 rounded-[12px] border-[1.5px] border-grey-60 bg-grey-0 px-[16px] py-[10px] text-[14px] font-medium tracking-[-0.28px] text-[#414450]"
        >
          확인하기
        </button>
      </div>
    </div>
  );
}
