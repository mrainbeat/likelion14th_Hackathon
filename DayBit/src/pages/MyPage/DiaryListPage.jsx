import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";

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

function MoreIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="3" cy="8" r="1.3" fill="#5F6473" />
      <circle cx="8" cy="8" r="1.3" fill="#5F6473" />
      <circle cx="13" cy="8" r="1.3" fill="#5F6473" />
    </svg>
  );
}

function formatDateLabel(recordedDate) {
  const [, month, day] = recordedDate.split("-").map(Number);
  return `${month}월 ${day}일`;
}

function formatTimeLabel(createdAt) {
  const timePart = createdAt.split("T")[1] ?? "00:00:00";
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = Number(hourStr);
  const minute = (minuteStr ?? "00").padStart(2, "0");
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${period} ${hour}:${minute}`;
}

export default function DiaryListPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDiaries = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const listRes = await apiClient.get("/api/v1/diaries", {
        params: { year, month },
      });
      const items = listRes.data?.result?.items ?? [];

      const details = await Promise.all(
        items.map((item) =>
          apiClient
            .get(`/api/v1/diaries/${item.diaryId}`)
            .then((res) => res.data?.result)
            .catch(() => null),
        ),
      );

      const merged = items
        .map((item, i) => {
          const detail = details[i];
          return {
            diaryId: item.diaryId,
            recordedDate: item.recordedDate,
            body: detail?.content ?? "",
            time: detail?.createdAt ? formatTimeLabel(detail.createdAt) : "",
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

  const handleMore = () => alert("준비 중인 기능이에요.");

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
        <img
          src={profileIcon}
          alt="프로필"
          className="size-[38px] shrink-0 rounded-full object-contain"
          style={{ filter: "drop-shadow(0 0 9.938px rgba(65, 68, 80, 0.16))" }}
        />
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
                className="flex w-full flex-col items-start gap-[8px]"
              >
                <div className="flex w-full items-center justify-between">
                  <p className="whitespace-nowrap text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-[#2D3038]">
                    {formatDateLabel(entry.recordedDate)}
                  </p>
                  <button
                    type="button"
                    onClick={handleMore}
                    className="size-[16px] shrink-0 bg-transparent p-0"
                  >
                    <MoreIcon className="h-full w-full" />
                  </button>
                </div>
                <div className="flex w-full items-center gap-[5px] whitespace-nowrap text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-[#5F6473]">
                  <p className="shrink-0">{entry.time}</p>
                  <p className="truncate">{entry.body}</p>
                </div>
                <div className="h-0 w-full border-t border-[#D6D9E2]" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
