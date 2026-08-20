import { useScrollLock } from "../../../hooks/useScrollLock";

export default function WeeklyImageNotificationModal({
  imageUrl,
  onLater,
  onConfirm,
  onClose,
}) {
  useScrollLock();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="flex w-[calc(100%-32px)] max-w-[358px] flex-col items-start justify-center gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-center gap-[16px]">
          <div className="flex w-full flex-col items-start gap-[6px]">
            <p className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
              지난주를 돌아볼까요?
            </p>
            <p className="w-full text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-70">
              지난주의 기록으로 만든 주간 이미지가 도착했어요.
            </p>
          </div>
          {imageUrl && (
            <div className="h-[156px] w-[222px] shrink-0 overflow-hidden rounded-[4px]">
              <div
                className="h-full w-full rounded-[4px]"
                style={{
                  backgroundImage: `url("${imageUrl}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "50% 50%",
                  filter: "blur(8.5px)",
                }}
              />
            </div>
          )}
        </div>
        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onLater}
            className="flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-[12px] border-[1.5px] border-[#787E8C] bg-white px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-[#4F5563] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)]"
          >
            나중에 보기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-[12px] bg-[#4F5563] px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-white text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)]"
          >
            확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
