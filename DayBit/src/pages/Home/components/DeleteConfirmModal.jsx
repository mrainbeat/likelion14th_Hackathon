const BUTTON_BASE =
  "flex h-[49px] min-w-px flex-1 items-center justify-center whitespace-nowrap rounded-[12px] border-[1.5px] px-[26px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)]";

export default function DeleteConfirmModal({ month, day, onCancel, onDelete }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onCancel}
    >
      <div
        className="flex w-[calc(100%-40px)] max-w-[350px] flex-col items-start justify-center gap-[16px] rounded-[12px] bg-[#F6F8FA] px-[16px] py-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-start gap-[6px]">
          <div className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
            <p>
              {month}월 {day}일에 작성한 일기를
            </p>
            <p>삭제하시겠어요?</p>
          </div>
          <div className="w-full text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-70">
            <p>삭제한 일기는 30일 동안</p>
            <p>마이페이지의 휴지통에 보관돼요.</p>
          </div>
        </div>
        <div className="flex w-full items-center gap-[14px]">
          <button
            type="button"
            onClick={onDelete}
            className={`${BUTTON_BASE} cursor-pointer border-[#787E8C] bg-grey-0 text-grey-80`}
          >
            삭제하기
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`${BUTTON_BASE} cursor-pointer border-grey-80 bg-grey-80 text-grey-0`}
          >
            삭제하지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
