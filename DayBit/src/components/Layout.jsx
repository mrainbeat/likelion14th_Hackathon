import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    /* 바깥 전체 화면->모바일에선 꽉 차고, 데스크톱에선 회색 배경 + 정중앙 정렬 */
    // dvh 대신 svh 사용
    <div className="w-screen  h-[100svh] bg-white sm:bg-[#E5E8EB] flex justify-center items-center overflow-hidden font-sans">
      {/* 데스크톱에선 390x844 고정->핸드폰 화면처럼 보이도록 */}
      <div className="w-full h-full sm:w-[390px] sm:h-[844px] bg-[#F6F8FA] flex flex-col sm:rounded-3xl sm:shadow-2xl overflow-hidden relative">
        {/* 자식 페이지들이 렌더링되는 영역 */}
        <div className="w-full h-full flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
