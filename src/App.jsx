import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProfileIncompleteScreen from '@/components/ProfileIncompleteScreen';
import { useProfileCheck } from '@/components/hooks/useProfileCheck';
import AdminLaunchpad from './pages/AdminLaunchpad';
import TokenSale from './pages/TokenSale';
import TokenSaleDashboard from './pages/TokenSaleDashboard';
import Events from './pages/Events';
import EventCheckout from './pages/EventCheckout';
import EventEntry from './pages/EventEntry';
import TransactionAudit from './pages/TransactionAudit';
import Demo from './pages/Demo';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const ProtectedRoute = ({ children, currentPageName }) => {
  const { isProfileComplete, isLoading } = useProfileCheck();
  const publicPages = ["Checkout", "SubscriberPortal", "Home", "Pay", "PayTerminal", "Features", "Pricing", "Security", "Documentation", "APIReference", "Webhooks", "About", "Contact", "PrivacyPolicy", "TermsOfService", "AcceptableUsePolicy", "MerchantAgreement", "Disclaimer", "PaymentProof", "Unlock", "Store", "Access", "Roadmap", "Litepaper", "TokenSale", "EventCheckout", "EventEntry", "MerchantProfile"];

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isProfileComplete && !publicPages.includes(currentPageName)) {
    return <ProfileIncompleteScreen />;
  }

  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute currentPageName={mainPageKey}>
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        </ProtectedRoute>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <ProtectedRoute currentPageName={path}>
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="/AdminLaunchpad" element={<ProtectedRoute currentPageName="AdminLaunchpad"><LayoutWrapper currentPageName="AdminLaunchpad"><AdminLaunchpad /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/TokenSale" element={<TokenSale />} />
      <Route path="/TokenSaleDashboard" element={<ProtectedRoute currentPageName="TokenSaleDashboard"><LayoutWrapper currentPageName="TokenSaleDashboard"><TokenSaleDashboard /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/Events" element={<ProtectedRoute currentPageName="Events"><LayoutWrapper currentPageName="Events"><Events /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/EventCheckout" element={<EventCheckout />} />
      <Route path="/EventEntry" element={<EventEntry />} />
      <Route path="/TransactionAudit" element={<ProtectedRoute currentPageName="TransactionAudit"><LayoutWrapper currentPageName="TransactionAudit"><TransactionAudit /></LayoutWrapper></ProtectedRoute>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App