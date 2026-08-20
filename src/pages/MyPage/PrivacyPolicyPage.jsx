import SettingsListPage from "./components/SettingsListPage";

export default function PrivacyPolicyPage() {
  return (
    <SettingsListPage
      title="개인정보 처리방침"
      items={[
        { label: "개발자 모드", to: "/mypage/privacy/dated-diary" },
        { label: "Ai 정보 활용 안내", disabled: true },
        { label: "경험조각 익명화 • 처리 안내", disabled: true },
      ]}
    />
  );
}
