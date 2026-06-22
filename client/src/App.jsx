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
import SkillEvaluatorPage from './pages/SkillEvaluatorPage';
import CompanyPortalPage from './pages/CompanyPortalPage';
import CompanyRegisterPage from './pages/CompanyRegisterPage';
import PublicResumePage from './pages/PublicResumePage';

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
  // Companies skip onboarding (they go to company portal)
  if (user && user.role === 'company') return children;
  if (user && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
};

const CompanyRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'company') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"            element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register"         element={user ? <Navigate to="/" /> : <RegisterPage />} />
      <Route path="/register/company" element={user ? <Navigate to="/company-portal" /> : <CompanyRegisterPage />} />
      <Route path="/onboarding"       element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

      {/* Public resume page — no login required */}
      <Route path="/resume/:userId"   element={<PublicResumePage />} />

      {/* Main app — job seekers */}
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
        <Route path="learning-roadmap"  element={<LearningRoadmapPage />} />
        <Route path="skill-evaluator"   element={<SkillEvaluatorPage />} />
        {/* Company portal nested inside Layout so nav works */}
        <Route path="company-portal"    element={<CompanyRoute><CompanyPortalPage /></CompanyRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
