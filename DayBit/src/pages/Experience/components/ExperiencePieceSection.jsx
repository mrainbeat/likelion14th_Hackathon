import { Fragment } from "react";
import kebabIcon from "../../../assets/icons/menu.svg";

function ChevronDownIcon() {
  return (
    <svg
      width="11"
      height="7"
      viewBox="0 0 11 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5.5 6L10 1"
        stroke="#5F6473"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoreButton({ onClick }) {
  return (
    <div className="flex w-full items-center justify-center gap-[12px]">
      <div className="h-px flex-1 bg-grey-40" />
      <button
        type="button"
        onClick={onClick}
        className="flex shrink-0 items-center gap-[2px] rounded-[38px] bg-grey-10 px-[12px] py-[6px]"
      >
        <span className="whitespace-nowrap text-[14px] font-semibold text-grey-70">
          더보기
        </span>
        <ChevronDownIcon />
      </button>
      <div className="h-px flex-1 bg-grey-40" />
    </div>
  );
}

export default function ExperiencePieceSection({
  title,
  subtitle,
  items,
  hasMore,
  onMore,
}) {
  return (
    <div className="w-full shrink-0 rounded-[12px] bg-grey-0 px-[16px] py-[14px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]">
      <div className="flex w-full flex-col items-start gap-[16px]">
        <div className="flex w-full flex-col items-start gap-[2px]">
          <p className="text-[20px] font-semibold tracking-[-0.4px] text-grey-90">
            {title}
          </p>
          {subtitle && (
            <p className="text-[14px] font-medium tracking-[-0.28px] text-grey-60">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-[12px]">
          {items.map((item, i) => (
            <Fragment key={item.id}>
              {i > 0 && <div className="h-px w-full bg-grey-40" />}
              <div className="flex w-full flex-col items-start gap-[8px]">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <p className="whitespace-nowrap text-[18px] font-semibold tracking-[-0.18px] text-grey-80">
                      {item.dateLabel}
                    </p>
                    {item.tag && (
                      <span className="shrink-0 rounded-[8px] bg-grey-60 px-[6px] py-[2px] text-[14px] font-medium tracking-[-0.28px] text-grey-0">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <button type="button" className="shrink-0">
                    <img src={kebabIcon} alt="더보기" className="size-[16px]" />
                  </button>
                </div>
                <div className="flex w-full items-center gap-[5px] overflow-hidden">
                  <p className="shrink-0 whitespace-nowrap text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                    {item.time}
                  </p>
                  <p className="min-w-0 flex-1 truncate text-[16px] font-medium tracking-[-0.32px] text-grey-70">
                    {item.snippet}
                  </p>
                </div>
              </div>
            </Fragment>
          ))}
        </div>

        {hasMore && <MoreButton onClick={onMore} />}
      </div>
    </div>
  );
}
