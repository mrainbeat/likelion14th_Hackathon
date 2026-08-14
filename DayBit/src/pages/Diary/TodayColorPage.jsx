import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import {
  getOnPageTextColor,
  getTodayColorPalette,
  hexToRgba,
} from "../../utils/rewardColor";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
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

  const reward = location.state?.reward ?? null;

  const isPending = reward?.status === "PENDING";
  const isReady = reward?.status === "COMPLETED" && reward?.colorHex;
  const rawColor = isReady ? reward.colorHex : FALLBACK_COLOR;
  // 받은 색은 그대로 칠하고, 버튼·굵은 글자만 안 읽힐 때 진한 동계열로 바꿈.
  // 그림자·번짐은 같은 색상의 옅은 소프트 컬러를 씀
  const palette = isReady ? getTodayColorPalette(rawColor) : null;
  // 날짜·색코드·키워드는 흰 배경(페이지/카드) 위라 mainTextColor를 그대로 못 씀
  const textColor = palette ? getOnPageTextColor(palette) : "#4F5563";
  const buttonTextColor = palette ? palette.mainTextColor : "#FFFFFF";
  const glowColor = palette ? palette.softColor : FALLBACK_COLOR;
  const keywords = reward?.keywords ?? [];

  // 성찰질문 페이지를 거치지 않고 직접 접근한 경우
  useEffect(() => {
    if (!reward) navigate("/diary", { replace: true });
  }, [reward, navigate]);

  const handleBack = () => navigate("/diary", { replace: true });
  const handleFinish = () => navigate("/home", { replace: true });

  if (!reward) return null;

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#F6F8FA]">
      <div className="pointer-none absolute inset-0 overflow-hidden">
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
              className="w-full h-full object-contain"
              style={{
                filter: `drop-shadow(0 0 9.938px ${hexToRgba(glowColor, 0.16)})`,
              }}
            />
          </button>
        </div>
        <p
          className="text-[28px] font-bold tracking-[-0.56px]"
          style={{ color: textColor }}
        >
          {dateStr}
        </p>
      </div>

      <div className="absolute inset-x-0 top-[115px] bottom-0 z-10">
        {/* box-shadow에 큰 blur를 그대로 쓰면 저알파 구간에서 계단현상(밴딩)이 보여서,
            카드 뒤에 같은 색 판을 깔고 filter: blur()로 흐리는 방식으로 대체함 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[12px]"
          style={{ backgroundColor: hexToRgba(glowColor, 0.15), filter: "blur(20px)" }}
        />
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[12px] bg-grey-0 px-[20px] pb-[50px] pt-[36px]">
          <div
            className="pointer-events-none absolute rounded-[50%]"
            style={{
              left: 86,
              top: 44,
              width: 473,
              height: 573,
              backgroundColor: hexToRgba(glowColor, 0.1),
              filter: "blur(81px)",
            }}
          />
          <div
            className="pointer-events-none absolute rounded-[50%]"
            style={{
              left: -199,
              top: 302,
              width: 473,
              height: 573,
              backgroundColor: hexToRgba(glowColor, 0.1),
              filter: "blur(81px)",
            }}
          />

          <div className="relative z-10 flex w-full items-start gap-[6px]">
          <img
            src={logoImage}
            alt=""
            className="h-[28px] w-[22px] shrink-0 object-cover"
          />
          <p className="text-[24px] font-bold tracking-[-0.48px] text-grey-80">
            오늘의 색
          </p>
        </div>

        {isReady ? (
          <div className="relative z-10 flex w-full flex-col items-start gap-[6px] px-[16px]">
            <div
              className="aspect-square w-full"
              style={{ backgroundColor: rawColor }}
            />
            <p className="text-[24px] font-bold" style={{ color: textColor }}>
              {rawColor}
            </p>
            {keywords.length > 0 && (
              <div
                className="flex items-center gap-[10px] text-[16px] font-semibold"
                style={{ color: textColor }}
              >
                {keywords.map((keyword) => (
                  <p key={keyword}>{keyword}</p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 flex w-full flex-col items-start gap-[6px] px-[16px]">
            <div className="flex aspect-square w-full items-center justify-center bg-[#F6F8FA]">
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

          <button
            type="button"
            onClick={handleFinish}
            className="relative z-10 w-[350px] max-w-full self-center rounded-[12px] px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.18px]"
            style={{ backgroundColor: rawColor, color: buttonTextColor }}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
