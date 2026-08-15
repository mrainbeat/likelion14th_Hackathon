import { useState } from "react";

export default function FeedbackModal({ onClose, onComplete }) {
  const [text, setText] = useState("");

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-grey-90/25 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="w-[calc(100%-40px)] max-w-[350px] bg-[#F6F8FA] rounded-[12px] px-[16px] py-[20px] flex flex-col gap-[16px]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-grey-90 text-[20px] font-semibold tracking-[-0.4px]">
          조각을 전달해준 분에게 보낼 메세지에요 :)
        </p>
        <div className="w-full rounded-[12px] bg-grey-0 px-[16px] py-[20px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="내용을 입력해주세요."
            rows={3}
            className="w-full resize-none bg-transparent text-[16px] font-normal leading-[26px] tracking-[-0.32px] text-grey-90 placeholder:text-grey-40 focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled={!text.trim()}
          onClick={() => onComplete(text.trim())}
          className="h-[49px] w-full rounded-[12px] bg-grey-70 text-[18px] font-semibold tracking-[-0.18px] text-grey-0 disabled:bg-grey-20"
        >
          완료
        </button>
      </div>
    </div>
  );
}
