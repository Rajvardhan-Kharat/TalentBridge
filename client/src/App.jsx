import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import JobDiscoveryPage from './pages/JobDiscoveryPage';
import JobEvaluatorPage from './pages/JobEvaluatorPage';
import CvTailoringPage from './pages/CvTailoringPage';
import PromptToolkitPage from './pages/PromptToolkitPage';
import PortalScannerPage from './pages/PortalScannerPage';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage';
import StoryBankPage from './pages/StoryBankPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import LearningRoadmapPage from './pages/LearningRoadmapPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a0f' }}>
      <div className="loader" style={{ width: 40, height: 40 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const OnboardingGuard = ({ children }) => {
  const { user } = useAuth();
  if (user && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
};

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"      element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register"   element={user ? <Navigate to="/" /> : <RegisterPage />} />
      <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

      <Route path="/" element={<PrivateRoute><OnboardingGuard><Layout /></OnboardingGuard></PrivateRoute>}>
        <Route index                    element={<DashboardPage />} />
        <Route path="jobs"              element={<JobDiscoveryPage />} />
        <Route path="evaluator"         element={<JobEvaluatorPage />} />
        <Route path="cv-tailor"         element={<CvTailoringPage />} />
        <Route path="toolkit"           element={<PromptToolkitPage />} />
        <Route path="portal-scanner"    element={<PortalScannerPage />} />
        <Route path="tracker"           element={<ApplicationTrackerPage />} />
        <Route path="story-bank"        element={<StoryBankPage />} />
        <Route path="profile"           element={<ProfilePage />} />
        <Route path="pricing"           element={<PricingPage />} />
        <Route path="resume"            element={<ResumeBuilderPage />} />
        <Route path="learning-roadmap"   element={<LearningRoadmapPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
