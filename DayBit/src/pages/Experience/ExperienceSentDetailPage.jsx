import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import {
  getMyExperienceFragments,
  getExperienceFragmentFeedbacks,
  formatFragmentDate,
} from "../../utils/experienceFragments";

export default function ExperienceSentDetailPage() {
  const navigate = useNavigate();
  const { pieceId } = useParams();
  const location = useLocation();
  const [fragment, setFragment] = useState(location.state?.fragment ?? null);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    let alive = true;
    getExperienceFragmentFeedbacks(pieceId)
      .then((response) => {
        if (!alive) return;
        const result = response.data.result;
        setFeedbacks(Array.isArray(result) ? result : []);
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/experience-fragments/{shareId}/feedbacks 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, [pieceId]);

  useEffect(() => {
    if (fragment) return;
    let alive = true;
    getMyExperienceFragments()
      .then((response) => {
        if (!alive) return;
        const list = response.data.result ?? [];
        const found = list.find((f) => String(f.shareId) === String(pieceId));
        if (found) setFragment(found);
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/experience-fragments/mine 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, [fragment, pieceId]);

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#f6f8fa] px-[16px] py-[16px] scrollbar-hide">
      <div className="flex w-full flex-col items-start gap-[16px] pb-[16px]">
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="size-[32px] shrink-0 cursor-pointer"
          >
            <img
              src={backIcon}
              alt="뒤로가기"
              className="h-full w-full object-contain"
            />
          </button>
          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="size-[38px] shrink-0 cursor-pointer bg-transparent border-none p-0 transition-opacity active:opacity-60"
          >
            <img
              src={profileIcon}
              alt="프로필"
              className="h-full w-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
            />
          </button>
        </div>

        <p className="text-heading-28 whitespace-nowrap drop-shadow-[0px_0px_1px_rgba(0,0,0,0.05)] text-grey-80">
          {formatFragmentDate(fragment?.approvedAt ?? fragment?.createdAt)}
        </p>

        {fragment ? (
          <div className="flex w-full flex-col gap-[16px] rounded-[12px] bg-grey-0 px-[16px] py-[20px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
            {fragment.keywords?.length > 0 && (
              <div className="flex flex-wrap items-center gap-[4px]">
                {fragment.keywords.map((keyword) => (
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
            <p className="text-16 w-full text-grey-90">
              {fragment.anonymizedContent}
            </p>
          </div>
        ) : (
          <p className="text-16 w-full text-grey-60">
            경험조각을 불러오는 중이에요.
          </p>
        )}

        {feedbacks.length > 0 && (
          <div className="flex w-full flex-col items-start gap-[10px]">
            <p className="text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
              받은 반응
            </p>
            <div className="flex w-full flex-col items-start gap-[12px]">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.deliveryId}
                  className="w-full rounded-[12px] bg-grey-20 px-[16px] py-[10px]"
                >
                  <p className="text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                    {feedback.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
