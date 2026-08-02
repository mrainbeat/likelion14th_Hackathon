import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
// import Onboarding from "./pages/Onboarding";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/onboarding" element={<Onboarding />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
