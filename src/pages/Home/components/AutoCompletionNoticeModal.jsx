export default function AutoCompletionNoticeModal({
  recordedDate,
  onConfirm,
  onClose,
}) {
  const dateLabel = recordedDate
    ? `${Number(recordedDate.slice(5, 7))}월 ${Number(recordedDate.slice(8, 10))}일 `
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="flex w-[calc(100%-32px)] max-w-[358px] flex-col items-start justify-center gap-[16px] overflow-hidden rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-start gap-[6px]">
          <p className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-[#2D3038]">
            {dateLabel}일기가 자동 작성완료 되었어요.
          </p>
          <p className="w-full text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-[#5F6473]">
            하루 전환 시간까지 일기 작성이 완료되지 않으면,
            <br />
            자동으로 완료돼요.
          </p>
        </div>
        <div className="flex w-full items-center">
          <button
            type="button"
            onClick={onConfirm}
            className="flex min-w-px flex-[1_0_0] cursor-pointer items-center justify-center rounded-[12px] bg-[#5F6473] px-[26px] py-[14px]"
          >
            <span className="whitespace-nowrap text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-white text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)]">
              일기 확인하기
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
