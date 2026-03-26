import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { BookOpen, CreditCard, RefreshCw, Heart, Zap, Monitor, Code2, ShoppingCart, Hexagon, Bot, Users, Calendar, LayoutDashboard, Eye, ArrowRight } from "lucide-react";

const sections = [
  {
    title: "Dashboard & overzicht",
    icon: LayoutDashboard,
    items: [
      {
        name: "Dashboard",
        steps: [
          "Open je dashboard om je algemene prestaties te zien.",
          "Bekijk bovenaan de belangrijkste cijfers zoals omzet, aantal betalingen en activiteit.",
          "Gebruik het dashboard als je dagelijkse startpunt om snel te zien wat goed loopt en waar opvolging nodig is.",
          "Controleer regelmatig trends zodat je sneller kan bijsturen."
        ]
      },
      {
        name: "Payments",
        steps: [
          "Ga naar Payments om alle ontvangen betalingen te bekijken.",
          "Open een betaling om de status, bedragen en klantgegevens na te kijken.",
          "Gebruik dit scherm om te bevestigen of een betaling correct is binnengekomen.",
          "Dit is ook de beste plek om individuele transacties op te volgen."
        ]
      },
      {
        name: "Customers",
        steps: [
          "Ga naar Customers om te zien wie al betaald heeft.",
          "Bekijk per klant hoeveel betalingen er zijn gebeurd en wat hun waarde is.",
          "Gebruik dit overzicht om terugkerende klanten te herkennen.",
          "Dit helpt je ook om community, support en verkoop beter op te volgen."
        ]
      },
      {
        name: "Transactions",
        steps: [
          "Open Transactions voor extra detail over bewegingen en opvolging.",
          "Gebruik dit scherm wanneer je dieper wil kijken dan het gewone payment-overzicht.",
          "Handig voor controle, audits en het onderzoeken van specifieke cases."
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
          "Maak een nieuwe payment link aan voor een product, dienst of vaste prijs.",
          "Geef een duidelijke titel, bedrag en optionele beschrijving mee.",
          "Deel de link via website, social media, chat of e-mail.",
          "Gebruik Payment Links als snelste manier om betalingen te starten zonder technische setup."
        ]
      },
      {
        name: "Subscriptions",
        steps: [
          "Gebruik Subscriptions voor terugkerende betalingen.",
          "Maak eerst een plan aan met bedrag en interval.",
          "Deel daarna de inschrijflink met je klant of community.",
          "Ideaal voor memberships, memberships met voordelen, coaching of premium toegang."
        ]
      },
      {
        name: "Donations",
        steps: [
          "Gebruik Donations wanneer bezoekers vrij kunnen bijdragen.",
          "Maak een donatiepagina aan met naam, verhaal en branding.",
          "Deel de pagina publiekelijk met supporters.",
          "Perfect voor creators, communities, goede doelen en projecten."
        ]
      },
      {
        name: "POS Terminal",
        steps: [
          "Gebruik POS Terminal voor fysieke verkooppunten of live verkoop.",
          "Voer een bedrag in op het moment van verkoop.",
          "Laat de klant meteen betalen aan de kassa of op locatie.",
          "Handig voor events, pop-ups, retail en directe transacties."
        ]
      },
      {
        name: "Pay Terminals",
        steps: [
          "Maak vaste terminals aan voor specifieke situaties of teams.",
          "Koppel ze aan de juiste payment flow.",
          "Gebruik meerdere terminals wanneer je verschillende locaties of verkooppunten hebt.",
          "Zo hou je je verkoop gestructureerd per terminal."
        ]
      },
      {
        name: "Button Generator",
        steps: [
          "Gebruik Button Generator om snel een betaalbutton te maken.",
          "Selecteer de juiste payment link.",
          "Kopieer de code en plaats die op je website of landingspagina.",
          "Dit is ideaal wanneer je zonder volledige webshop toch wil verkopen."
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
          "Gebruik Shop Pages om producten overzichtelijk te presenteren.",
          "Maak een shopstructuur die bezoekers makkelijk begrijpen.",
          "Koppel producten of flows aan de juiste betaalopties.",
          "Ideaal voor wie een eenvoudige verkoopomgeving wil zonder complex platform."
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
          "Begin hier als je met NFT-functionaliteit wil werken.",
          "Bekijk het overzicht van je NFT-onderdelen en status.",
          "Gebruik dit als vertrekpunt om te beslissen welke NFT-flow je nodig hebt."
        ]
      },
      {
        name: "NFT Control",
        steps: [
          "Gebruik NFT Control om je NFT-processen te beheren.",
          "Controleer instellingen, assets en operationele onderdelen.",
          "Handig voor merchants die meer grip willen op hun NFT-werking."
        ]
      },
      {
        name: "NFT Fulfillment",
        steps: [
          "Gebruik NFT Fulfillment om te bepalen hoe NFT’s geleverd worden na een betaling.",
          "Koppel fulfillment aan de juiste flow of actie.",
          "Controleer goed welke levering automatisch of handmatig gebeurt.",
          "Belangrijk voor een betrouwbare klantbeleving."
        ]
      },
      {
        name: "NFT Gating",
        steps: [
          "Gebruik NFT Gating om toegang te beperken op basis van NFT-bezit.",
          "Bepaal welke collectie of asset toegang geeft.",
          "Gebruik dit voor exclusieve content, communities of ervaringen.",
          "Ideaal voor premium toegang en utility."
        ]
      },
      {
        name: "NFT Distribution",
        steps: [
          "Gebruik NFT Distribution wanneer je NFT’s op schaal wil verdelen.",
          "Bereid vooraf goed voor welke assets verstuurd moeten worden.",
          "Controleer de distributielogica voor je live gaat.",
          "Handig voor campagnes, drops en community rewards."
        ]
      },
      {
        name: "NFT Marketplace",
        steps: [
          "Gebruik NFT Marketplace om een verkoopervaring rond NFT’s op te bouwen.",
          "Voeg listings toe en werk je presentatie uit.",
          "Controleer prijzen, beschrijvingen en beschikbare assets.",
          "Zo maak je een duidelijke publieke storefront voor je aanbod."
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
          "Gebruik Access Links voor betalende toegang tot communities of content.",
          "Maak een toegangspagina aan met de juiste voorwaarden.",
          "Deel de link met je doelgroep.",
          "Perfect voor private groepen, memberships en gated communities."
        ]
      },
      {
        name: "Discord Gate",
        steps: [
          "Gebruik Discord Gate om toegang tot Discord te koppelen aan een betaling.",
          "Controleer dat je community-setup en rollen goed staan.",
          "Test eerst intern voor je live gaat.",
          "Zo geef je betalende leden automatisch of gestructureerd toegang."
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
          "Gebruik Events om tickets of eventtoegang te beheren.",
          "Maak je event aan met duidelijke info en prijs.",
          "Deel de eventflow met bezoekers of deelnemers.",
          "Gebruik dit voor online events, fysieke events en gated toegang."
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
        title="Tutorials — PayADA stap-voor-stap gids"
        description="Uitgebreide stap-voor-stap handleidingen voor dashboard, payments, customers, payment links, subscriptions, donations, POS, NFT-tools, access links, Discord gate en events."
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
        <div className="mb-10 rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Complete Tutorials</h1>
              <p className="text-slate-600 mt-1">Duidelijke stap-voor-stap gidsen voor alle belangrijke onderdelen van PayADA.</p>
            </div>
          </div>
          <p className="max-w-4xl text-slate-600 leading-7">
            Deze pagina is bedoeld als centrale handleiding voor merchants en teams. Je vindt hier per onderdeel wat het is, wanneer je het gebruikt en hoe je er stap voor stap mee werkt. Zo kan iedereen sneller starten, beter begrijpen wat elk onderdeel doet en met meer vertrouwen werken in het platform.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <a key={section.title} href={`#${section.title}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                  <h2 className="font-semibold text-slate-900">{section.title}</h2>
                </div>
                <p className="text-sm text-slate-600">{section.items.length} handleidingen</p>
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
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{section.title}</h2>
                    <p className="text-sm text-slate-500">Stap-voor-stap uitleg voor dit onderdeel.</p>
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
          <h2 className="text-2xl font-bold mb-3">Volgende stap</h2>
          <p className="text-slate-300 mb-6 max-w-3xl">
            Gebruik deze tutorials samen met onboarding om sneller live te gaan. Begin met Payment Links of Dashboard en breid daarna uit naar subscriptions, shop pages, NFT-flows of community access.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/OnboardingGoals" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
              Naar onboarding <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={createPageUrl("Documentation")} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Naar documentation
            </Link>
            <Link to={createPageUrl("APIReference")} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Naar API reference
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}