import BubbleTail from "../../../components/BubbleTail";

export default function ExperienceNotificationBubble({
  message,
  relativeTime,
  isToday,
  onConfirm,
}) {
  return (
    <div className="flex w-full flex-col items-end gap-[4px]">
      <div
        className={`relative flex w-full items-center gap-[10px] rounded-[12px] px-[16px] py-[10px] ${
          isToday ? "bg-grey-60" : "bg-grey-20"
        }`}
      >
        <BubbleTail
          color={isToday ? "#858C9C" : "#E7E9EE"}
          className="!left-[-1.5px] !top-[-8px]"
        />
        <p
          className={`text-[16px] font-medium tracking-[-0.32px] ${
            isToday ? "text-grey-0" : "text-grey-70"
          }`}
        >
          {message}
        </p>
      </div>
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
