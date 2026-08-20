import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsListPage from "./components/SettingsListPage";
import { resetTodayDiary } from "../../utils/devDiary";
import { clearDraft } from "../../utils/diaryDraft";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetTodayDiary = async () => {
    if (isResetting) return;
    if (
      !window.confirm(
        "오늘 작성한 일기와 연결된 색상·성찰 질문·기억 후보를 초기화합니다. 계속할까요?",
      )
    )
      return;

    setIsResetting(true);
    try {
      const response = await resetTodayDiary();
      const result = response.data.result;
      alert(
        result.deleted
          ? "초기화가 완료되었습니다. 오늘 일기를 다시 작성할 수 있습니다."
          : "오늘 작성된 일기가 없어 초기화할 데이터가 없습니다.",
      );
      clearDraft();
      navigate("/home", { replace: true });
    } catch (error) {
      const code = error.response?.data?.code;
      if (code === "DEV409_1") {
        alert("공유 이력이 있는 일기는 초기화할 수 없습니다.");
      } else if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
      } else if (error.response?.status === 404) {
        alert("현재 서버에서는 개발용 초기화 기능이 활성화되어 있지않습니다.");
      } else {
        alert("오늘 일기를 초기화하지 못했습니다.");
      }
      console.error(
        "DELETE /api/dev/me/diaries/today 실패:",
        error.response?.status,
        error.response?.data,
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <SettingsListPage
      title="개인정보 처리방침"
      items={[
        { label: "개인정보 처리방침", to: "/mypage/privacy/dated-diary" },
        { label: "Ai 정보 활용 안내", onClick: handleResetTodayDiary },
        { label: "경험조각 익명화 • 처리 안내", disabled: true },
      ]}
    />
  );
}
