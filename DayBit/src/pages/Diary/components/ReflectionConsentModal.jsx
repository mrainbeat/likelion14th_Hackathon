export default function ReflectionConsentModal({ onSkip, onUse }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#2D3038]/25 backdrop-blur-[1px]">
      <div className="w-[calc(100%-40px)] max-w-[350px] bg-[#F6F8FA] rounded-[12px] px-[16px] py-[20px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[7px]">
          <p className="text-[#2D3038] text-[20px] font-semibold tracking-[-0.4px]">
            오늘의 일기내용을 질문에 반영할까요?
          </p>
          <p className="text-[#5F6473] text-[16px] font-medium tracking-[-0.32px]">
            더 나에게 맞는 질문을 만들 수 있어요.
          </p>
        </div>
        <div className="flex gap-[14px] items-center w-full">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 h-[48px] bg-white border-[1.5px] border-[#858C9C] rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-[#4F5563]"
          >
            반영하지 않기
          </button>
          <button
            type="button"
            onClick={onUse}
            className="flex-1 h-[48px] bg-[#5F6473] rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] text-white"
          >
            반영하기
          </button>
        </div>
      </div>
    </div>
  );
}
