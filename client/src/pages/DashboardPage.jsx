import { useAuth } from '../context/AuthContext';
import { useCareerTier } from './CareerPortalSelector';
import FresherDashboard from './FresherDashboard';
import MidLevelDashboard from './MidLevelDashboard';
import SeniorDashboard from './SeniorDashboard';

export default function DashboardPage() {
  const [tier] = useCareerTier();
  const { user } = useAuth();
  
  // Determine tier based on profile experience
  let profileTier = 'midlevel';
  const exp = user?.profile?.experience;
  if (exp === 'fresher' || exp === '1-3 years') profileTier = 'fresher';
  else if (exp === '10+ years') profileTier = 'senior';

  const activeTier = tier || profileTier;

  if (activeTier === 'fresher') {
    return <FresherDashboard />;
  }

  if (activeTier === 'senior') {
    return <SeniorDashboard />;
  }

  // Default / midlevel
  return <MidLevelDashboard />;
}
