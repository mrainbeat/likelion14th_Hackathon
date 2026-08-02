import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import OnboardingName from "./pages/OnboardingName";
import OnboardingJob from "./pages/OnboardingJob";
import DiaryPage from "./pages/Diary/DiaryPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 레이아웃 전체 적용 */}
        <Route element={<Layout />}>
          <Route element={<Layout />}></Route>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingName />} />
          <Route path="/onboarding/job" element={<OnboardingJob />} />
          <Route path="/diary" element={<DiaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
