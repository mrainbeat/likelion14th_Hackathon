import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import apiClient from "../../api/apiClient";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.png";

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

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const FALLBACK_COLOR = "#858C9C";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;

export default function TodayColorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dateStr } = useCurrentTime() || {};

  const diaryId = location.state?.diaryId ?? null;
  const [reward, setReward] = useState(location.state?.reward ?? null);

  const isPending = reward?.status === "PENDING";
  const isReady = reward?.status === "COMPLETED" && reward?.colorHex;
  const color = isReady ? reward.colorHex : FALLBACK_COLOR;

  // 성찰질문 페이지를 거치지 않고 직접 접근한 경우
  useEffect(() => {
    if (!reward) navigate("/diary", { replace: true });
  }, [reward, navigate]);

  useEffect(() => {
    if (!isPending || !diaryId) return;

    let alive = true;
    let timer;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const response = await apiClient.get(`/api/v1/diaries/${diaryId}`);
        const nextReward = response.data.result?.reward;
        if (!alive) return;
        if (nextReward && nextReward.status !== "PENDING") {
          setReward(nextReward);
          return;
        }
      } catch (error) {
        console.error(
          "GET /api/v1/diaries/{diaryId} 실패:",
          error.response?.status,
          error.response?.data,
        );
      }

      if (!alive) return;
      if (attempts >= MAX_POLL_ATTEMPTS) {
        setReward((prev) => ({ ...prev, status: "FAILED" }));
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [isPending, diaryId]);

  const handleBack = () => navigate("/diary", { replace: true });
  const handleFinish = () => navigate("/home", { replace: true });

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
      </div>

      <div className="absolute left-0 top-0 z-10 flex w-full flex-col gap-[12px] px-[20px] py-[16px]">
        <div className="flex w-full items-center justify-between">
          <button type="button" onClick={handleBack}>
            <img src={backIcon} alt="뒤로가기" className="size-[32px]" />
          </button>
          <button className="w-[38px] h-[38px] shrink-0 cursor-pointer bg-transparent border-none p-0">
            <img
              src={profileIcon}
              alt="프로필"
              className="w-full h-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
            />
          </button>
        </div>
        <p
          className="text-[28px] font-bold tracking-[-0.56px]"
          style={{ color: isReady ? color : "#4F5563" }}
        >
          {dateStr}
        </p>
      </div>

      <div
        className="absolute inset-x-0 top-[164px] bottom-0 z-10 flex flex-col justify-between overflow-hidden rounded-[12px] bg-grey-0 px-[36px] pb-[50px] pt-[36px]"
        style={{
          boxShadow: `0 0 10px 0 ${hexToRgba(color, 0.05)}, 0 0 30px 0 ${hexToRgba(color, 0.05)}`,
        }}
      >
        <div
          className="pointer-events-none absolute rounded-[50%]"
          style={{
            left: 86,
            top: 44,
            width: 473,
            height: 573,
            backgroundColor: hexToRgba(color, 0.15),
            filter: "blur(80px)",
          }}
        />
        <div
          className="pointer-events-none absolute rounded-[50%]"
          style={{
            left: -199,
            top: 302,
            width: 473,
            height: 573,
            backgroundColor: hexToRgba(color, 0.15),
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 flex w-full items-center gap-[6px]">
          <img
            src={logoImage}
            alt=""
            className="h-[28px] w-[22px] object-cover"
          />
          <p className="text-[24px] font-bold tracking-[-0.48px] text-grey-80">
            오늘의 색
          </p>
        </div>

        {isPending ? (
          <div className="relative z-10 flex w-full flex-col items-start gap-[6px]">
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-[12px] bg-[#F6F8FA]">
              <img
                src={logoImage}
                alt="DAYBIT"
                className="h-[62px] w-[49px] object-cover"
              />
              <p className="text-[16px] font-semibold text-grey-60">생성중..</p>
            </div>
          </div>
        ) : isReady ? (
          <div className="relative z-10 flex w-full flex-col items-start gap-[6px]">
            <div
              className="aspect-square w-full"
              style={{ backgroundColor: color }}
            />
            {reward.colorName && (
              <p className="text-[16px] font-semibold text-grey-80">
                {reward.colorName}
              </p>
            )}
            <p className="text-[24px] font-bold" style={{ color }}>
              {color}
            </p>
          </div>
        ) : (
          <div className="relative z-10 flex w-full flex-col items-start gap-[6px]">
            <div className="flex aspect-square w-full items-center justify-center bg-[#F6F8FA]">
              <p className="px-[24px] text-center text-[16px] font-medium text-grey-60">
                오늘은 색을 만드는 데 실패했어요.
                <br />
                일기는 안전하게 저장됐어요.
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleFinish}
          className="relative z-10 w-[350px] max-w-full self-center rounded-[12px] px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.18px] text-grey-0"
          style={{ backgroundColor: color }}
        >
          완료
        </button>
      </div>
    </div>
  );
}
