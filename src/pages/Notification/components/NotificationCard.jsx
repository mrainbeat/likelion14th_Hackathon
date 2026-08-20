export default function NotificationCard({ title, time, body, unread }) {
  return (
    <div
      className={`flex w-full items-center rounded-tr-[12px] rounded-bl-[12px] rounded-br-[12px] p-[16px] ${
        unread
          ? "bg-[#DFE2EA]"
          : "border border-solid border-[#DFE2EA] bg-[#EFF1F6]"
      }`}
    >
      <div className="flex min-w-px flex-1 flex-col items-start gap-[4px]">
        <div className="flex w-full items-end justify-between">
          <p
            className={`text-[16px] font-semibold leading-[normal] ${
              unread ? "text-[#2D3038]" : "text-[#4F5563]"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-[12px] font-normal leading-[normal] tracking-[-0.12px] ${
              unread ? "text-[#4F5563]" : "text-[#5F6473]"
            }`}
          >
            {time}
          </p>
        </div>
        <p
          className={`text-[14px] font-medium leading-[normal] tracking-[-0.28px] ${
            unread ? "text-[#4F5563]" : "text-[#787E8C]"
          }`}
        >
          {body}
        </p>
      </div>
    </div>
  );
}
