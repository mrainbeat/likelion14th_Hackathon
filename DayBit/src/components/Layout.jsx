import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="w-screen h-screen bg-white sm:bg-[#E5E8EB] flex justify-center items-center overflow-hidden font-sans">
      <div className="w-full h-full sm:w-[430px] sm:h-[844px] bg-[#F6F8FA] flex flex-col sm:rounded-3xl sm:shadow-2xl overflow-hidden relative">
        <div className="w-full h-full flex flex-col overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
