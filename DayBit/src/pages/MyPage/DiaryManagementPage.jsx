import SettingsListPage from "./components/SettingsListPage";

export default function DiaryManagementPage() {
  return (
    <SettingsListPage
      title="일기 관리"
      items={[
        { label: "일기 관리", to: "/mypage/diary-list" },
        { label: "숨긴 일기", disabled: true },
        { label: "휴지통", to: "/mypage/trash" },
      ]}
    />
  );
}
