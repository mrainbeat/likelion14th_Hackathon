export default function QuestionModal({ questions }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-[12px] w-full shrink-0">
      {questions.map((question, idx) => (
        <div
          key={idx}
          className="bg-[#DFE2EA] text-[#2D3038] text-[15px] leading-snug px-[16px] py-[12px] rounded-[16px] rounded-tl-[4px] self-start max-w-[90%] animate-fade-in shadow-sm"
        >
          {question}
        </div>
      ))}
    </div>
  );
}
