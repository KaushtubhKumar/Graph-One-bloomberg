"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const columns = [
  { title: "Platform", links: ["AI Startups", "AI Products", "Investors", "Funding", "Jobs", "News"] },
  { title: "Resources", links: ["Research", "Collections", "Blog", "Help Center"] },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-25">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-sm bg-accent-500 flex items-center justify-center text-white text-xs font-bold">G</div>
              <span className="font-semibold text-[15px] text-ink-900 tracking-tight">GraphOne</span>
            </div>
            <p className="text-meta text-ink-500 leading-relaxed">The global intelligence layer for the AI economy.</p>
            <div className="flex gap-2 mt-5">
              {["𝕏", "in", "◎"].map((s, i) => (
                <button key={i} aria-label="Social link" className="w-8 h-8 rounded-sm border border-ink-200 flex items-center justify-center text-[13px] text-ink-500 hover:border-ink-400 hover:text-ink-900 transition-colors duration-150">{s}</button>
              ))}
            </div>
          </div>
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-meta text-ink-900 mb-4 uppercase tracking-wide font-semibold">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}><Link href="#" className="text-[14px] text-ink-500 hover:text-ink-900 transition-colors duration-150">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-meta text-ink-900 mb-4 uppercase tracking-wide font-semibold">Stay ahead in AI</h4>
            <p className="text-[14px] text-ink-500 mb-4 leading-relaxed">Get weekly updates on new tools and trends.</p>
            <form className="flex flex-col gap-2" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                required
                aria-label="Email address"
                className="text-[14px] border border-ink-200 rounded-sm px-3.5 h-10 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all duration-150 bg-white"
                placeholder="you@company.com"
              />
              <button className="flex items-center justify-center gap-1.5 h-10 bg-ink-900 text-white text-[14px] font-medium rounded-sm hover:bg-ink-800 transition-colors duration-150">
                Subscribe <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-ink-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-meta text-ink-400">© 2026 GraphOne. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center">
            {["About", "Advertise", "API", "Newsletter", "Blog", "Privacy", "Terms", "Contact"].map(l => (
              <Link key={l} href="#" className="text-meta text-ink-400 hover:text-ink-700 transition-colors duration-150">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
