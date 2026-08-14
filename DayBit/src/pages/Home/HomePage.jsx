import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import MonthYearPickerModal from "./components/MonthYearPickerModal";
import ResumeDraftModal from "../Diary/components/ResumeDraftModal";
import SpeechBubble from "../../components/SpeechBubble";
import { getTodayColorPalette, hexToRgba } from "../../utils/rewardColor";
import logoImage from "../../assets/logos/logo-symbol.svg";
import profileIcon from "../../assets/icons/profile.svg";
import bellIcon from "../../assets/icons/notification-bell.svg";
import arrowIcon from "../../assets/icons/back.svg";
import editIcon from "../../assets/icons/edit-pencil.svg";
import {
  loadTodayDraft,
  clearDraft,
  draftHasContent,
} from "../../utils/diaryDraft";
let resumeCheckedThisSession = false;

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function maskedIcon(src, color) {
  return {
    backgroundColor: color,
    maskImage: `url("${src}")`,
    WebkitMaskImage: `url("${src}")`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: "contain",
    WebkitMaskSize: "contain",
  };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getSeoulToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    dateStr: `${map.year}-${map.month}-${map.day}`,
  };
}

function buildCalendarWeeks(year, month) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0=월요일

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      inMonth: true,
      dateStr: `${year}-${pad2(month)}-${pad2(d)}`,
    });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, inMonth: false });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function DayCell({ cell, item, onClick }) {
  if (!cell.inMonth) {
    return (
      <div className="relative size-[38px] shrink-0 overflow-clip rounded-[2px]">
        <div className="absolute left-px top-1/2 flex h-[38px] w-[37px] -translate-y-1/2 flex-col items-center justify-center p-[10px]">
          <p className="whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] text-grey-10">
            {cell.day}
          </p>
        </div>
      </div>
    );
  }

  const colorHex = item?.reward?.colorHex;

  return (
    <button
      type="button"
      onClick={item ? onClick : undefined}
      disabled={!item}
      className={`relative size-[38px] shrink-0 overflow-clip rounded-[2px] border-none p-0 ${item ? "cursor-pointer" : "cursor-default"}`}
      style={{ backgroundColor: colorHex || "#ffffff" }}
    >
      <div className="absolute left-px top-0 flex h-[38px] w-[37px] flex-col items-center justify-center p-[10px]">
        <p
          className={`whitespace-nowrap text-[16px] font-semibold ${colorHex ? "text-grey-0" : "text-grey-20"}`}
        >
          {cell.day}
        </p>
      </div>
    </button>
  );
}

function RewardBadge() {
  return (
    <div className="relative flex size-[38px] shrink-0 items-center justify-center overflow-clip rounded-[4px] bg-grey-30">
      <p className="whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] text-grey-0">
        보상
      </p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [today] = useState(() => getSeoulToday());

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [monthItems, setMonthItems] = useState([]);
  const [todayItem, setTodayItem] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showResumeDraft, setShowResumeDraft] = useState(false);

  const themeColor =
    todayItem?.reward?.status === "COMPLETED"
      ? todayItem.reward.colorHex
      : null;
  const palette = themeColor ? getTodayColorPalette(themeColor) : null;

  const accentColor = palette ? palette.uiAccentColor : null;
  const profileShadowColor = accentColor
    ? hexToRgba(accentColor, 0.16)
    : "rgba(65, 68, 80, 0.16)";

  const cardShadow = accentColor
    ? `0 0 10px 0 ${hexToRgba(accentColor, 0.05)}, 0 0 30px 0 ${hexToRgba(accentColor, 0.05)}`
    : "0 0 10px 0 rgba(77, 80, 91, 0.05), 0 0 30px 0 rgba(65, 68, 80, 0.05)";

  const [hasTodayDraft, setHasTodayDraft] = useState(() =>
    draftHasContent(loadTodayDraft()),
  );

  useEffect(() => {
    if (resumeCheckedThisSession) return;
    resumeCheckedThisSession = true;

    const draft = loadTodayDraft();
    if (draftHasContent(draft)) {
      setShowResumeDraft(true);
    }
  }, []);

  const handleResumeDraft = () => {
    setShowResumeDraft(false);
    navigate("/diary");
  };

  const handleDiscardDraft = () => {
    setHasTodayDraft(false);
    clearDraft();
    setShowResumeDraft(false);
    navigate("/diary");
  };

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/api/v1/diaries", {
        params: { year: viewYear, month: viewMonth },
        headers: { "Cache-Control": "no-cache" },
      })
      .then((response) => {
        if (!alive) return;
        const result = response.data.result;
        setMonthItems(Array.isArray(result) ? result : (result?.items ?? []));
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/diaries 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, [viewYear, viewMonth]);

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/api/v1/diaries", {
        params: { year: today.year, month: today.month },
        headers: { "Cache-Control": "no-cache" },
      })
      .then((response) => {
        if (!alive) return;
        const result = response.data.result;
        const items = Array.isArray(result) ? result : (result?.items ?? []);
        setTodayItem(
          items.find((item) => item.recordedDate === today.dateStr) ?? null,
        );
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/diaries(오늘 작성 여부) 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, [today]);

  const itemByDate = new Map(
    monthItems.map((item) => [item.recordedDate, item]),
  );

  const isTodayWritten = Boolean(todayItem);

  const weeks = buildCalendarWeeks(viewYear, viewMonth);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleConfirmPicker = ({ year, month }) => {
    setViewYear(year);
    setViewMonth(month);
    setShowPicker(false);
  };

  const handleGoToWrite = () => navigate("/diary");

  return (
    <div className="relative flex h-full w-full select-none flex-col items-center gap-[20px] overflow-y-auto bg-[#f6f8fa] px-[16px] py-[16px] scrollbar-hide">
      <div className="flex w-full flex-col items-start gap-[8px]">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-end gap-[4px]">
            <div
              aria-hidden
              className="h-[25px] w-[20px] shrink-0"
              style={maskedIcon(logoImage, accentColor ?? "#414450")}
            />
            <p className="whitespace-nowrap text-[14px] font-bold tracking-[1.12px] text-grey-95">
              DAY BIT
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="size-[38px] shrink-0 cursor-pointer rounded-full border-none bg-transparent p-0 transition-opacity active:opacity-60"
          >
            <img
              src={profileIcon}
              alt="프로필"
              className="h-full w-full object-contain"
              style={{
                filter: `drop-shadow(0 0 9.938px ${profileShadowColor})`,
              }}
            />
          </button>
        </div>

        <div className="flex w-full items-end justify-between">
          <p className="text-[22px] font-semibold leading-[normal] tracking-[-0.66px] text-grey-90">
            {viewMonth}월의 조각이
            <br />
            차곡차곡 쌓이고 있어요
          </p>
          <div className="flex shrink-0 items-center justify-center px-[6px] py-[3px]">
            <img
              src={bellIcon}
              alt="알림"
              className="h-[24.375px] w-[18.963px] object-contain"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-[16px]">
        <div
          className="w-full rounded-[12px] bg-grey-0 px-[16px] py-[14px]"
          style={{ boxShadow: cardShadow }}
        >
          <div className="flex w-full flex-col gap-[6px]">
            <div className="flex w-full items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="size-[24px] shrink-0 cursor-pointer"
              >
                <img
                  src={arrowIcon}
                  alt="이전 달"
                  className="h-full w-full object-contain"
                />
              </button>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="flex cursor-pointer items-center gap-[8px] whitespace-nowrap text-[24px] font-bold tracking-[-0.48px] text-grey-90"
              >
                {viewYear}년 {viewMonth}월
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="size-[24px] shrink-0 cursor-pointer"
              >
                <img
                  src={arrowIcon}
                  alt="다음 달"
                  className="h-full w-full rotate-180 object-contain"
                />
              </button>
            </div>

            <div className="flex flex-col gap-[12px]">
              <div className="flex flex-col gap-[8px]">
                <div className="flex items-center gap-[2px]">
                  {WEEKDAYS.map((label) => (
                    <div
                      key={label}
                      className="flex size-[38px] shrink-0 items-center justify-center text-[16px] font-semibold tracking-[-0.16px] text-grey-90"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-[2px]">
                  {weeks.map((week, weekIdx) => {
                    const daysInMonthCount = week.filter(
                      (cell) => cell.inMonth,
                    ).length;
                    const canEarnReward = daysInMonthCount >= 3;
                    return (
                      <div
                        key={weekIdx}
                        className="flex w-full items-center justify-between"
                      >
                        <div className="flex items-center gap-[2px]">
                          {week.map((cell, i) => {
                            const item = cell.inMonth
                              ? itemByDate.get(cell.dateStr)
                              : undefined;
                            return (
                              <DayCell
                                key={i}
                                cell={cell}
                                item={item}
                                onClick={() =>
                                  navigate("/diary/today-color", {
                                    state: {
                                      reward: item.reward,
                                      diaryId: item.diaryId,
                                      recordedDate: item.recordedDate,
                                      mode: "review",
                                    },
                                  })
                                }
                              />
                            );
                          })}
                        </div>
                        {canEarnReward && <RewardBadge />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex w-full items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/home/diaries")}
                  aria-label="일기 목록"
                  className="flex size-[40px] shrink-0 cursor-pointer items-center justify-center"
                >
                  <div
                    aria-hidden
                    className="size-[19.503px]"
                    style={maskedIcon(editIcon, "#5F6473")}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleGoToWrite}
                  disabled={isTodayWritten}
                  className={`flex h-[43px] items-center justify-center rounded-[12px] px-[20px] ${
                    isTodayWritten
                      ? "cursor-default bg-grey-20"
                      : "cursor-pointer bg-grey-70"
                  }`}
                >
                  <p className="whitespace-nowrap text-[16px] font-semibold leading-[normal] text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] text-grey-0">
                    {isTodayWritten ? "작성 완료" : "일기 작성하기"}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex w-full flex-col items-center rounded-[12px] bg-grey-0 px-[16px] py-[12px]"
          style={{ boxShadow: cardShadow }}
        >
          <div className="flex items-center gap-[47px]">
            <div className="flex w-[66px] flex-col items-center gap-[6px]">
              <p className="whitespace-nowrap text-[16px] font-semibold text-grey-90">
                오늘 작성
              </p>
              <p
                className={`whitespace-nowrap text-[12px] font-semibold leading-[normal] tracking-[-0.12px] ${
                  isTodayWritten
                    ? "text-grey-70"
                    : hasTodayDraft
                      ? "text-[#787E8C]"
                      : "text-grey-40"
                }`}
                style={
                  isTodayWritten && accentColor
                    ? { color: accentColor }
                    : undefined
                }
              >
                {isTodayWritten
                  ? "작성 완료"
                  : hasTodayDraft
                    ? "작성 중"
                    : "작성 전"}
              </p>
            </div>
            <div className="h-full w-px shrink-0 bg-grey-20" />
            <div className="flex flex-col items-center gap-[6px]">
              <p className="whitespace-nowrap text-[16px] font-semibold text-grey-90">
                이달 기록
              </p>
              <p className="whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] text-grey-70">
                {monthItems.length}회
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex w-full flex-col items-start gap-[16px] rounded-[12px] bg-grey-0 px-[16px] py-[20px] text-left"
          style={{ boxShadow: cardShadow }}
        >
          <div className="flex items-center gap-[10px]">
            <div
              aria-hidden
              className="h-[28px] w-[22px] shrink-0"
              style={maskedIcon(logoImage, accentColor ?? "#414450")}
            />
            <p className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
              다른 사람의 경험
            </p>
          </div>
          {[
            "“다이어트”와 관련된 다른사람의 경험이 도착했어요.",
            "“수능공부”와 관련된 다른사람의 경험이 도착했어요.",
          ].map((text) => (
            <SpeechBubble
              key={text}
              color="#EFF1F6"
              direction="left"
              bordered
              className="flex w-full items-center gap-[10px] px-[16px] py-[10px]"
            >
              <p className="flex-1 text-[16px] font-medium tracking-[-0.32px] text-grey-80">
                {text}
              </p>
            </SpeechBubble>
          ))}
        </div>
      </div>

      <MonthYearPickerModal
        open={showPicker}
        initial={{ year: viewYear, month: viewMonth }}
        onConfirm={handleConfirmPicker}
        onClose={() => setShowPicker(false)}
      />

      {showResumeDraft && (
        <ResumeDraftModal
          onDiscard={handleDiscardDraft}
          onResume={handleResumeDraft}
        />
      )}
    </div>
  );
}
