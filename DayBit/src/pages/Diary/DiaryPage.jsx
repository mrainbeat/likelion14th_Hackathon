import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import QuestionModal from "./components/QuestionModal";
import { fetchMockQuestions } from "./mocks/questionMock";
import profileIcon from "../../assets/icons/profile.png";
import backIcon from "../../assets/icons/back.svg";
import logoImage from "../../assets/logos/logo-symbol.png";

export default function DiaryPage() {
  const navigate = useNavigate();
  const { dateStr, timeStr } = useCurrentTime();

  const [content, setContent] = useState("");

  // 로컬스토리지에서 기존에 받았던 질문 목록 불러오기
  const [questions, setQuestions] = useState(() => {
    const savedQuestions = localStorage.getItem("diary_questions");
    return savedQuestions ? JSON.parse(savedQuestions) : [];
  });

  const [questionPool, setQuestionPool] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const isTimeAppended = useRef(false);
  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // 컴포넌트 마운트 시 질문 풀 미리 로드
  useEffect(() => {
    fetchMockQuestions().then((data) => {
      setQuestionPool(data);
    });
  }, []);

  // 글자 양에 따라 입력창 크기 조절 및 스크롤 튐 방지
  useEffect(() => {
    if (textareaRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const currentScrollTop = container.scrollTop;

      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      container.scrollTop = currentScrollTop;
    }
  }, [content]);

  // 스크롤 위치 감지하여 블러 노출 여부 결정->10px 이상 스크롤 시 블러 노출
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    setIsScrolled(scrollTop > 10);
  };

  // 질문 받기 로직->api 호출 후 질문을 받아오는 로직으로 변경 필요
  const handleGetQuestions = () => {
    if (questions.length < questionPool.length) {
      const nextQuestion = questionPool[questions.length];
      setQuestions((prev) => {
        const updated = [...prev, nextQuestion];
        localStorage.setItem("diary_questions", JSON.stringify(updated));

        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 50);
        return updated;
      });
    }
  };

  // 진입 시 시간 세팅 및 저장 파일 불러오기
  useEffect(() => {
    if (!timeStr || isTimeAppended.current) return;
    const savedDiary = localStorage.getItem("diary_content");
    if (savedDiary) {
      setContent(savedDiary);
    } else {
      setContent(`${timeStr}\n`);
    }
    isTimeAppended.current = true;
  }, [timeStr]);

  // 사용자가 시간을 제외하고 실제로 내용을 작성했는지 확인
  const hasUserWritten = content.replace(timeStr, "").trim().length > 0;

  // 뒤로가기 버튼
  const handleBack = () => {
    if (hasUserWritten) {
      localStorage.setItem("diary_content", content);
    } else {
      localStorage.removeItem("diary_content");
    }
    localStorage.setItem("diary_questions", JSON.stringify(questions));
    navigate(-1);
  };

  // 작성완료 버튼
  const handleComplete = () => {
    if (!hasUserWritten) return;
    localStorage.removeItem("diary_content");
    localStorage.removeItem("diary_questions");
    navigate("/diary");
  };

  const isAllQuestionsLoaded =
    questionPool.length > 0 && questions.length === questionPool.length;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#F6F8FA] box-border overflow-hidden relative select-none">
      {/* 상단 고정 영역 */}
      <div className="shrink-0 pt-[2.57vh] px-[20px] bg-[#F6F8FA] z-25">
        <header className="flex justify-between items-center mb-[2vh] w-full">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={handleBack}
            className="w-[clamp(32px,9.74vw,44px)] h-[clamp(32px,9.74vw,44px)] flex items-center justify-center cursor-pointer bg-transparent border-none p-0"
          >
            <img
              src={backIcon}
              alt="뒤로가기"
              className="w-full h-full object-contain"
            />
          </button>

          {/* 프로필 버튼 */}
          <button className="w-[clamp(32px,9.74vw,44px)] h-[clamp(32px,9.74vw,44px)] rounded-full overflow-hidden cursor-pointer bg-transparent border-none p-0 flex items-center justify-center">
            <img
              src={profileIcon}
              alt="프로필"
              className="w-[115%] h-[115%] rounded-full object-cover"
            />
          </button>
        </header>

        {/* 날짜 정보 영역 */}
        <div className="inline-flex h-[clamp(28px,3.91vh,40px)] items-center text-[24px] font-bold text-[#4F5563] mb-[1.18vh] tracking-tight">
          {dateStr}
        </div>
      </div>

      {/* 스크롤 영역 래퍼 */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* 상단 블러 효과 */}
        <div
          className={`absolute top-0 left-0 w-full h-[2.84vh] bg-gradient-to-b from-[#F6F8FA] via-[#F6F8FA]/80 to-transparent backdrop-blur-[1px] z-10 pointer-events-none transition-opacity duration-200 ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        ></div>

        {/* 실제 스크롤되는 콘텐츠의 영역 */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-hide px-[20px] pt-[1.18vh] pb-[200px] flex flex-col"
        >
          {/* 일기 작성 카드 */}
          <div className="w-full bg-white rounded-[12px] p-[16px] flex flex-col mb-[20px] shrink-0 shadow-sm">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 어떤 일이 있었나요?"
              rows={1}
              className="w-full bg-transparent resize-none focus:outline-none text-[15px] text-[#2D3038] leading-relaxed overflow-hidden"
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-[10px] w-full h-[48px] shrink-0 mb-[24px]">
            <button
              type="button"
              onClick={handleGetQuestions}
              disabled={isAllQuestionsLoaded}
              className="flex-[219] h-full bg-white border border-[#2D3038] rounded-[11.5px] text-[15px] font-semibold text-[#2D3038] flex items-center justify-center gap-[8px] active:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
            >
              <img
                src={logoImage}
                alt="로고"
                className="w-[clamp(16px,4.62vw,22px)] h-[clamp(16px,4.62vw,22px)] object-contain"
              />
              {isAllQuestionsLoaded ? "질문 완료" : "데이빗에게 질문 받기"}
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={!hasUserWritten}
              className="flex-[125] h-full rounded-[12px] text-[15px] font-semibold bg-[#5F6473] text-white shadow-sm active:bg-[#4F5563] disabled:bg-[#E7E9EE] disabled:text-[#9499A8] disabled:cursor-not-allowed transition-colors"
            >
              작성 완료
            </button>
          </div>

          {/* 질문 모달 컴포넌트 */}
          <QuestionModal questions={questions} />
        </div>
      </div>

      {/* 하단 바 */}
      <div className="w-full h-[30px] bg-[#FF00000D] shrink-0"></div>
    </div>
  );
}
