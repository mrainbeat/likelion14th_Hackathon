import SettingsListPage from "./components/SettingsListPage";

export default function DiaryManagementPage() {
  return (
    <SettingsListPage
      title="일기 관리"
      items={[
        { label: "일기 관리" },
        { label: "숨긴 일기", disabled: true },
        { label: "휴지통" },
      ]}
    />
  );
}
