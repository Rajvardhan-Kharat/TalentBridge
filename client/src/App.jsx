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
import CompanyProfilePage from './pages/CompanyProfilePage';
import PublicResumePage from './pages/PublicResumePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CareerPortalSelector from './pages/CareerPortalSelector';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading && !user) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-base)' }}>
      <div className="loader" style={{ width: 40, height: 40 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const OnboardingGuard = ({ children }) => {
  const { user } = useAuth();
  // Admins must go to their own dashboard
  if (user && user.role === 'admin') return <Navigate to="/admin" replace />;
  // Companies skip onboarding
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

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading && !user) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-base)' }}>
      <div className="loader" style={{ width: 40, height: 40 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Blocks company and admin users from job-seeker-only pages
const JobseekerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'company') return <Navigate to="/company-portal" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
};

// Index route: sends each role to the right home page
const RoleIndexRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'company') return <Navigate to="/company-portal" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <DashboardPage />;
};

// Helper component to route Profile page based on role
const ProfileRouteSwitch = () => {
  const { user } = useAuth();
  if (user?.role === 'company') return <CompanyProfilePage />;
  return <ProfilePage />;
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

      {/* Admin dashboard — standalone page, no Layout sidebar */}
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

      {/* Career Portal Selector — accessible while logged in (no layout) */}
      <Route path="/career-selector" element={<PrivateRoute><CareerPortalSelector /></PrivateRoute>} />

      {/* Public resume page — no login required */}
      <Route path="/resume/:userId"   element={<PublicResumePage />} />

      {/* Public Home Page */}
      <Route path="/" element={<HomePage />} />

      {/* Main app — job seekers + company (company gets redirected from /dashboard to /company-portal) */}
      <Route element={<PrivateRoute><OnboardingGuard><Layout /></OnboardingGuard></PrivateRoute>}>
        <Route path="dashboard"         element={<RoleIndexRedirect />} />
        <Route path="jobs"              element={<JobseekerRoute><JobDiscoveryPage /></JobseekerRoute>} />
        <Route path="evaluator"         element={<JobseekerRoute><JobEvaluatorPage /></JobseekerRoute>} />
        <Route path="cv-tailor"         element={<JobseekerRoute><CvTailoringPage /></JobseekerRoute>} />
        <Route path="toolkit"           element={<JobseekerRoute><PromptToolkitPage /></JobseekerRoute>} />
        <Route path="portal-scanner"    element={<JobseekerRoute><PortalScannerPage /></JobseekerRoute>} />
        <Route path="tracker"           element={<JobseekerRoute><ApplicationTrackerPage /></JobseekerRoute>} />
        <Route path="story-bank"        element={<JobseekerRoute><StoryBankPage /></JobseekerRoute>} />
        <Route path="profile"           element={<ProfileRouteSwitch />} />
        <Route path="settings"          element={<SettingsPage />} />
        <Route path="pricing"           element={<PricingPage />} />
        <Route path="resume"            element={<JobseekerRoute><ResumeBuilderPage /></JobseekerRoute>} />
        <Route path="learning-roadmap"  element={<JobseekerRoute><LearningRoadmapPage /></JobseekerRoute>} />
        <Route path="skill-evaluator"   element={<JobseekerRoute><SkillEvaluatorPage /></JobseekerRoute>} />
        {/* Company portal */}
        <Route path="company-portal"    element={<CompanyRoute><CompanyPortalPage /></CompanyRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

