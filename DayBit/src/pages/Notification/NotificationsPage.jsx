import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import NotificationCard from "./components/NotificationCard";
import {
  loadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  notificationTitle,
  notificationRoute,
  formatNotificationTime,
} from "../../utils/notifications";
import {
  loadCachedNotifications,
  saveCachedNotifications,
} from "../../utils/notificationsCache";
import { fetchWrittenToday } from "../../utils/todayDiary";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => loadCachedNotifications() ?? []);
  const [loaded, setLoaded] = useState(() => loadCachedNotifications() != null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loadNotifications().then(({ items: list, failed }) => {
      if (!alive) return;
      if (failed) {
        setLoadFailed(true);
      } else {
        setItems(list);
        setLoadFailed(false);
        saveCachedNotifications(list);
      }
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const applyItems = (updater) => {
    setItems((prev) => {
      const next = updater(prev);
      saveCachedNotifications(next);
      return next;
    });
  };

  const handleCardClick = async (item) => {
    if (!item.read) {
      applyItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
      markNotificationRead(item.id).catch((error) => {
        console.error(
          "PATCH /api/v1/notifications/{notificationId}/read 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    }

    const route = notificationRoute(item);
    if (!route) return;

    if (item.type === "DIARY_REMINDER") {
      const written = await fetchWrittenToday().catch(() => false);
      if (written) return;
    }

    navigate(route);
  };

  const handleReadAll = () => {
    applyItems((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllNotificationsRead().catch((error) => {
      console.error(
        "PATCH /api/v1/notifications/read-all 실패:",
        error.response?.status,
        error.response?.data,
      );
    });
  };

  const unreadItems = [];
  const readItems = [];
  for (const item of items) {
    (item.read ? readItems : unreadItems).push(item);
  }

  const renderCard = (item) => (
    <button
      key={item.id}
      type="button"
      onClick={() => handleCardClick(item)}
      className="w-full cursor-pointer border-none bg-transparent p-0 text-left transition-opacity active:opacity-80"
    >
      <NotificationCard
        title={notificationTitle(item.type)}
        time={formatNotificationTime(item.createdAt)}
        body={item.message}
        unread={!item.read}
      />
    </button>
  );

  return (
    <div className="flex h-full w-full select-none flex-col gap-[16px] overflow-y-auto bg-[#F6F8FA] p-[16px] scrollbar-hide">
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
        <div className="flex w-full items-center justify-between">
          <p className="whitespace-nowrap text-[22px] font-semibold leading-[normal] tracking-[-0.66px] text-[#4F5563]">
            알림
          </p>
          {unreadItems.length > 0 && (
            <button
              type="button"
              onClick={handleReadAll}
              className="shrink-0 cursor-pointer whitespace-nowrap border-none bg-transparent p-0 text-[14px] font-semibold tracking-[-0.28px] text-grey-60 transition-opacity active:opacity-60"
            >
              모두 읽음
            </button>
          )}
        </div>

        {!loaded ? null : loadFailed && items.length === 0 ? (
          <p className="w-full text-[14px] font-medium tracking-[-0.28px] text-grey-60">
            알림을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        ) : items.length === 0 ? (
          <p className="w-full text-[14px] font-medium tracking-[-0.28px] text-grey-60">
            아직 도착한 알림이 없어요.
          </p>
        ) : (
          <div className="flex w-full flex-col items-start gap-[20px]">
            {unreadItems.length > 0 && (
              <div className="flex w-full flex-col items-start gap-[8px]">
                <p className="whitespace-nowrap text-[14px] font-semibold leading-[normal] tracking-[-0.28px] text-grey-70">
                  확인하지 않은 알림
                </p>
                <div className="flex w-full flex-col items-start gap-[16px]">
                  {unreadItems.map(renderCard)}
                </div>
              </div>
            )}
            {readItems.length > 0 && (
              <div className="flex w-full flex-col items-start gap-[8px]">
                <p className="whitespace-nowrap text-[14px] font-semibold leading-[normal] tracking-[-0.28px] text-grey-70">
                  확인한 알림
                </p>
                <div className="flex w-full flex-col items-start gap-[16px]">
                  {readItems.map(renderCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
