import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-[100svh] w-full items-center justify-center overflow-hidden bg-grey-0 font-sans sm:bg-grey-20 sm:p-[20px]">
      <div className="relative flex h-[100svh] w-full flex-col overflow-hidden bg-[#F6F8FA] sm:h-[796px] sm:max-h-full sm:w-[390px] sm:rounded-3xl sm:shadow-2xl">
        <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
