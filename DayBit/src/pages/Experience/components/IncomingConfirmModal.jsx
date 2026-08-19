export default function IncomingConfirmModal({
  keyword,
  onDecline,
  onConfirm,
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]">
      <div className="w-[calc(100%-32px)] max-w-[358px] bg-[#F6F8FA] rounded-[12px] px-[16px] py-[20px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[6px] w-full">
          <p className="text-grey-90 text-[20px] font-semibold tracking-[-0.4px]">
            "{keyword}"와 관련된 경험조각을 확인하시겠어요?
          </p>
          <p className="text-grey-70 text-[16px] font-medium tracking-[-0.32px]">
            경험조각은 1주동안 확인 가능해요.
          </p>
        </div>
        <div className="flex gap-[14px] items-center w-full">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 h-[48px] bg-grey-0 border-[1.5px] border-grey-60 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-80"
          >
            확인하지 않기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-[48px] bg-grey-70 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
          >
            확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
