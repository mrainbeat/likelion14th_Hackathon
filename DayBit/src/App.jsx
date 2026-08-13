import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import OnboardingName from "./pages/Onboarding/OnboardingName";
import OnboardingJob from "./pages/Onboarding/OnboardingJob";
import DiaryPage from "./pages/Diary/DiaryPage";
import OnboardingAlarm from "./pages/Onboarding/OnboardingAlarm";
import OnboardingConsent from "./pages/Onboarding/OnboardingConsent";
import OnboardingDone from "./pages/Onboarding/OnboardingDone";
import KakaoCallbackPage from "./pages/Auth/KakaoCallbackPage";
import ReflectionPage from "./pages/Diary/ReflectionPage";
import TodayColorPage from "./pages/Diary/TodayColorPage";
import HomePage from "./pages/Home/HomePage";
import DiaryListPage from "./pages/Home/DiaryListPage";
import DiaryDetailPage from "./pages/Home/DiaryDetailPage";
import ExperiencePage from "./pages/Experience/ExperiencePage";

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
          <Route path="/onboarding/alarm" element={<OnboardingAlarm />} />
          <Route path="/onboarding/consent" element={<OnboardingConsent />} />
          <Route path="/onboarding/done" element={<OnboardingDone />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/home/diaries" element={<DiaryListPage />} />
          <Route path="/home/diaries/:diaryId" element={<DiaryDetailPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/diary/reflection" element={<ReflectionPage />} />
          <Route path="/diary/today-color" element={<TodayColorPage />} />
          <Route
            path="/oauth2/callback/kakao"
            element={<KakaoCallbackPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
