import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function ProductDemoSection({ title, description, eyebrow, videoUrl, embedUrl, ctaLabel, ctaTo, onCtaClick }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 md:pt-10 md:pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 mb-4">{eyebrow}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
          <p className="text-lg text-slate-600 mb-8">{description}</p>
          {onCtaClick ? (
            <Button onClick={onCtaClick} className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white gap-2">
              {ctaLabel} <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Link to={ctaTo}>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white gap-2">
                {ctaLabel} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="bg-slate-950 p-3 md:p-4">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-2xl aspect-video">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                scrolling="no"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={title}
              />
            ) : (
              <video
                className="w-full h-full object-cover"
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}