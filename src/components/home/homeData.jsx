import {
  LayoutDashboard,
  Link2,
  CreditCard,
  Users,
  Wallet,
  Webhook,
  Key,
  Receipt,
  Eye,
  Code2,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";

export const homePrimaryActions = [
  {
    title: "Open dashboard",
    description: "Go straight into your merchant workspace to manage links, customers and payments.",
    icon: LayoutDashboard,
    href: "/Dashboard",
    cta: "Open dashboard",
  },
  {
    title: "Create payment links",
    description: "Launch ADA and CNT payment links for products, invoices or quick checkout.",
    icon: Link2,
    href: "/PaymentLinks",
    cta: "View payment links",
  },
  {
    title: "Sell access",
    description: "Create access links for communities, memberships, gated content or private offers.",
    icon: Users,
    href: "/AccessLinks",
    cta: "View access links",
  },
];

export const homeWorkspaceSections = [
  {
    title: "Payments",
    description: "Track incoming transactions and monitor what was paid and when.",
    icon: CreditCard,
    href: "/Payments",
  },
  {
    title: "Customers",
    description: "See who paid, build customer history and manage repeat buyers.",
    icon: Users,
    href: "/Customers",
  },
  {
    title: "Merchant profile",
    description: "Manage wallet details, business info and your public merchant setup.",
    icon: Wallet,
    href: "/MerchantProfile",
  },
  {
    title: "Transactions",
    description: "Review transaction activity and audit what happened across your flows.",
    icon: Eye,
    href: "/TransactionAudit",
  },
  {
    title: "Webhooks",
    description: "Send payment events to your own systems and automate follow-up actions.",
    icon: Webhook,
    href: "/Webhooks",
  },
  {
    title: "API keys",
    description: "Generate and manage secure keys for custom integrations.",
    icon: Key,
    href: "/ApiKeys",
  },
  {
    title: "Billing",
    description: "Review platform fees, plan details and merchant account billing status.",
    icon: Receipt,
    href: "/Billing",
  },
  {
    title: "Tutorials",
    description: "Get step-by-step guidance for the main setup and development flows.",
    icon: Code2,
    href: "/Tutorials",
  },
];

export const homeHighlights = [
  {
    title: "Wallet-first onboarding",
    description: "Connect a Cardano wallet directly from the homepage to start faster.",
    icon: Zap,
  },
  {
    title: "Merchant-ready tools",
    description: "Everything from links to webhooks and API keys in one clean workspace.",
    icon: ShieldCheck,
  },
  {
    title: "Fast next steps",
    description: "Every homepage block links straight to the same tools shown in the sidebar.",
    icon: ArrowRight,
  },
];