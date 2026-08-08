import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { fetchTodayColor } from "./mocks/todayColorMock";
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

export default function TodayColorPage() {
  const navigate = useNavigate();
  const { dateStr } = useCurrentTime() || {};

  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState("#00DEAD");

  useEffect(() => {
    let alive = true;
    fetchTodayColor().then((data) => {
      if (!alive) return;
      setColor(data.color);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleBack = () => navigate(-1);
  const handleFinish = () => navigate("/diary", { replace: true });

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
          <div
            className="flex size-[38px] items-center justify-center rounded-full bg-white"
            style={{
              boxShadow: loading
                ? "0 0 9.938px 0 rgba(65,68,80,0.16)"
                : `0 0 9.938px 0 ${hexToRgba(color, 0.16)}`,
            }}
          >
            <img src={profileIcon} alt="프로필" className="size-[20px]" />
          </div>
        </div>
        <p
          className="text-[28px] font-bold tracking-[-0.56px]"
          style={{ color: loading ? "#4F5563" : color }}
        >
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
          <p className="text-[20px] font-semibold tracking-[-0.4px] text-[#2D3038]">
            생성중..
          </p>
        </div>
      ) : (
        <div
          className="absolute inset-x-0 top-[164px] bottom-0 z-10 flex flex-col justify-between overflow-hidden rounded-[12px] bg-white px-[36px] pb-[50px] pt-[36px]"
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
            <p className="text-[24px] font-bold tracking-[-0.48px] text-[#4F5563]">
              오늘의 색
            </p>
          </div>

          <div className="relative z-10 flex w-full flex-col items-start gap-[6px]">
            <div
              className="aspect-square w-full"
              style={{ backgroundColor: color }}
            />
            <p className="text-[24px] font-bold" style={{ color }}>
              {color}
            </p>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="relative z-10 w-[350px] max-w-full self-center rounded-[12px] px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.18px] text-white"
            style={{ backgroundColor: color }}
          >
            완료
          </button>
        </div>
      )}
    </div>
  );
}
