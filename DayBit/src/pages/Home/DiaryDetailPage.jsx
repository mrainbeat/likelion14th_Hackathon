import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import apiClient from "../../api/apiClient";
import DiaryOptionsMenu from "./components/DiaryOptionsMenu";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import HideConfirmModal from "./components/HideConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import kebabIcon from "../../assets/icons/menu.svg";
import LogoSymbol from "../../assets/icons/LogoSymbol.jsx";

const FALLBACK_COLOR = "#4F5563";

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
function formatCommentDate(iso) {
  if (!iso) return "";
  const [datePart] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return `${String(y).slice(2)}년 ${m}월 ${d}일`;
}

function todayLabel() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year.slice(2)}년 ${Number(map.month)}월 ${Number(map.day)}일`;
}

export default function DiaryDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { diaryId } = useParams();
  const fromMonth = location.state?.fromMonth ?? null;

  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHideConfirm, setShowHideConfirm] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const commentInputRef = useRef(null);
  useEffect(() => {
    let alive = true;
    apiClient
      .get(`/api/v1/diaries/${diaryId}`)
      .then((response) => {
        if (!alive) return;
        setDiary(response.data.result ?? null);
      })
      .catch((error) => {
        if (!alive) return;
        setErrorMessage("일기를 불러오지 못했어요.");
        console.error(
          "GET /api/v1/diaries/{diaryId} 실패:",
          error.response?.status,
          error.response?.data,
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [diaryId]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await apiClient.get(
        `/api/v1/diaries/${diaryId}/comments`,
      );
      setComments(response.data.result ?? []);
    } catch (error) {
      console.error(
        "GET /api/v1/diaries/{diaryId}/comments 실패:",
        error.response?.status,
        error.response?.data,
      );
    }
  }, [diaryId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const submitComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentError("");
    try {
      await apiClient.post(`/api/v1/diaries/${diaryId}/comments`, {
        content: trimmed,
      });
      setCommentText("");
      if (commentInputRef.current)
        commentInputRef.current.style.height = "auto";
      await fetchComments();
    } catch (error) {
      setCommentError("추가 기록을 남기지 못했어요. 다시 시도해주세요.");
      console.error(
        "POST /api/v1/diaries/{diaryId}/comments 실패:",
        error.response?.status,
        error.response?.data,
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submitComment();
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);

    try {
      await apiClient.delete(`/api/v1/diaries/${diaryId}`);
      navigate(-1);
    } catch (error) {
      alert("일기를 삭제하지 못했어요. 다시 시도해주세요.");
      console.error(
        "DELETE /api/v1/diaries/{diaryId} 실패:",
        error.response?.status,
        error.response?.data,
      );
    }
  };

  const handleHideConfirmed = async () => {
    setShowHideConfirm(false);
    try {
      await apiClient.patch(`/api/v1/diaries/${diaryId}/hide`);
      navigate(-1);
    } catch (error) {
      alert("일기를 숨기지 못했어요. 다시 시도해주세요.");
      console.error(
        "PATCH /api/v1/diaries/{diaryId}/hide 실패:",
        error.response?.status,
        error.response?.data,
      );
    }
  };

  const handleHide = async () => {
    setShowMenu(false);
    try {
      await apiClient.patch(`/api/v1/diaries/${diaryId}/hide`);
      navigate(-1);
    } catch (error) {
      alert("일기를 숨기지 못했어요. 다시 시도해주세요.");
      console.error(
        "PATCH /api/v1/diaries/{diaryId}/hide 실패:",
        error.response?.status,
        error.response?.data,
      );
    }
  };

  const colorHex = diary?.reward?.colorHex;
  const color = colorHex || FALLBACK_COLOR;
  const blocks = parseDiaryBlocks(diary?.content);
  const reflection = diary?.reflectionQuestion ?? diary?.reflection ?? null;
  const reflectionQuestion = reflection?.questionText ?? "";
  const reflectionAnswer =
    reflection?.answerText ?? diary?.reflectionAnswer?.answerText ?? "";
  const [, month, day] = diary?.recordedDate?.split("-").map(Number) ?? [];

  return (
    <div className="relative flex h-full w-full select-none flex-col gap-[16px] overflow-y-auto bg-[#f6f8fa] px-[20px] py-[16px] scrollbar-hide">
      {" "}
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() =>
            fromMonth
              ? navigate("/home", { state: { viewMonth: fromMonth } })
              : navigate(-1)
          }
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
          className="size-[38px] shrink-0 cursor-pointer rounded-full border-none bg-transparent p-0 transition-opacity active:opacity-60"
          style={{
            filter: `drop-shadow(0 0 9.938px ${hexToRgba(color, 0.16)})`,
          }}
        >
          <img
            src={profileIcon}
            alt="프로필"
            className="h-full w-full object-contain"
          />
        </button>
      </div>
      {loading ? (
        <p className="text-center text-[16px] font-medium text-grey-60">
          불러오는 중...
        </p>
      ) : errorMessage ? (
        <p className="text-center text-[16px] font-medium text-grey-60">
          {errorMessage}
        </p>
      ) : (
        <>
          <div className="mt-[8px] flex w-full items-center justify-between">
            <p
              className="text-heading-28 whitespace-nowrap drop-shadow-[0px_0px_1px_rgba(0,0,0,0.05)]"
              style={{ color }}
            >
              {month}월 {day}일
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className="flex size-[16px] cursor-pointer items-center justify-center"
              >
                <img src={kebabIcon} alt="더보기" className="h-full w-full" />
              </button>
              {showMenu && (
                <DiaryOptionsMenu
                  onClose={() => setShowMenu(false)}
                  onHide={() => {
                    setShowMenu(false);
                    setShowHideConfirm(true);
                  }}
                  onDelete={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-[24px] pb-[250px]">
            <div
              className="flex w-full flex-col gap-[26px] rounded-[12px] bg-grey-0 px-[16px] py-[20px]"
              style={{
                boxShadow: `0 0 5px 0 ${hexToRgba(color, 0.05)}, 0 0 15px 0 ${hexToRgba(color, 0.05)}`,
              }}
            >
              {blocks.map((block, i) => (
                <div
                  key={i}
                  className="flex w-full flex-col items-start gap-[6px]"
                >
                  {block.time && (
                    <p className="whitespace-nowrap text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                      {block.time}
                    </p>
                  )}
                  {block.text && (
                    <p className="text-16 w-full whitespace-pre-wrap break-words text-grey-90">
                      {block.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex w-full flex-col items-start gap-[8px]">
              <p className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
                나의 반응
              </p>

              <div className="flex w-full flex-col items-start gap-[4px]">
                <div className="flex w-full flex-col items-start gap-[4px]">
                  <div className="flex w-full items-center rounded-bl-[12px] rounded-br-[12px] rounded-tl-[12px] border border-solid border-[#DFE2EA] bg-[#EFF1F6] px-[16px] py-[10px]">
                    <textarea
                      ref={commentInputRef}
                      value={commentText}
                      onChange={handleCommentChange}
                      onKeyDown={handleCommentKeyDown}
                      placeholder="반응 추가하기"
                      rows={1}
                      maxLength={2000}
                      disabled={isSubmittingComment}
                      className="min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-[16px] font-normal leading-[26px] tracking-[-0.32px] text-grey-90 placeholder:text-grey-60 focus:outline-none"
                    />
                  </div>
                  <p className="whitespace-nowrap text-[12px] font-normal tracking-[-0.12px] text-grey-60">
                    {todayLabel()}
                  </p>
                </div>

                {[...comments].reverse().map((comment) => (
                  <div
                    key={comment.commentId}
                    className="flex w-full flex-col items-start gap-[4px]"
                  >
                    <div className="flex w-full items-center rounded-bl-[12px] rounded-br-[12px] rounded-tl-[12px] border border-solid border-[#DFE2EA] bg-[#EFF1F6] px-[16px] py-[10px]">
                      <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[16px] font-normal leading-[26px] tracking-[-0.32px] text-grey-90">
                        {comment.content}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-[12px] font-normal tracking-[-0.12px] text-grey-60">
                      {formatCommentDate(comment.createdAt)}
                    </p>
                  </div>
                ))}

                {commentError && (
                  <p className="text-[13px] font-medium text-red-500">
                    {commentError}
                  </p>
                )}
              </div>
            </div>
            {reflectionQuestion && (
              <div className="flex w-full flex-col items-start gap-[16px]">
                <div className="flex items-end gap-[6px]">
                  <LogoSymbol
                    dotColor={color}
                    className="h-[27.872px] w-[22px] shrink-0"
                  />
                  <p className="whitespace-nowrap text-[24px] font-bold leading-[normal] tracking-[-0.48px] text-grey-90">
                    성찰질문
                  </p>
                </div>

                <div className="flex w-full flex-col items-start gap-[12px]">
                  <div className="flex w-full items-center rounded-bl-[12px] rounded-br-[12px] rounded-tr-[12px] bg-grey-60 px-[16px] py-[10px]">
                    <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-0">
                      {reflectionQuestion}
                    </p>
                  </div>

                  {reflectionAnswer && (
                    <div className="flex w-full items-center rounded-bl-[12px] rounded-br-[12px] rounded-tl-[12px] border border-solid border-grey-30 bg-[#EFF1F6] px-[16px] py-[10px]">
                      <p className="text-16 min-w-0 flex-1 whitespace-pre-wrap break-words text-grey-90">
                        {reflectionAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          month={month}
          day={day}
          onCancel={() => setShowDeleteConfirm(false)}
          onDelete={handleDelete}
        />
      )}
      {showHideConfirm && (
        <HideConfirmModal
          month={month}
          day={day}
          onCancel={() => setShowHideConfirm(false)}
          onConfirm={handleHideConfirmed}
        />
      )}
    </div>
  );
}
