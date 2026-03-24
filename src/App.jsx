import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AdminLaunchpad from './pages/AdminLaunchpad';
import TokenSale from './pages/TokenSale';
import TokenSaleDashboard from './pages/TokenSaleDashboard';
import Events from './pages/Events';
import EventCheckout from './pages/EventCheckout';
import EventEntry from './pages/EventEntry';
import TransactionAudit from './pages/TransactionAudit';
import Demo from './pages/Demo';
import MultiTokenCheckout from './pages/MultiTokenCheckout';
import DonationPages from './pages/DonationPages';
import Donate from './pages/Donate';
import NFTs from './pages/NFTs';
import NFTGating from './pages/NFTGating';
import NFTGate from './pages/NFTGate';
import NFTDistribution from './pages/NFTDistribution';
import NFTOperations from './pages/NFTOperations';
import NFTFulfillmentSetup from './pages/NFTFulfillmentSetup';
import NFTMarketplace from './pages/NFTMarketplace';
import NFTStore from './pages/NFTStore';
import NFTDetail from './pages/NFTDetail';
import NFTMarketplaceFAQ from './pages/NFTMarketplaceFAQ';
import NFTMarketplaceTerms from './pages/NFTMarketplaceTerms';
import PublicNFTMarketplace from './pages/PublicNFTMarketplace';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const TEMP_RESTRICTED_PAGES = ["Subscriptions", "NFTs"];
const TEMP_ALLOWED_EMAIL = "nerscardano@gmail.com";

const ProtectedRoute = ({ children, currentPageName }) => {
  const { user } = useAuth();
  const isTemporarilyAllowed = user?.role === "admin" || user?.email === TEMP_ALLOWED_EMAIL;

  if (TEMP_RESTRICTED_PAGES.includes(currentPageName) && !isTemporarilyAllowed) {
    return <PageNotFound />;
  }

  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const publicPages = ["Checkout", "SubscriberPortal", "Home", "Pay", "PayTerminal", "Features", "Pricing", "Security", "Documentation", "APIReference", "Webhooks", "About", "Contact", "PrivacyPolicy", "TermsOfService", "AcceptableUsePolicy", "MerchantAgreement", "Disclaimer", "PaymentProof", "Unlock", "Store", "Access", "Roadmap", "Litepaper", "TokenSale", "EventCheckout", "EventEntry", "MerchantProfile", "Demo", "MultiTokenCheckout", "Donate", "NFTGate", "NFTStore", "NFTMarketplaceFAQ", "NFTMarketplaceTerms", "Marketplace"];
  
  // Determine current page name from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPageName = pathSegments[0] || "Home";

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
      // Only redirect to login if the current page is not public
      if (!publicPages.includes(currentPageName)) {
        navigateToLogin();
        return null;
      }
      // If it's a public page, continue rendering without redirecting
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
      <Route path="/Demo" element={<Demo />} />
      <Route path="/MultiTokenCheckout" element={<MultiTokenCheckout />} />
      <Route path="/DonationPages" element={<ProtectedRoute currentPageName="DonationPages"><LayoutWrapper currentPageName="DonationPages"><DonationPages /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/Donate" element={<ProtectedRoute currentPageName="Donate"><LayoutWrapper currentPageName="Donate"><Donate /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/NFTs" element={<ProtectedRoute currentPageName="NFTs"><LayoutWrapper currentPageName="NFTs"><NFTs /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/NFTOperations" element={<ProtectedRoute currentPageName="NFTOperations"><LayoutWrapper currentPageName="NFTOperations"><NFTOperations /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/NFTFulfillmentSetup" element={<ProtectedRoute currentPageName="NFTFulfillmentSetup"><LayoutWrapper currentPageName="NFTFulfillmentSetup"><NFTFulfillmentSetup /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/NFTGating" element={<ProtectedRoute currentPageName="NFTGating"><LayoutWrapper currentPageName="NFTGating"><NFTGating /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/NFTDistribution" element={<ProtectedRoute currentPageName="NFTDistribution"><LayoutWrapper currentPageName="NFTDistribution"><NFTDistribution /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/NFTMarketplace" element={<ProtectedRoute currentPageName="NFTMarketplace"><LayoutWrapper currentPageName="NFTMarketplace"><NFTMarketplace /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/NFTGate" element={<ProtectedRoute currentPageName="NFTGate"><LayoutWrapper currentPageName="NFTGate"><NFTGate /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/NFTStore" element={<ProtectedRoute currentPageName="NFTStore"><LayoutWrapper currentPageName="NFTStore"><NFTStore /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/nft/:storeSlug" element={<NFTStore />} />
      <Route path="/nft/:storeSlug/:listingId" element={<NFTDetail />} />
      <Route path="/NFTMarketplaceFAQ" element={<LayoutWrapper currentPageName="NFTMarketplaceFAQ"><NFTMarketplaceFAQ /></LayoutWrapper>} />
      <Route path="/NFTMarketplaceTerms" element={<LayoutWrapper currentPageName="NFTMarketplaceTerms"><NFTMarketplaceTerms /></LayoutWrapper>} />
      <Route path="/Marketplace" element={<LayoutWrapper currentPageName="Marketplace"><PublicNFTMarketplace /></LayoutWrapper>} />
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