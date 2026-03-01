/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import APIReference from './pages/APIReference';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import ApiKeys from './pages/ApiKeys';
import Billing from './pages/Billing';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Features from './pages/Features';
import Home from './pages/Home';
import MerchantSettings from './pages/MerchantSettings';
import Onboarding from './pages/Onboarding';
import PaymentLinks from './pages/PaymentLinks';
import Payments from './pages/Payments';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import SDKDocumentation from './pages/SDKDocumentation';
import Security from './pages/Security';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Subscriptions from './pages/Subscriptions';
import TermsOfService from './pages/TermsOfService';
import Webhooks from './pages/Webhooks';
import __Layout from './Layout.jsx';


export const PAGES = {
    "APIReference": APIReference,
    "About": About,
    "AdminDashboard": AdminDashboard,
    "ApiKeys": ApiKeys,
    "Billing": Billing,
    "Checkout": Checkout,
    "Contact": Contact,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "Features": Features,
    "Home": Home,
    "MerchantSettings": MerchantSettings,
    "Onboarding": Onboarding,
    "PaymentLinks": PaymentLinks,
    "Payments": Payments,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "SDKDocumentation": SDKDocumentation,
    "Security": Security,
    "SubscriptionPlans": SubscriptionPlans,
    "Subscriptions": Subscriptions,
    "TermsOfService": TermsOfService,
    "Webhooks": Webhooks,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};