import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import QuestionModal from "./components/QuestionModal";
import ExitConfirmModal from "./components/ExitConfirmModal";
import DiaryTutorial from "./components/DiaryTutorial";
import ReflectionConsentModal from "./components/ReflectionConsentModal";
import AnonymousShareModal from "./components/AnonymousShareModal";
import apiClient from "../../api/apiClient";
import backIcon from "../../assets/icons/back.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
import logoImageDisabled from "../../assets/logos/logo-symbol-disabled.svg";
import profileIcon from "../../assets/icons/profile.svg";
import { saveDraft, clearDraft, loadTodayDraft } from "../../utils/diaryDraft";

function htmlToPlainText(html) {
  if (!html) return "";

  const temp = document.createElement("div");
  temp.innerHTML = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p)>/gi, "\n");

  return (temp.textContent || temp.innerText || "")
    .replace(/\u200B/g, "")
    .trim();
}

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
  const [remainingQuestions, setRemainingQuestions] = useState(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const [tutorialStep, setTutorialStep] = useState(() => {
    const seen = localStorage.getItem("diary_tutorial_seen");
    return seen ? null : 0;
  });

  const [showReflectionConsent, setShowReflectionConsent] = useState(false);
  const [showAnonymousShare, setShowAnonymousShare] = useState(false);
  const [pendingUseDiaryContent, setPendingUseDiaryContent] = useState(false);
  const [tutorialSpot, setTutorialSpot] = useState(null);

  const isTimeAppended = useRef(false);
  const editorRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const pageRef = useRef(null);
  const questionButtonRef = useRef(null);
  const completeButtonRef = useRef(null);
  const profileButtonRef = useRef(null);

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/api/v1/ai/writing-help/status")
      .then((response) => {
        if (!alive) return;
        const { available, remainingCount } = response.data.result;
        setRemainingQuestions(available ? remainingCount : 0);
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/ai/writing-help/status 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
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
    const timeHtml = `<span data-time-badge style="color: #5F6473; font-weight: 500;">${timeStr}</span><br><span style="color: #2D3038;">\u200B</span>`;
    const savedDiary = loadTodayDraft();

    let priorText = "";
    if (savedDiary) {
      const tempPrior = document.createElement("div");
      tempPrior.innerHTML = savedDiary;
      priorText = (tempPrior.textContent || tempPrior.innerText || "").trim();
    }

    const newContent = savedDiary
      ? `${savedDiary}<br><br>${timeHtml}`
      : timeHtml;

    if (priorText.length > 0) {
      setHadPriorContent(true);
    }

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

  const handleGetQuestions = async () => {
    if (isAskingQuestion || remainingQuestions === 0) return;

    setIsAskingQuestion(true);
    setQuestionError("");
    try {
      const response = await apiClient.post(
        "/api/v1/ai/writing-help/questions",
      );
      const { questionId, questionText, remainingCount } = response.data.result;

      setRemainingQuestions(remainingCount);
      setQuestions((prev) => {
        const updated = [...prev, { questionId, questionText }];
        localStorage.setItem("diary_questions", JSON.stringify(updated));
        return updated;
      });

      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 50);
    } catch (error) {
      const code = error.response?.data?.code;
      if (code === "QUESTION429") {
        setRemainingQuestions(0);
      } else {
        setQuestionError(
          error.response?.data?.message ??
            "질문을 받아오지 못했어요. 잠시 후 다시 시도해주세요.",
        );
      }
      console.error(
        "POST /api/v1/ai/writing-help/questions 실패:",
        error.response?.status,
        error.response?.data,
      );
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const currentText = useMemo(() => {
    if (typeof document === "undefined") return "";
    const temp = document.createElement("div");
    temp.innerHTML = content;
    return temp.textContent || temp.innerText || "";
  }, [content]);

  const hasUserWritten =
    hadPriorContent ||
    (currentText !== initialText && currentText.trim().length > 0);

  useEffect(() => {
    if (!hasUserWritten) return;
    const timer = setTimeout(() => {
      saveDraft(content);
    }, 500);
    return () => clearTimeout(timer);
  }, [content, hasUserWritten]);

  const performBack = () => {
    if (hasUserWritten) {
      saveDraft(content);
    } else {
      clearDraft();
    }
    localStorage.setItem("diary_questions", JSON.stringify(questions));
    navigate("/home", { replace: true });
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
    setShowReflectionConsent(true);
  };

  const handleReflectionChoice = (useDiaryContent) => {
    setShowReflectionConsent(false);
    setPendingUseDiaryContent(useDiaryContent);
    setShowAnonymousShare(true);
  };

  const handleAnonymousShareChoice = (shareAnonymously) => {
    setShowAnonymousShare(false);
    goToReflection(pendingUseDiaryContent, shareAnonymously);
  };

  const goToReflection = (useDiaryContent, shareAnonymously) => {
    const plainText = htmlToPlainText(content);
    if (!plainText) return;

    saveDraft(content);
    navigate("/diary/reflection", {
      state: { content: plainText, useDiaryContent, shareAnonymously },
    });
  };

  const handleTutorialNext = () => {
    if (tutorialStep === 3) {
      localStorage.setItem("diary_tutorial_seen", "true");
      setTutorialStep(null);
      return;
    }
    setTutorialStep((prev) => prev + 1);
  };

  useLayoutEffect(() => {
    if (tutorialStep === null) return;
    const container = pageRef.current;
    if (!container) return;

    const collect = () => {
      if (tutorialStep === 0) {
        return { el: questionButtonRef.current, radius: 12, pad: 0 };
      }
      if (tutorialStep === 1) {
        return {
          el: editorRef.current?.querySelector("[data-time-badge]"),
          radius: 8,
          pad: 6,
        };
      }
      if (tutorialStep === 2) {
        return { el: completeButtonRef.current, radius: 12, pad: 0 };
      }
      return { el: profileButtonRef.current, radius: 999, pad: 0 };
    };

    const measure = () => {
      const target = collect();
      if (!target?.el) return;
      const rect = target.el.getBoundingClientRect();
      const base = container.getBoundingClientRect();
      const pad = target.pad;
      setTutorialSpot({
        top: rect.top - base.top - pad,
        left: rect.left - base.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        radius: target.radius,
      });
    };

    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [tutorialStep]);

  const isAllQuestionsLoaded = remainingQuestions === 0;

  return (
    <div
      ref={pageRef}
      className="flex flex-col w-full h-full  min-h-0 bg-[#F6F8FA] box-border relative select-none overflow-hidden"
    >
      <div className="absolute bottom-0 left-0 right-0 w-full h-[42px] bg-[#F6F8FA] z-30 pointer-events-none"></div>

      <div className="shrink-0 pt-[16px] px-[16px] relative z-20">
        <header className="flex justify-between items-center mb-[12px] w-full">
          <button
            type="button"
            onClick={handleBack}
            className="size-[32px] shrink-0 cursor-pointer bg-transparent border-none p-0 transition-opacity active:opacity-60"
          >
            <img
              src={backIcon}
              alt="뒤로가기"
              className="h-full w-full object-contain"
            />
          </button>

          <button
            ref={profileButtonRef}
            type="button"
            onClick={() => navigate("/mypage")}
            className="w-[38px] h-[38px] shrink-0 cursor-pointer bg-transparent border-none p-0 transition-opacity active:opacity-60"
          >
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
        <div
          className={`absolute top-0 left-[16px] right-[16px] h-[92px] z-10 pointer-events-none transition-opacity duration-200 ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(180deg, #F6F8FA 0%, rgba(246, 248, 250, 0) 100%)",
          }}
        ></div>

        <div
          className="absolute bottom-[42px] left-[16px] right-[16px] h-[92px] z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, #F6F8FA 0%, rgba(246, 248, 250, 0) 100%)",
          }}
        ></div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-[16px] relative"
        >
          <div className="flex flex-col gap-[16px] pb-[170px]">
            <div className="w-full bg-grey-0 rounded-[12px] px-[16px] py-[20px] flex flex-col shrink-0 shadow-[0_0_30px_0_rgba(65,68,80,0.05),0_0_10px_0_rgba(77,80,91,0.05)] min-h-[91px] ">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                className="w-full bg-transparent focus:outline-none text-16 text-grey-90 whitespace-pre-wrap outline-none"
                style={{ wordBreak: "break-word" }}
              />
            </div>

            <div className="flex flex-col gap-[10px] w-full shrink-0 ">
              <div className="flex w-full gap-[14px] z-20 relative">
                <button
                  ref={questionButtonRef}
                  type="button"
                  onClick={handleGetQuestions}
                  disabled={isAllQuestionsLoaded || isAskingQuestion}
                  className={`w-[217px] h-[48px] border-[1.5px] bg-grey-0 rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.36px] flex items-center justify-center gap-[6px] whitespace-nowrap active:bg-gray-50 transition-all ${
                    isAllQuestionsLoaded
                      ? "border-[#E8EBF0] text-grey-30"
                      : "border-grey-60 text-grey-95"
                  }`}
                >
                  <img
                    src={isAllQuestionsLoaded ? logoImageDisabled : logoImage}
                    alt="로고"
                    className="w-[16px] h-[20px] object-contain shrink-0"
                  />
                  <span className="whitespace-nowrap">
                    {isAskingQuestion
                      ? "질문 받는 중..."
                      : isAllQuestionsLoaded
                        ? "질문 받기 완료"
                        : "데이빗에게 질문 받기"}
                  </span>
                </button>
                <button
                  ref={completeButtonRef}
                  type="button"
                  onClick={handleComplete}
                  disabled={!hasUserWritten && tutorialStep !== 2}
                  className="w-[118px] h-[48px] rounded-[12px] px-[26px] text-[18px] font-semibold tracking-[-0.18px] bg-grey-70 text-grey-0 disabled:bg-grey-20 disabled:text-grey-0 disabled:cursor-not-allowed transition-colors duration-700 delay-200 ease-in-out whitespace-nowrap"
                >
                  작성 완료
                </button>
              </div>

              {questionError && (
                <p className="text-[13px] font-medium text-red-500">
                  {questionError}
                </p>
              )}

              <QuestionModal
                questions={questions}
                remainingQuestions={remainingQuestions}
              />
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

      {tutorialStep !== null && (
        <DiaryTutorial
          step={tutorialStep}
          spot={tutorialSpot}
          onNext={handleTutorialNext}
        />
      )}

      {showReflectionConsent && (
        <ReflectionConsentModal
          onSkip={() => handleReflectionChoice(false)}
          onUse={() => handleReflectionChoice(true)}
          onClose={() => setShowReflectionConsent(false)}
        />
      )}

      {showAnonymousShare && (
        <AnonymousShareModal
          onDecline={() => handleAnonymousShareChoice(false)}
          onShare={() => handleAnonymousShareChoice(true)}
          onClose={() => setShowAnonymousShare(false)}
        />
      )}
    </div>
  );
}
