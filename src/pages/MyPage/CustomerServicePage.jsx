import SettingsListPage from "./components/SettingsListPage";

export default function CustomerServicePage() {
  return (
    <SettingsListPage
      title="고객센터"
      items={[
        { label: "자주 묻는 질문", disabled: true },
        { label: "문의하기", disabled: true },
        { label: "오류 신고", disabled: true },
      ]}
    />
  );
}
