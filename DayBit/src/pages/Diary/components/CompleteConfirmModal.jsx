export default function CompleteConfirmModal({ onContinue, onComplete }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]">
      <div className="w-[calc(100%-40px)] max-w-[350px] bg-[#F6F8FA] rounded-[12px] px-[16px] py-[20px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[7px]">
          <p className="text-grey-90 text-[20px] font-semibold tracking-[-0.4px]">
            작성을 완료하시겠어요?
          </p>
          <p className="text-grey-70 text-[16px] font-medium tracking-[-0.32px]">
            잠시후에 성찰질문과 오늘의 색을 알려드릴게요 :)
          </p>
        </div>
        <div className="flex gap-[14px] items-center w-full">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 h-[48px] bg-grey-0 border-[1.5px] border-grey-60 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-80"
          >
            작성 계속하기
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="flex-1 h-[48px] bg-grey-70 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
          >
            작성 완료
          </button>
        </div>
      </div>
    </div>
  );
}
