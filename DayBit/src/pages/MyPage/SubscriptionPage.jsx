import SettingsListPage from "./components/SettingsListPage";

export default function SubscriptionPage() {
  return (
    <SettingsListPage
      title="구독 관리"
      items={[
        { label: "플랜 / 혜택", disabled: true },
        { label: "구독 관리", disabled: true },
      ]}
    />
  );
}
