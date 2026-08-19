import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import {
  getWeeklyRewardDetail,
  markWeeklyRewardViewed,
  getCachedWeeklyRewardDetail,
  saveCachedWeeklyRewardDetail,
} from "../../utils/weeklyRewards";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import LogoSymbol from "../../assets/icons/LogoSymbol.jsx";
import WeeklyImagePreviewModal from "./components/WeeklyImagePreviewModal";

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

const POLL_INTERVAL_MS = 4000;
const ACCENT_COLOR = "#4F5563";

export default function WeeklyImagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { weeklyRewardId } = useParams();
  const fromMonth = location.state?.fromMonth ?? null;
  const [reward, setReward] = useState(() =>
    getCachedWeeklyRewardDetail(weeklyRewardId),
  );
  const [errorText, setErrorText] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const pollRef = useRef(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    let alive = true;

    const fetchDetail = async () => {
      try {
        const response = await getWeeklyRewardDetail(weeklyRewardId);
        if (!alive) return;
        const result = response.data.result;
        setReward(result);
        saveCachedWeeklyRewardDetail(weeklyRewardId, result);
        console.log({
          categoryKeyword: result.categoryKeyword,
          imageSource: result.imageSource,
          status: result.status,
        });

        if (result.status === "PENDING" || result.status === "GENERATING") {
          pollRef.current = setTimeout(fetchDetail, POLL_INTERVAL_MS);
        } else if (
          result.status === "COMPLETED" &&
          result.available &&
          !result.viewed &&
          !viewedRef.current
        ) {
          viewedRef.current = true;
          markWeeklyRewardViewed(
            result.weeklyRewardId ?? Number(weeklyRewardId),
          ).catch((error) => {
            if (error.response?.data?.code === "WEEKLY_REWARD409") return;
            console.error(
              "PATCH /api/v1/weekly-rewards/{weeklyRewardId}/view 실패:",
              error.response?.status,
              error.response?.data,
            );
          });
        }
      } catch (error) {
        if (!alive) return;
        if (error.response?.data?.code === "WEEKLY_REWARD404") {
          setErrorText("존재하지 않는 주간 이미지예요.");
        } else {
          setErrorText("주간 이미지를 불러오지 못했어요. 다시 시도해주세요.");
        }
        console.error(
          "GET /api/v1/weekly-rewards/{weeklyRewardId} 실패:",
          error.response?.status,
          error.response?.data,
        );
      }
    };

    fetchDetail();

    return () => {
      alive = false;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [weeklyRewardId]);

  const handleImageError = async () => {
    try {
      const response = await apiClient.get(
        `/api/v1/weekly-rewards/${weeklyRewardId}`,
      );
      setReward(response.data.result);
    } catch (error) {
      console.error(
        "GET /api/v1/weekly-rewards/{weeklyRewardId} 실패:",
        error.response?.status,
        error.response?.data,
      );
    }
  };

  const goHome = () =>
    navigate("/home", fromMonth ? { state: { viewMonth: fromMonth } } : {});
  const handleBack = goHome;
  const handleFinish = goHome;

  const isReady = reward?.status === "COMPLETED" && reward?.available;
  const extraKeywords = (reward?.keywords ?? []).filter(
    (keyword) => keyword !== reward?.categoryKeyword,
  );
  const isPending =
    reward?.status === "PENDING" || reward?.status === "GENERATING";

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BLOBS.map(({ cx, cy, w, h, rotate, blur, color }, i) => (
          <div
            key={i}
            className="absolute rounded-[50%]"
            style={{
              left: cx - w / 2,
              top: cy - h / 2,
              width: w,
              height: h,
              backgroundColor: color,
              transform: `rotate(${rotate}deg)`,
              filter: `blur(${blur}px)`,
            }}
          />
        ))}
      </div>

      <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between px-[16px] py-[16px]">
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
            className="h-full w-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
          />
        </button>
      </div>

      {errorText ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[24px] px-[36px]">
          <p className="text-center text-[18px] font-semibold tracking-[-0.36px] text-grey-80">
            {errorText}
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="w-full cursor-pointer rounded-[12px] bg-grey-70 px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
          >
            돌아가기
          </button>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 top-[65px] z-10 flex flex-col overflow-hidden rounded-t-[12px] bg-grey-0 shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <div className="relative z-10 flex w-full shrink-0 items-start gap-[6px] px-[16px] pb-[32px] pt-[32px]">
            <LogoSymbol
              dotColor={ACCENT_COLOR}
              className="h-[27.872px] w-[22px] shrink-0"
            />
            <p className="text-[24px] font-bold leading-[normal] tracking-[-0.48px] text-grey-80">
              주간 이미지
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

            <div className="h-full overflow-y-auto scrollbar-hide px-[16px] pb-[56px] pt-0">
              {isReady ? (
                <div className="flex w-full flex-col items-start gap-[20px]">
                  <div className="flex w-full flex-col items-start gap-[4px]">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="w-full cursor-pointer border-none bg-transparent p-0"
                    >
                      <img
                        src={reward.imageUrl}
                        alt=""
                        onError={handleImageError}
                        className="w-full rounded-[4px]"
                      />
                    </button>
                    {reward.dailyColors?.length > 0 && (
                      <div className="flex flex-wrap items-start gap-[4px]">
                        {reward.dailyColors.map((day) => (
                          <div
                            key={day.recordedDate}
                            className="h-[19px] w-[20px] shrink-0 rounded-[2px]"
                            style={{ backgroundColor: day.colorHex }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {reward.title && (
                    <p className="text-[20px] font-bold leading-[normal] tracking-[-0.4px] text-grey-90">
                      {reward.title}
                    </p>
                  )}

                  {(reward.categoryKeyword ||
                    extraKeywords.length > 0 ||
                    reward.summary) && (
                    <div className="flex w-full flex-col items-start justify-center gap-[12px] rounded-[4px] border border-solid border-[#E8EBF0] bg-[#F8F9FC] px-[16px] py-[20px]">
                      {reward.categoryKeyword && (
                        <div className="flex items-center justify-center rounded-[100px] border border-solid border-[#AFB6C4] px-[8px] py-[4px]">
                          <p className="whitespace-nowrap text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-grey-80">
                            {reward.categoryKeyword}
                          </p>
                        </div>
                      )}
                      {extraKeywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-[4px]">
                          {extraKeywords.map((keyword) => (
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
                      {reward.summary && (
                        <p className="w-full text-[14px] font-normal leading-[1.45] tracking-[-0.35px] text-grey-80">
                          {reward.summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex w-full flex-col items-center justify-center gap-[17px] py-[80px]">
                  <p className="whitespace-pre-line px-[24px] text-center text-[16px] font-medium text-grey-60">
                    {isPending
                      ? "주간 이미지를 만들고 있어요.\n잠시만 기다려주세요."
                      : reward?.status === "FAILED"
                        ? "주간 이미지 생성에 실패했어요.\n잠시 후 다시 확인해주세요."
                        : "아직 주간 이미지가 없어요."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-20 flex w-full shrink-0 justify-center bg-grey-0 px-[16px] pb-[30px] pt-[16px]">
            <button
              type="button"
              onClick={handleFinish}
              className="flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-[12px] bg-[#4F5563] px-[26px] py-[14px] text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-white text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] transition-opacity active:opacity-80"
            >
              완료
            </button>
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <WeeklyImagePreviewModal
          imageUrl={reward.imageUrl}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
