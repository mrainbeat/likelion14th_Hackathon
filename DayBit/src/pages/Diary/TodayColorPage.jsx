import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import apiClient from "../../api/apiClient";
import { getTodayColorPalette, hexToRgba } from "../../utils/rewardColor";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import LogoSymbol from "../../assets/icons/LogoSymbol.jsx";

const BLOBS = [
  {
    cx: 131.5,
    cy: 596,
    w: 149,
    h: 182,
    rotate: 0,
    blur: 92.3,
    color: "#FFF0C7",
  },
  {
    cx: 279.5,
    cy: 812.5,
    w: 169,
    h: 205,
    rotate: -90,
    blur: 92.3,
    color: "#C7FFF6",
  },
  {
    cx: 412.44,
    cy: 475.25,
    w: 142.78,
    h: 173.19,
    rotate: -168.32,
    blur: 81,
    color: "#DCCDE6",
  },
  {
    cx: -23.45,
    cy: 410.94,
    w: 167,
    h: 217,
    rotate: 27.85,
    blur: 65.5,
    color: "#FFCFCF",
  },
];

const FALLBACK_COLOR = "#858C9C";

export default function TodayColorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dateStr } = useCurrentTime() || {};

  const isReview = location.state?.mode === "review";
  const diaryId = location.state?.diaryId ?? null;
  const [reward, setReward] = useState(location.state?.reward ?? null);

  const isPending = reward?.status === "PENDING";
  const isReady = reward?.status === "COMPLETED" && reward?.colorHex;

  const palette = isReady ? getTodayColorPalette(reward.colorHex) : null;
  const todayColor = palette ? palette.todayColor : FALLBACK_COLOR;
  const accentColor = palette ? palette.uiAccentColor : FALLBACK_COLOR;

  const keywords = reward?.keywords ?? [];
  const colorComment = reward?.colorComment ?? "";

  const recordedDate = location.state?.recordedDate ?? null;
  const reviewDateStr =
    isReview && recordedDate
      ? `${Number(recordedDate.slice(5, 7))}월 ${Number(recordedDate.slice(8, 10))}일`
      : null;

  useEffect(() => {
    if (!location.state?.reward) navigate("/diary", { replace: true });
  }, [location.state, navigate]);

  useEffect(() => {
    if (!isReview || !diaryId || colorComment) return;

    let alive = true;
    apiClient
      .get(`/api/v1/diaries/${diaryId}`)
      .then((response) => {
        if (!alive) return;
        const detail = response.data.result?.reward;
        if (detail) setReward((prev) => ({ ...prev, ...detail }));
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/diaries/{diaryId} 실패:",
          error.response?.status,
          error.response?.data,
        );
      });

    return () => {
      alive = false;
    };
  }, [isReview, diaryId, colorComment]);

  const handleBack = () =>
    navigate(isReview ? "/home" : "/diary", { replace: true });
  const handleFinish = () => {
    if (isReview && diaryId) {
      navigate(`/home/diaries/${diaryId}`);
      return;
    }
    navigate("/home", { replace: true });
  };

  if (!reward) return null;

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BLOBS.map(({ cx, cy, w, h, rotate, blur, color: blobColor }, i) => (
          <div
            key={i}
            className="absolute rounded-[50%]"
            style={{
              left: cx - w / 2,
              top: cy - h / 2,
              width: w,
              height: h,
              backgroundColor: blobColor,
              transform: `rotate(${rotate}deg)`,
              filter: `blur(${blur}px)`,
            }}
          />
        ))}
        <div
          className="absolute rounded-[50%]"
          style={{
            left: -199,
            top: 253,
            width: 473,
            height: 573,
            backgroundColor: hexToRgba(accentColor, 0.1),
            filter: "blur(81px)",
          }}
        />
      </div>

      <div className="absolute left-0 top-0 z-10 flex w-full flex-col gap-[24px] px-[20px] py-[16px]">
        <div className="flex w-full items-center justify-between">
          <button type="button" onClick={handleBack} className="cursor-pointer">
            <img src={backIcon} alt="뒤로가기" className="size-[32px]" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="size-[38px] shrink-0 cursor-pointer border-none bg-transparent p-0 transition-opacity active:opacity-60"
          >
            <img
              src={profileIcon}
              alt="프로필"
              className="h-full w-full object-contain"
              style={{
                filter: `drop-shadow(0 0 9.938px ${hexToRgba(accentColor, 0.16)})`,
              }}
            />
          </button>
        </div>
        <p
          className="text-[28px] font-bold leading-[normal] tracking-[-0.56px]"
          style={{ color: accentColor }}
        >
          {reviewDateStr ?? dateStr}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-[143px] z-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[12px]"
          style={{
            backgroundColor: hexToRgba(accentColor, 0.05),
            filter: "blur(15px)",
          }}
        />

        <div className="relative flex h-full flex-col overflow-hidden rounded-t-[12px] bg-grey-0">
          <div
            className="pointer-events-none absolute rounded-[50%]"
            style={{
              left: 131,
              top: 82,
              width: 354,
              height: 429,
              backgroundColor: hexToRgba(accentColor, 0.1),
              filter: "blur(81px)",
            }}
          />

          <div className="relative z-10 flex w-full shrink-0 items-start gap-[6px] px-[20px] pt-[32px]">
            <LogoSymbol
              dotColor={accentColor}
              className="h-[27.872px] w-[22px] shrink-0"
            />
            <p className="text-[24px] font-bold leading-[normal] tracking-[-0.48px] text-grey-80">
              오늘의 색
            </p>
          </div>

          <div className="relative z-10 min-h-0 flex-1">
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[56px]"
              style={{
                background:
                  "linear-gradient(0deg, #FFF 0%, rgba(255, 255, 255, 0) 100%)",
              }}
            />

            <div
              className="h-full overflow-y-auto scrollbar-hide px-[36px] pb-[24px] pt-[32px]"
            >
              {isReady ? (
                <div className="flex w-full flex-col items-start gap-[20px]">
                  <div className="flex w-full flex-col items-start gap-[4px]">
                    <div
                      className="aspect-square w-full rounded-[4px]"
                      style={{ backgroundColor: todayColor }}
                    />
                    <p
                      className="text-[24px] font-bold leading-[normal]"
                      style={{ color: accentColor }}
                    >
                      {todayColor}
                    </p>
                  </div>

                  {(keywords.length > 0 || colorComment) && (
                    <div className="flex w-full flex-col items-start justify-center gap-[12px] rounded-[4px] border border-solid border-[#E8EBF0] bg-[#F8F9FC] px-[16px] py-[20px]">
                      {keywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-[4px]">
                          {keywords.map((keyword) => (
                            <div
                              key={keyword}
                              className="flex items-center justify-center rounded-[100px] border border-solid border-[#AFB6C4] px-[8px] py-[4px]"
                            >
                              <p className="whitespace-nowrap text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-grey-80">
                                {keyword}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {colorComment && (
                        <p className="w-full text-[14px] font-normal leading-[1.45] tracking-[-0.35px] text-grey-80">
                          {colorComment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex w-full flex-col items-start gap-[4px]">
                  <div className="flex aspect-square w-full items-center justify-center rounded-[4px] bg-[#F6F8FA]">
                    <p className="whitespace-pre-line px-[24px] text-center text-[16px] font-medium text-grey-60">
                      {isPending
                        ? "오늘의 색을 만들고 있어요.\n잠시만 기다려주세요."
                        : reward.status === "FAILED"
                          ? "오늘은 색을 만드는 데 실패했어요.\n일기는 안전하게 저장됐어요."
                          : "색은 아직 준비되지 않았어요.\n홈에서 다시 확인해주세요."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-20 flex w-full shrink-0 justify-center bg-grey-0 px-[20px] pb-[30px] pt-[16px]">
            <button
              type="button"
              onClick={handleFinish}
              className="flex w-full max-w-[350px] cursor-pointer items-center justify-center rounded-[12px] px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-grey-0 text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] transition-opacity active:opacity-80"
              style={{ backgroundColor: accentColor }}
            >
              {isReview ? "일기 보러가기" : "완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
