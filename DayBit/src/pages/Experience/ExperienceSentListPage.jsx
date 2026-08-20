import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExperiencePieceSection from "./components/ExperiencePieceSection";
import backIcon from "../../assets/icons/back.svg";
import profileIcon from "../../assets/icons/profile.svg";
import logoImage from "../../assets/logos/logo-symbol.svg";
import {
  getMyExperienceFragments,
  fragmentsToPieceItems,
  getCachedMyFragments,
  saveCachedMyFragments,
} from "../../utils/experienceFragments";

export default function ExperienceSentListPage() {
  const navigate = useNavigate();
  const [fragments, setFragments] = useState(() => getCachedMyFragments());

  useEffect(() => {
    let alive = true;
    getMyExperienceFragments()
      .then((response) => {
        if (!alive) return;
        const list = response.data.result ?? [];
        setFragments(list);
        saveCachedMyFragments(list);
      })
      .catch((error) => {
        console.error(
          "GET /api/v1/experience-fragments/mine 실패:",
          error.response?.status,
          error.response?.data,
        );
      });
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(
    () =>
      fragmentsToPieceItems(
        fragments.filter((f) => f.status === "APPROVED"),
        "sent",
        (f) => f.approvedAt ?? f.createdAt,
      ),
    [fragments],
  );

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
          <button
            type="button"
            onClick={() => navigate("/mypage")}
            className="size-[38px] shrink-0 cursor-pointer bg-transparent border-none p-0 transition-opacity active:opacity-60"
          >
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
          title="전달한 나의 경험조각"
          emptyText="나의 경험조각을 전달할 사람을 찾고있어요:)"
          hideTag
          items={items}
          onItemClick={(item) =>
            navigate(`/experience/sent/${item.id}`, {
              state: { fragment: item.fragment },
            })
          }
        />
      </div>
    </div>
  );
}
