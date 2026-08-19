import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import MonthYearPickerModal from "./components/MonthYearPickerModal";
import ResumeDraftModal from "../Diary/components/ResumeDraftModal";
import HomeTutorial from "./components/HomeTutorial";
import ExperienceBlobs from "./components/ExperienceBlobs";
import WeeklyImageNotificationModal from "./components/WeeklyImageNotificationModal";
import AutoCompletionNoticeModal from "./components/AutoCompletionNoticeModal";
import SpeechBubble from "../../components/SpeechBubble";
import { getTodayColorPalette, hexToRgba } from "../../utils/rewardColor";
import { getWeeklyRewards } from "../../utils/weeklyRewards";
import {
  loadCachedMonthItems,
  saveCachedMonthItems,
} from "../../utils/monthDiariesCache";
import {
  loadCachedWeeklyRewards,
  saveCachedWeeklyRewards,
} from "../../utils/weeklyRewardsCache";
import { loadUnreadNotificationCount } from "../../utils/notifications";
import {
  loadCachedUnreadCount,
  saveCachedUnreadCount,
} from "../../utils/notificationsCache";
import { addDays, generateWeeklyReward } from "../../utils/devDiary";
import {
  loadExperienceInbox,
  fragmentTopic,
  formatArrivalTime,
} from "../../utils/experienceFragments";
import { useDevAccess } from "../../contexts/devAccess";
import { getServiceToday, saveDayStartTime } from "../../utils/serviceDate";
import {
  getPendingAutoCompletionNotice,
  markAutoCompletionNoticeViewed,
} from "../../utils/diaryDraftApi";
import LogoSymbol from "../../assets/icons/LogoSymbol.jsx";
import profileIcon from "../../assets/icons/profile.svg";
import bellIcon from "../../assets/icons/notification-bell.svg";
import unreadDotIcon from "../../assets/icons/notification-unread-dot.svg";
import arrowIcon from "../../assets/icons/back.svg";
import editIcon from "../../assets/icons/edit-pencil.svg";
import {
  loadTodayDraft,
  clearDraft,
  draftHasContent,
  clearQuestions,
} from "../../utils/diaryDraft";
let resumeCheckedThisSession = false;
let weeklyNotifyCheckedThisSession = false;
let autoCompletionCheckedThisSession = false;

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

const UNREAD_POLL_INTERVAL_MS = 60000;

const MONTH_TRANSITION_MS = 420;
const CALENDAR_ROW_HEIGHT = 38;
const CALENDAR_ROW_GAP = 2;

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

const EDIT_ICON_MASK = maskedIcon(editIcon, "#5F6473");

const STATS_DIVIDER_GRADIENT =
  "linear-gradient(180deg, rgba(205, 209, 218, 0.00) 0%, #CDD1DA 15%, #CDD1DA 84.62%, rgba(205, 209, 218, 0.00) 100%)";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function monthIndex(year, month) {
  return year * 12 + month;
}

function gridHeightOf(rowCount) {
  if (rowCount <= 0) return 0;
  return rowCount * CALENDAR_ROW_HEIGHT + (rowCount - 1) * CALENDAR_ROW_GAP;
}

function formatDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function mondayOf(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayOffset);
  return formatDate(date);
}

function weeklyRewardsMapFromItems(items) {
  return new Map((items ?? []).map((item) => [item.weekStartDate, item]));
}

function buildCalendarWeeks(year, month) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const numWeeks = Math.ceil((firstWeekday + daysInMonth) / 7);
  const gridStart = new Date(year, month - 1, 1 - firstWeekday);

  const weeks = [];
  for (let w = 0; w < numWeeks; w += 1) {
    const weekStart = new Date(gridStart);
    weekStart.setDate(gridStart.getDate() + w * 7);

    const cells = [];
    for (let d = 0; d < 7; d += 1) {
      const cur = new Date(weekStart);
      cur.setDate(weekStart.getDate() + d);
      const inMonth = cur.getMonth() === month - 1;
      cells.push({
        day: cur.getDate(),
        inMonth,
        dateStr: inMonth ? formatDate(cur) : undefined,
      });
    }

    weeks.push({ cells, weekStartDate: formatDate(weekStart) });
  }

  return weeks;
}

const DayCell = memo(function DayCell({ cell, item, onSelect }) {
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
      onClick={item ? () => onSelect(item) : undefined}
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
});

const REWARD_BADGE_STYLE = {
  available: "bg-[#5F6473] text-grey-0",
  viewed: "border-[1.5px] border-[#787E8C] bg-transparent text-grey-70",
  unavailable: "bg-[#EFF1F6] text-grey-0",
};

const RewardBadge = memo(function RewardBadge({
  state,
  onSelect,
  weekStartDate,
}) {
  const isInteractive = state === "available" || state === "viewed";
  return (
    <button
      type="button"
      data-reward-badge
      data-week-start={weekStartDate}
      onClick={isInteractive ? () => onSelect(weekStartDate) : undefined}
      disabled={!isInteractive}
      className={`relative flex size-[38px] shrink-0 items-center justify-center overflow-clip rounded-[4px] p-0 ${
        isInteractive ? "cursor-pointer" : "cursor-default"
      } ${REWARD_BADGE_STYLE[state] ?? REWARD_BADGE_STYLE.unavailable}`}
    >
      <p className="whitespace-nowrap text-[12px] font-semibold tracking-[-0.12px]">
        보상
      </p>
    </button>
  );
});

const CalendarGrid = memo(function CalendarGrid({
  rows,
  itemByDate,
  onSelectDay,
  onSelectReward,
}) {
  return (
    <div className="flex flex-col gap-[2px]">
      {rows.map(
        ({ cells, weekStartDate, canEarnReward, rewardState }, weekIdx) => (
          <div
            key={weekIdx}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-[2px]">
              {cells.map((cell, i) => (
                <DayCell
                  key={i}
                  cell={cell}
                  item={cell.inMonth ? itemByDate.get(cell.dateStr) : undefined}
                  onSelect={onSelectDay}
                />
              ))}
            </div>
            {canEarnReward && (
              <RewardBadge
                state={rewardState}
                weekStartDate={weekStartDate}
                onSelect={onSelectReward}
              />
            )}
          </div>
        ),
      )}
    </div>
  );
});

export default function HomePage() {
  const navigate = useNavigate();
  const { devPassword } = useDevAccess();
  const [today] = useState(() => getServiceToday());
  const [userId, setUserId] = useState(null);
  const [tutorialCompleted, setTutorialCompleted] = useState(null);

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/api/me")
      .then((response) => {
        if (!alive) return;
        setUserId(response.data.result?.id ?? null);
        setTutorialCompleted(response.data.result?.tutorialCompleted ?? null);
        saveDayStartTime(response.data.result?.dayStartTime);
      })
      .catch((error) => {
        console.error(
          "GET /api/me 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, []);

  const location = useLocation();
  const returnedMonth = location.state?.viewMonth;
  const [viewYear, setViewYear] = useState(returnedMonth?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(
    returnedMonth?.month ?? today.month,
  );
  const [monthItems, setMonthItems] = useState(
    () => loadCachedMonthItems(viewYear, viewMonth) ?? [],
  );
  const [monthLoaded, setMonthLoaded] = useState(
    () => loadCachedMonthItems(viewYear, viewMonth) != null,
  );
  const [weeklyRewardsByWeekStart, setWeeklyRewardsByWeekStart] = useState(() =>
    weeklyRewardsMapFromItems(loadCachedWeeklyRewards(viewYear, viewMonth)),
  );
  const [weeklyRewardsLoaded, setWeeklyRewardsLoaded] = useState(
    () => loadCachedWeeklyRewards(viewYear, viewMonth) != null,
  );
  const [hydratedMonthKey, setHydratedMonthKey] = useState(
    `${viewYear}-${viewMonth}`,
  );
  const [awayTodayItem, setAwayTodayItem] = useState(null);
  const [awayLoaded, setAwayLoaded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showResumeDraft, setShowResumeDraft] = useState(false);
  const [hasTodayDraft, setHasTodayDraft] = useState(() =>
    draftHasContent(loadTodayDraft()),
  );

  const isCurrentMonth = viewYear === today.year && viewMonth === today.month;
  const isPastMonth =
    viewYear < today.year ||
    (viewYear === today.year && viewMonth < today.month);
  const isFutureMonth =
    viewYear > today.year ||
    (viewYear === today.year && viewMonth > today.month);

  const currentMonthKey = `${viewYear}-${viewMonth}`;
  if (hydratedMonthKey !== currentMonthKey) {
    setHydratedMonthKey(currentMonthKey);
    const cached = loadCachedMonthItems(viewYear, viewMonth);
    setMonthItems(cached ?? []);
    setMonthLoaded(cached != null);
    const cachedWeekly = loadCachedWeeklyRewards(viewYear, viewMonth);
    setWeeklyRewardsByWeekStart(weeklyRewardsMapFromItems(cachedWeekly));
    setWeeklyRewardsLoaded(cachedWeekly != null);
  }

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
        const items = Array.isArray(result) ? result : (result?.items ?? []);
        setMonthItems(items);
        saveCachedMonthItems(viewYear, viewMonth, items);
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

  const itemByDate = useMemo(
    () => new Map(monthItems.map((item) => [item.recordedDate, item])),
    [monthItems],
  );

  const todayItem = isCurrentMonth
    ? (itemByDate.get(today.dateStr) ?? null)
    : awayTodayItem;
  const todayLoaded = isCurrentMonth ? monthLoaded : awayLoaded;
  const isTodayWritten = Boolean(todayItem);

  const calendarMent = useMemo(() => {
    if (isCurrentMonth && !isTodayWritten) {
      return {
        line1: `${today.month}월 ${today.day}일의`,
        line2: "기록을 남겨볼까요?",
      };
    }
    if (isPastMonth) {
      return {
        line1: `${viewMonth}월의 조각이`,
        line2: "이렇게 모여있네요 :)",
      };
    }
    if (isFutureMonth) {
      return { line1: `${viewMonth}월의 조각은`, line2: "어떤 색일까요?" };
    }
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const coloredCount = monthItems.filter(
      (item) => item.reward?.colorHex,
    ).length;
    const ratio = daysInMonth > 0 ? coloredCount / daysInMonth : 0;
    if (ratio >= 2 / 3) {
      return { line1: `${viewMonth}월의 조각이`, line2: "다채로워졌어요 :)" };
    }
    if (ratio >= 1 / 3) {
      return {
        line1: `${viewMonth}월의 조각을`,
        line2: "차곡차곡 쌓고 있어요",
      };
    }
    return { line1: `${viewMonth}월의 조각을`, line2: "데이빗과 모아봐요 :)" };
  }, [
    isCurrentMonth,
    isTodayWritten,
    isPastMonth,
    isFutureMonth,
    viewYear,
    viewMonth,
    monthItems,
    today,
  ]);

  const themeColor =
    todayItem?.reward?.status === "COMPLETED"
      ? todayItem.reward.colorHex
      : null;
  const palette = themeColor ? getTodayColorPalette(themeColor) : null;

  const accentColor = palette ? palette.uiAccentColor : null;
  const profileShadowColor = useMemo(
    () =>
      accentColor ? hexToRgba(accentColor, 0.16) : "rgba(65, 68, 80, 0.16)",
    [accentColor],
  );

  const cardShadow = useMemo(
    () =>
      accentColor
        ? `0 0 10px 0 ${hexToRgba(accentColor, 0.05)}, 0 0 30px 0 ${hexToRgba(accentColor, 0.05)}`
        : "0 0 10px 0 rgba(77, 80, 91, 0.05), 0 0 30px 0 rgba(65, 68, 80, 0.05)",
    [accentColor],
  );

  useEffect(() => {
    if (!todayLoaded || resumeCheckedThisSession) return;
    resumeCheckedThisSession = true;

    if (isTodayWritten) {
      clearDraft();
      clearQuestions();
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

  const [notifyReward, setNotifyReward] = useState(null);

  useEffect(() => {
    let alive = true;

    const prevMonthDate = new Date(viewYear, viewMonth - 2, 1);
    const requests = [
      getWeeklyRewards(viewYear, viewMonth),
      getWeeklyRewards(
        prevMonthDate.getFullYear(),
        prevMonthDate.getMonth() + 1,
      ),
    ];

    Promise.allSettled(requests).then((results) => {
      if (!alive) return;
      const map = new Map();
      results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const items = result.value.data.result?.items ?? [];
        items.forEach((item) => map.set(item.weekStartDate, item));
      });
      setWeeklyRewardsByWeekStart(map);
      setWeeklyRewardsLoaded(true);
      saveCachedWeeklyRewards(viewYear, viewMonth, Array.from(map.values()));
    });

    return () => {
      alive = false;
    };
  }, [viewYear, viewMonth]);

  useEffect(() => {
    if (
      !weeklyRewardsLoaded ||
      !isCurrentMonth ||
      userId == null ||
      weeklyNotifyCheckedThisSession
    )
      return;
    weeklyNotifyCheckedThisSession = true;

    let latest = null;
    weeklyRewardsByWeekStart.forEach((item) => {
      const isUnseen =
        item.status === "COMPLETED" &&
        item.available &&
        !item.viewed &&
        item.weekEndDate < today.dateStr;
      if (!isUnseen) return;
      if (!latest || item.weekEndDate > latest.weekEndDate) latest = item;
    });
    if (latest) setNotifyReward(latest);
  }, [
    weeklyRewardsLoaded,
    weeklyRewardsByWeekStart,
    isCurrentMonth,
    today,
    userId,
  ]);

  const [autoCompletionNotice, setAutoCompletionNotice] = useState(null);

  useEffect(() => {
    if (userId == null || autoCompletionCheckedThisSession) return;
    autoCompletionCheckedThisSession = true;

    let alive = true;
    getPendingAutoCompletionNotice()
      .then((notice) => {
        if (!alive || !notice || notice.viewed) return;
        setAutoCompletionNotice(notice);
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/diaries/auto-completion-notices/pending 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  const dismissAutoCompletionNotice = () => {
    const notice = autoCompletionNotice;
    setAutoCompletionNotice(null);
    const noticeId = notice?.noticeId ?? notice?.id;
    if (noticeId == null) return notice;
    markAutoCompletionNoticeViewed(noticeId).catch((error) => {
      console.error(
        "PATCH /api/v1/diaries/auto-completion-notices/{noticeId}/view 실패:",
        error.response?.status,
        error.response?.data,
      );
    });
    return notice;
  };

  const handleAutoCompletionConfirm = () => {
    const notice = dismissAutoCompletionNotice();
    const diaryId = notice?.diaryId;
    if (diaryId != null) navigate(`/home/diaries/${diaryId}`);
  };

  const handleNotifyClose = () => {
    setNotifyReward(null);
  };

  const handleNotifyConfirm = () => {
    if (!notifyReward) return;
    const id = notifyReward.weeklyRewardId;
    setNotifyReward(null);
    navigate(`/home/weekly-rewards/${id}`);
  };

  const [claimingWeek, setClaimingWeek] = useState(null);
  const [rewardClaimError, setRewardClaimError] = useState("");

  const handleRewardBadgeClick = useCallback(
    async (weekStartDate) => {
      const item = weeklyRewardsByWeekStart.get(weekStartDate);

      if (item?.weeklyRewardId) {
        navigate(`/home/weekly-rewards/${item.weeklyRewardId}`, {
          state: { fromMonth: { year: viewYear, month: viewMonth } },
        });
        return;
      }

      if (claimingWeek) return;
      setClaimingWeek(weekStartDate);
      setRewardClaimError("");
      try {
        const response = await generateWeeklyReward(weekStartDate, devPassword);
        const result = response.data.result;
        if (!result?.eligible || !result.weeklyRewardId) {
          setRewardClaimError(
            result?.message ?? "아직 이 주의 이미지를 만들 수 없어요.",
          );
          return;
        }
        navigate(`/home/weekly-rewards/${result.weeklyRewardId}`, {
          state: { fromMonth: { year: viewYear, month: viewMonth } },
        });
      } catch (error) {
        console.error(
          "POST /api/dev/me/weekly-rewards/generate 실패:",
          error.response?.status,
          error.response?.data,
        );
        setRewardClaimError(
          "주간 이미지를 준비 중이에요. 잠시 후 다시 확인해주세요.",
        );
      } finally {
        setClaimingWeek(null);
      }
    },
    [
      weeklyRewardsByWeekStart,
      claimingWeek,
      devPassword,
      navigate,
      viewYear,
      viewMonth,
    ],
  );

  const [inboxArrivals, setInboxArrivals] = useState([]);

  useEffect(() => {
    let alive = true;
    loadExperienceInbox().then(({ arrivals }) => {
      if (alive) setInboxArrivals(arrivals);
    });
    return () => {
      alive = false;
    };
  }, []);

  const [unreadCount, setUnreadCount] = useState(
    () => loadCachedUnreadCount() ?? 0,
  );

  useEffect(() => {
    let alive = true;

    const sync = () => {
      loadUnreadNotificationCount().then((count) => {
        if (!alive) return;
        setUnreadCount(count);
        saveCachedUnreadCount(count);
      });
    };

    sync();
    const timer = setInterval(sync, UNREAD_POLL_INTERVAL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const currentWeekStart = useMemo(() => mondayOf(today.dateStr), [today]);

  const scrollRef = useRef(null);
  const pencilRef = useRef(null);
  const experienceRef = useRef(null);

  const TUTORIAL_STEP_COUNT = 3;
  const TUTORIAL_SHEET_HEIGHT = 282;
  const tutorialJustFinished = useRef(false);
  const hasPositionedOnceRef = useRef(false);
  const tutorialStartedRef = useRef(false);
  const [tutorialStep, setTutorialStep] = useState(null);
  const [spot, setSpot] = useState(null);

  useEffect(() => {
    if (tutorialStartedRef.current) return;
    if (userId == null || !weeklyRewardsLoaded) return;
    if (notifyReward) return;
    if (tutorialCompleted === false) {
      tutorialStartedRef.current = true;
      setTutorialStep(0);
    }
  }, [userId, weeklyRewardsLoaded, notifyReward, tutorialCompleted]);

  useLayoutEffect(() => {
    if (tutorialStep === null) return;

    const scroller = scrollRef.current;
    if (!scroller) return;

    const collect = () => {
      if (tutorialStep === 0) {
        const el = scroller.querySelector(
          `[data-reward-badge][data-week-start="${currentWeekStart}"]`,
        );
        if (!el) return null;
        return { rect: el.getBoundingClientRect(), radius: 8, pad: 4 };
      }
      const el = tutorialStep === 1 ? pencilRef.current : experienceRef.current;
      if (!el) return null;
      return {
        rect: el.getBoundingClientRect(),
        radius: 12,
        pad: tutorialStep === 1 ? 2 : 0,
      };
    };

    const computeSpot = (target) => {
      const base = scroller.getBoundingClientRect();
      const { rect, pad } = target;
      return {
        top: rect.top - base.top - pad,
        left: rect.left - base.left - pad,
        width: rect.right - rect.left + pad * 2,
        height: rect.bottom - rect.top + pad * 2,
        radius: target.radius,
      };
    };

    const initial = collect();
    if (!initial) return;

    const base = scroller.getBoundingClientRect();
    const maxScroll = Math.max(
      0,
      scroller.scrollHeight - scroller.clientHeight,
    );
    const visibleHeight = scroller.clientHeight - TUTORIAL_SHEET_HEIGHT;
    const targetHeight = initial.rect.bottom - initial.rect.top;
    const topInContent = initial.rect.top - base.top + scroller.scrollTop;
    const desiredTop = Math.max(16, (visibleHeight - targetHeight) / 2);
    const targetScrollTop = Math.min(
      maxScroll,
      Math.max(0, topInContent - desiredTop),
    );

    const fromScrollTop = scroller.scrollTop;
    const initialSpot = computeSpot(initial);

    let rafId = null;

    if (!hasPositionedOnceRef.current) {
      scroller.scrollTop = targetScrollTop;
      hasPositionedOnceRef.current = true;
      const settledNow = collect();
      if (settledNow) setSpot(computeSpot(settledNow));

      rafId = requestAnimationFrame(() => {
        const settled = collect();
        if (settled) setSpot(computeSpot(settled));
      });
    } else {
      const delta = targetScrollTop - fromScrollTop;
      const toSpot = { ...initialSpot, top: initialSpot.top - delta };
      const fromSpot = spot ?? initialSpot;
      const spotEl = document.querySelector("[data-tutorial-spot]");

      const DURATION = 300;
      const startTime = performance.now();

      const easeOut = (t) => 1 - (1 - t) ** 3;

      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - startTime) / DURATION));
        const e = easeOut(t);

        scroller.scrollTop = fromScrollTop + delta * e;

        if (spotEl) {
          spotEl.style.top = `${fromSpot.top + (toSpot.top - fromSpot.top) * e}px`;
          spotEl.style.left = `${fromSpot.left + (toSpot.left - fromSpot.left) * e}px`;
          spotEl.style.width = `${fromSpot.width + (toSpot.width - fromSpot.width) * e}px`;
          spotEl.style.height = `${fromSpot.height + (toSpot.height - fromSpot.height) * e}px`;
          spotEl.style.borderRadius = `${fromSpot.radius + (toSpot.radius - fromSpot.radius) * e}px`;
        }

        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          const settled = collect();
          if (settled) setSpot(computeSpot(settled));
        }
      };

      rafId = requestAnimationFrame(tick);
    }

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialStep, monthLoaded, currentWeekStart]);

  useLayoutEffect(() => {
    if (tutorialStep !== null || !tutorialJustFinished.current) return;
    tutorialJustFinished.current = false;
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [tutorialStep]);

  const handleTutorialNext = () => {
    if (tutorialStep >= TUTORIAL_STEP_COUNT - 1) {
      setTutorialCompleted(true);
      apiClient.patch("/api/me/tutorial-completion").catch((error) => {
        console.error(
          "PATCH /api/me/tutorial-completion 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
      tutorialJustFinished.current = true;
      setTutorialStep(null);
      setSpot(null);
      return;
    }
    setTutorialStep((prev) => prev + 1);
  };

  const weeks = useMemo(
    () => buildCalendarWeeks(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const calendarRows = useMemo(() => {
    const resolveRewardState = (weekStartDate, cells) => {
      const reward = weeklyRewardsByWeekStart.get(weekStartDate);
      if (reward?.status === "COMPLETED" && reward.available) {
        return reward.viewed ? "viewed" : "available";
      }
      if (addDays(weekStartDate, 6) >= today.dateStr) return "unavailable";

      const diaryCount =
        reward?.diaryCount ??
        cells.reduce(
          (count, cell) =>
            cell.inMonth && itemByDate.has(cell.dateStr) ? count + 1 : count,
          0,
        );
      return diaryCount >= 3 ? "available" : "unavailable";
    };

    return weeks.map(({ cells, weekStartDate }) => {
      const inMonthCount = cells.reduce(
        (count, cell) => (cell.inMonth ? count + 1 : count),
        0,
      );
      return {
        cells,
        weekStartDate,
        canEarnReward: inMonthCount >= 3,
        rewardState:
          inMonthCount >= 3 ? resolveRewardState(weekStartDate, cells) : null,
      };
    });
  }, [weeks, weeklyRewardsByWeekStart, itemByDate, today]);

  const [monthTransition, setMonthTransition] = useState(null);
  const monthTransitionTimer = useRef(null);
  const outPanelRef = useRef(null);
  const inPanelRef = useRef(null);
  const monthAnimRef = useRef(null);

  useEffect(
    () => () => {
      if (monthTransitionTimer.current)
        clearTimeout(monthTransitionTimer.current);
    },
    [],
  );

  useLayoutEffect(() => {
    if (!monthTransition) return;

    const inEl = inPanelRef.current;
    const outEl = outPanelRef.current;
    if (!inEl) return;

    const sign = monthTransition.direction === "next" ? 1 : -1;
    const easeOut = (t) => 1 - (1 - t) ** 3;
    const start = performance.now();

    inEl.style.transform = `translateX(${sign * 100}%)`;
    if (outEl) outEl.style.transform = "translateX(0%)";

    const step = (now) => {
      const t = Math.min(1, (now - start) / MONTH_TRANSITION_MS);
      const e = easeOut(t);
      inEl.style.transform = `translateX(${sign * 100 * (1 - e)}%)`;
      if (outEl) outEl.style.transform = `translateX(${-sign * 100 * e}%)`;
      if (t < 1) {
        monthAnimRef.current = requestAnimationFrame(step);
      } else {
        inEl.style.transform = "translateX(0%)";
      }
    };

    monthAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (monthAnimRef.current) cancelAnimationFrame(monthAnimRef.current);
    };
  }, [monthTransition]);

  const startMonthTransition = useCallback(
    (direction) => {
      setMonthTransition({
        direction,
        key: `${viewYear}-${viewMonth}`,
        rows: calendarRows,
        itemByDate,
      });
      if (monthTransitionTimer.current)
        clearTimeout(monthTransitionTimer.current);
      monthTransitionTimer.current = setTimeout(() => {
        setMonthTransition(null);
      }, MONTH_TRANSITION_MS);
    },
    [viewYear, viewMonth, calendarRows, itemByDate],
  );

  const handlePrevMonth = () => {
    startMonthTransition("prev");
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    startMonthTransition("next");
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleConfirmPicker = ({ year, month }) => {
    const target = monthIndex(year, month);
    const current = monthIndex(viewYear, viewMonth);
    if (target !== current) {
      startMonthTransition(target > current ? "next" : "prev");
    }
    setViewYear(year);
    setViewMonth(month);
    setShowPicker(false);
  };

  const handleGoToWrite = () => navigate("/diary");

  const handleSelectDay = useCallback(
    (item) => {
      navigate("/diary/today-color", {
        state: {
          reward: item.reward,
          diaryId: item.diaryId,
          recordedDate: item.recordedDate,
          mode: "review",
          fromMonth: { year: viewYear, month: viewMonth },
        },
      });
    },
    [navigate, viewYear, viewMonth],
  );

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
        <div className="flex w-full flex-col items-start gap-[16px]">
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
              {calendarMent.line1}
              <br />
              {calendarMent.line2}
            </p>
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              aria-label={unreadCount > 0 ? "알림 (안 읽은 알림 있음)" : "알림"}
              className="flex shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-opacity active:opacity-60"
            >
              <span className="relative block size-[30px]">
                <img
                  src={bellIcon}
                  alt=""
                  className="absolute left-[5.517px] top-[3.126px] h-[24.375px] w-[18.963px] object-contain"
                />
                {unreadCount > 0 && (
                  <img
                    src={unreadDotIcon}
                    alt=""
                    className="absolute left-[17px] top-[5px] size-[8px]"
                  />
                )}
              </span>
            </button>
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

                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      height: gridHeightOf(calendarRows.length),
                      transition: `height ${MONTH_TRANSITION_MS}ms ease-out`,
                    }}
                  >
                    {monthTransition && (
                      <div
                        ref={outPanelRef}
                        key={`cal-out-${monthTransition.key}`}
                        className="pointer-events-none absolute inset-x-0 top-0"
                      >
                        <CalendarGrid
                          rows={monthTransition.rows}
                          itemByDate={monthTransition.itemByDate}
                          onSelectDay={handleSelectDay}
                          onSelectReward={handleRewardBadgeClick}
                        />
                      </div>
                    )}
                    <div
                      ref={inPanelRef}
                      key={`cal-in-${currentMonthKey}`}
                      className="absolute inset-x-0 top-0"
                    >
                      <CalendarGrid
                        rows={calendarRows}
                        itemByDate={itemByDate}
                        onSelectDay={handleSelectDay}
                        onSelectReward={handleRewardBadgeClick}
                      />
                    </div>
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
                      style={EDIT_ICON_MASK}
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
            className="flex w-full flex-col items-center rounded-[12px] bg-grey-0 py-[12px]"
            style={{ boxShadow: cardShadow }}
          >
            <div className="flex w-full items-stretch">
              <div className="flex flex-1 flex-col items-center gap-[6px]">
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
              <div
                className="w-px shrink-0 self-stretch"
                style={{ background: STATS_DIVIDER_GRADIENT }}
              />
              <div className="flex flex-1 flex-col items-center gap-[6px]">
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
            ref={experienceRef}
            type="button"
            onClick={() => navigate("/experience")}
            className="relative flex w-full cursor-pointer flex-col items-start gap-[16px] overflow-hidden rounded-[12px] bg-grey-0 px-[16px] pb-[32px] pt-[20px] text-left transition-opacity active:opacity-80"
            style={{ boxShadow: cardShadow }}
          >
            <ExperienceBlobs />

            <div className="relative flex w-full flex-col gap-[32px]">
              <div className="flex w-full flex-col items-start gap-[4px]">
                <div className="flex items-center gap-[10px]">
                  <LogoSymbol
                    dotColor={accentColor ?? "#414450"}
                    className="h-[27.872px] w-[22px] shrink-0"
                  />
                  <p className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
                    경험조각 주고받기
                  </p>
                </div>
                {inboxArrivals.length === 0 && (
                  <p className="whitespace-nowrap text-[14px] font-medium tracking-[-0.28px] text-grey-60">
                    아직 나와 비슷한 경험이 도착하지 않았어요.
                  </p>
                )}
              </div>

              {inboxArrivals.length > 0 ? (
                <div className="flex w-full flex-col gap-[16px]">
                  {inboxArrivals.slice(0, 2).map((arrival) => (
                    <SpeechBubble
                      key={arrival.arrivalId}
                      color="#EFF1F6"
                      direction="left"
                      bordered
                      className="flex w-full items-center gap-[10px] px-[16px] py-[10px]"
                    >
                      <p className="flex-1 text-[16px] font-medium tracking-[-0.32px] text-grey-80">
                        {fragmentTopic(arrival) || "새로운 경험"}과 관련된
                        경험조각이 도착했어요.
                      </p>
                      <span className="shrink-0 whitespace-nowrap text-[12px] font-normal text-grey-60">
                        {formatArrivalTime(arrival.arrivedAt)}
                      </span>
                    </SpeechBubble>
                  ))}
                </div>
              ) : (
                <div className="flex w-full flex-col items-center justify-center">
                  <div className="flex items-center justify-center rounded-[32px] bg-[#F8F9FC] p-[10px]">
                    <p className="whitespace-nowrap text-[14px] font-medium tracking-[-0.28px] text-grey-80">
                      경험조각을 찾는중..
                    </p>
                  </div>
                </div>
              )}
            </div>
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
            onClose={() => setShowResumeDraft(false)}
          />
        )}

        {notifyReward && (
          <WeeklyImageNotificationModal
            imageUrl={notifyReward.imageUrl}
            onLater={handleNotifyClose}
            onConfirm={handleNotifyConfirm}
            onClose={handleNotifyClose}
          />
        )}

        {autoCompletionNotice && !notifyReward && (
          <AutoCompletionNoticeModal
            recordedDate={autoCompletionNotice.recordedDate}
            onConfirm={handleAutoCompletionConfirm}
            onClose={dismissAutoCompletionNotice}
          />
        )}
      </div>

      {rewardClaimError && (
        <button
          type="button"
          onClick={() => setRewardClaimError("")}
          className="absolute inset-x-[16px] bottom-[16px] z-40 rounded-[12px] bg-grey-90/90 px-[16px] py-[12px] text-center text-[14px] font-medium leading-[1.5] text-grey-0"
        >
          {rewardClaimError}
        </button>
      )}

      {tutorialStep !== null && !notifyReward && (
        <HomeTutorial
          step={tutorialStep}
          spot={spot}
          onNext={handleTutorialNext}
        />
      )}
    </div>
  );
}
