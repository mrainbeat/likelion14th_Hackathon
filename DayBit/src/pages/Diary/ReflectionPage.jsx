import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import apiClient from "../../api/apiClient";
import { createExperienceFragment } from "../../utils/experienceFragments";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
import SpeechBubble from "../../components/SpeechBubble";
import { clearDraft, clearQuestions } from "../../utils/diaryDraft";

const BLOB_CYCLE_MS = 16000;
const BLOB_EASE = "cubic-bezier(0.68, -0.55, 0.265, 1.55)"; // Ease in and out back
const BLOBS = [
  {
    name: "loading-blob-7",
    color: "#FFF0C7",
    blur: 92.3,
    left: 57,
    top: 505,
    w: 149,
    h: 182,
    steps: [
      { t: [0, 0], r: 0, s: [1, 1], o: 1 },
      { t: [86.914, 70.433], r: -75.89, s: [1, 1], o: 1 },
      { t: [160.914, -194.567], r: -75.89, s: [1, 1], o: 1 },
      { t: [-84.086, -190.567], r: -75.89, s: [1, 1], o: 1 },
    ],
  },
  {
    name: "loading-blob-8",
    color: "#C7FFF6",
    blur: 92.3,
    left: 195,
    top: 710,
    w: 169,
    h: 205,
    steps: [
      { t: [0, 0], r: -90, s: [1, 1], o: 1 },
      { t: [-298, -452], r: -90, s: [1, 1], o: 0 },
      { t: [-298, -452], r: -90, s: [1, 1], o: 1 },
      { t: [-74, -117], r: -90, s: [1, 1], o: 1 },
    ],
  },
  {
    name: "loading-blob-9",
    color: "#EDDCF9",
    blur: 81,
    left: 336.82,
    top: 388.22,
    w: 147.055,
    h: 173.193,
    steps: [
      { t: [0, 0], r: -168.32, s: [1, 1], o: 1 },
      { t: [-316.315, -208.867], r: -244.22, s: [0.9709, 1], o: 1 },
      { t: [-283.315, 342.133], r: -244.22, s: [0.9709, 1], o: 1 },
      { t: [0, 0], r: -168.32, s: [1, 1], o: 0 },
    ],
  },
  {
    name: "loading-blob-6",
    color: "#FFCFCF",
    blur: 65.5,
    left: -106.98,
    top: 302.44,
    w: 167,
    h: 217,
    steps: [
      { t: [0, 0], r: 27.85, s: [1, 1], o: 1 },
      { t: [-51.008, 308.695], r: -48.04, s: [1, 1], o: 1 },
      { t: [463.573, 280.249], r: -162.36, s: [0.8624, 0.6432], o: 1 },
      { t: [440.665, -109.355], r: -123.1, s: [0.8704, 0.8704], o: 1 },
    ],
  },
];

function blobTransform(step) {
  return `translate(${step.t[0]}px, ${step.t[1]}px) rotate(${step.r}deg) scale(${step.s[0]}, ${step.s[1]})`;
}

function buildBlobKeyframes(blob) {
  const frames = blob.steps.map(
    (step, i) =>
      `${i * 25}% { transform: ${blobTransform(step)}; opacity: ${step.o}; animation-timing-function: ${BLOB_EASE}; }`,
  );
  const first = blob.steps[0];
  frames.push(
    `100% { transform: ${blobTransform(first)}; opacity: ${first.o}; }`,
  );
  return `@keyframes ${blob.name} { ${frames.join(" ")} }`;
}

const POLL_INTERVAL_MS = 800;
const MAX_POLL_ATTEMPTS = 38; // 약 30초

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
        const response = await apiClient.post("/api/v1/diaries", {
          content: diaryContent,
          reflectionUsesDiaryContent: useDiaryContent,
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

        clearDraft();
        clearQuestions();
      } catch (error) {
        const code = error.response?.data?.code;
        if (code === "DIARY409_1") {
          clearDraft();
          clearQuestions();
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
          const response = await apiClient.get(`/api/v1/diaries/${diaryId}`);
          const nextReward = response.data.result?.reward;
          if (nextReward && nextReward.status !== "PENDING") {
            if (!cancelled) setReward(nextReward);
            return nextReward;
          }
        } catch (error) {
          console.error(
            "GET /api/v1/diaries/{diaryId} 실패:",
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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BLOBS.map((blob) => (
          <div
            key={blob.name}
            className="absolute rounded-[50%]"
            style={{
              left: blob.left,
              top: blob.top,
              width: blob.w,
              height: blob.h,
              backgroundColor: blob.color,
              filter: `blur(${blob.blur}px)`,
              willChange: "transform, opacity",
              animation: `${blob.name} ${BLOB_CYCLE_MS}ms infinite`,
            }}
          />
        ))}
        <style>{BLOBS.map(buildBlobKeyframes).join("\n")}</style>
      </div>

      <div className="absolute left-0 top-0 z-10 flex w-full flex-col gap-[24px] px-[16px] py-[16px]">
        <div className="flex w-full items-center justify-between">
          <button type="button" onClick={handleBack} className="cursor-pointer">
            <img src={backIcon} alt="뒤로가기" className="size-[32px]" />
          </button>
          <button
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
        <div className="absolute inset-x-0 top-[115px] bottom-0 z-10 flex flex-col overflow-hidden rounded-[12px] bg-grey-0 shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div
              className={`pointer-events-none absolute left-0 right-0 top-0 z-10 h-[92px] rounded-t-[12px] transition-opacity duration-200 ${
                isScrolled ? "opacity-100" : "opacity-0"
              }`}
              style={{
                background:
                  "linear-gradient(180deg, #F6F8FA 0%, rgba(246, 248, 250, 0) 100%)",
              }}
            ></div>

            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[92px]"
              style={{
                background:
                  "linear-gradient(0deg, #F6F8FA 0%, rgba(246, 248, 250, 0) 100%)",
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
                  <p className="w-full text-[14px] font-medium tracking-[-0.28px] text-grey-50">
                    작성하지 않고 넘어가도 괜찮아요.
                  </p>
                </div>

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
                    className="w-full resize-none overflow-hidden bg-transparent px-[16px] py-[10px] text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-80 placeholder:text-grey-40 focus:outline-none"
                  />
                </SpeechBubble>

                {answerError && (
                  <p className="text-[13px] font-medium text-red-500">
                    {answerError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-center bg-grey-0 px-[16px] pb-[30px] pt-[16px]">
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="flex w-full max-w-[350px] cursor-pointer items-center justify-center whitespace-nowrap rounded-[12px] bg-grey-80 px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-grey-0 text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] disabled:opacity-50"
            >
              {isSubmitting ? "제출 중..." : "완료"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
