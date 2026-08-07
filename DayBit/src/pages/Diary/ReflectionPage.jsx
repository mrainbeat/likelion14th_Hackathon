import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { fetchReflectionQuestion } from "./mocks/reflectionMock";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.png";
import bubbleTailSvg from "../../assets/icons/tail.svg";

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

export default function ReflectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dateStr } = useCurrentTime() || {};
  const useDiaryContent = location.state?.useDiaryContent ?? false;

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    let alive = true;
    fetchReflectionQuestion({ useDiaryContent }).then((data) => {
      if (!alive) return;
      setQuestion(data.question);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [useDiaryContent]);

  const handleBack = () => navigate(-1);

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleFinish = () => {
    localStorage.removeItem("diary_content");
    localStorage.removeItem("diary_questions");
    navigate("/diary", { replace: true });
  };

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

      <div className="absolute left-0 top-0 z-10 flex w-full flex-col gap-[12px] px-[20px] py-[16px]">
        <div className="flex w-full items-center justify-between">
          <button type="button" onClick={handleBack}>
            <img src={backIcon} alt="뒤로가기" className="size-[32px]" />
          </button>
          <div className="flex size-[38px] items-center justify-center rounded-full bg-white shadow-[0_0_9.938px_0_rgba(65,68,80,0.16)]">
            <img src={profileIcon} alt="프로필" className="size-[20px]" />
          </div>
        </div>
        <p className="text-[28px] font-bold tracking-[-0.56px] text-[#4F5563]">
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
        <div className="absolute inset-x-0 top-[164px] bottom-0 z-10 flex flex-col justify-between rounded-[12px] bg-white px-[36px] pb-[50px] pt-[36px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
          <div className="flex w-full flex-col items-start gap-[16px]">
            <div className="flex w-full flex-col items-start gap-[8px]">
              <div className="flex items-start gap-[6px]">
                <img
                  src={logoImage}
                  alt=""
                  className="h-[28px] w-[22px] object-cover"
                />
                <p className="text-[24px] font-bold tracking-[-0.48px] text-[#2D3038]">
                  성찰질문
                </p>
              </div>
              <p className="text-[14px] font-medium text-[#AFB6C4]">
                작성하지 않고 넘어가도 괜찮아요.
              </p>
            </div>

            <div className="relative flex w-full items-center gap-[10px] rounded-[12px] bg-[#858C9C] px-[16px] py-[10px]">
              <img
                src={bubbleTailSvg}
                alt=""
                className="pointer-events-none absolute left-[-4px] top-[-9px] h-[18.739px] w-[15.307px]"
              />
              <p className="flex-1 text-[16px] font-medium tracking-[-0.32px] text-white">
                {question}
              </p>
            </div>

            <textarea
              value={answer}
              onChange={handleAnswerChange}
              placeholder="답변을 입력해주세요"
              rows={1}
              className="w-full resize-none overflow-hidden rounded-[12px] bg-[#DFE2EA] px-[16px] py-[10px] text-[16px] font-medium tracking-[-0.32px] text-[#4F5563] placeholder:text-[#AFB6C4] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full rounded-[12px] bg-[#5F6473] px-[26px] py-[14px] text-[18px] font-semibold tracking-[-0.18px] text-white"
          >
            작성완료
          </button>
        </div>
      )}
    </div>
  );
}
