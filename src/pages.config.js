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
import ButtonGenerator from './pages/ButtonGenerator';
import Contact from './pages/Contact';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import DiscordPlugin from './pages/DiscordPlugin';
import Documentation from './pages/Documentation';
import Features from './pages/Features';
import Home from './pages/Home';
import MerchantProfile from './pages/MerchantProfile';
import Onboarding from './pages/Onboarding';
import Pay from './pages/Pay';
import PayTerminal from './pages/PayTerminal';
import PayTerminals from './pages/PayTerminals';
import PaymentLinks from './pages/PaymentLinks';
import Payments from './pages/Payments';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import SDKDocumentation from './pages/SDKDocumentation';
import Security from './pages/Security';
import ShoppingPageGenerator from './pages/ShoppingPageGenerator';
import SubscriberPortal from './pages/SubscriberPortal';
import Subscriptions from './pages/Subscriptions';
import TermsOfService from './pages/TermsOfService';
import Webhooks from './pages/Webhooks';
import PaymentProof from './pages/PaymentProof';
import Unlock from './pages/Unlock';
import Store from './pages/Store';
import __Layout from './Layout.jsx';


export const PAGES = {
    "APIReference": APIReference,
    "About": About,
    "AdminDashboard": AdminDashboard,
    "ApiKeys": ApiKeys,
    "Billing": Billing,
    "ButtonGenerator": ButtonGenerator,
    "Contact": Contact,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "DiscordPlugin": DiscordPlugin,
    "Documentation": Documentation,
    "Features": Features,
    "Home": Home,
    "MerchantProfile": MerchantProfile,
    "Onboarding": Onboarding,
    "Pay": Pay,
    "PayTerminal": PayTerminal,
    "PayTerminals": PayTerminals,
    "PaymentLinks": PaymentLinks,
    "Payments": Payments,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "SDKDocumentation": SDKDocumentation,
    "Security": Security,
    "ShoppingPageGenerator": ShoppingPageGenerator,
    "SubscriberPortal": SubscriberPortal,
    "Subscriptions": Subscriptions,
    "TermsOfService": TermsOfService,
    "Webhooks": Webhooks,
    "PaymentProof": PaymentProof,
    "Unlock": Unlock,
    "Store": Store,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};