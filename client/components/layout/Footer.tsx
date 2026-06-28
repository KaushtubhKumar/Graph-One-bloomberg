import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-[#FF3B57] flex items-center justify-center text-white text-xs font-bold">G</div>
              <span className="font-semibold text-sm">GraphOne</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">The global intelligence layer for the AI economy.</p>
            <div className="flex gap-3 mt-4">
              {["𝕏", "in", "◎"].map((s, i) => (
                <button key={i} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-500 hover:border-gray-400 transition-colors">{s}</button>
              ))}
            </div>
          </div>
          {[
            { title: "Platform", links: ["AI Startups", "AI Products", "Investors", "Funding", "Jobs", "News"] },
            { title: "Resources", links: ["Research", "Collections", "Blog", "Help Center"] },
            { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}><Link href="#" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">Stay ahead in AI</h4>
            <p className="text-xs text-gray-500 mb-3">Get weekly updates on new tools and trends.</p>
            <div className="flex gap-2">
              <input className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#FF3B57]" placeholder="Enter your email" />
              <button className="px-3 py-2 bg-[#FF3B57] text-white text-xs font-semibold rounded-lg hover:bg-[#e0324c] transition-colors whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400">© 2024 GraphOne. All rights reserved.</p>
          <div className="flex gap-4">
            {["About", "Advertise", "API", "Newsletter", "Blog", "Privacy", "Terms", "Contact"].map(l => (
              <Link key={l} href="#" className="text-xs text-gray-400 hover:text-gray-600">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
