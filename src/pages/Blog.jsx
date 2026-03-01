import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, User, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Getting Started with Cardano Payments in 2024",
    excerpt: "A comprehensive guide to accepting Cardano payments for your business. Learn the basics, setup your account, and process your first payment.",
    author: "Sarah Chen",
    date: "2024-02-28",
    category: "Guide",
    image: "https://images.unsplash.com/photo-1639762681033-6461502ae929?w=800&h=400&fit=crop"
  },
  {
    id: 2,
    title: "Why Merchants Are Switching to Cardano Payments",
    excerpt: "Discover why forward-thinking merchants are adopting Cardano for their payment processing needs. Lower fees, faster settlements, and global reach.",
    author: "Marcus Johnson",
    date: "2024-02-20",
    category: "Business",
    image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Blockchain Security: How Your Payments Are Protected",
    excerpt: "Understanding the cryptographic security behind Cardano payments. Learn how the blockchain keeps your transactions safe and immutable.",
    author: "Dr. Alex Mueller",
    date: "2024-02-15",
    category: "Security",
    image: "https://images.unsplash.com/photo-1516534775068-bb8fce1d67dd?w=800&h=400&fit=crop"
  },
  {
    id: 4,
    title: "Building Global eCommerce with Cryptocurrency",
    excerpt: "How to expand your eCommerce business internationally using cryptocurrency payments. No currency conversion, no borders, no limits.",
    author: "Elena Rodriguez",
    date: "2024-02-10",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1460925895917-adf4078cead0?w=800&h=400&fit=crop"
  },
  {
    id: 5,
    title: "Cardano Network: Behind the Scenes",
    excerpt: "An in-depth look at how the Cardano blockchain works. Understanding proof-of-stake, validators, and network security.",
    author: "Thomas Weber",
    date: "2024-02-05",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop"
  },
  {
    id: 6,
    title: "API Integration Best Practices for Payment Platforms",
    excerpt: "Best practices for integrating PayADA's API into your application. Error handling, webhooks, and production deployment.",
    author: "David Kim",
    date: "2024-01-30",
    category: "Development",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="text-indigo-600">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("About")} className="text-sm text-slate-600 hover:text-slate-900">About</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">Contact</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">PayADA Blog</h1>
          <p className="text-xl text-slate-600">Insights, guides, and updates about Cardano payments and blockchain technology.</p>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="aspect-video overflow-hidden bg-slate-100">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{post.author}</span>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <span className="text-sm font-semibold">Read</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 bg-slate-50 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Stay Updated</h2>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            Subscribe to our newsletter for the latest news, tutorials, and best practices for accepting Cardano payments.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}