import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyPageHeader from "./components/MyPageHeader";
import { useNickname } from "./useNickname";
import {
  createDatedDiary,
  generateWeeklyReward,
  getDiaryReward,
  getMondayOf,
  getSeoulTodayStr,
  addDays,
} from "../../utils/devDiary";

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 90000;

const CARD =
  "flex w-full flex-col gap-[12px] rounded-[12px] bg-grey-0 px-[16px] py-[16px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]";
const PRIMARY_BUTTON =
  "flex w-full items-center justify-center rounded-[12px] bg-grey-70 px-[10px] py-[14px] text-[16px] font-semibold text-grey-0 disabled:bg-grey-20";
const SECTION_TITLE =
  "text-[16px] font-semibold tracking-[-0.32px] text-grey-90";
const CAPTION = "text-[13px] font-medium leading-[1.5] text-grey-60";

function describeError(error, fallback) {
  const status = error.response?.status;
  const code = error.response?.data?.code;
  if (status === 404) {
    return "서버에 개발용 API가 켜져 있지 않아요. (DEV_DATED_DIARY_ENABLED 확인 필요)";
  }
  if (code === "AUTH403_1") {
    return "이 계정은 날짜 지정 일기 허용 사용자가 아니에요. (DEV_DATED_DIARY_ALLOWED_USER_ID 확인 필요)";
  }
  if (code === "DIARY409_1") {
    return "그 날짜에는 이미 일기가 있어요. 다른 날짜를 골라주세요.";
  }
  if (status === 401) {
    return "로그인이 필요해요.";
  }
  return error.response?.data?.message ?? fallback;
}

export default function DatedDiaryPage() {
  const navigate = useNavigate();
  const nickname = useNickname();
  const [todayStr] = useState(() => getSeoulTodayStr());

  const [recordedDate, setRecordedDate] = useState(todayStr);
  const [content, setContent] = useState("");
  const [usePersonalization, setUsePersonalization] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedDiary, setSavedDiary] = useState(null);
  const [reward, setReward] = useState(null);

  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [weeklyResult, setWeeklyResult] = useState(null);

  const pollRef = useRef(null);

  useEffect(() => {
    const diaryId = savedDiary?.diaryId;
    if (!diaryId) return;

    let alive = true;
    const startedAt = Date.now();

    const fetchReward = async () => {
      try {
        const response = await getDiaryReward(diaryId);
        if (!alive) return;
        const result = response.data.result;
        setReward(result);

        const pending =
          result.status === "PENDING" || result.status === "GENERATING";
        if (pending && Date.now() - startedAt < POLL_TIMEOUT_MS) {
          pollRef.current = setTimeout(fetchReward, POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (!alive) return;
        console.error(
          "GET /api/v1/diaries/{diaryId}/reward 실패:",
          error.response?.status,
          error.response?.data,
        );
      }
    };

    fetchReward();

    return () => {
      alive = false;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [savedDiary]);

  const weekStartDate = recordedDate ? getMondayOf(recordedDate) : "";
  const weekEndDate = weekStartDate ? addDays(weekStartDate, 6) : "";
  const canSave = Boolean(recordedDate) && content.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);
    setSaveError("");
    setSavedDiary(null);
    setReward(null);
    setWeeklyResult(null);

    try {
      const response = await createDatedDiary(
        recordedDate,
        content.trim(),
        usePersonalization,
      );
      const result = response.data.result;
      setSavedDiary(result);
      setReward(result.reward ?? null);
      setContent("");
    } catch (error) {
      console.error(
        "POST /api/dev/me/diaries 실패:",
        error.response?.status,
        error.response?.data,
      );
      setSaveError(describeError(error, "일기를 저장하지 못했어요."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateWeekly = async () => {
    if (!weekStartDate || isGeneratingWeekly) return;

    setIsGeneratingWeekly(true);
    setWeeklyResult(null);

    try {
      const response = await generateWeeklyReward(weekStartDate);
      setWeeklyResult(response.data.result);
    } catch (error) {
      console.error(
        "POST /api/dev/me/weekly-rewards/generate 실패:",
        error.response?.status,
        error.response?.data,
      );
      setWeeklyResult({
        eligible: false,
        message: describeError(error, "주간 이미지를 요청하지 못했어요."),
      });
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  const isRewardPending =
    reward?.status === "PENDING" || reward?.status === "GENERATING";

  return (
    <div className="flex h-full w-full select-none flex-col gap-[14px] overflow-y-auto bg-[#F6F8FA] px-[16px] py-[16px] scrollbar-hide">
      <MyPageHeader nickname={nickname} onBack={() => navigate(-1)} />
      <p className="whitespace-nowrap text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-70">
        날짜 지정 일기 (개발용)
      </p>
      <div className="h-[0.5px] w-full shrink-0 bg-grey-40" />

      <div className="flex w-full flex-col gap-[14px] pb-[24px]">
        <div className={CARD}>
          <p className={SECTION_TITLE}>1. 날짜를 정해 일기 쓰기</p>
          <p className={CAPTION}>
            지난 날짜로 실제 일기를 저장해요. 미래 날짜와 이미 쓴 날짜는 저장할
            수 없어요.
          </p>

          <div className="flex w-full flex-col gap-[6px]">
            <label
              htmlFor="recordedDate"
              className="text-[14px] font-medium text-grey-70"
            >
              날짜
            </label>
            <input
              id="recordedDate"
              type="date"
              value={recordedDate}
              max={todayStr}
              onChange={(e) => setRecordedDate(e.target.value)}
              className="w-full appearance-none rounded-[8px] border border-solid border-grey-30 bg-grey-0 px-[12px] py-[10px] text-left text-[16px] font-medium text-grey-90 focus:outline-none [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:p-0"
            />
          </div>

          <div className="flex w-full flex-col gap-[6px]">
            <label
              htmlFor="devContent"
              className="text-[14px] font-medium text-grey-70"
            >
              내용
            </label>
            <textarea
              id="devContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="그날 있었던 일을 적어주세요."
              className="w-full resize-none rounded-[8px] border border-solid border-grey-30 bg-grey-0 px-[12px] py-[10px] text-[16px] font-normal leading-[1.5] text-grey-90 placeholder-grey-40 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setUsePersonalization((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-[14px] font-medium text-grey-70">
              AI 질문 개인화에 이 내용 사용
            </span>
            <span
              className={`flex size-[22px] shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-solid text-[13px] font-bold ${
                usePersonalization
                  ? "border-grey-70 bg-grey-70 text-grey-0"
                  : "border-grey-30 bg-grey-0 text-transparent"
              }`}
            >
              ✓
            </span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className={PRIMARY_BUTTON}
          >
            {isSaving ? "저장 중..." : "일기 저장"}
          </button>

          {saveError && (
            <p className="text-[13px] font-medium leading-[1.5] text-red-500">
              {saveError}
            </p>
          )}
        </div>

        {savedDiary && (
          <div className={CARD}>
            <p className={SECTION_TITLE}>2. 오늘의 색</p>
            <p className={CAPTION}>
              {savedDiary.recordedDate} · 일기 #{savedDiary.diaryId}
            </p>

            {isRewardPending && (
              <p className="text-[14px] font-medium text-grey-70">
                색을 만드는 중이에요...
              </p>
            )}

            {reward?.status === "COMPLETED" && (
              <div className="flex w-full flex-col gap-[10px]">
                <div className="flex items-center gap-[10px]">
                  <div
                    className="size-[38px] shrink-0 rounded-[4px]"
                    style={{ backgroundColor: reward.colorHex }}
                  />
                  <p className="text-[16px] font-semibold text-grey-90">
                    {reward.colorHex}
                  </p>
                </div>
                {reward.keywords?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-[4px]">
                    {reward.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-[100px] border border-solid border-[#AFB6C4] px-[8px] py-[4px] text-[13px] font-medium text-grey-80"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                {reward.colorComment && (
                  <p className="text-[14px] font-normal leading-[1.5] text-grey-80">
                    {reward.colorComment}
                  </p>
                )}
              </div>
            )}

            {reward?.status === "FAILED" && (
              <p className="text-[14px] font-medium text-red-500">
                색 생성에 실패했어요.
              </p>
            )}

            {savedDiary.reflectionQuestion?.questionText && (
              <div className="flex w-full flex-col gap-[4px] rounded-[8px] bg-[#F8F9FC] px-[12px] py-[10px]">
                <p className="text-[13px] font-semibold text-grey-60">
                  성찰 질문 ({savedDiary.reflectionQuestion.generationSource})
                </p>
                <p className="text-[14px] font-normal leading-[1.5] text-grey-80">
                  {savedDiary.reflectionQuestion.questionText}
                </p>
              </div>
            )}
          </div>
        )}

        <div className={CARD}>
          <p className={SECTION_TITLE}>3. 주간 이미지 만들기</p>
          <p className={CAPTION}>
            같은 주(월~일)에 일기가 3개 이상이고 색이 모두 만들어져야 생성돼요.
          </p>
          {weekStartDate && (
            <p className="text-[14px] font-medium text-grey-70">
              대상 주차: {weekStartDate} ~ {weekEndDate}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerateWeekly}
            disabled={!weekStartDate || isGeneratingWeekly}
            className={PRIMARY_BUTTON}
          >
            {isGeneratingWeekly ? "요청 중..." : "이 주차 주간 이미지 생성"}
          </button>

          {weeklyResult && (
            <div className="flex w-full flex-col gap-[10px]">
              <p
                className={`text-[14px] font-medium leading-[1.5] ${
                  weeklyResult.eligible ? "text-grey-80" : "text-red-500"
                }`}
              >
                {weeklyResult.message}
              </p>
              {weeklyResult.eligible && weeklyResult.weeklyRewardId && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/home/weekly-rewards/${weeklyResult.weeklyRewardId}`,
                    )
                  }
                  className="flex w-full items-center justify-center rounded-[12px] border-[1.5px] border-solid border-grey-60 bg-grey-0 px-[10px] py-[14px] text-[16px] font-semibold text-grey-80"
                >
                  주간 이미지 보러가기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
