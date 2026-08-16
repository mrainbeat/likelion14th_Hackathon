import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../Auth/auth";
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
import MyPageHeader from "./components/MyPageHeader";
import LogoutConfirmModal from "./components/LogoutConfirmModal";
import { useNickname } from "./useNickname";

function MenuIcon({ src, inset }) {
  return (
    <div className="relative size-[30px] shrink-0">
      <img
        src={src}
        alt=""
        className="absolute block max-w-none"
        style={inset}
      />
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
        <p
          className={`whitespace-nowrap text-[16px] font-medium leading-[normal] tracking-[-0.32px] ${
            disabled ? "text-grey-40" : "text-grey-70"
          }`}
        >
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
  const nickname = useNickname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    if (isLoggingOut) return;
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleLogoutConfirm = async () => {
    if (isLoggingOut) return;
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative flex h-full w-full select-none flex-col gap-[14px] overflow-y-auto bg-[#F6F8FA] px-[16px] py-[16px] scrollbar-hide">
      <MyPageHeader nickname={nickname} onBack={() => navigate("/home")} />
      <Divider />
      <div className="flex w-full flex-col gap-[16px]">
        <div className="flex w-full flex-col gap-[22px]">
          <MenuRow
            icon={<MenuIcon src={personIcon} inset={{ inset: "16.67%" }} />}
            label="프로필 • 개인화 설정"
            onClick={() => navigate("/mypage/profile")}
          />
          <MenuRow
            icon={
              <MenuIcon
                src={notificationsIcon}
                inset={{ inset: "10.42% 18.4% 8.33% 18.39%" }}
              />
            }
            label="알림 설정"
            onClick={() => navigate("/mypage/notifications")}
          />
          <MenuRow
            icon={<MenuIcon src={assignmentIcon} inset={{ inset: "0" }} />}
            label="일기 관리"
            onClick={() => navigate("/mypage/diary-management")}
          />
          <MenuRow
            icon={
              <MenuIcon src={monetizationIcon} inset={{ inset: "8.33%" }} />
            }
            label="구독 관리"
            onClick={() => navigate("/mypage/subscription")}
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
            onClick={() => navigate("/mypage/support")}
          />
          <MenuRow
            icon={<MenuIcon src={checkCircleIcon} inset={{ inset: "8.33%" }} />}
            label="이용 약관"
            onClick={() => navigate("/mypage/terms")}
          />
          <MenuRow
            icon={
              <MenuIcon
                src={lockIcon}
                inset={{ inset: "4.17% 16.67% 8.33% 16.67%" }}
              />
            }
            label="개인정보 처리방침"
            onClick={() => navigate("/mypage/privacy")}
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
            onClick={handleLogoutClick}
          />
          <MenuRow icon={<SentimentIcon />} label="회원탈퇴" disabled />
        </div>
      </div>
      {showLogoutModal && (
        <LogoutConfirmModal
          onCancel={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
        />
      )}
    </div>
  );
}
