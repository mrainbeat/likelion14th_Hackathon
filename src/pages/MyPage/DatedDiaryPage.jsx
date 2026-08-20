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
  resetTodayDiary,
} from "../../utils/devDiary";
import { useDevAccess } from "../../contexts/devAccess";
import { clearDraft } from "../../utils/diaryDraft";
import {
  createExperienceFragment,
  getMyExperienceFragments,
  approveExperienceFragment,
} from "../../utils/experienceFragments";

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
  if (status === 401) {
    return "로그인이 필요해요.";
  }
  if (status === 403) {
    return "비밀번호가 없거나 틀렸어요. 다시 입력해주세요.";
  }
  if (status === 404) {
    return "서버에서 개발용 API가 비활성화되어 있어요.";
  }
  if (code === "DIARY409_1") {
    return "그 날짜에는 이미 일기가 있어요. 다른 날짜를 골라주세요.";
  }
  return fallback;
}

function DevPasswordGate({ onBack, nickname, onVerify }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim() || isChecking) return;

    setIsChecking(true);
    setError("");
    try {
      const ok = await onVerify(value);
      if (!ok) setError("비밀번호가 올바르지 않아요.");
    } catch (err) {
      console.error(
        "POST /api/dev/access/verify 실패:",
        err.response?.status,
        err.response?.data,
      );
      setError(
        describeError(err, "확인하지 못했어요. 잠시 후 다시 시도해주세요."),
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex h-full w-full select-none flex-col gap-[14px] overflow-y-auto bg-[#F6F8FA] px-[16px] py-[16px] scrollbar-hide">
      <MyPageHeader nickname={nickname} onBack={onBack} />
      <form onSubmit={handleSubmit} className={`${CARD} mt-[14px]`}>
        <p className="w-full text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
          암호를 입력해주세요
        </p>
        <input
          type="password"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          placeholder="암호"
          className={`w-full rounded-[8px] border border-solid bg-white px-[12px] py-[10px] text-[16px] font-medium tracking-[0.2em] text-grey-90 placeholder-grey-40 placeholder:tracking-normal focus:outline-none ${
            error ? "border-red-400" : "border-grey-30"
          }`}
        />
        {error && (
          <p className="text-[13px] font-medium leading-[1.5] text-red-500">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!value.trim() || isChecking}
          className="flex h-[46px] w-full items-center justify-center rounded-[12px] bg-grey-80 px-[26px] text-[16px] font-semibold text-white disabled:bg-grey-20"
        >
          {isChecking ? "확인 중..." : "확인"}
        </button>
      </form>
    </div>
  );
}

export default function DatedDiaryPage() {
  const navigate = useNavigate();
  const nickname = useNickname();
  const { devPassword, isVerified, verify } = useDevAccess();
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

  const [shareInstantly, setShareInstantly] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const [isResetting, setIsResetting] = useState(false);

  const handleResetTodayDiary = async () => {
    if (isResetting) return;
    if (
      !window.confirm(
        "오늘 작성한 일기와 연결된 색상·성찰 질문·기억 후보를 초기화합니다. 계속할까요?",
      )
    )
      return;

    setIsResetting(true);
    try {
      const response = await resetTodayDiary();
      const result = response.data.result;
      alert(
        result.deleted
          ? "초기화가 완료되었습니다. 오늘 일기를 다시 작성할 수 있습니다."
          : "오늘 작성된 일기가 없어 초기화할 데이터가 없습니다.",
      );
      clearDraft();
    } catch (error) {
      const code = error.response?.data?.code;
      if (code === "DEV409_1") {
        alert("공유 이력이 있는 일기는 초기화할 수 없습니다.");
      } else if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
      } else if (error.response?.status === 404) {
        alert("현재 서버에서는 개발용 초기화 기능이 활성화되어 있지않습니다.");
      } else {
        alert("오늘 일기를 초기화하지 못했습니다.");
      }
      console.error(
        "DELETE /api/dev/me/diaries/today 실패:",
        error.response?.status,
        error.response?.data,
      );
    } finally {
      setIsResetting(false);
    }
  };

  const pollRef = useRef(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

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

  // 테스트 일기는 검토 유예기간 없이 익명화가 끝나는 대로 바로 승인해 공유 풀에 넣는다
  const runInstantShare = async (diaryId) => {
    setShareStatus("익명화를 요청하고 있어요...");
    try {
      await createExperienceFragment(diaryId);
    } catch (error) {
      console.error(
        "POST /api/v1/experience-fragments/diaries/{diaryId} 실패:",
        error.response?.status,
        error.response?.data,
      );
      setShareStatus("경험조각 생성 요청에 실패했어요.");
      return;
    }

    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (!aliveRef.current) return;

      let found;
      try {
        const response = await getMyExperienceFragments();
        found = (response.data.result ?? []).find((f) => f.diaryId === diaryId);
      } catch (error) {
        console.error(
          "GET /api/v1/experience-fragments/mine 실패:",
          error.response?.status,
          error.response?.data,
        );
        continue;
      }
      if (!aliveRef.current) return;

      if (found?.status === "REVIEW_REQUIRED") {
        try {
          await approveExperienceFragment(found.shareId);
          if (aliveRef.current) {
            setShareStatus("익명화 후 바로 전달까지 끝났어요.");
          }
        } catch (error) {
          console.error(
            "POST /api/v1/experience-fragments/{shareId}/approve 실패:",
            error.response?.status,
            error.response?.data,
          );
          if (aliveRef.current) setShareStatus("자동 전달에 실패했어요.");
        }
        return;
      }
      if (found?.status === "APPROVED") {
        setShareStatus("이미 전달된 조각이에요.");
        return;
      }
      if (found?.status === "BLOCKED" || found?.status === "REJECTED") {
        setShareStatus("공유가 제한된 조각이에요.");
        return;
      }
      setShareStatus(`익명화가 진행 중이에요... (${attempt + 1})`);
    }

    if (aliveRef.current) {
      setShareStatus(
        "익명화가 아직 안 끝났어요. 경험조각 화면에서 확인해주세요.",
      );
    }
  };

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
    setShareStatus("");

    try {
      const response = await createDatedDiary(
        recordedDate,
        content.trim(),
        usePersonalization,
        devPassword,
      );
      const result = response.data.result;
      setSavedDiary(result);
      setReward(result.reward ?? null);
      setContent("");
      if (shareInstantly && result.diaryId) {
        runInstantShare(result.diaryId);
      }
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
      const response = await generateWeeklyReward(weekStartDate, devPassword);
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

  if (!isVerified) {
    return (
      <DevPasswordGate
        nickname={nickname}
        onBack={() => navigate(-1)}
        onVerify={verify}
      />
    );
  }

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
            onClick={() => setShareInstantly((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="min-w-0 flex-1 pr-[10px] text-[14px] font-medium leading-[1.4] text-grey-70">
              경험조각으로 바로 공유 (익명화 후 유예기간 없이 전달)
            </span>
            <span
              className={`flex size-[22px] shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-solid text-[13px] font-bold ${
                shareInstantly
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

          {shareStatus && (
            <p className="text-[13px] font-medium leading-[1.5] text-grey-70">
              {shareStatus}
            </p>
          )}

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

        <div className={CARD}>
          <p className={SECTION_TITLE}>4. 경험조각 주고받기</p>
          <p className={CAPTION}>
            홈 화면에서는 아직 막아둔 화면이에요. 여기서만 들어가서 익명화
            결과와 전달을 확인할 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => navigate("/experience")}
            className="flex w-full items-center justify-center rounded-[12px] border-[1.5px] border-solid border-grey-60 bg-grey-0 px-[10px] py-[14px] text-[16px] font-semibold text-grey-80"
          >
            경험조각 화면 열기
          </button>
        </div>

        <div className={CARD}>
          <p className={SECTION_TITLE}>5. 오늘 일기 초기화</p>
          <p className={CAPTION}>
            오늘 작성한 일기와 연결된 색상 · 성찰 질문 · 기억 후보를 지워요.
            공유 이력이 있는 일기는 초기화할 수 없어요.
          </p>
          <button
            type="button"
            disabled={isResetting}
            onClick={handleResetTodayDiary}
            className="flex w-full items-center justify-center rounded-[12px] border-[1.5px] border-solid border-grey-60 bg-grey-0 px-[10px] py-[14px] text-[16px] font-semibold text-grey-80 disabled:opacity-50"
          >
            {isResetting ? "초기화 중..." : "오늘 일기 초기화"}
          </button>
        </div>
      </div>
    </div>
  );
}
