import SettingsListPage from "./components/SettingsListPage";

export default function NotificationSettingsPage() {
  return (
    <SettingsListPage
      title="알림 설정"
      items={[
        { label: "일기", disabled: true },
        { label: "경험조각", disabled: true },
        { label: "서비스", disabled: true },
      ]}
    />
  );
}
