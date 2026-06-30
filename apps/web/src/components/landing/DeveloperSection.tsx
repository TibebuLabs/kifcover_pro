const sdkSnippet = `import KifCover from "@kifcover/sdk";

const config = {
  publicKey: "PK_LIVE_...7x89",
  environment: "production"
};

const kif = await KifCover.initialize(config);

// Generate instant quote + checkout
const quote = await kif.quote({
  product: "AUTO_ELITE_01",
  metadata: { vehicleAge: 3, value: 250000 }
});

kif.checkout({ quoteId: quote.id });`

export function DeveloperSection() {
  return (
    <section className="py-24 bg-primary-container" id="developer">
      <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left */}
        <div className="text-on-primary">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-8">
            <span className="material-symbols-outlined text-secondary-fixed text-[16px]">code</span>
            <span className="text-xs font-semibold text-on-primary/80">Developer First</span>
          </div>
          <h2 className="font-display text-4xl font-bold mb-6">One platform, limitless solutions</h2>
          <p className="text-lg text-on-primary/70 mb-10 leading-relaxed">
            Developer-friendly documentation, SDKs for every major platform, and a sandbox environment to test before you ship.
          </p>
          <ul className="space-y-5 mb-10">
            {[
              'REST API for purchase, renewal, and claims',
              'Webhooks for real-time event notifications',
              'White-label SDK for Web, iOS & Android',
              'Sandbox with full test data & mock payments',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">check_circle</span>
                <span className="text-sm text-on-primary/80">{item}</span>
              </li>
            ))}
          </ul>
          <button className="bg-secondary text-on-secondary px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-secondary-fixed-dim transition-colors">
            View Documentation →
          </button>
        </div>

        {/* Right: Code block */}
        <div className="bg-[#051c2e] rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Window chrome */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-xs text-white/40 font-mono">integration.js</span>
          </div>
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto text-primary-fixed-dim whitespace-pre">
            <code>{sdkSnippet}</code>
          </pre>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
            {['JavaScript', 'React Native', 'Python', 'Swift', 'Kotlin'].map((lang) => (
              <span key={lang} className="px-3 py-1 bg-white/5 rounded text-xs text-white/60 font-mono border border-white/10">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
