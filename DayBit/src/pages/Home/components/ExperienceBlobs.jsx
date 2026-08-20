import blob1 from "../../../assets/images/experience-blob-1.svg";
import blob2 from "../../../assets/images/experience-blob-2.svg";

const BLUR_SPREAD = 88.1;

const CYCLE_MS = 8400;
const BACK_EASE = "cubic-bezier(0.68, -0.55, 0.265, 1.55)"; // Ease in and out back

export default function ExperienceBlobs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]"
    >
      <div
        className="absolute left-[75px] top-[60px] h-[116px] w-[156px]"
        style={{ animation: `experience-blob-1 ${CYCLE_MS}ms infinite` }}
      >
        <div className="absolute" style={{ inset: `-${BLUR_SPREAD}px` }}>
          <img src={blob1} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>

      <div
        className="absolute left-[284px] top-[-14px] h-[88.458px] w-[88.373px] opacity-60"
        style={{ animation: `experience-blob-2 ${CYCLE_MS}ms infinite` }}
      >
        <div className="absolute" style={{ inset: `-${BLUR_SPREAD}px` }}>
          <img src={blob2} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>

      <style>{`
        @keyframes experience-blob-1 {
          0%      { transform: translate(0px, 0px);    animation-timing-function: linear; }
          9.524%  { transform: translate(0px, 0px);    animation-timing-function: ${BACK_EASE}; }
          33.333% { transform: translate(51px, 9px);   animation-timing-function: linear; }
          42.857% { transform: translate(51px, 9px);   animation-timing-function: ${BACK_EASE}; }
          66.667% { transform: translate(18px, -26px); animation-timing-function: linear; }
          76.19%  { transform: translate(18px, -26px); animation-timing-function: ${BACK_EASE}; }
          100%    { transform: translate(0px, 0px); }
        }
        @keyframes experience-blob-2 {
          0%      { transform: translate(0px, 0px);      animation-timing-function: linear; }
          9.524%  { transform: translate(0px, 0px);      animation-timing-function: ${BACK_EASE}; }
          33.333% { transform: translate(-290px, 37px);  animation-timing-function: linear; }
          42.857% { transform: translate(-290px, 37px);  animation-timing-function: ${BACK_EASE}; }
          66.667% { transform: translate(-53px, 137px);  animation-timing-function: linear; }
          76.19%  { transform: translate(-53px, 137px);  animation-timing-function: ${BACK_EASE}; }
          100%    { transform: translate(0px, 0px); }
        }
      `}</style>
    </div>
  );
}
