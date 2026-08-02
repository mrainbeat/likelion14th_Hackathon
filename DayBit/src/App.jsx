import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
// import Onboarding from "./pages/Onboarding";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        {/* <Route path="/onboarding" element={<Onboarding />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
