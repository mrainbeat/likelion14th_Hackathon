export default function CancelConfirmModal({
  onKeepSharing,
  onCancelDelivery,
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onKeepSharing}
    >
      <div
        className="w-[calc(100%-32px)] max-w-[358px] bg-[#F6F8FA] rounded-[12px] px-[16px] py-[20px] flex flex-col gap-[16px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-[6px] w-full">
          <p className="text-grey-90 text-[20px] font-semibold tracking-[-0.4px]">
            전달을 취소하시겠어요?
          </p>
          <p className="text-grey-70 text-[16px] font-medium tracking-[-0.32px]">
            확인할 수 있는 경험조각이 줄어들 수 있어요!
          </p>
        </div>
        <div className="flex gap-[14px] items-center w-full">
          <button
            type="button"
            onClick={onCancelDelivery}
            className="flex-1 h-[48px] bg-grey-0 border-[1.5px] border-grey-60 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-80"
          >
            전달 취소하기
          </button>
          <button
            type="button"
            onClick={onKeepSharing}
            className="flex-1 h-[48px] bg-grey-70 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
          >
            전달하기
          </button>
        </div>
      </div>
    </div>
  );
}
