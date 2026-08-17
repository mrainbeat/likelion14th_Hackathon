import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FeedbackModal from "./components/FeedbackModal";
import CancelConfirmModal from "./components/CancelConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import {
  getMyExperienceFragments,
  getReceivedFragments,
  getExperienceFragmentReview,
  sendDeliveryFeedback,
  approveExperienceFragment,
  rejectExperienceFragment,
  formatFragmentDate,
  fragmentTopic,
  describeAutoApprove,
} from "../../utils/experienceFragments";

const TIME_PATTERN = /^(AM|PM)\s*\d{1,2}:\d{2}$/i;

function parseDiaryBlocks(content) {
  if (!content) return [];
  return content
    .split(/\n{2,}/)
    .map((block) => {
      const [first, ...rest] = block.split("\n");
      const head = first?.trim() ?? "";
      if (TIME_PATTERN.test(head)) {
        return { time: head, text: rest.join("\n").trim() };
      }
      return { time: "", text: block.trim() };
    })
    .filter((block) => block.time || block.text);
}

export default function ExperienceDiaryPage() {
  const navigate = useNavigate();
  const { pieceId } = useParams();
  const location = useLocation();
  const mode = location.state?.mode ?? "incoming";

  const [fragment, setFragment] = useState(() => {
    if (location.state?.fragment) return location.state.fragment;
    if (mode === "incoming") {
      return (
        getReceivedFragments().find(
          (f) => String(f.shareId) === String(pieceId),
        ) ?? null
      );
    }
    return null;
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [review, setReview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (fragment || mode === "incoming") return;
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
  }, [fragment, mode, pieceId]);

  // 원문은 발신자 본인만 볼 수 있어 검토 API로만 받아온다. 수신 화면에서는 절대 호출하지 않는다.
  useEffect(() => {
    if (mode !== "pending" || !fragment?.shareId) return;
    let alive = true;

    getExperienceFragmentReview(fragment.shareId)
      .then((response) => {
        if (alive) setReview(response.data.result ?? null);
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/experience-fragments/{shareId}/review 실패:",
          error.response?.status,
          error.response?.data,
        );
      });

    return () => {
      alive = false;
    };
  }, [mode, fragment?.shareId]);

  const handleDeliver = async () => {
    if (!fragment) return;
    setIsSubmitting(true);
    setActionError("");
    try {
      await approveExperienceFragment(fragment.shareId);
      navigate("/experience", { replace: true });
    } catch (error) {
      console.error(
        "POST /api/v1/experience-fragments/{shareId}/approve 실패:",
        error.response?.status,
        error.response?.data,
      );
      setActionError("전달에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelDelivery = async () => {
    if (!fragment) return;
    setIsSubmitting(true);
    try {
      await rejectExperienceFragment(fragment.shareId);
      setShowCancelConfirm(false);
      navigate("/experience", { replace: true });
    } catch (error) {
      console.error(
        "POST /api/v1/experience-fragments/{shareId}/reject 실패:",
        error.response?.status,
        error.response?.data,
      );
      setActionError("취소에 실패했어요. 잠시 후 다시 시도해주세요.");
      setShowCancelConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackComplete = async (content) => {
    if (!fragment?.deliveryId) {
      setShowFeedback(false);
      setActionError("이 조각에는 반응을 보낼 수 없어요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await sendDeliveryFeedback(fragment.deliveryId, content);
      setShowFeedback(false);
      navigate("/experience/gotten", { replace: true });
    } catch (error) {
      console.error(
        "POST /api/v1/experience-fragments/deliveries/{deliveryId}/feedback 실패:",
        error.response?.status,
        error.response?.data,
      );
      setShowFeedback(false);
      setActionError(
        error.response?.status === 409
          ? "이미 반응을 보낸 조각이에요."
          : "반응을 보내지 못했어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = mode === "pending";
  const isProcessing = isPending && fragment?.status === "REQUESTED";
  const dateSource = isPending
    ? fragment?.createdAt
    : (fragment?.receivedAt ?? fragment?.createdAt);
  const topic = fragmentTopic(review ?? fragment ?? {});
  const anonymizedContent =
    review?.anonymizedContent ?? fragment?.anonymizedContent ?? "";
  const blocks = showOriginal
    ? parseDiaryBlocks(review?.originalContent ?? "")
    : anonymizedContent
      ? [{ time: "", text: anonymizedContent }]
      : [];
  const autoApproveText =
    isPending && fragment?.status === "REVIEW_REQUIRED"
      ? describeAutoApprove(review?.reviewAvailableAt ?? fragment?.createdAt)
      : "";

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#f6f8fa] px-[16px] py-[16px] scrollbar-hide">
      <div className="flex w-full flex-col items-start gap-[16px] pb-[100px]">
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

        <div className="flex items-center gap-[8px]">
          <p className="text-heading-28 whitespace-nowrap drop-shadow-[0px_0px_1px_rgba(0,0,0,0.05)] text-grey-80">
            {formatFragmentDate(dateSource)}
          </p>
          {topic && (
            <span className="shrink-0 rounded-[8px] bg-grey-60 px-[6px] py-[2px] text-[14px] font-medium tracking-[-0.28px] text-grey-0">
              {topic}
            </span>
          )}
        </div>

        {!fragment ? (
          <p className="text-16 w-full text-grey-60">
            경험조각을 불러오는 중이에요.
          </p>
        ) : isProcessing ? (
          <div className="flex w-full flex-col items-start gap-[6px] rounded-[12px] bg-grey-0 px-[16px] py-[20px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
            <p className="text-16 w-full text-grey-70">
              익명화가 진행 중이에요. 잠시 후 다시 확인해주세요.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-[16px]">
            <div className="flex w-full flex-col gap-[26px] rounded-[12px] bg-grey-0 px-[16px] py-[20px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
              {isPending && review?.originalContent && (
                <button
                  type="button"
                  onClick={() => setShowOriginal((prev) => !prev)}
                  className="shrink-0 self-start rounded-[12px] border-[1.5px] border-solid border-grey-60 bg-grey-0 px-[16px] py-[10px] text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-grey-95"
                >
                  {showOriginal ? "익명화보기" : "원문보기"}
                </button>
              )}

              {blocks.length === 0 ? (
                <p className="text-16 w-full text-grey-60">
                  표시할 내용이 없어요.
                </p>
              ) : (
                blocks.map((block, i) => (
                  <div
                    key={i}
                    className="flex w-full flex-col items-start gap-[6px]"
                  >
                    {block.time && (
                      <p className="whitespace-nowrap text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                        {block.time}
                      </p>
                    )}
                    <p className="text-16 w-full whitespace-pre-wrap break-words text-grey-90">
                      {block.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {autoApproveText && (
              <p className="w-full text-[14px] font-medium tracking-[-0.28px] text-grey-60">
                자동 전달까지 {autoApproveText}. 그전까지 전달을 취소할 수
                있어요.
              </p>
            )}
          </div>
        )}

        {actionError && (
          <p className="w-full text-center text-[14px] font-medium text-red-500">
            {actionError}
          </p>
        )}
      </div>

      {isPending && fragment?.status === "REVIEW_REQUIRED" && (
        <div className="absolute inset-x-0 bottom-0 flex w-full items-center gap-[16px] bg-[#f6f8fa] px-[16px] pb-[30px] pt-[16px]">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 h-[49px] rounded-[12px] border-[1.5px] border-grey-60 bg-grey-0 text-[18px] font-semibold tracking-[-0.18px] text-grey-80 disabled:opacity-50"
          >
            전달 취소하기
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleDeliver}
            className="flex-1 h-[49px] rounded-[12px] bg-grey-70 text-[18px] font-semibold tracking-[-0.18px] text-grey-0 disabled:opacity-50"
          >
            전달하기
          </button>
        </div>
      )}

      {mode === "incoming" && fragment && (
        <div className="absolute inset-x-0 bottom-0 flex w-full bg-[#f6f8fa] px-[16px] pb-[30px] pt-[16px]">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowFeedback(true)}
            className="h-[49px] w-full rounded-[12px] bg-grey-70 text-[18px] font-semibold tracking-[-0.36px] text-grey-0 disabled:opacity-50"
          >
            반응 보내기
          </button>
        </div>
      )}

      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          onComplete={handleFeedbackComplete}
        />
      )}

      {showCancelConfirm && (
        <CancelConfirmModal
          onKeepSharing={() => setShowCancelConfirm(false)}
          onCancelDelivery={handleCancelDelivery}
        />
      )}
    </div>
  );
}
