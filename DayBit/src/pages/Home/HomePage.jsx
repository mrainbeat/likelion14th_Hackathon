import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import MonthYearPickerModal from "./components/MonthYearPickerModal";
import ResumeDraftModal from "../Diary/components/ResumeDraftModal";
import { getTodayColorPalette, hexToRgba } from "../../utils/rewardColor";
import logoImage from "../../assets/logos/logo-symbol.png";
import profileIcon from "../../assets/icons/profile.svg";
import bellIcon from "../../assets/icons/notification-bell.svg";
import arrowIcon from "../../assets/icons/back.svg";
import editIcon from "../../assets/icons/edit-pencil.svg";
import {
  loadTodayDraft,
  clearDraft,
  draftHasContent,
} from "../../utils/diaryDraft";
import bubbleTailSvg from "../../assets/icons/tail.svg";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

// svg 에셋은 img로 두면 색을 못 바꿔서, 보상 색을 따라가야 하는 아이콘만 mask로 씌운다.
// img의 기본 동작(비율 유지 + 가운데 정렬)을 그대로 맞춰야 모양이 안 찌그러진다.
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

function RewardBadge({ active }) {
  if (active) {
    return (
      <div className="relative size-[38px] shrink-0 overflow-clip rounded-[4px] border-[1.5px] border-solid border-grey-60">
        <p className="absolute left-[7.5px] top-[10.5px] whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] text-grey-70">
          보상
        </p>
      </div>
    );
  }
  return (
    <div className="relative size-[38px] shrink-0 overflow-clip rounded-[4px] bg-grey-30">
      <p className="absolute left-[9px] top-[12px] whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] text-grey-0">
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
  // 받은 색 하나로 메인/소프트 배경과 그 위 텍스트 색까지 한 세트로 만듦.
  // 메인: 원본 그대로(그림자·글자), 소프트: 같은 색상의 옅은 톤(말풍선 배경)
  const palette = themeColor ? getTodayColorPalette(themeColor) : null;
  const isPale = palette ? palette.mode === "derived-text" : false;
  const textColor = palette ? palette.mainTextColor : null;
  const bubbleColor = palette ? palette.softColor : "#E7E9EE";
  const bubbleTextColor = palette ? palette.softTextColor : "#5F6473";
  const profileShadowColor = palette
    ? hexToRgba(palette.mainColor, isPale ? 0.6 : 0.16)
    : "rgba(65, 68, 80, 0.16)";
  const cardShadowColor = palette
    ? hexToRgba(palette.mainColor, isPale ? 0.2 : 0.05)
    : null;
  // 보상 색이 없는 기본 상태는 피그마 값 그대로 두 톤을 따로 씀
  const cardShadowStyle = {
    boxShadow: palette
      ? `0 0 10px 0 ${cardShadowColor}, 0 0 30px 0 ${cardShadowColor}`
      : "0 0 10px 0 rgba(77, 80, 91, 0.05), 0 0 30px 0 rgba(65, 68, 80, 0.05)",
  };

  useEffect(() => {
    const draft = loadTodayDraft();
    if (draftHasContent(draft)) {
      setShowResumeDraft(true);
    }
  }, []);

  const handleResumeDraft = () => {
    setShowResumeDraft(false);
    navigate("/diary", { state: { skipResumePrompt: true } });
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowResumeDraft(false);
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

  const isCurrentMonth = viewYear === today.year && viewMonth === today.month;
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
            <img
              src={logoImage}
              alt=""
              className="h-[25px] w-[20px] object-contain"
            />
            <p className="whitespace-nowrap text-[14px] font-bold tracking-[1.12px] text-grey-95">
              DAY BIT
            </p>
          </div>
          <button className="size-[38px] shrink-0 rounded-full border-none bg-transparent p-0">
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
          <p
            className="text-[22px] font-semibold leading-[normal] tracking-[-0.66px] text-grey-90"
            style={textColor ? { color: textColor } : undefined}
          >
            {viewMonth}월의 조각이
            <br />
            차곡차곡 쌓이고 있어요
          </p>
          <img
            src={bellIcon}
            alt="알림"
            className="h-[24.375px] w-[18.963px] shrink-0 object-contain"
          />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-[16px]">
        <div
          className="relative w-full rounded-[12px] bg-grey-0 px-[16px] py-[14px]"
          style={cardShadowStyle}
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
                    const isCurrentWeek =
                      isCurrentMonth &&
                      week.some(
                        (cell) => cell.inMonth && cell.day === today.day,
                      );
                    // 이번 달에 속한 날이 3일 미만이면 어차피 보상을 못 받으므로 버튼 자체를 없앰
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
                                  navigate(`/home/diaries/${item.diaryId}`)
                                }
                              />
                            );
                          })}
                        </div>
                        {canEarnReward && (
                          <RewardBadge active={isCurrentWeek} />
                        )}
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
                  {/* 피그마 create 컴포넌트: 26px 프레임 안에 19.5px 벡터가
                      3.25px 여백을 두고 들어있음 — 26px로 채우면 실제보다 커짐 */}
                  <div
                    aria-hidden
                    className="size-[19.503px]"
                    style={maskedIcon(editIcon, textColor ?? "#858C9C")}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleGoToWrite}
                  disabled={isTodayWritten}
                  className={`flex items-center justify-center rounded-[12px] px-[20px] py-[12px] ${
                    isTodayWritten
                      ? "cursor-default bg-grey-20"
                      : "cursor-pointer bg-grey-70"
                  }`}
                >
                  <p className="whitespace-nowrap text-[16px] font-semibold text-shadow-[0px_0px_2px_rgba(0,0,0,0.05)] text-grey-0">
                    {isTodayWritten ? "작성 완료" : "일기 작성하기"}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex w-full flex-col items-center rounded-[12px] bg-grey-0 px-[16px] py-[12px]"
          style={cardShadowStyle}
        >
          <div className="flex items-center gap-[47px]">
            <div className="flex w-[66px] flex-col items-center gap-[6px]">
              <p className="whitespace-nowrap text-[16px] font-semibold text-grey-90">
                오늘 작성
              </p>
              <p
                className={`whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px] ${
                  isTodayWritten ? "text-grey-70" : "text-grey-40"
                }`}
                style={
                  isTodayWritten && textColor ? { color: textColor } : undefined
                }
              >
                {isTodayWritten ? "작성완료" : "작성전"}
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

        <button
          type="button"
          onClick={() => navigate("/experience")}
          className="flex w-full cursor-pointer flex-col items-start gap-[16px] rounded-[12px] bg-grey-0 px-[16px] py-[20px] text-left"
          style={cardShadowStyle}
        >
          <div className="flex items-center gap-[10px]">
            <img
              src={logoImage}
              alt=""
              className="h-[28px] w-[22px] object-contain"
            />
            <p className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
              경험조각 주고받기
            </p>
          </div>
          {[
            "“다이어트”와 관련된 다른사람의 경험이 도착했어요.",
            "“수능공부”와 관련된 다른사람의 경험이 도착했어요.",
          ].map((text) => (
            <div
              key={text}
              className="relative flex w-full items-center gap-[10px] rounded-[12px] px-[16px] py-[10px]"
              style={{ backgroundColor: bubbleColor }}
            >
              {/* 말풍선 색이 보상 색을 따라가므로 꼬리도 같은 값을 써야 어긋나지 않음 */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-[-4px] top-[-9px] h-[18.739px] w-[15.307px]"
                style={maskedIcon(bubbleTailSvg, bubbleColor)}
              />
              <p
                className="flex-1 text-[16px] font-medium tracking-[-0.32px]"
                style={{ color: bubbleTextColor }}
              >
                {text}
              </p>
            </div>
          ))}
        </button>
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
