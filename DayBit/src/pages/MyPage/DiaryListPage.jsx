import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import DiaryOptionsMenu from "../Home/components/DiaryOptionsMenu";
import DeleteConfirmModal from "../Home/components/DeleteConfirmModal";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import kebabIcon from "../../assets/icons/menu.svg";

const ROW_DIVIDER_GRADIENT =
  "linear-gradient(90deg, rgba(205, 209, 218, 0.00) 0%, #CDD1DA 15%, #CDD1DA 84.62%, rgba(205, 209, 218, 0.00) 100%)";
const TIME_PATTERN = /^\[?(AM|PM)\s*\d{1,2}:\d{2}\]?$/i;

function firstBlock(content) {
  if (!content) return { time: "", text: "" };
  const [firstLine, ...rest] = content.split("\n");
  const head = firstLine?.trim() ?? "";
  if (TIME_PATTERN.test(head)) {
    return { time: head, text: rest.join(" ").trim() };
  }
  return { time: "", text: content.split("\n").join(" ").trim() };
}

function ChevronLeft({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M15 6l-6 6 6 6"
        stroke="#2D3038"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 6l6 6-6 6"
        stroke="#2D3038"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDateLabel(recordedDate) {
  const [, month, day] = recordedDate.split("-").map(Number);
  return `${month}월 ${day}일`;
}

export default function DiaryListPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDiaries = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await apiClient.get("/api/v1/diaries", {
        params: { year, month },
      });
      const items = res.data?.result ?? [];

      const merged = items
        .map((item) => {
          const { time, text } = firstBlock(item.content);
          return {
            diaryId: item.diaryId,
            recordedDate: item.recordedDate,
            body: text,
            time,
          };
        })
        .sort((a, b) => (a.recordedDate < b.recordedDate ? -1 : 1));

      setEntries(merged);
    } catch (err) {
      setErrorMessage("일기 목록을 불러오지 못했어요.");
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    const { diaryId } = deleteTarget;
    setDeleteTarget(null);
    try {
      await apiClient.delete(`/api/v1/diaries/${diaryId}`);
      setEntries((prev) => prev.filter((entry) => entry.diaryId !== diaryId));
    } catch (error) {
      alert("일기를 삭제하지 못했어요. 다시 시도해주세요.");
      console.error(
        "DELETE /api/v1/diaries/{diaryId} 실패:",
        error.response?.status,
        error.response?.data,
      );
    }
  };

  return (
    <div className="flex h-full w-full select-none flex-col gap-[24px] overflow-y-auto bg-[#F6F8FA] p-[16px] scrollbar-hide">
      <div className="flex w-full shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="size-[32px] shrink-0 cursor-pointer bg-transparent p-0 transition-opacity active:opacity-60"
        >
          <img src={backIcon} alt="뒤로가기" className="h-full w-full" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/mypage")}
          className="size-[38px] shrink-0 cursor-pointer rounded-full border-none bg-transparent p-0 transition-opacity active:opacity-60"
        >
          <img
            src={profileIcon}
            alt="프로필"
            className="h-full w-full rounded-full object-contain"
            style={{
              filter: "drop-shadow(0 0 9.938px rgba(65, 68, 80, 0.16))",
            }}
          />
        </button>
      </div>

      <div className="flex w-full flex-col items-start gap-[18px]">
        <div className="flex w-full flex-col items-center">
          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="size-[24px] shrink-0 bg-transparent p-0"
            >
              <ChevronLeft className="h-full w-full" />
            </button>
            <p className="whitespace-nowrap text-[24px] font-bold leading-[normal] tracking-[-0.48px] text-[#2D3038]">
              {year}년 {month}월
            </p>
            <button
              type="button"
              onClick={handleNextMonth}
              className="size-[24px] shrink-0 bg-transparent p-0"
            >
              <ChevronRight className="h-full w-full" />
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="w-full text-center text-[14px] text-[#5F6473]">
            불러오는 중...
          </p>
        )}

        {!isLoading && errorMessage && (
          <p className="w-full text-center text-[14px] text-[#5F6473]">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && entries.length === 0 && (
          <p className="w-full text-center text-[14px] text-[#5F6473]">
            이 달에 작성된 일기가 없어요.
          </p>
        )}

        {!isLoading && !errorMessage && entries.length > 0 && (
          <div className="flex w-full flex-col items-start gap-[20px]">
            {entries.map((entry) => (
              <div
                key={entry.diaryId}
                className="flex w-full flex-col items-start gap-[20px]"
              >
                <div className="flex w-full flex-col items-start gap-[8px]">
                  <div className="flex w-full items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigate(`/home/diaries/${entry.diaryId}`)}
                      className="cursor-pointer bg-transparent p-0 text-left"
                    >
                      <p className="whitespace-nowrap text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-[#2D3038]">
                        {formatDateLabel(entry.recordedDate)}
                      </p>
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((prev) =>
                            prev === entry.diaryId ? null : entry.diaryId,
                          )
                        }
                        className="flex size-[16px] shrink-0 cursor-pointer items-center justify-center bg-transparent p-0"
                      >
                        <img
                          src={kebabIcon}
                          alt="더보기"
                          className="h-full w-full"
                        />
                      </button>
                      {openMenuId === entry.diaryId && (
                        <DiaryOptionsMenu
                          onClose={() => setOpenMenuId(null)}
                          onDelete={() => {
                            setOpenMenuId(null);
                            setDeleteTarget(entry);
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/home/diaries/${entry.diaryId}`)}
                    className="flex w-full cursor-pointer items-center gap-[5px] overflow-hidden bg-transparent p-0 text-left"
                  >
                    {entry.time && (
                      <p className="shrink-0 whitespace-nowrap text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-[#AFB6C4]">
                        {entry.time}
                      </p>
                    )}
                    <p className="min-w-0 flex-1 truncate text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-[#AFB6C4]">
                      {entry.body}
                    </p>
                  </button>
                </div>
                <div
                  className="h-px w-full shrink-0"
                  style={{ background: ROW_DIVIDER_GRADIENT }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          month={Number(deleteTarget.recordedDate.split("-")[1])}
          day={Number(deleteTarget.recordedDate.split("-")[2])}
          onCancel={() => setDeleteTarget(null)}
          onDelete={handleDeleteConfirmed}
        />
      )}
    </div>
  );
}
