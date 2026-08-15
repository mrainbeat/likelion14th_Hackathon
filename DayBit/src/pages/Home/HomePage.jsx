import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import MonthYearPickerModal from "./components/MonthYearPickerModal";
import ResumeDraftModal from "../Diary/components/ResumeDraftModal";
import HomeTutorial from "./components/HomeTutorial";
import SpeechBubble from "../../components/SpeechBubble";
import { getTodayColorPalette, hexToRgba } from "../../utils/rewardColor";
import LogoSymbol from "../../assets/icons/LogoSymbol.jsx";
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
    <div
      data-reward-badge
      className="relative flex size-[38px] shrink-0 items-center justify-center overflow-clip rounded-[4px] bg-grey-30"
    >
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
  const [monthLoaded, setMonthLoaded] = useState(false);
  const [awayTodayItem, setAwayTodayItem] = useState(null);
  const [awayLoaded, setAwayLoaded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showResumeDraft, setShowResumeDraft] = useState(false);
  const [hasTodayDraft, setHasTodayDraft] = useState(() =>
    draftHasContent(loadTodayDraft()),
  );

  const isCurrentMonth = viewYear === today.year && viewMonth === today.month;

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
      })
      .finally(() => {
        if (alive) setMonthLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [viewYear, viewMonth]);

  // 이번 달을 보고 있으면 위 응답에서 오늘 항목을 그대로 꺼내 쓴다.
  // 따로 요청하면 캘린더 색과 포인트 색이 서로 다른 시점에 들어와 깜빡여서.
  useEffect(() => {
    if (isCurrentMonth) return;
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
        setAwayTodayItem(
          items.find((item) => item.recordedDate === today.dateStr) ?? null,
        );
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/diaries(오늘 작성 여부) 실패:",
          error.response?.status,
          error.response?.data,
        );
      })
      .finally(() => {
        if (alive) setAwayLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [isCurrentMonth, today]);

  const itemByDate = new Map(
    monthItems.map((item) => [item.recordedDate, item]),
  );

  const todayItem = isCurrentMonth
    ? (itemByDate.get(today.dateStr) ?? null)
    : awayTodayItem;
  const todayLoaded = isCurrentMonth ? monthLoaded : awayLoaded;
  const isTodayWritten = Boolean(todayItem);

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

  // 오늘 일기가 이미 완료된 상태면 남아있는 임시 저장은 버그로 생긴 값이라 지운다
  useEffect(() => {
    if (!todayLoaded || resumeCheckedThisSession) return;
    resumeCheckedThisSession = true;

    if (isTodayWritten) {
      clearDraft();
      setHasTodayDraft(false);
      return;
    }

    if (draftHasContent(loadTodayDraft())) {
      setShowResumeDraft(true);
    }
  }, [todayLoaded, isTodayWritten]);

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

  const scrollRef = useRef(null);
  const pencilRef = useRef(null);
  const experienceRef = useRef(null);

  const TUTORIAL_STEP_COUNT = 3;
  const TUTORIAL_SHEET_HEIGHT = 312;
  const tutorialJustFinished = useRef(false);
  const [tutorialStep, setTutorialStep] = useState(() =>
    localStorage.getItem("home_tutorial_seen") ? null : 0,
  );
  const [spot, setSpot] = useState(null);

  useLayoutEffect(() => {
    if (tutorialStep === null) return;

    const scroller = scrollRef.current;
    if (!scroller) return;

    const collect = () => {
      if (tutorialStep === 0) {
        const badges = Array.from(
          scroller.querySelectorAll("[data-reward-badge]"),
        );
        if (!badges.length) return null;
        const rects = badges.map((b) => b.getBoundingClientRect());
        return {
          rect: {
            top: Math.min(...rects.map((r) => r.top)),
            left: Math.min(...rects.map((r) => r.left)),
            right: Math.max(...rects.map((r) => r.right)),
            bottom: Math.max(...rects.map((r) => r.bottom)),
          },
          radius: 4,
          pad: 4,
          el: badges[0],
        };
      }
      const el = tutorialStep === 1 ? pencilRef.current : experienceRef.current;
      if (!el) return null;
      return {
        rect: el.getBoundingClientRect(),
        radius: tutorialStep === 1 ? 999 : 8,
        pad: 6,
        el,
      };
    };

    // 하단 시트에 가리지 않도록 시트 위쪽 영역 가운데로 직접 스크롤한다
    const initial = collect();
    if (initial) {
      const base = scroller.getBoundingClientRect();
      const visibleHeight = scroller.clientHeight - TUTORIAL_SHEET_HEIGHT;
      const targetHeight = initial.rect.bottom - initial.rect.top;
      const topInContent = initial.rect.top - base.top + scroller.scrollTop;
      const desiredTop = Math.max(16, (visibleHeight - targetHeight) / 2);
      scroller.scrollTop = Math.max(0, topInContent - desiredTop);
    }

    const measure = () => {
      const target = collect();
      if (!target) return;
      const base = scroller.getBoundingClientRect();
      const { rect, pad } = target;
      setSpot({
        top: rect.top - base.top - pad,
        left: rect.left - base.left - pad,
        width: rect.right - rect.left + pad * 2,
        height: rect.bottom - rect.top + pad * 2,
        radius: target.radius,
      });
    };

    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [tutorialStep, monthLoaded]);

  // 하단 여백이 걷힌 뒤에 올려야 스크롤이 중간에 잘리지 않는다
  useLayoutEffect(() => {
    if (tutorialStep !== null || !tutorialJustFinished.current) return;
    tutorialJustFinished.current = false;
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [tutorialStep]);

  const handleTutorialNext = () => {
    if (tutorialStep >= TUTORIAL_STEP_COUNT - 1) {
      localStorage.setItem("home_tutorial_seen", "true");
      tutorialJustFinished.current = true;
      setTutorialStep(null);
      setSpot(null);
      return;
    }
    setTutorialStep((prev) => prev + 1);
  };

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
    <div className="relative h-full w-full overflow-hidden bg-[#f6f8fa]">
      <div
        ref={scrollRef}
        className="flex h-full w-full select-none flex-col items-center gap-[20px] overflow-y-auto px-[16px] py-[16px] scrollbar-hide"
        style={
          tutorialStep !== null
            ? { paddingBottom: TUTORIAL_SHEET_HEIGHT + 16 }
            : undefined
        }
      >
        <div className="flex w-full flex-col items-start gap-[8px]">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-end gap-[4px]">
              <LogoSymbol
                dotColor={accentColor ?? "#414450"}
                className="h-[25.338px] w-[20px] shrink-0"
              />
              <p className="whitespace-nowrap text-[14px] font-bold leading-[10px] tracking-[1.12px] text-grey-95">
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
                    ref={pencilRef}
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
            className="flex w-full flex-col items-start gap-[16px] rounded-[12px] bg-grey-0 px-[16px] py-[20px] text-left opacity-30"
            style={{ boxShadow: cardShadow }}
          >
            <div ref={experienceRef} className="flex items-center gap-[10px]">
              <LogoSymbol
                dotColor={accentColor ?? "#414450"}
                className="h-[28px] w-[22px] shrink-0"
              />
              <p className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
                경험조각 주고받기
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
            onClose={() => setShowReflectionConsent(false)}
          />
        )}
      </div>

      {tutorialStep !== null && (
        <HomeTutorial
          step={tutorialStep}
          spot={spot}
          onNext={handleTutorialNext}
        />
      )}
    </div>
  );
}
