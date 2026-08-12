import bubbleTail from "../../../assets/icons/tail.svg";

export default function QuestionModal({ questions }) {
  if (!questions || !Array.isArray(questions) || questions.length === 0)
    return null;

  return (
    <div className="flex flex-col items-start gap-[12px] w-full max-w-[350px] pb-[20px]">
      {questions.map((question, index) => {
        const questionText =
          typeof question === "string"
            ? question
            : question?.questionText ||
              question?.text ||
              question?.content ||
              question?.question ||
              "";

        return (
          <div
            key={index}
            className="relative w-fit max-w-full bg-grey-30 rounded-[12px] px-[16px] py-[10px] text-grey-80 text-[16px] font-medium tracking-[-0.32px] leading-normal break-words whitespace-pre-wrap"
          >
            <img
              src={bubbleTail}
              alt=""
              className="absolute -top-[7px] left-0 w-[9px] h-[13px]"
            />
            <span className="relative z-10">{questionText}</span>
          </div>
        );
      })}
    </div>
  );
}
