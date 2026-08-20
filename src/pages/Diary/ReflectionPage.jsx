import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import apiClient from "../../api/apiClient";
import { createExperienceFragment } from "../../utils/experienceFragments";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
import SpeechBubble from "../../components/SpeechBubble";
import { clearDraft, clearQuestions } from "../../utils/diaryDraft";
import { clearDraftId, getStoredDraftId } from "../../utils/diaryDraftApi";
import { getDiaryReward } from "../../utils/devDiary";
import { markWrittenToday } from "../../utils/todayDiary";
import AnimatedBlobs from "../../components/AnimatedBlobs";
import { useSlideUp } from "../../hooks/useSlideUp";

const POLL_INTERVAL_MS = 800;
const MAX_POLL_ATTEMPTS = 38;

function SlideUpPanel({ children }) {
  const ref = useSlideUp();
  return (
    <div
      ref={ref}
      className="absolute inset-x-0 top-[143px] bottom-0 z-10 flex flex-col overflow-hidden rounded-t-[12px] bg-grey-0 shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]"
    >
      {children}
    </div>
  );
}

export default function ReflectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dateStr } = useCurrentTime() || {};
  const diaryContent = location.state?.content ?? "";
  const useDiaryContent = location.state?.useDiaryContent ?? false;
  const shareAnonymously = location.state?.shareAnonymously ?? false;

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [diaryId, setDiaryId] = useState(null);
  const [reward, setReward] = useState(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const isSavedRef = useRef(false);
  const scrollContainerRef = useRef(null);
  const rewardReadyRef = useRef(null);

  useEffect(() => {
    if (isSavedRef.current) return;
    isSavedRef.current = true;

    if (!diaryContent) {
      navigate("/diary", { replace: true });
      return;
    }

    const saveDiary = async () => {
      try {
        const draftId = location.state?.draftId ?? getStoredDraftId();
        const response = await apiClient.post("/api/v1/diaries", {
          content: diaryContent,
          personalizationUsesDiaryContent: useDiaryContent,
          ...(draftId != null ? { draftId } : {}),
        });
        const result = response.data.result;

        setQuestion(result.reflectionQuestion?.questionText ?? "");
        setDiaryId(result.diaryId ?? null);
        setReward(result.reward ?? null);

        if (shareAnonymously && result.diaryId) {
          createExperienceFragment(result.diaryId).catch((shareError) => {
            console.error(
              "POST /api/v1/experience-fragments/diaries/{diaryId} 실패:",
              shareError.response?.status,
              shareError.response?.data,
            );
          });
        }

        markWrittenToday();
        clearDraft();
        clearQuestions();
        clearDraftId();
      } catch (error) {
        const code = error.response?.data?.code;
        if (code === "DIARY409_1") {
          markWrittenToday();
          clearDraft();
          clearQuestions();
          clearDraftId();
          setSaveError("오늘의 일기는 이미 작성했어요.");
        } else {
          setSaveError("일기 저장에 실패했어요. 다시 시도해주세요.");
        }
        console.error(
          "POST /api/v1/diaries 실패:",
          error.response?.status,
          error.response?.data,
        );
      } finally {
        setLoading(false);
      }
    };

    saveDiary();
  }, [diaryContent, useDiaryContent, navigate]);

  const handleBack = () => navigate("/diary", { replace: true });

  const handleScroll = (e) => {
    setIsScrolled(e.target.scrollTop > 10);
  };

  useEffect(() => {
    if (!diaryId) return;

    if (reward?.status !== "PENDING") {
      rewardReadyRef.current = Promise.resolve(reward);
      return;
    }

    let cancelled = false;

    rewardReadyRef.current = (async () => {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        try {
          const response = await getDiaryReward(diaryId);
          const nextReward = response.data.result;
          if (nextReward && nextReward.status !== "PENDING") {
            if (!cancelled) setReward(nextReward);
            return nextReward;
          }
        } catch (error) {
          console.error(
            "GET /api/v1/diaries/{diaryId}/reward 실패:",
            error.response?.status,
            error.response?.data,
          );
        }
        if (cancelled) break;
        if (attempt < MAX_POLL_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
      }
      const failed = { ...reward, status: "FAILED" };
      if (!cancelled) setReward(failed);
      return failed;
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaryId]);

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleFinish = async () => {
    if (isSubmitting) return;

    const trimmed = answer.trim();

    if (!trimmed || !diaryId) {
      setIsSubmitting(true);
      const finalReward = await (rewardReadyRef.current ??
        Promise.resolve(reward));
      navigate("/diary/today-color", {
        replace: true,
        state: { reward: finalReward, diaryId },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/api/v1/diaries/${diaryId}/reflection-answer`, {
        answerText: trimmed,
      });
      const finalReward = await (rewardReadyRef.current ??
        Promise.resolve(reward));
      navigate("/diary/today-color", {
        replace: true,
        state: { reward: finalReward, diaryId },
      });
    } catch (error) {
      if (error.response?.data?.code === "QUESTION409_1") {
        const finalReward = await (rewardReadyRef.current ??
          Promise.resolve(reward));
        navigate("/diary/today-color", {
          replace: true,
          state: { reward: finalReward, diaryId },
        });
        return;
      }
      setAnswerError("답변 제출에 실패했어요. 다시 시도해주세요.");
      console.error(
        "POST /api/v1/diaries/{diaryId}/reflection-answer 실패:",
        error.response?.status,
        error.response?.data,
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <AnimatedBlobs />
      <div className="absolute left-0 top-0 z-10 flex w-full flex-col gap-[24px] p-[16px]">
        <div className="flex w-full items-center justify-end">
          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="h-[38px] w-[38px] shrink-0 cursor-pointer border-none bg-transparent p-0 transition-opacity active:opacity-60"
          >
            <img
              src={profileIcon}
              alt="프로필"
              className="h-full w-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
            />
          </button>
        </div>
        <p className="text-[28px] font-bold leading-[normal] tracking-[-0.56px] text-grey-80">
          {dateStr}
        </p>
      </div>

      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[17px]">
          <img
            src={logoImage}
            alt="DAYBIT"
            className="h-[124px] w-[98px] object-cover"
          />
          <p className="text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
            생성중..
          </p>
        </div>
      ) : saveError ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[24px] px-[36px]">
          <p className="text-center text-[18px] font-semibold tracking-[-0.36px] text-grey-80">
            {saveError}
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="w-full rounded-[12px] bg-grey-70 px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
          >
            돌아가기
          </button>
        </div>
      ) : (
        <SlideUpPanel>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div
              className={`pointer-events-none absolute left-0 right-0 top-0 z-10 h-[92px] rounded-t-[12px] transition-opacity duration-200 ${
                isScrolled ? "opacity-100" : "opacity-0"
              }`}
              style={{
                background:
                  "linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0) 100%)",
              }}
            ></div>

            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[92px]"
              style={{
                background:
                  "linear-gradient(0deg, #FFF 0%, rgba(255, 255, 255, 0) 100%)",
              }}
            ></div>

            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto scrollbar-hide px-[16px] pb-[24px] pt-[36px]"
            >
              <div className="flex w-full flex-col items-start gap-[16px]">
                <div className="flex w-full flex-col items-start gap-[8px]">
                  <div className="flex items-start gap-[6px]">
                    <img
                      src={logoImage}
                      alt=""
                      className="h-[28px] w-[22px] shrink-0 object-cover"
                    />
                    <p className="text-[24px] font-bold tracking-[-0.48px] text-grey-90">
                      성찰질문
                    </p>
                  </div>
                  <p className="w-full text-[14px] font-medium tracking-[-0.28px] text-[#AFB6C4]">
                    작성하지 않고 넘어가도 괜찮아요.
                  </p>
                </div>

                <div className="flex w-full flex-col items-start gap-[12px]">
                  <SpeechBubble
                    color="#787E8C"
                    direction="left"
                    className="flex w-full items-center px-[16px] py-[10px]"
                  >
                    <p className="flex-1 text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-0">
                      {question}
                    </p>
                  </SpeechBubble>

                  <SpeechBubble
                    color="#EFF1F6"
                    direction="right"
                    bordered
                    className="w-full"
                  >
                    <textarea
                      value={answer}
                      onChange={handleAnswerChange}
                      placeholder="내용을 입력해주세요."
                      rows={1}
                      className="block w-full resize-none overflow-hidden bg-transparent px-[16px] py-[10px] text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-80 placeholder:text-grey-40 focus:outline-none"
                    />
                  </SpeechBubble>
                </div>

                {answerError && (
                  <p className="text-[13px] font-medium text-red-500">
                    {answerError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-center bg-grey-0 px-[20px] pb-[30px]">
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-[12px] bg-grey-70 px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-grey-0 text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] disabled:opacity-50"
            >
              {isSubmitting ? "제출 중..." : "완료"}
            </button>
          </div>
        </SlideUpPanel>
      )}
    </div>
  );
}
