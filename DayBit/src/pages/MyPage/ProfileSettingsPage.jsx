import SettingsListPage from "./components/SettingsListPage";

export default function ProfileSettingsPage() {
  return (
    <SettingsListPage
      title="프로필 • 개인화 설정"
      items={[
        { label: "닉네임 수정" },
        { label: "하루 전환 시간" },
        { label: "직업 수정" },
        { label: "Ai 질문에 활용 중인 정보 관리", disabled: true },
      ]}
    />
  );
}
