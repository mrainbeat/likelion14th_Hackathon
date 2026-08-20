export default function DiaryOptionsMenu({
  onClose,
  onHide,
  onDelete,
  hideQuestionButton = false,
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`absolute right-[12px] top-[19px] z-50 flex ${
          hideQuestionButton ? "w-[79px]" : "w-[146px]"
        } flex-col items-start gap-[16px] rounded-bl-[8px] rounded-br-[8px] rounded-tl-[8px] bg-[#787E8C] py-[10px] pl-[8px] pr-[16px] text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-0`}
      >
        {!hideQuestionButton && (
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-not-allowed whitespace-nowrap text-left"
          >
            질문에 반영하지 않기
          </button>
        )}
        <button
          type="button"
          onClick={onHide}
          className="w-full cursor-pointer whitespace-nowrap text-left transition-opacity active:opacity-60"
        >
          숨기기
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-full cursor-pointer whitespace-nowrap text-left transition-opacity active:opacity-60"
        >
          삭제하기
        </button>
      </div>
    </>
  );
}
