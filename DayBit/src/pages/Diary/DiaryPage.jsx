import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import QuestionModal from "./components/QuestionModal";
import ExitConfirmModal from "./components/ExitConfirmModal";
import { fetchMockQuestions } from "./mocks/questionMock";
import backIcon from "../../assets/icons/back.svg";
import logoImage from "../../assets/logos/logo-symbol.png";
import profileIcon from "../../assets/icons/profile.svg";

export default function DiaryPage() {
  const navigate = useNavigate();
  const { dateStr } = useCurrentTime() || {};
  const [content, setContent] = useState("");
  const [initialText, setInitialText] = useState("");
  const [hadPriorContent, setHadPriorContent] = useState(false);
  const [questions, setQuestions] = useState(() => {
    try {
      const savedQuestions = localStorage.getItem("diary_questions");
      return savedQuestions ? JSON.parse(savedQuestions) : [];
    } catch (error) {
      return [];
    }
  });
  const [questionPool, setQuestionPool] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const isTimeAppended = useRef(false);
  const editorRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchMockQuestions().then((data) => {
      setQuestionPool(data);
    });
  }, []);

  const handleScroll = (e) => {
    setIsScrolled(e.target.scrollTop > 10);
  };

  const getFormattedTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${ampm} ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (isTimeAppended.current) return;

    const timeStr = getFormattedTime();
    const timeHtml = `<span style="color: #5F6473; font-weight: 500;">${timeStr}</span><br><span style="color: #2D3038;">\u200B</span>`;
    const savedDiary = localStorage.getItem("diary_content");

    // 이전에 저장된 내용이 있었는지 확인
    if (savedDiary) {
      const tempPrior = document.createElement("div");
      tempPrior.innerHTML = savedDiary;
      const priorText = (
        tempPrior.textContent ||
        tempPrior.innerText ||
        ""
      ).trim();
      if (priorText.length > 0) {
        setHadPriorContent(true);
      }
    }

    const newContent = savedDiary
      ? `${savedDiary}<br><br>${timeHtml}`
      : timeHtml;

    if (editorRef.current) {
      editorRef.current.innerHTML = newContent;
      setContent(newContent);

      const temp = document.createElement("div");
      temp.innerHTML = newContent;
      setInitialText(temp.textContent || temp.innerText || "");

      setTimeout(() => {
        try {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (e) {}
      }, 10);
    }

    isTimeAppended.current = true;
  }, []);

  const handleInput = (e) => {
    setContent(e.currentTarget.innerHTML);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

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

  const currentText = useMemo(() => {
    if (typeof document === "undefined") return "";
    const temp = document.createElement("div");
    temp.innerHTML = content;
    return temp.textContent || temp.innerText || "";
  }, [content]);

  // 이번에 새로 내용을 썼거나, 이전에 이미 내용이 있었으면 true
  const hasUserWritten =
    hadPriorContent ||
    (currentText !== initialText && currentText.trim().length > 0);
  const performBack = () => {
    if (hasUserWritten) {
      localStorage.setItem("diary_content", content);
    } else {
      localStorage.removeItem("diary_content");
    }
    localStorage.setItem("diary_questions", JSON.stringify(questions));
    navigate(-1);
  };

  const handleBack = () => {
    if (hasUserWritten) {
      setShowExitModal(true);
    } else {
      performBack();
    }
  };

  const handleContinueWriting = () => setShowExitModal(false);

  const handleStopWriting = () => {
    setShowExitModal(false);
    performBack();
  };

  const handleComplete = () => {
    if (!hasUserWritten) return;
    localStorage.removeItem("diary_content");
    localStorage.removeItem("diary_questions");
    navigate("/diary");
  };

  const isAllQuestionsLoaded =
    questionPool.length > 0 && questions.length === questionPool.length;

  return (
    <div className="flex flex-col w-full h-full  min-h-0 bg-[#F6F8FA] box-border relative select-none overflow-hidden">
      {/* 하단 여백 */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[42px] bg-[#F6F8FA] z-30 pointer-events-none"></div>

      {/* 상단 헤더 날짜 영역 */}
      <div className="shrink-0 pt-[16px] px-[20px] relative z-20">
        <header className="flex justify-between items-center mb-[12px] w-full">
          <button
            onClick={handleBack}
            className="w-[38px] h-[38px] flex items-center justify-center cursor-pointer bg-transparent border-none p-0"
          >
            <img
              src={backIcon}
              alt="뒤로가기"
              className="w-full h-full object-contain"
            />
          </button>

          <button className="w-[38px] h-[38px] shrink-0 cursor-pointer bg-transparent border-none p-0">
            <img
              src={profileIcon}
              alt="프로필"
              className="w-full h-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
            />
          </button>
        </header>

        <div className="flex w-[106px] h-[33px] justify-center items-center text-heading-28 text-grey-80 mb-[12px]">
          {dateStr}
        </div>
      </div>

      <div className="relative flex-1 min-h-0 w-full flex flex-col overflow-hidden z-20">
        {/* 상단 그라데이션 */}
        <div
          className={`absolute top-0 left-[20px] right-[20px] h-[92px] z-10 pointer-events-none transition-opacity duration-200 ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(180deg, #F6F8FA 0%, rgba(246, 248, 250, 0) 100%)",
          }}
        ></div>

        {/* 하단 그라데이션 */}
        <div
          className="absolute bottom-[42px] left-[20px] right-[20px] h-[92px] z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, #F6F8FA 0%, rgba(246, 248, 250, 0) 100%)",
          }}
        ></div>

        {/* 본문 */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-[20px] relative z-0"
        >
          {/* 콘텐츠 높이 계산용 래퍼 */}
          <div className="flex flex-col gap-[16px] pb-[170px]">
            {/* 에디터 박스 */}
            <div className="w-full bg-white rounded-[12px] px-[16px] py-[20px] flex flex-col shrink-0 shadow-[0_0_30px_0_rgba(65,68,80,0.05),0_0_10px_0_rgba(77,80,91,0.05)] min-h-[91px] ">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                className="w-full bg-transparent focus:outline-none text-16 text-grey-90 whitespace-pre-wrap outline-none"
                style={{ wordBreak: "break-word" }}
              />
            </div>

            {/* 버튼과 질문 묶음 */}
            <div className="flex flex-col gap-[10px] w-full shrink-0 ">
              <div className="flex w-full gap-[14px] z-20 relative">
                <button
                  type="button"
                  onClick={handleGetQuestions}
                  disabled={isAllQuestionsLoaded}
                  className="w-[217px] h-[48px] border-[1.5px] border-[#858C9C] bg-white rounded-[12px] px-[26px] text-[18px] font-semibold text-[#414450] tracking-[-0.18px] flex items-center justify-center gap-[4px] whitespace-nowrap active:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <img
                    src={logoImage}
                    alt="로고"
                    className="w-[16px] h-[20px] object-contain shrink-0"
                  />
                  <span className="whitespace-nowrap">
                    {isAllQuestionsLoaded
                      ? "질문 완료"
                      : "데이빗에게 질문 받기"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={!hasUserWritten}
                  className="w-[118px] h-[48px] rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] bg-grey-70 text-white disabled:bg-grey-20 disabled:text-white disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  작성 완료
                </button>
              </div>

              <QuestionModal questions={questions} />
            </div>
          </div>
        </div>
      </div>

      {showExitModal && (
        <ExitConfirmModal
          onContinue={handleContinueWriting}
          onExit={handleStopWriting}
        />
      )}
    </div>
  );
}
