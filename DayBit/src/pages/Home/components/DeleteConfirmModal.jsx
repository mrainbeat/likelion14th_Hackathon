export default function DeleteConfirmModal({ month, day, onCancel, onDelete }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onCancel}
    >
      <div
        className="flex w-[calc(100%-40px)] max-w-[350px] flex-col gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-start gap-[6px]">
          <p className="w-full text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
            {month}월 {day}일에 작성한 일기를 삭제하시겠어요?
          </p>
          <p className="w-full text-[16px] font-medium tracking-[-0.32px] text-grey-70">
            삭제한 일기는 30일 동안 휴지통에 보관돼요.
          </p>
        </div>
        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onDelete}
            className="h-[49px] flex-1 rounded-[12px] border-[1.5px] border-grey-60 bg-grey-0 text-[18px] font-semibold tracking-[-0.18px] text-grey-80"
          >
            삭제하기
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-[49px] flex-1 rounded-[12px] bg-grey-70 text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
          >
            삭제하지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
