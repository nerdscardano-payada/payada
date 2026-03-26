import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { BookOpen, CreditCard, RefreshCw, Heart, Zap, Monitor, Code2, ShoppingCart, Hexagon, Users, Calendar, LayoutDashboard, ArrowRight } from "lucide-react";

const sections = [
  {
    title: "Dashboard & Overview",
    icon: LayoutDashboard,
    items: [
      {
        name: "Dashboard",
        steps: [
          "Open your dashboard to view your overall business performance.",
          "Review the main numbers at the top, such as revenue, payments, and activity.",
          "Use the dashboard as your daily starting point to quickly understand what is working well and what needs attention.",
          "Check trends regularly so you can make faster decisions."
        ]
      },
      {
        name: "Payments",
        steps: [
          "Go to Payments to see all received payments in one place.",
          "Open any payment to review status, amount, and customer details.",
          "Use this screen to confirm whether a payment was received correctly.",
          "This is also the best place to follow up on individual transactions."
        ]
      },
      {
        name: "Customers",
        steps: [
          "Go to Customers to see who has already paid.",
          "Review how many payments each customer has made and their total value.",
          "Use this overview to identify returning customers.",
          "It also helps you improve community management, support, and sales follow-up."
        ]
      },
      {
        name: "Transactions",
        steps: [
          "Open Transactions for more detailed movement and tracking information.",
          "Use this view when you want to go deeper than the standard payment overview.",
          "It is useful for control, audits, and investigating specific cases."
        ]
      }
    ]
  },
  {
    title: "Get Paid",
    icon: CreditCard,
    items: [
      {
        name: "Payment Links",
        steps: [
          "Create a new payment link for a product, service, or fixed-price offer.",
          "Add a clear title, amount, and optional description.",
          "Share the link through your website, social media, chat, or email.",
          "Use Payment Links when you want the fastest way to start accepting payments without technical setup."
        ]
      },
      {
        name: "Subscriptions",
        steps: [
          "Use Subscriptions for recurring payments.",
          "First create a plan with the correct amount and billing interval.",
          "Then share the signup link with your customer or community.",
          "This is ideal for memberships, recurring benefits, coaching, or premium access."
        ]
      },
      {
        name: "Donations",
        steps: [
          "Use Donations when visitors should be able to contribute freely.",
          "Create a donation page with a clear name, story, and branding.",
          "Share the page publicly with supporters.",
          "This is perfect for creators, communities, charities, and campaigns."
        ]
      },
      {
        name: "POS Terminal",
        steps: [
          "Use POS Terminal for physical points of sale or live selling.",
          "Enter the amount at the moment of sale.",
          "Let the customer pay immediately at the counter or on location.",
          "This is useful for events, pop-ups, retail, and direct in-person transactions."
        ]
      },
      {
        name: "Pay Terminals",
        steps: [
          "Create fixed terminals for specific teams, use cases, or locations.",
          "Connect each terminal to the right payment flow.",
          "Use multiple terminals if you operate across different locations or sales setups.",
          "This helps you keep your payment operations organized by terminal."
        ]
      },
      {
        name: "Button Generator",
        steps: [
          "Use Button Generator to create a payment button quickly.",
          "Select the correct payment link.",
          "Copy the code and place it on your website or landing page.",
          "This is ideal if you want to sell without building a full webshop."
        ]
      }
    ]
  },
  {
    title: "Sell",
    icon: ShoppingCart,
    items: [
      {
        name: "Shop Pages",
        steps: [
          "Use Shop Pages to present products in a more structured way.",
          "Build a shop layout that visitors can understand easily.",
          "Connect products or flows to the correct payment options.",
          "This is ideal for merchants who want a simple selling environment without a complex platform."
        ]
      }
    ]
  },
  {
    title: "NFT",
    icon: Hexagon,
    items: [
      {
        name: "NFT Overview",
        steps: [
          "Start here if you want to work with NFT features.",
          "Review the status of your NFT-related setup and tools.",
          "Use this as your starting point to decide which NFT flow you need."
        ]
      },
      {
        name: "NFT Control",
        steps: [
          "Use NFT Control to manage your NFT processes.",
          "Review settings, assets, and operational parts of your NFT setup.",
          "This is useful for merchants who want more control over their NFT operations."
        ]
      },
      {
        name: "NFT Fulfillment",
        steps: [
          "Use NFT Fulfillment to define how NFTs are delivered after a payment.",
          "Connect fulfillment to the correct payment flow or trigger.",
          "Check carefully whether delivery happens automatically or manually.",
          "This is important for a reliable customer experience."
        ]
      },
      {
        name: "NFT Gating",
        steps: [
          "Use NFT Gating to restrict access based on NFT ownership.",
          "Choose which collection or asset should unlock access.",
          "Use it for exclusive content, communities, or experiences.",
          "It is ideal for premium access and utility-based flows."
        ]
      },
      {
        name: "NFT Distribution",
        steps: [
          "Use NFT Distribution when you want to distribute NFTs at scale.",
          "Prepare in advance which assets need to be sent.",
          "Review the distribution logic before going live.",
          "This is useful for campaigns, drops, and community rewards."
        ]
      },
      {
        name: "NFT Marketplace",
        steps: [
          "Use NFT Marketplace to create a storefront experience around NFTs.",
          "Add listings and build a clear presentation for visitors.",
          "Review pricing, descriptions, and available assets carefully.",
          "This helps you create a professional public storefront for your NFT offer."
        ]
      }
    ]
  },
  {
    title: "Community",
    icon: Users,
    items: [
      {
        name: "Access Links",
        steps: [
          "Use Access Links for paid access to communities or content.",
          "Create an access page with the right terms and value proposition.",
          "Share the link with your target audience.",
          "This is perfect for private groups, memberships, and gated communities."
        ]
      },
      {
        name: "Discord Gate",
        steps: [
          "Use Discord Gate to connect Discord access to a payment.",
          "Make sure your community setup and role structure are correct.",
          "Test everything internally before going live.",
          "This allows you to give paying members clear and structured access."
        ]
      }
    ]
  },
  {
    title: "Events",
    icon: Calendar,
    items: [
      {
        name: "Events",
        steps: [
          "Use Events to manage tickets or event access.",
          "Create your event with clear details and pricing.",
          "Share the event flow with visitors or participants.",
          "This is useful for online events, physical events, and gated experiences."
        ]
      }
    ]
  }
];

function TutorialBlock({ item }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-4">{item.name}</h3>
      <ol className="space-y-3">
        {item.steps.map((step, index) => (
          <li key={index} className="flex gap-3 text-sm text-slate-600 leading-6">
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead
        title="Tutorials — PayADA step-by-step guide"
        description="Detailed step-by-step tutorials for dashboard, payments, customers, payment links, subscriptions, donations, POS, NFT tools, access links, Discord gate, and events."
      />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold text-slate-900">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/OnboardingGoals" className="text-sm font-medium text-slate-600 hover:text-slate-900">Onboarding</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm font-medium text-slate-600 hover:text-slate-900">Documentation</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Complete Tutorials</h1>
              <p className="mt-1 text-slate-600">Clear step-by-step guides for the most important parts of PayADA.</p>
            </div>
          </div>
          <p className="max-w-4xl leading-7 text-slate-600">
            This page is designed as a central learning guide for merchants and teams. For each area, you will find what it is, when to use it, and how to work with it step by step. This helps everyone get started faster, understand each tool more clearly, and use the platform with confidence.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <a key={section.title} href={`#${section.title}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                  <h2 className="font-semibold text-slate-900">{section.title}</h2>
                </div>
                <p className="text-sm text-slate-600">{section.items.length} tutorials</p>
              </a>
            );
          })}
        </div>

        <div className="space-y-12">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title} id={section.title} className="scroll-mt-24">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900">
                    <Icon className="h-6 w-6 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{section.title}</h2>
                    <p className="text-sm text-slate-500">Step-by-step guidance for this part of the platform.</p>
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  {section.items.map((item) => (
                    <TutorialBlock key={item.name} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl bg-slate-900 p-8 text-white">
          <h2 className="mb-3 text-2xl font-bold">Next step</h2>
          <p className="mb-6 max-w-3xl text-slate-300">
            Use these tutorials together with onboarding to go live faster. Start with Payment Links or Dashboard, then expand into subscriptions, shop pages, NFT flows, or community access.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/OnboardingGoals" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
              Go to onboarding <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={createPageUrl("Documentation")} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Go to documentation
            </Link>
            <Link to={createPageUrl("APIReference")} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Go to API reference
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}