import { Navigate, Route, Routes } from 'react-router-dom';
import MarketingHome from './pages/MarketingHome.jsx';
import PromptWorkspace from './components/PromptWorkspace';
import AuthPage from './pages/AuthPage';
import StudioPage from './pages/StudioPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import CustomisePage from './pages/CustomisePage.jsx';
import { useAuth } from './context/useAuth.js';

function Loading() {
  return <div className="flex h-screen items-center justify-center text-sm text-gray-400 font-sans">Loading...</div>;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<MarketingHome />} />
        <Route path="/design" element={<PromptWorkspace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/design" element={<PromptWorkspace />} />
      <Route path="/design/uploads" element={<UploadPage />} />
      <Route path="/design/projects/:id" element={<StudioPage />} />
      <Route path="/design/customise/:uploadId" element={<CustomisePage />} />
      <Route path="/design/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/design" replace />} />
    </Routes>
  );
}

export default App;