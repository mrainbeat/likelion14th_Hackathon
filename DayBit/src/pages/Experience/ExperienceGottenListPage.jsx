import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExperiencePieceSection from "./components/ExperiencePieceSection";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
import {
  getReceivedFragments,
  removeReceivedFragment,
  fragmentToPieceItem,
} from "../../utils/experienceFragments";

export default function ExperienceGottenListPage() {
  const navigate = useNavigate();
  const [receivedFragments, setReceivedFragments] = useState(() =>
    getReceivedFragments(),
  );

  const items = receivedFragments
    .slice()
    .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
    .map((f) => fragmentToPieceItem(f, "received"));

  const handleRemove = (item) => {
    removeReceivedFragment(item.id);
    setReceivedFragments(getReceivedFragments());
  };

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-y-auto bg-[#f6f8fa] px-[16px] py-[16px] scrollbar-hide">
      <div className="flex w-full flex-col items-start gap-[16px] pb-[16px]">
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="size-[32px] shrink-0 cursor-pointer"
          >
            <img
              src={backIcon}
              alt="뒤로가기"
              className="h-full w-full object-contain"
            />
          </button>
          <button className="size-[38px] shrink-0 cursor-pointer bg-transparent border-none p-0">
            <img
              src={profileIcon}
              alt="프로필"
              className="h-full w-full object-contain [filter:drop-shadow(0_0_9.938px_rgba(65,68,80,0.16))]"
            />
          </button>
        </div>

        <div className="flex items-center gap-[10px]">
          <img
            src={logoImage}
            alt=""
            className="h-[28px] w-[22px] object-cover"
          />
          <p className="text-[24px] font-bold tracking-[-0.48px] text-grey-90">
            경험조각 주고받기
          </p>
        </div>

        <ExperiencePieceSection
          title="받은 경험조각"
          items={items}
          kebabMode="options"
          onItemClick={(item) =>
            navigate(`/experience/diary/${item.id}`, {
              state: { mode: "incoming", fragment: item.fragment },
            })
          }
          onHideItem={handleRemove}
          onDeleteItem={handleRemove}
        />
      </div>
    </div>
  );
}
