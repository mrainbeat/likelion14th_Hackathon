import SpeechBubble from "../../../components/SpeechBubble";

export default function QuestionModal({ questions, remainingQuestions }) {
  if (!questions || !Array.isArray(questions) || questions.length === 0)
    return null;

  const showRemaining =
    typeof remainingQuestions === "number" && remainingQuestions >= 0;

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

        const isLast = index === questions.length - 1;

        const bubble = (
          <SpeechBubble
            color="#EFF1F6"
            direction="left"
            bordered
            className="w-fit max-w-full px-[16px] py-[10px] text-grey-80 text-[16px] font-medium tracking-[-0.32px] leading-normal break-words whitespace-pre-wrap"
          >
            {questionText}
          </SpeechBubble>
        );

        if (!isLast || !showRemaining) {
          return <div key={index}>{bubble}</div>;
        }

        return (
          <div key={index} className="flex flex-col items-start gap-[4px]">
            {bubble}
            <p className="text-[12px] font-semibold tracking-[-0.12px] text-grey-60">
              오늘 남은 질문 횟수 : {remainingQuestions}번
            </p>
          </div>
        );
      })}
    </div>
  );
}
