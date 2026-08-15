import { useNavigate } from "react-router-dom";
import chevronIcon from "../../../assets/icons/mypage-chevron-right.svg";
import MyPageHeader from "./MyPageHeader";
import { useNickname } from "../useNickname";

function SettingsRow({ label, to, disabled }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (to) {
      navigate(to);
    } else {
      alert("준비 중인 기능이에요.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between bg-transparent p-0 text-left transition-opacity ${
        disabled ? "cursor-not-allowed" : "cursor-pointer active:opacity-60"
      }`}
    >
      <p
        className={`whitespace-nowrap text-[16px] font-medium leading-[normal] tracking-[-0.32px] ${
          disabled ? "text-grey-40" : "text-grey-70"
        }`}
      >
        {label}
      </p>
      <img
        src={chevronIcon}
        alt=""
        className="block h-[15px] w-[9px] shrink-0"
      />
    </button>
  );
}

export default function SettingsListPage({ title, items }) {
  const navigate = useNavigate();
  const nickname = useNickname();

  return (
    <div className="flex h-full w-full select-none flex-col gap-[14px] overflow-y-auto bg-[#F6F8FA] px-[16px] py-[16px] scrollbar-hide">
      <MyPageHeader nickname={nickname} onBack={() => navigate(-1)} />
      <p className="whitespace-nowrap text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-70">
        {title}
      </p>
      <div className="h-[0.5px] w-full shrink-0 bg-grey-40" />
      <div className="flex w-full flex-col gap-[22px]">
        {items.map((item) => (
          <SettingsRow key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}
