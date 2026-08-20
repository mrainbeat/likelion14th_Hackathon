export default function ExperienceNotificationBubble({
  message,
  relativeTime,
  stale = false,
  onConfirm,
}) {
  return (
    <button
      type="button"
      onClick={onConfirm}
      className={`flex w-full items-center rounded-bl-[12px] rounded-br-[12px] rounded-tr-[12px] p-[16px] text-left transition-opacity active:opacity-80 ${
        stale
          ? "border border-solid border-grey-30 bg-grey-10"
          : "bg-grey-30"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-end justify-between gap-[10px]">
        <p
          className={`min-w-0 text-[16px] font-medium leading-[normal] tracking-[-0.32px] ${
            stale ? "text-grey-80" : "text-grey-90"
          }`}
        >
          {message}
        </p>
        <p
          className={`shrink-0 whitespace-nowrap text-[12px] font-normal leading-[normal] tracking-[-0.12px] ${
            stale ? "text-grey-70" : "text-grey-80"
          }`}
        >
          {relativeTime}
        </p>
      </div>
    </button>
  );
}
