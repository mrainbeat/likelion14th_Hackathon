export default function DiaryOptionsMenu({
  onClose,
  onDelete,
  hideQuestionButton = false,
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`absolute right-0 top-[19px] z-50 flex ${
          hideQuestionButton ? "w-fit" : "w-[146px]"
        } flex-col items-start gap-[16px] rounded-bl-[8px] rounded-br-[8px] rounded-tl-[8px] bg-grey-60 px-[8px] py-[10px] text-[16px] font-medium tracking-[-0.32px] text-grey-0`}
      >
        {!hideQuestionButton && (
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-not-allowed whitespace-nowrap text-left opacity-60"
          >
            질문에 반영하지 않기
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-full cursor-not-allowed whitespace-nowrap text-left opacity-60"
        >
          숨기기
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-full cursor-pointer whitespace-nowrap text-left"
        >
          삭제하기
        </button>
      </div>
    </>
  );
}
