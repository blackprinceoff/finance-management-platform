import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<AuthPage />} />
    </Routes>
  );
}
