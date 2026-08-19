import { Fragment, useLayoutEffect, useRef, useState } from "react";

const NAVIGATE_THRESHOLD = 8;

const MOTION_DURATION = "0.3s";
const MOTION_EASING = "ease-out";

export const LIST_FADE_HEIGHT = 140;

export const LIST_FADE_GRADIENT =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)";

const ROW_DIVIDER_GRADIENT =
  "linear-gradient(90deg, rgba(205, 209, 218, 0.00) 0%, #CDD1DA 15%, #CDD1DA 84.62%, rgba(205, 209, 218, 0.00) 100%)";

const DIVIDER_LEFT_GRADIENT =
  "linear-gradient(270deg, #F3F4F7 75.48%, rgba(205, 209, 218, 0) 100%)";

const DIVIDER_RIGHT_GRADIENT =
  "linear-gradient(90deg, #F3F4F7 75.48%, rgba(205, 209, 218, 0) 100%)";

export function Collapsible({ open, children }) {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setContentHeight(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div
      className="w-full overflow-hidden [overflow-anchor:none]"
      style={{
        height: open ? contentHeight : 0,
        opacity: open ? 1 : 0,
        transition: `height ${MOTION_DURATION} ${MOTION_EASING}, opacity ${MOTION_DURATION} ${MOTION_EASING}`,
      }}
    >
      <div ref={contentRef} className="w-full">
        {children}
      </div>
    </div>
  );
}

function ChevronDownIcon({ className = "", style }) {
  return (
    <svg
      width="11"
      height="7"
      viewBox="0 0 11 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
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

function PillButton({ label, direction, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 cursor-pointer items-center gap-[2px] rounded-[38px] bg-grey-10 px-[12px] py-[6px] ${className}`}
    >
      <span
        key={label}
        className="animate-fade-in whitespace-nowrap text-[14px] font-semibold tracking-[-0.28px] text-grey-70"
      >
        {label}
      </span>
      {direction === "right" ? (
        <span className="flex h-[11px] w-[7px] shrink-0 items-center justify-center">
          <ChevronDownIcon style={{ rotate: "-90deg" }} />
        </span>
      ) : (
        <ChevronDownIcon
          className="shrink-0"
          style={{
            scale: direction === "up" ? "1 -1" : "1 1",
            transition: `scale ${MOTION_DURATION} ${MOTION_EASING}`,
          }}
        />
      )}
    </button>
  );
}

export function MoreButton({ expanded, onClick, onNavigate }) {
  return (
    <div className="relative z-10 flex w-full items-center justify-center gap-[12px]">
      <div
        className="h-px min-w-px flex-1"
        style={{ background: DIVIDER_LEFT_GRADIENT }}
      />
      <PillButton
        label={expanded ? "줄이기" : "더보기"}
        direction={expanded ? "up" : "down"}
        onClick={onClick}
      />
      {expanded && onNavigate && (
        <PillButton
          label="더보기"
          direction="right"
          onClick={onNavigate}
          className="animate-fade-in"
        />
      )}
      <div
        className="h-px min-w-px flex-1"
        style={{ background: DIVIDER_RIGHT_GRADIENT }}
      />
    </div>
  );
}

function findScrollParent(element) {
  let node = element?.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function RowDivider() {
  return (
    <div
      className="h-px w-full shrink-0"
      style={{ background: ROW_DIVIDER_GRADIENT }}
    />
  );
}

function PieceRow({ item, hideTag, onItemClick }) {
  return (
    <button
      type="button"
      onClick={() => onItemClick?.(item)}
      className="flex w-full cursor-pointer flex-col items-start gap-[8px] bg-transparent p-0 text-left"
    >
      <div className="flex w-full items-center gap-[8px]">
        <p className="shrink-0 whitespace-nowrap text-[18px] font-semibold leading-[normal] tracking-[-0.36px] text-grey-80">
          {item.dateLabel}
        </p>
        {!hideTag && item.tag && (
          <span className="min-w-0 truncate rounded-[8px] bg-grey-60 px-[6px] py-[2px] text-[14px] font-medium tracking-[-0.28px] text-grey-0">
            {item.tag}
          </span>
        )}
      </div>
      <div className="flex w-full items-center gap-[5px] overflow-hidden">
        <p className="shrink-0 whitespace-nowrap text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-grey-70">
          {item.time}
        </p>
        <p className="min-w-0 flex-1 truncate text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-grey-70">
          {item.snippet}
        </p>
      </div>
    </button>
  );
}

export default function ExperiencePieceSection({
  title,
  subtitle,
  emptyText,
  hideTag = false,
  items,
  moreItems = [],
  onItemClick,
  onNavigateMore,
}) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  const totalCount = items.length + moreItems.length;
  const canNavigateMore = totalCount >= NAVIGATE_THRESHOLD && !!onNavigateMore;
  const hasMore = moreItems.length > 0;

  const handleMoreClick = () => {
    const scroller = findScrollParent(cardRef.current);
    const keptScrollTop = scroller?.scrollTop;

    setExpanded((prev) => !prev);

    if (!scroller || keptScrollTop == null) return;
    const hold = () => {
      if (scroller.scrollTop !== keptScrollTop) {
        scroller.scrollTop = keptScrollTop;
      }
    };
    hold();
    requestAnimationFrame(hold);
  };

  return (
    <div
      ref={cardRef}
      className="relative w-full shrink-0 overflow-hidden rounded-[12px] bg-grey-0 p-[16px] shadow-[0_0_10px_0_rgba(77,80,91,0.05),0_0_30px_0_rgba(65,68,80,0.05)]"
    >
      <div className="flex w-full flex-col items-start gap-[16px]">
        <div className="flex w-full flex-col items-start gap-[4px]">
          <p className="text-[20px] font-semibold leading-[normal] tracking-[-0.4px] text-grey-90">
            {title}
          </p>
          {subtitle && (
            <p className="w-full whitespace-pre-line text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-[#787E8C]">
              {subtitle}
            </p>
          )}
        </div>

        {items.length === 0 && !hasMore && emptyText && (
          <p className="w-full whitespace-pre-line text-[14px] font-medium leading-[normal] tracking-[-0.28px] text-[#787E8C]">
            {emptyText}
          </p>
        )}

        {items.length > 0 && (
          <div className="flex w-full flex-col items-start gap-[20px]">
            {items.map((item, i) => (
              <Fragment key={item.id}>
                {i > 0 && <RowDivider />}
                <PieceRow
                  item={item}
                  hideTag={hideTag}
                  onItemClick={onItemClick}
                />
              </Fragment>
            ))}
          </div>
        )}

        {hasMore && (
          <Collapsible open={expanded}>
            <div className="flex w-full flex-col items-start gap-[20px]">
              {moreItems.map((item, i) => (
                <Fragment key={item.id}>
                  {(i > 0 || items.length > 0) && <RowDivider />}
                  <PieceRow
                    item={item}
                    hideTag={hideTag}
                    onItemClick={onItemClick}
                  />
                </Fragment>
              ))}
            </div>
          </Collapsible>
        )}

        {hasMore && (
          <MoreButton
            expanded={expanded}
            onClick={handleMoreClick}
            onNavigate={canNavigateMore ? onNavigateMore : undefined}
          />
        )}
      </div>

      {hasMore && (
        <div
          key={expanded ? "expanded" : "collapsed"}
          aria-hidden
          className="animate-fade-in pointer-events-none absolute inset-x-0 bottom-0"
          style={{ height: LIST_FADE_HEIGHT, background: LIST_FADE_GRADIENT }}
        />
      )}
    </div>
  );
}
