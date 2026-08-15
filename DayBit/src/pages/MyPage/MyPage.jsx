import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { logout } from "../Auth/auth";
import { clearDraft } from "../../utils/diaryDraft";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import chevronIcon from "../../assets/icons/mypage-chevron-right.svg";
import personIcon from "../../assets/icons/mypage-person.svg";
import notificationsIcon from "../../assets/icons/mypage-notifications.svg";
import assignmentIcon from "../../assets/icons/mypage-assignment.svg";
import monetizationIcon from "../../assets/icons/mypage-monetization.svg";
import libraryIcon from "../../assets/icons/mypage-library.svg";
import checkCircleIcon from "../../assets/icons/mypage-check-circle.svg";
import lockIcon from "../../assets/icons/mypage-lock.svg";
import personRemoveIcon from "../../assets/icons/mypage-person-remove.svg";
import sentimentEyeIcon from "../../assets/icons/mypage-sentiment-eye.svg";
import sentimentFaceIcon from "../../assets/icons/mypage-sentiment-face.svg";

function MenuIcon({ src, inset }) {
  return (
    <div className="relative size-[30px] shrink-0">
      <img src={src} alt="" className="absolute block max-w-none" style={inset} />
    </div>
  );
}

function SentimentIcon() {
  return (
    <div className="relative size-[30px] shrink-0">
      <img
        src={sentimentFaceIcon}
        alt=""
        className="absolute block max-w-none"
        style={{ inset: "8.33%" }}
      />
      <img
        src={sentimentEyeIcon}
        alt=""
        className="absolute block max-w-none"
        style={{ inset: "33.33% 29.17% 54.17% 58.33%" }}
      />
      <img
        src={sentimentEyeIcon}
        alt=""
        className="absolute block max-w-none"
        style={{ inset: "33.33% 58.33% 54.17% 29.17%" }}
      />
    </div>
  );
}

function MenuRow({ icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between bg-transparent p-0 text-left transition-opacity ${
        disabled ? "cursor-not-allowed" : "cursor-pointer active:opacity-60"
      }`}
    >
      <div className="flex items-center gap-[17px]">
        {icon}
        <p className="whitespace-nowrap text-[16px] font-medium leading-[normal] tracking-[-0.32px] text-grey-70">
          {label}
        </p>
      </div>
      <img
        src={chevronIcon}
        alt=""
        className="block h-[15px] w-[9px] shrink-0"
      />
    </button>
  );
}

function Divider() {
  return <div className="h-[0.5px] w-full shrink-0 bg-grey-40" />;
}

export default function MyPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(
    () => localStorage.getItem("nickname") || "",
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    let alive = true;

    apiClient
      .get("/api/me")
      .then((response) => {
        if (!alive) return;
        const user = response.data.result;
        const name = user?.nickname || user?.name;
        if (name) setNickname(name);
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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    if (!window.confirm("로그아웃 하시겠어요?")) return;

    setIsLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const handleResetTodayDiary = async () => {
    if (isResetting) return;
    if (
      !window.confirm(
        "오늘 작성한 일기와 연결된 색상·성찰 질문·기억 후보를 초기화합니다. 계속할까요?",
      )
    )
      return;

    setIsResetting(true);
    try {
      const response = await apiClient.delete("/api/dev/me/diaries/today");
      const result = response.data.result;
      alert(
        result.deleted
          ? "초기화가 완료되었습니다. 오늘 일기를 다시 작성할 수 있습니다."
          : "오늘 작성된 일기가 없어 초기화할 데이터가 없습니다.",
      );
      clearDraft();
      navigate("/home", { replace: true });
    } catch (error) {
      const code = error.response?.data?.code;
      if (code === "DEV409_1") {
        alert("공유 이력이 있는 일기는 초기화할 수 없습니다.");
      } else if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
      } else if (error.response?.status === 404) {
        alert("현재 서버에서는 개발용 초기화 기능이 활성화되어 있지 않습니다.");
      } else {
        alert("오늘 일기를 초기화하지 못했습니다.");
      }
      console.error(
        "DELETE /api/dev/me/diaries/today 실패:",
        error.response?.status,
        error.response?.data,
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex h-full w-full select-none flex-col gap-[14px] overflow-y-auto bg-[#F6F8FA] px-[20px] py-[16px] scrollbar-hide">
      <div className="flex w-full shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="size-[32px] shrink-0 cursor-pointer bg-transparent p-0 transition-opacity active:opacity-60"
        >
          <img src={backIcon} alt="뒤로가기" className="h-full w-full" />
        </button>
        <div className="flex items-center justify-end gap-[12px]">
          <p className="whitespace-nowrap text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-grey-90">
            {nickname}
          </p>
          <img
            src={profileIcon}
            alt="프로필"
            className="size-[38px] shrink-0 rounded-full object-contain"
            style={{
              filter: "drop-shadow(0 0 9.938px rgba(65, 68, 80, 0.16))",
            }}
          />
        </div>
      </div>

      <Divider />

      <div className="flex w-full flex-col gap-[16px]">
        <div className="flex w-full flex-col gap-[22px]">
          <MenuRow
            icon={<MenuIcon src={personIcon} inset={{ inset: "16.67%" }} />}
            label="프로필 • 개인화 설정"
            disabled
          />
          <MenuRow
            icon={
              <MenuIcon
                src={notificationsIcon}
                inset={{ inset: "10.42% 18.4% 8.33% 18.39%" }}
              />
            }
            label="알림 설정"
            disabled
          />
          <MenuRow
            icon={<MenuIcon src={assignmentIcon} inset={{ inset: "0" }} />}
            label="일기 관리"
            disabled
          />
          <MenuRow
            icon={
              <MenuIcon src={monetizationIcon} inset={{ inset: "8.33%" }} />
            }
            label="구독 관리"
            disabled
          />
        </div>

        <Divider />

        <div className="flex w-full flex-col gap-[22px]">
          <MenuRow
            icon={
              <MenuIcon
                src={libraryIcon}
                inset={{ inset: "8.33% 12.5% 7.44% 12.5%" }}
              />
            }
            label="고객센터"
            onClick={handleResetTodayDiary}
          />
          <MenuRow
            icon={<MenuIcon src={checkCircleIcon} inset={{ inset: "8.33%" }} />}
            label="이용 약관"
            disabled
          />
          <MenuRow
            icon={
              <MenuIcon
                src={lockIcon}
                inset={{ inset: "4.17% 16.67% 8.33% 16.67%" }}
              />
            }
            label="개인정보 처리방침"
            disabled
          />
        </div>

        <Divider />

        <div className="flex w-full flex-col gap-[22px]">
          <MenuRow
            icon={
              <MenuIcon
                src={personRemoveIcon}
                inset={{ inset: "16.67% 4.17% 16.67% 8.33%" }}
              />
            }
            label="로그아웃"
            onClick={handleLogout}
          />
          <MenuRow icon={<SentimentIcon />} label="회원탈퇴" disabled />
        </div>
      </div>
    </div>
  );
}
