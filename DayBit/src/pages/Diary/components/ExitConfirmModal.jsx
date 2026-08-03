export default function ExitConfirmModal({ onContinue, onExit }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#2D3038]/25 backdrop-blur-[1px]">
      <div className="w-[calc(100%-40px)] max-w-[350px] bg-[#F6F8FA] rounded-[12px] px-[16px] py-[20px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[7px]">
          <p className="text-[#2D3038] text-[20px] font-semibold tracking-[-0.4px]">
            작성을 중단하시겠어요?
          </p>
          <p className="text-[#5F6473] text-[16px] font-medium tracking-[-0.32px]">
            내용은 자동저장 돼요 :)
          </p>
        </div>
        <div className="flex gap-[14px] items-center w-full">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 h-[48px] bg-white border border-[#5F6473] rounded-[12px] px-[26px] text-[18px] font-medium tracking-[-0.36px] text-[#2D3038]"
          >
            작성 계속하기
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex-1 h-[48px] bg-[#5F6473] rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-white"
          >
            작성 중단
          </button>
        </div>
      </div>
    </div>
  );
}
