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
import About from './pages/About';
import AcceptableUsePolicy from './pages/AcceptableUsePolicy';
import Access from './pages/Access';
import AccessLinks from './pages/AccessLinks';
import AdminCNTLab from './pages/AdminCNTLab';
import AdminDashboard from './pages/AdminDashboard';
import AdminLaunchpad from './pages/AdminLaunchpad';

import Billing from './pages/Billing';
import ButtonGenerator from './pages/ButtonGenerator';
import Contact from './pages/Contact';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Demo from './pages/Demo';
import Disclaimer from './pages/Disclaimer';
import DiscordPlugin from './pages/DiscordPlugin';
import Documentation from './pages/Documentation';
import EventCheckout from './pages/EventCheckout';
import EventEntry from './pages/EventEntry';
import Events from './pages/Events';
import Features from './pages/Features';
import Home from './pages/Home';
import Litepaper from './pages/Litepaper';
import MerchantAgreement from './pages/MerchantAgreement';
import MerchantProfile from './pages/MerchantProfile';
import MyStores from './pages/MyStores';
import Onboarding from './pages/Onboarding';
import POS from './pages/POS';
import Pay from './pages/Pay';
import PayTerminal from './pages/PayTerminal';
import PayTerminals from './pages/PayTerminals';
import PaymentLinks from './pages/PaymentLinks';
import PaymentProof from './pages/PaymentProof';
import Payments from './pages/Payments';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Roadmap from './pages/Roadmap';
import SDKDocumentation from './pages/SDKDocumentation';
import Security from './pages/Security';
import Settings from './pages/Settings';
import ShoppingPageGenerator from './pages/ShoppingPageGenerator';
import Store from './pages/Store';
import SubscriberPortal from './pages/SubscriberPortal';
import Subscriptions from './pages/Subscriptions';
import TermsOfService from './pages/TermsOfService';
import TokenSale from './pages/TokenSale';
import TokenSaleDashboard from './pages/TokenSaleDashboard';
import TransactionAudit from './pages/TransactionAudit';
import Unlock from './pages/Unlock';
import WebhookSetupWizard from './pages/WebhookSetupWizard';

import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AcceptableUsePolicy": AcceptableUsePolicy,
    "Access": Access,
    "AccessLinks": AccessLinks,
    "AdminCNTLab": AdminCNTLab,
    "AdminDashboard": AdminDashboard,
    "AdminLaunchpad": AdminLaunchpad,
    "Billing": Billing,
    "ButtonGenerator": ButtonGenerator,
    "Contact": Contact,
    "Customers": Customers,
    "Dashboard": Dashboard,
    "Demo": Demo,
    "Disclaimer": Disclaimer,
    "DiscordPlugin": DiscordPlugin,
    "Documentation": Documentation,
    "EventCheckout": EventCheckout,
    "EventEntry": EventEntry,
    "Events": Events,
    "Features": Features,
    "Home": Home,
    "Litepaper": Litepaper,
    "MerchantAgreement": MerchantAgreement,
    "MerchantProfile": MerchantProfile,
    "MyStores": MyStores,
    "Onboarding": Onboarding,
    "POS": POS,
    "Pay": Pay,
    "PayTerminal": PayTerminal,
    "PayTerminals": PayTerminals,
    "PaymentLinks": PaymentLinks,
    "PaymentProof": PaymentProof,
    "Payments": Payments,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "Roadmap": Roadmap,
    "SDKDocumentation": SDKDocumentation,
    "Security": Security,
    "Settings": Settings,
    "ShoppingPageGenerator": ShoppingPageGenerator,
    "Store": Store,
    "SubscriberPortal": SubscriberPortal,
    "Subscriptions": Subscriptions,
    "TermsOfService": TermsOfService,
    "TokenSale": TokenSale,
    "TokenSaleDashboard": TokenSaleDashboard,
    "TransactionAudit": TransactionAudit,
    "Unlock": Unlock,
    "WebhookSetupWizard": WebhookSetupWizard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};