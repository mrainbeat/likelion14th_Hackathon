import { BrowserRouter, Routes, Route } from "react-router-dom";
import DevAccessProvider from "./contexts/DevAccessProvider";
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
import EmailLoginPage from "./pages/Auth/EmailLoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ReflectionPage from "./pages/Diary/ReflectionPage";
import TodayColorPage from "./pages/Diary/TodayColorPage";
import HomePage from "./pages/Home/HomePage";
import DiaryListPage from "./pages/Home/DiaryListPage";
import DiaryDetailPage from "./pages/Home/DiaryDetailPage";
import ExperiencePage from "./pages/Experience/ExperiencePage";
import ExperienceIncomingListPage from "./pages/Experience/ExperienceIncomingListPage";
import ExperienceGottenListPage from "./pages/Experience/ExperienceGottenListPage";
import ExperienceSentListPage from "./pages/Experience/ExperienceSentListPage";
import ExperienceSentDetailPage from "./pages/Experience/ExperienceSentDetailPage";
import ExperienceDiaryPage from "./pages/Experience/ExperienceDiaryPage";
import MyPage from "./pages/MyPage/MyPage";
import NotificationsPage from "./pages/Notification/NotificationsPage";
import ProfileSettingsPage from "./pages/MyPage/ProfileSettingsPage";
import NotificationSettingsPage from "./pages/MyPage/NotificationSettingsPage";
import DiaryManagementPage from "./pages/MyPage/DiaryManagementPage";
import MyPageDiaryListPage from "./pages/MyPage/DiaryListPage";
import SubscriptionPage from "./pages/MyPage/SubscriptionPage";
import CustomerServicePage from "./pages/MyPage/CustomerServicePage";
import TermsPage from "./pages/MyPage/TermsPage";
import PrivacyPolicyPage from "./pages/MyPage/PrivacyPolicyPage";
import DatedDiaryPage from "./pages/MyPage/DatedDiaryPage";
import WeeklyImagePage from "./pages/Home/WeeklyImagePage";

function App() {
  return (
    <BrowserRouter>
      <DevAccessProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<Layout />}></Route>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/email" element={<EmailLoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<OnboardingName />} />
            <Route path="/onboarding/job" element={<OnboardingJob />} />
            <Route path="/onboarding/alarm" element={<OnboardingAlarm />} />
            <Route path="/onboarding/consent" element={<OnboardingConsent />} />
            <Route path="/onboarding/done" element={<OnboardingDone />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/home/diaries" element={<DiaryListPage />} />
            <Route
              path="/home/diaries/:diaryId"
              element={<DiaryDetailPage />}
            />
            <Route
              path="/home/weekly-rewards/:weeklyRewardId"
              element={<WeeklyImagePage />}
            />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route
              path="/experience/incoming"
              element={<ExperienceIncomingListPage />}
            />
            <Route
              path="/experience/gotten"
              element={<ExperienceGottenListPage />}
            />
            <Route
              path="/experience/sent"
              element={<ExperienceSentListPage />}
            />
            <Route
              path="/experience/sent/:pieceId"
              element={<ExperienceSentDetailPage />}
            />
            <Route
              path="/experience/diary/:pieceId"
              element={<ExperienceDiaryPage />}
            />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/mypage/profile" element={<ProfileSettingsPage />} />
            <Route
              path="/mypage/notifications"
              element={<NotificationSettingsPage />}
            />
            <Route
              path="/mypage/diary-management"
              element={<DiaryManagementPage />}
            />
            <Route
              path="/mypage/diary-list"
              element={<MyPageDiaryListPage />}
            />
            <Route path="/mypage/subscription" element={<SubscriptionPage />} />
            <Route path="/mypage/support" element={<CustomerServicePage />} />
            <Route path="/mypage/terms" element={<TermsPage />} />
            <Route path="/mypage/privacy" element={<PrivacyPolicyPage />} />
            <Route
              path="/mypage/privacy/dated-diary"
              element={<DatedDiaryPage />}
            />
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/diary/reflection" element={<ReflectionPage />} />
            <Route path="/diary/today-color" element={<TodayColorPage />} />
            <Route
              path="/oauth2/callback/kakao"
              element={<KakaoCallbackPage />}
            />
          </Route>
        </Routes>
      </DevAccessProvider>
    </BrowserRouter>
  );
}
export default App;
