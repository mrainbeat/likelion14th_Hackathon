import { useNavigate } from "react-router-dom";
import backIcon from "../../../assets/icons/back.svg";
import profileIcon from "../../../assets/icons/profile.svg";

export default function MyPageHeader({ nickname, onBack }) {
  const navigate = useNavigate();
  return (
    <div className="flex w-full shrink-0 items-center justify-between">
      <button
        type="button"
        onClick={onBack || (() => navigate(-1))}
        className="size-[32px] shrink-0 cursor-pointer bg-transparent p-0 transition-opacity active:opacity-60"
      >
        <img src={backIcon} alt="뒤로가기" className="h-full w-full" />
      </button>
      <button
        type="button"
        onClick={() => navigate("/mypage")}
        className="flex cursor-pointer items-center justify-end gap-[12px] border-none bg-transparent p-0 transition-opacity active:opacity-60"
      >
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
      </button>
    </div>
  );
}
