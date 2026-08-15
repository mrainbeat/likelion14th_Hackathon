import SettingsListPage from "./components/SettingsListPage";

export default function TermsPage() {
  return (
    <SettingsListPage
      title="이용 약관"
      items={[
        { label: "서비스 이용약관", disabled: true },
        { label: "경험조각 운영정책", disabled: true },
      ]}
    />
  );
}
