window.BUILDER_BLOCKS = {
  'nav-corporate': {
    category: 'Navigation',
    name: 'Corporate Navbar',
    icon: 'fa-solid fa-bars',
    html: `
<header class="wb-navbar" data-block-type="navigation">
  <div class="wb-container wb-nav-inner">
    <a href="#" class="wb-brand">
      <div class="wb-brand-icon"><i class="fa-solid fa-shapes"></i></div>
      <span contenteditable="true">EnterpriseBuilder</span>
    </a>
    <button type="button" class="wb-nav-toggle" aria-label="Toggle navigation menu">
      <i class="fa-solid fa-bars"></i>
    </button>
    <div class="wb-nav-collapse">
      <ul class="wb-nav-links">
        <li><a href="#services" contenteditable="true">Features</a></li>
        <li><a href="#about" contenteditable="true">About</a></li>
        <li><a href="#pricing" contenteditable="true">Plans & Pricing</a></li>
        <li><a href="#testimonials" contenteditable="true">Reviews</a></li>
        <li><a href="#faq" contenteditable="true">FAQ</a></li>
        <li><a href="#contact" contenteditable="true">Contact</a></li>
      </ul>
      <div class="wb-nav-cta">
        <a href="#pricing" class="wb-btn wb-btn-primary" style="padding: 0.6rem 1.25rem; font-size: 0.9rem;" contenteditable="true"><i class="fa-solid fa-bolt"></i> Start Building</a>
      </div>
    </div>
  </div>
</header>`
  },

  'nav-minimal': {
    category: 'Navigation',
    name: 'Minimal Clean Nav',
    icon: 'fa-solid fa-grip-lines',
    html: `
<header class="wb-navbar" data-block-type="navigation" style="border-bottom: none;">
  <div class="wb-container wb-nav-inner">
    <a href="#" class="wb-brand">
      <span style="font-weight: 900; letter-spacing: -0.04em;" contenteditable="true">VERTEX.</span>
    </a>
    <button type="button" class="wb-nav-toggle" aria-label="Toggle navigation menu">
      <i class="fa-solid fa-bars"></i>
    </button>
    <div class="wb-nav-collapse">
      <ul class="wb-nav-links">
        <li><a href="#services" contenteditable="true">Services</a></li>
        <li><a href="#cases" contenteditable="true">Case Studies</a></li>
        <li><a href="#team" contenteditable="true">Our Team</a></li>
      </ul>
      <div class="wb-nav-cta">
        <a href="#contact" class="wb-btn wb-btn-secondary" style="padding: 0.6rem 1.25rem; font-size: 0.9rem;" contenteditable="true">Book a Call</a>
      </div>
    </div>
  </div>
</header>`
  },

  'hero-split': {
    category: 'Hero',
    name: 'Split Hero with Image',
    icon: 'fa-solid fa-window-maximize',
    html: `
<section class="wb-section wb-hero" data-block-type="hero">
  <div class="wb-container">
    <div class="wb-grid-2">
      <div>
        <div class="wb-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> <span contenteditable="true">AI-Powered Next-Gen Website Studio</span></div>
        <h1 class="wb-hero-headline" contenteditable="true">Build High-Converting Business Websites <span class="wb-hero-highlight">in Minutes</span></h1>
        <p class="wb-hero-sub" contenteditable="true">Create responsive, professional company websites with visual drag-and-drop, 52+ curated industry templates, 3-color cosmic gradients, instant PDF export, and clean production code downloads.</p>
        <div class="wb-hero-actions">
          <a href="#pricing" class="wb-btn wb-btn-primary" contenteditable="true"><i class="fa-solid fa-bolt"></i> Start Building Free</a>
          <a href="#services" class="wb-btn wb-btn-secondary" contenteditable="true"><i class="fa-solid fa-cubes"></i> Explore Features</a>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 0.9rem;">
          <div style="display: flex; color: #f59e0b; gap: 3px;">
            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
          </div>
          <span contenteditable="true">Rated 4.9/5 by 10,000+ Founders, Agencies & Developers</span>
        </div>
      </div>
      <div class="wb-hero-img-wrap">
        <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80" alt="Enterprise Website Builder Studio">
      </div>
    </div>
  </div>
</section>`
  },

  'hero-centered': {
    category: 'Hero',
    name: 'Centered High-Impact Hero',
    icon: 'fa-solid fa-heading',
    html: `
<section class="wb-section wb-hero dark-bg" data-block-type="hero" style="text-align: center; padding: 7rem 0;">
  <div class="wb-container" style="max-width: 900px;">
    <div class="wb-badge" style="background: rgba(37, 99, 235, 0.2); color: #60a5fa;"><i class="fa-solid fa-sparkles"></i> <span contenteditable="true">All-In-One Enterprise Website Studio</span></div>
    <h1 class="wb-hero-headline" contenteditable="true" style="color: #fff;">Design, Customize & Export Production Websites Effortlessly</h1>
    <p class="wb-hero-sub" contenteditable="true" style="color: #cbd5e1; max-width: 720px; margin-left: auto; margin-right: auto;">Unlock visual drag-and-drop editing, 52+ corporate templates, multi-device responsiveness, real Google OAuth authentication, and instant HTML/ZIP/PDF exports.</p>
    <div class="wb-hero-actions" style="justify-content: center;">
      <a href="#pricing" class="wb-btn wb-btn-primary" contenteditable="true"><i class="fa-solid fa-rocket"></i> Get Started Free</a>
      <a href="#about" class="wb-btn wb-btn-secondary" contenteditable="true">Learn More</a>
    </div>
  </div>
</section>`
  },

  'about-story': {
    category: 'About Us',
    name: 'Company Story & Values',
    icon: 'fa-solid fa-building',
    html: `
<section class="wb-section alt-bg" id="about" data-block-type="about">
  <div class="wb-container">
    <div class="wb-grid-2">
      <div class="wb-hero-img-wrap">
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" alt="Collaborative Builder Studio">
      </div>
      <div>
        <div class="wb-badge"><i class="fa-solid fa-award"></i> <span contenteditable="true">About EnterpriseBuilder</span></div>
        <h2 class="wb-title" contenteditable="true">The modern website studio built for speed and perfection</h2>
        <p class="wb-desc" style="margin-bottom: 1.5rem;" contenteditable="true">EnterpriseBuilder provides founders, designers, and engineering teams with an intuitive visual canvas to craft enterprise-grade company websites without touching complex build tooling. Export clean, framework-independent HTML5 and CSS3 that loads instantly anywhere.</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem;">
          <div>
            <h4 style="font-size: 1.15rem; margin-bottom: 0.4rem;" contenteditable="true"><i class="fa-solid fa-shield-halved" style="color: var(--primary-color);"></i> Google Verified Security</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted);" contenteditable="true">Seamless Google account sign-in with enterprise role and whitelist clearance.</p>
          </div>
          <div>
            <h4 style="font-size: 1.15rem; margin-bottom: 0.4rem;" contenteditable="true"><i class="fa-solid fa-file-code" style="color: var(--primary-color);"></i> 100% Clean Code</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted);" contenteditable="true">Pure semantic HTML5 and CSS3 output with 0 bloatware and 100/100 PageSpeed.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
  },

  'features-grid': {
    category: 'Features & Services',
    name: '3-Column Service Grid',
    icon: 'fa-solid fa-cubes',
    html: `
<section class="wb-section" id="services" data-block-type="features">
  <div class="wb-container">
    <div class="wb-header-center">
      <div class="wb-badge"><i class="fa-solid fa-layer-group"></i> <span contenteditable="true">Feature Capabilities</span></div>
      <h2 class="wb-title" contenteditable="true">Everything You Need to Build High-Converting Sites</h2>
      <p class="wb-desc" contenteditable="true">Explore the full suite of visual tools, responsive breakpoints, and export utilities.</p>
    </div>
    <div class="wb-grid-3">
      <div class="wb-card">
        <div class="wb-feature-icon"><i class="fa-solid fa-layer-group"></i></div>
        <h3 class="wb-feature-title" contenteditable="true">52+ Industry Templates</h3>
        <p class="wb-feature-desc" contenteditable="true">Pre-built designs for Corporate, SaaS, FinTech, Healthcare, Logistics, Real Estate, and Legal firms.</p>
      </div>
      <div class="wb-card">
        <div class="wb-feature-icon"><i class="fa-solid fa-mobile-screen-button"></i></div>
        <h3 class="wb-feature-title" contenteditable="true">Multi-Device Responsive Canvas</h3>
        <p class="wb-feature-desc" contenteditable="true">Toggle smoothly between Desktop, Tablet, and Mobile views with collapsible hamburger navigation.</p>
      </div>
      <div class="wb-card">
        <div class="wb-feature-icon"><i class="fa-solid fa-file-export"></i></div>
        <h3 class="wb-feature-title" contenteditable="true">1-Click Code & PDF Export</h3>
        <p class="wb-feature-desc" contenteditable="true">Export production-ready HTML5, full ZIP archive packages, and high-speed print-ready PDFs.</p>
      </div>
      <div class="wb-card">
        <div class="wb-feature-icon"><i class="fa-solid fa-palette"></i></div>
        <h3 class="wb-feature-title" contenteditable="true">3-Color Cosmic Gradients</h3>
        <p class="wb-feature-desc" contenteditable="true">Customize backgrounds with solid palettes, 2-color blends, and exclusive 3-color cosmic gradients.</p>
      </div>
      <div class="wb-card">
        <div class="wb-feature-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
        <h3 class="wb-feature-title" contenteditable="true">Auto-Arrange Layout Optimizer</h3>
        <p class="wb-feature-desc" contenteditable="true">1-click automated section sequencing that fixes orphaned navigation anchors and formats flow.</p>
      </div>
      <div class="wb-card">
        <div class="wb-feature-icon"><i class="fa-solid fa-shield-check"></i></div>
        <h3 class="wb-feature-title" contenteditable="true">Google Account Verification</h3>
        <p class="wb-feature-desc" contenteditable="true">Direct Google OAuth permission granting, verified user badges, and workspace tier clearance.</p>
      </div>
    </div>
  </div>
</section>`
  },

  'stats-counter': {
    category: 'Statistics',
    name: 'Key Business Metrics',
    icon: 'fa-solid fa-chart-simple',
    html: `
<section class="wb-section alt-bg" data-block-type="stats">
  <div class="wb-container">
    <div class="wb-grid-4">
      <div class="wb-stat-box">
        <div class="wb-stat-number" contenteditable="true">52+</div>
        <div class="wb-stat-label" contenteditable="true">Pro Templates</div>
      </div>
      <div class="wb-stat-box">
        <div class="wb-stat-number" contenteditable="true">100/100</div>
        <div class="wb-stat-label" contenteditable="true">PageSpeed Score</div>
      </div>
      <div class="wb-stat-box">
        <div class="wb-stat-number" contenteditable="true">10,000+</div>
        <div class="wb-stat-label" contenteditable="true">Websites Built</div>
      </div>
      <div class="wb-stat-box">
        <div class="wb-stat-number" contenteditable="true">0 sec</div>
        <div class="wb-stat-label" contenteditable="true">Build Setup Time</div>
      </div>
    </div>
  </div>
</section>`
  },

  'testimonials-cards': {
    category: 'Testimonials',
    name: 'Client Reviews & Proof',
    icon: 'fa-solid fa-comments',
    html: `
<section class="wb-section" id="testimonials" data-block-type="testimonials">
  <div class="wb-container">
    <div class="wb-header-center">
      <div class="wb-badge"><i class="fa-solid fa-heart"></i> <span contenteditable="true">User Reviews</span></div>
      <h2 class="wb-title" contenteditable="true">Loved by Teams Worldwide</h2>
      <p class="wb-desc" contenteditable="true">Read what founders and developers say about building with EnterpriseBuilder.</p>
    </div>
    <div class="wb-grid-3">
      <div class="wb-testimonial-card">
        <p class="wb-testimonial-quote" contenteditable="true">"EnterpriseBuilder saved us weeks of frontend development. We launched our consulting website in 2 hours and exported clean HTML that scored 100 on Google PageSpeed."</p>
        <div class="wb-testimonial-user">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" class="wb-avatar" alt="Sarah Jenkins">
          <div>
            <div class="wb-user-name" contenteditable="true">Sarah Jenkins</div>
            <div class="wb-user-role" contenteditable="true">CTO at FinScale Global</div>
          </div>
        </div>
      </div>
      <div class="wb-testimonial-card">
        <p class="wb-testimonial-quote" contenteditable="true">"The PDF export and live preview features are incredible. The 3-color cosmic gradient inspector gave our landing page an ultra-modern aesthetic."</p>
        <div class="wb-testimonial-user">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" class="wb-avatar" alt="David Chen">
          <div>
            <div class="wb-user-name" contenteditable="true">David Chen</div>
            <div class="wb-user-role" contenteditable="true">Managing Director, Horizon Ventures</div>
          </div>
        </div>
      </div>
      <div class="wb-testimonial-card">
        <p class="wb-testimonial-quote" contenteditable="true">"The Google login with verified enterprise credentials made account management seamless. Pro templates are top-tier quality."</p>
        <div class="wb-testimonial-user">
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" class="wb-avatar" alt="Elena Rostova">
          <div>
            <div class="wb-user-name" contenteditable="true">Elena Rostova</div>
            <div class="wb-user-role" contenteditable="true">Lead Product Designer, Stratis</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
  },

  'pricing-table': {
    category: 'Pricing',
    name: '3-Tier Pricing Table',
    icon: 'fa-solid fa-tags',
    html: `
<section class="wb-section alt-bg" id="pricing" data-block-type="pricing">
  <div class="wb-container">
    <div class="wb-header-center">
      <div class="wb-badge"><i class="fa-solid fa-receipt"></i> <span contenteditable="true">Transparent Plans</span></div>
      <h2 class="wb-title" contenteditable="true">Simple, Scalable Pricing for Every Team</h2>
      <p class="wb-desc" contenteditable="true">Choose the plan that fits your website building, export, and customization requirements.</p>
    </div>
    <div class="wb-grid-3">
      <div class="wb-pricing-card">
        <h3 style="font-size: 1.4rem;" contenteditable="true">Free Edition</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;" contenteditable="true">For testing & basic single-page landing prototypes</p>
        <div class="wb-price-amount" contenteditable="true">$0</div>
        <div class="wb-price-period" contenteditable="true">forever free</div>
        <ul class="wb-pricing-features">
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true">Up to 4 Sections per page</span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true">5 Free Starter Templates</span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true">Basic Block Components</span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true">2-Color Gradient Picker</span></li>
          <li style="color: #94a3b8;"><span class="icon" style="color: #94a3b8;"><i class="fa-solid fa-xmark"></i></span> <span contenteditable="true">Website Export (HTML, ZIP, PDF)</span></li>
          <li style="color: #94a3b8;"><span class="icon" style="color: #94a3b8;"><i class="fa-solid fa-xmark"></i></span> <span contenteditable="true">Live Multi-Device Preview</span></li>
          <li style="color: #94a3b8;"><span class="icon" style="color: #94a3b8;"><i class="fa-solid fa-xmark"></i></span> <span contenteditable="true">View & Copy Production Code</span></li>
        </ul>
        <button type="button" class="wb-btn wb-btn-secondary" style="width: 100%; justify-content: center;" onclick="window.authManager && window.authManager.openUpgradeModal('general')">Current Plan</button>
      </div>

      <div class="wb-pricing-card wb-pricing-popular">
        <div class="wb-pricing-badge" contenteditable="true">Most Popular</div>
        <h3 style="font-size: 1.4rem;" contenteditable="true">Pro Edition</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;" contenteditable="true">For professionals, founders & high-growth agencies</p>
        <div class="wb-price-amount" contenteditable="true">$19</div>
        <div class="wb-price-period" contenteditable="true">per month</div>
        <ul class="wb-pricing-features">
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>All 52+ Templates Unlocked</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>Full Website Export (HTML & ZIP)</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>Direct High-Speed PDF Export</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>Live Multi-Device Preview Mode</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>View & Copy Clean Production Code</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>Unlimited Canvas Sections</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>3-Color Cosmic Gradients</strong></span></li>
        </ul>
        <button type="button" class="wb-btn wb-btn-primary" style="width: 100%; justify-content: center;" onclick="window.authManager && window.authManager.upgradePlan('pro')"><i class="fa-solid fa-bolt"></i> Upgrade to Pro ($19)</button>
      </div>

      <div class="wb-pricing-card">
        <h3 style="font-size: 1.4rem;" contenteditable="true">Enterprise Edition</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;" contenteditable="true">For large teams demanding white-label and priority infra</p>
        <div class="wb-price-amount" contenteditable="true">$49</div>
        <div class="wb-price-period" contenteditable="true">per month</div>
        <ul class="wb-pricing-features">
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>Everything in Pro Edition</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>White-Label Export</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>Custom Domain Simulation</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>Team Multi-User Collaboration</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>Priority 24/7 Support</strong></span></li>
          <li><span class="icon"><i class="fa-solid fa-check"></i></span> <span contenteditable="true"><strong>Commercial License</strong></span></li>
        </ul>
        <button type="button" class="wb-btn wb-btn-secondary" style="width: 100%; justify-content: center;" onclick="window.authManager && window.authManager.upgradePlan('enterprise')"><i class="fa-solid fa-crown"></i> Activate Enterprise ($49)</button>
      </div>
    </div>
  </div>
</section>`
  },

  'team-grid': {
    category: 'Team & Leadership',
    name: 'Executive Leadership Grid',
    icon: 'fa-solid fa-users',
    html: `
<section class="wb-section" id="team" data-block-type="team">
  <div class="wb-container">
    <div class="wb-header-center">
      <div class="wb-badge"><i class="fa-solid fa-user-tie"></i> <span contenteditable="true">Leadership</span></div>
      <h2 class="wb-title" contenteditable="true">Led by Pioneers in Technology & Strategy</h2>
      <p class="wb-desc" contenteditable="true">Meet the seasoned executives spearheading our company mission.</p>
    </div>
    <div class="wb-grid-3">
      <div class="wb-team-card">
        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80" class="wb-team-img" alt="Marcus Vance">
        <h3 class="wb-team-name" contenteditable="true">Marcus Vance</h3>
        <div class="wb-team-role" contenteditable="true">Chief Executive Officer & Founder</div>
        <p style="font-size: 0.9rem; color: var(--text-muted);" contenteditable="true">Former Principal Partner at McKinsey with 18+ years leading technology turnarounds.</p>
      </div>
      <div class="wb-team-card">
        <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80" class="wb-team-img" alt="Dr. Alisha Patel">
        <h3 class="wb-team-name" contenteditable="true">Dr. Alisha Patel</h3>
        <div class="wb-team-role" contenteditable="true">Chief Technology Officer</div>
        <p style="font-size: 0.9rem; color: var(--text-muted);" contenteditable="true">PhD in Distributed Systems from Stanford; author of 14 cloud computing patents.</p>
      </div>
      <div class="wb-team-card">
        <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80" class="wb-team-img" alt="Julian Thorne">
        <h3 class="wb-team-name" contenteditable="true">Julian Thorne</h3>
        <div class="wb-team-role" contenteditable="true">Head of Global Operations</div>
        <p style="font-size: 0.9rem; color: var(--text-muted);" contenteditable="true">Scaling enterprise teams across North America, Europe, and APAC.</p>
      </div>
    </div>
  </div>
</section>`
  },

  'faq-accordion': {
    category: 'FAQ',
    name: 'Accordion FAQ',
    icon: 'fa-solid fa-circle-question',
    html: `
<section class="wb-section alt-bg" id="faq" data-block-type="faq">
  <div class="wb-container" style="max-width: 860px;">
    <div class="wb-header-center">
      <div class="wb-badge"><i class="fa-solid fa-circle-info"></i> <span contenteditable="true">Common Questions</span></div>
      <h2 class="wb-title" contenteditable="true">Frequently Asked Questions</h2>
      <p class="wb-desc" contenteditable="true">Everything you need to know about building, exporting, and plans.</p>
    </div>
    <div>
      <div class="wb-faq-item">
        <button class="wb-faq-question" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
          <span contenteditable="true">How do I export my website code or download a PDF?</span>
          <i class="fa-solid fa-chevron-down" style="font-size: 0.9rem;"></i>
        </button>
        <div class="wb-faq-answer">
          <p contenteditable="true">On Pro and Enterprise plans, you can click 'Export Website' in the top header to instantly download a clean, standalone ZIP package with semantic HTML5, CSS3, and JavaScript, or click 'Export PDF' for direct print-ready documents.</p>
        </div>
      </div>
      <div class="wb-faq-item">
        <button class="wb-faq-question" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
          <span contenteditable="true">What are the differences between Free, Pro, and Enterprise editions?</span>
          <i class="fa-solid fa-chevron-down" style="font-size: 0.9rem;"></i>
        </button>
        <div class="wb-faq-answer">
          <p contenteditable="true">Free Edition ($0) provides 4 canvas sections, 5 starter templates, and 2-color gradients. Pro Edition ($19/mo) unlocks all 52+ templates, unlimited canvas sections, live multi-device preview, clean code view, 3-color cosmic gradients, and full ZIP/PDF exports. Enterprise ($49/mo) adds white-label exports, custom domain simulation, and priority 24/7 support.</p>
        </div>
      </div>
      <div class="wb-faq-item">
        <button class="wb-faq-question" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
          <span contenteditable="true">How does Google Account verification and permissions work?</span>
          <i class="fa-solid fa-chevron-down" style="font-size: 0.9rem;"></i>
        </button>
        <div class="wb-faq-answer">
          <p contenteditable="true">Click 'Sign in with Google' in the top header. You will be prompted to enter your Google account email to receive your 6-digit verification code. Once verified, your account is authenticated and your plan entitlements are applied.</p>
        </div>
      </div>
    </div>
  </div>
</section>`
  },

  'cta-banner': {
    category: 'Call To Action',
    name: 'High-Converting Banner',
    icon: 'fa-solid fa-bullhorn',
    html: `
<section class="wb-section dark-bg" data-block-type="cta" style="text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);">
  <div class="wb-container" style="max-width: 800px;">
    <div class="wb-badge" style="background: rgba(255,255,255,0.1); color: #fff;"><i class="fa-solid fa-rocket"></i> <span contenteditable="true">Ready To Scale?</span></div>
    <h2 class="wb-title" style="color: #fff; margin-bottom: 1.25rem;" contenteditable="true">Supercharge Your Business Trajectory Today</h2>
    <p class="wb-desc" style="color: #cbd5e1; margin-bottom: 2.5rem;" contenteditable="true">Join hundreds of visionary companies driving measurable growth with our enterprise solutions.</p>
    <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
      <a href="#contact" class="wb-btn wb-btn-primary" contenteditable="true">Schedule Executive Briefing</a>
      <a href="#pricing" class="wb-btn wb-btn-secondary" contenteditable="true">Compare All Plans</a>
    </div>
  </div>
</section>`
  },

  'contact-form': {
    category: 'Contact & Lead Capture',
    name: 'Corporate Contact Section',
    icon: 'fa-solid fa-envelope',
    html: `
<section class="wb-section" id="contact" data-block-type="contact">
  <div class="wb-container">
    <div class="wb-grid-2">
      <div>
        <div class="wb-badge"><i class="fa-solid fa-location-dot"></i> <span contenteditable="true">Get In Touch</span></div>
        <h2 class="wb-title" contenteditable="true">Let's discuss how we can accelerate your targets</h2>
        <p class="wb-desc" style="margin-bottom: 2rem;" contenteditable="true">Our corporate solutions advisors are ready to tailor an enterprise roadmap for your specific business requirements.</p>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="wb-feature-icon" style="width: 44px; height: 44px; margin-bottom: 0;"><i class="fa-solid fa-envelope"></i></div>
            <div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Email Direct</div>
              <div style="font-weight: 600;" contenteditable="true">enterprise@apexcorp.com</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="wb-feature-icon" style="width: 44px; height: 44px; margin-bottom: 0;"><i class="fa-solid fa-phone"></i></div>
            <div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Headquarters Phone</div>
              <div style="font-weight: 600;" contenteditable="true">+1 (800) 555-0199</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="wb-feature-icon" style="width: 44px; height: 44px; margin-bottom: 0;"><i class="fa-solid fa-building-columns"></i></div>
            <div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">Global Headquarters</div>
              <div style="font-weight: 600;" contenteditable="true">550 Montgomery St, San Francisco, CA</div>
            </div>
          </div>
        </div>
      </div>
      <div class="wb-card">
        <h3 style="font-size: 1.35rem; margin-bottom: 1.25rem;" contenteditable="true">Request an Enterprise Proposal</h3>
        <form onsubmit="event.preventDefault(); alert('Thank you! Your message has been received.');">
          <div class="wb-form-group">
            <label class="wb-form-label" contenteditable="true">Full Name</label>
            <input type="text" class="wb-form-control" placeholder="Jane Doe" required>
          </div>
          <div class="wb-form-group">
            <label class="wb-form-label" contenteditable="true">Work Email</label>
            <input type="email" class="wb-form-control" placeholder="jane@company.com" required>
          </div>
          <div class="wb-form-group">
            <label class="wb-form-label" contenteditable="true">Company & Role</label>
            <input type="text" class="wb-form-control" placeholder="Acme Inc - VP of Engineering">
          </div>
          <div class="wb-form-group">
            <label class="wb-form-label" contenteditable="true">How can we assist you?</label>
            <textarea class="wb-form-control" rows="4" placeholder="Tell us about your upcoming project scope and timeframe..."></textarea>
          </div>
          <button type="submit" class="wb-btn wb-btn-primary" style="width: 100%;">Submit Request <i class="fa-solid fa-paper-plane"></i></button>
        </form>
      </div>
    </div>
  </div>
</section>`
  },

  'footer-corporate': {
    category: 'Footer',
    name: 'Corporate Multi-Column Footer',
    icon: 'fa-solid fa-shoe-prints',
    html: `
<footer class="wb-footer" data-block-type="footer">
  <div class="wb-container">
    <div class="wb-grid-4" style="margin-bottom: 3rem;">
      <div>
        <div class="wb-brand" style="color: #fff; margin-bottom: 1rem;">
          <div class="wb-brand-icon"><i class="fa-solid fa-shapes"></i></div>
          <span contenteditable="true">EnterpriseBuilder</span>
        </div>
        <p style="font-size: 0.9rem; line-height: 1.6;" contenteditable="true">Next-generation visual website builder and code export studio. Build responsive company websites with 52+ templates and 100% clean production code.</p>
      </div>
      <div>
        <h4 contenteditable="true">Features</h4>
        <ul class="wb-footer-links">
          <li><a href="#services" contenteditable="true">52+ Pro Templates</a></li>
          <li><a href="#services" contenteditable="true">Multi-Device Breakpoints</a></li>
          <li><a href="#services" contenteditable="true">3-Color Cosmic Gradients</a></li>
          <li><a href="#services" contenteditable="true">HTML, ZIP & PDF Export</a></li>
        </ul>
      </div>
      <div>
        <h4 contenteditable="true">Plans & Editions</h4>
        <ul class="wb-footer-links">
          <li><a href="#pricing" contenteditable="true">Free Edition ($0)</a></li>
          <li><a href="#pricing" contenteditable="true">Pro Edition ($19)</a></li>
          <li><a href="#pricing" contenteditable="true">Enterprise Edition ($49)</a></li>
          <li><a href="#pricing" contenteditable="true">Google Account Auth</a></li>
        </ul>
      </div>
      <div>
        <h4 contenteditable="true">Security & Trust</h4>
        <ul class="wb-footer-links">
          <li><a href="#" contenteditable="true">Google Verified Login</a></li>
          <li><a href="#" contenteditable="true">100/100 PageSpeed</a></li>
          <li><a href="#" contenteditable="true">Pure Semantic HTML5</a></li>
          <li><a href="#" contenteditable="true">Privacy Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="wb-footer-bottom">
      <div contenteditable="true">&copy; 2026 EnterpriseBuilder Platform. All rights reserved.</div>
      <div style="display: flex; gap: 1.25rem; font-size: 1.2rem;">
        <a href="#"><i class="fa-brands fa-linkedin"></i></a>
        <a href="#"><i class="fa-brands fa-x-twitter"></i></a>
        <a href="#"><i class="fa-brands fa-github"></i></a>
      </div>
    </div>
  </div>
</footer>`
  }
};

window.BUILDER_ELEMENTS = {
  'btn-primary': {
    category: 'Buttons & Links',
    name: 'Primary Action Button',
    icon: 'fa-solid fa-square-check',
    tier: 'free',
    target: '.wb-hero-actions, .wb-nav-cta, .wb-container, form, div',
    html: `<a href="#contact" class="wb-btn wb-btn-primary" contenteditable="true">Get Started <i class="fa-solid fa-arrow-right"></i></a>`
  },
  'btn-secondary': {
    category: 'Buttons & Links',
    name: 'Secondary Light Button',
    icon: 'fa-solid fa-square',
    tier: 'pro',
    target: '.wb-hero-actions, .wb-nav-cta, .wb-container, form, div',
    html: `<a href="#services" class="wb-btn wb-btn-secondary" contenteditable="true">Learn More</a>`
  },
  'btn-dark': {
    category: 'Buttons & Links',
    name: 'Dark Accent Button',
    icon: 'fa-solid fa-square-full',
    tier: 'pro',
    target: '.wb-hero-actions, .wb-nav-cta, .wb-container, form, div',
    html: `<a href="#pricing" class="wb-btn wb-btn-dark" contenteditable="true">Explore Plans</a>`
  },
  'btn-outline': {
    category: 'Buttons & Links',
    name: 'Outline Border Button',
    icon: 'fa-regular fa-square',
    tier: 'enterprise',
    target: '.wb-hero-actions, .wb-nav-cta, .wb-container, form, div',
    html: `<a href="#cases" class="wb-btn wb-btn-outline" contenteditable="true">View Portfolio</a>`
  },

  'input-text': {
    category: 'Form Inputs & Fields',
    name: 'Single-Line Text Input',
    icon: 'fa-solid fa-i-cursor',
    tier: 'free',
    target: 'form, .wb-card, .wb-grid-2, .wb-container',
    html: `
<div class="wb-form-group">
  <label class="wb-form-label" contenteditable="true">Full Name</label>
  <input type="text" class="wb-form-control" placeholder="Enter your full name...">
</div>`
  },
  'input-email': {
    category: 'Form Inputs & Fields',
    name: 'Work Email Input',
    icon: 'fa-solid fa-at',
    tier: 'pro',
    target: 'form, .wb-card, .wb-grid-2, .wb-container',
    html: `
<div class="wb-form-group">
  <label class="wb-form-label" contenteditable="true">Business Email</label>
  <input type="email" class="wb-form-control" placeholder="name@company.com" required>
</div>`
  },
  'input-phone': {
    category: 'Form Inputs & Fields',
    name: 'Phone Number Input',
    icon: 'fa-solid fa-phone',
    tier: 'pro',
    target: 'form, .wb-card, .wb-grid-2, .wb-container',
    html: `
<div class="wb-form-group">
  <label class="wb-form-label" contenteditable="true">Phone Number</label>
  <input type="tel" class="wb-form-control" placeholder="+1 (555) 000-0000">
</div>`
  },
  'input-textarea': {
    category: 'Form Inputs & Fields',
    name: 'Multi-Line Textarea Box',
    icon: 'fa-solid fa-align-left',
    tier: 'enterprise',
    target: 'form, .wb-card, .wb-grid-2, .wb-container',
    html: `
<div class="wb-form-group">
  <label class="wb-form-label" contenteditable="true">Message / Project Scope</label>
  <textarea class="wb-form-control" rows="4" placeholder="Tell us about your requirements..."></textarea>
</div>`
  },
  'input-select': {
    category: 'Form Inputs & Fields',
    name: 'Dropdown Select Menu',
    icon: 'fa-solid fa-list-check',
    tier: 'enterprise',
    target: 'form, .wb-card, .wb-grid-2, .wb-container',
    html: `
<div class="wb-form-group">
  <label class="wb-form-label" contenteditable="true">Select Service Needed</label>
  <select class="wb-form-control">
    <option value="cloud">Cloud Architecture & Migration</option>
    <option value="ai">AI Automation & Data Intelligence</option>
    <option value="security">Cybersecurity & Governance</option>
    <option value="advisory">Strategic Business Advisory</option>
  </select>
</div>`
  },
  'input-checkbox': {
    category: 'Form Inputs & Fields',
    name: 'Checkbox Agreement Option',
    icon: 'fa-regular fa-square-check',
    tier: 'enterprise',
    target: 'form, .wb-card, .wb-grid-2, .wb-container',
    html: `
<div class="wb-form-group" style="display: flex; align-items: center; gap: 0.6rem;">
  <input type="checkbox" id="wb-cb-agree" style="width: 18px; height: 18px; accent-color: var(--primary-color);">
  <label for="wb-cb-agree" style="font-size: 0.88rem; color: var(--text-muted); cursor: pointer;" contenteditable="true">I agree to the Terms of Service & Privacy Policy.</label>
</div>`
  },
  'input-submit': {
    category: 'Form Inputs & Fields',
    name: 'Form Submit Button',
    icon: 'fa-solid fa-paper-plane',
    tier: 'enterprise',
    target: 'form, .wb-card, .wb-container',
    html: `<button type="submit" class="wb-btn wb-btn-primary" style="width: 100%; justify-content: center;"><span contenteditable="true">Submit Request</span> <i class="fa-solid fa-paper-plane"></i></button>`
  },

  'icon-arrow-right': {
    category: 'Icons & Badges',
    name: 'Arrow Right Action Icon',
    icon: 'fa-solid fa-arrow-right',
    tier: 'free',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container, a',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-arrow-right"></i></div>`
  },
  'icon-arrow-trend': {
    category: 'Icons & Badges',
    name: 'Growth Trend Arrow Icon',
    icon: 'fa-solid fa-arrow-trend-up',
    tier: 'pro',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-arrow-trend-up"></i></div>`
  },
  'icon-chevron': {
    category: 'Icons & Badges',
    name: 'Chevron Direction Icon',
    icon: 'fa-solid fa-chevron-right',
    tier: 'pro',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-chevron-right"></i></div>`
  },
  'icon-box': {
    category: 'Icons & Badges',
    name: 'Bolt Energy Icon',
    icon: 'fa-solid fa-bolt',
    tier: 'enterprise',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-bolt"></i></div>`
  },
  'icon-cloud': {
    category: 'Icons & Badges',
    name: 'Cloud Infrastructure Icon',
    icon: 'fa-solid fa-cloud',
    tier: 'enterprise',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-cloud"></i></div>`
  },
  'icon-shield': {
    category: 'Icons & Badges',
    name: 'Security Shield Icon',
    icon: 'fa-solid fa-shield-halved',
    tier: 'enterprise',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-shield-halved"></i></div>`
  },
  'icon-chart': {
    category: 'Icons & Badges',
    name: 'Analytics Chart Icon',
    icon: 'fa-solid fa-chart-line',
    tier: 'enterprise',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-chart-line"></i></div>`
  },
  'icon-brain': {
    category: 'Icons & Badges',
    name: 'AI Intelligence Icon',
    icon: 'fa-solid fa-brain',
    tier: 'enterprise',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-brain"></i></div>`
  },
  'icon-gear': {
    category: 'Icons & Badges',
    name: 'Settings Gear Icon',
    icon: 'fa-solid fa-gear',
    tier: 'enterprise',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-gear"></i></div>`
  },
  'icon-lock': {
    category: 'Icons & Badges',
    name: 'Lock Security Icon',
    icon: 'fa-solid fa-lock',
    tier: 'enterprise',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-lock"></i></div>`
  },
  'icon-globe': {
    category: 'Icons & Badges',
    name: 'Global Network Icon',
    icon: 'fa-solid fa-globe',
    tier: 'enterprise',
    target: '.wb-card, .wb-grid-2, .wb-grid-3, .wb-container',
    html: `<div class="wb-feature-icon"><i class="fa-solid fa-globe"></i></div>`
  },
  'badge-pill': {
    category: 'Icons & Badges',
    name: 'Pill Status Badge',
    icon: 'fa-solid fa-tag',
    tier: 'enterprise',
    target: 'div, .wb-container, .wb-card',
    html: `<div class="wb-badge"><i class="fa-solid fa-sparkles"></i> <span contenteditable="true">New Enterprise Feature</span></div>`
  },
  'icon-star-rating': {
    category: 'Icons & Badges',
    name: '5-Star Customer Rating',
    icon: 'fa-solid fa-star',
    tier: 'enterprise',
    target: 'div, .wb-container, .wb-card, .wb-hero',
    html: `
<div style="display: inline-flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0;">
  <div style="display: flex; color: #f59e0b; gap: 3px; font-size: 0.95rem;">
    <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
  </div>
  <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);" contenteditable="true">5.0 / 5.0 Rating</span>
</div>`
  },
  'tech-stack-row': {
    category: 'Icons & Badges',
    name: 'Programming Stack Row',
    icon: 'fa-solid fa-code',
    tier: 'enterprise',
    target: '.wb-container, .wb-card, .wb-hero, div',
    html: `
<div style="display: flex; gap: 1.5rem; font-size: 2rem; align-items: center; justify-content: center; flex-wrap: wrap; margin: 1.5rem 0; color: var(--primary-color);">
  <i class="fa-brands fa-js" title="JavaScript"></i>
  <i class="fa-brands fa-python" title="Python"></i>
  <i class="fa-brands fa-react" title="React"></i>
  <i class="fa-brands fa-node-js" title="Node.js"></i>
  <i class="fa-brands fa-html5" title="HTML5"></i>
  <i class="fa-brands fa-css3-alt" title="CSS3"></i>
  <i class="fa-brands fa-docker" title="Docker / Go"></i>
  <i class="fa-brands fa-aws" title="AWS Cloud"></i>
</div>`
  },
  'social-icons': {
    category: 'Icons & Badges',
    name: 'Social Media Icons Row',
    icon: 'fa-brands fa-x-twitter',
    tier: 'enterprise',
    target: 'footer, div, .wb-container',
    html: `
<div style="display: flex; gap: 1rem; font-size: 1.25rem; align-items: center; margin: 0.5rem 0;">
  <a href="#" style="color: var(--primary-color);"><i class="fa-brands fa-linkedin"></i></a>
  <a href="#" style="color: var(--primary-color);"><i class="fa-brands fa-x-twitter"></i></a>
  <a href="#" style="color: var(--primary-color);"><i class="fa-brands fa-github"></i></a>
  <a href="#" style="color: var(--primary-color);"><i class="fa-brands fa-youtube"></i></a>
</div>`
  },

  'heading-h2': {
    category: 'Typography & Content',
    name: 'Main Section Title (H2)',
    icon: 'fa-solid fa-heading',
    tier: 'free',
    target: '.wb-container, .wb-header-center, div',
    html: `<h2 class="wb-title" contenteditable="true">Transforming Strategic Visions Into Real Capital</h2>`
  },
  'heading-h3': {
    category: 'Typography & Content',
    name: 'Card / Feature Title (H3)',
    icon: 'fa-solid fa-font',
    tier: 'pro',
    target: '.wb-card, .wb-container, div',
    html: `<h3 class="wb-feature-title" contenteditable="true">Intelligent Cloud Architecture</h3>`
  },
  'paragraph-lead': {
    category: 'Typography & Content',
    name: 'Lead Subtitle Paragraph',
    icon: 'fa-solid fa-paragraph',
    tier: 'pro',
    target: '.wb-container, .wb-header-center, div',
    html: `<p class="wb-desc" contenteditable="true">We empower leading global companies with resilient cloud infrastructure and AI-driven automation.</p>`
  },
  'list-item': {
    category: 'Typography & Content',
    name: 'Checked Feature Item',
    icon: 'fa-solid fa-check',
    tier: 'enterprise',
    target: 'ul, .wb-pricing-features, .wb-card, div',
    html: `<li style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem;"><span style="color: var(--primary-color); font-weight: bold;"><i class="fa-solid fa-check"></i></span> <span contenteditable="true">Enterprise Single-Tenant Cloud VPC</span></li>`
  },
  'divider-line': {
    category: 'Typography & Content',
    name: 'Horizontal Divider',
    icon: 'fa-solid fa-minus',
    tier: 'enterprise',
    target: '.wb-container, div',
    html: `<hr style="border: none; border-top: 1px solid var(--border-color); margin: 2rem 0; width: 100%;">`
  },

  'card-feature': {
    category: 'Cards & Components',
    name: 'Modular Feature Card',
    icon: 'fa-regular fa-clone',
    tier: 'free',
    target: '.wb-grid-2, .wb-grid-3, .wb-grid-4, .wb-container',
    html: `
<div class="wb-card">
  <div class="wb-feature-icon"><i class="fa-solid fa-cube"></i></div>
  <h3 class="wb-feature-title" contenteditable="true">Modular Service Module</h3>
  <p class="wb-feature-desc" contenteditable="true">High-availability microservice architecture designed for ultra-low latency and scalable enterprise operations.</p>
</div>`
  },
  'stat-box': {
    category: 'Cards & Components',
    name: 'Metric Counter Box',
    icon: 'fa-solid fa-chart-line',
    tier: 'pro',
    target: '.wb-grid-2, .wb-grid-3, .wb-grid-4, .wb-container',
    html: `
<div class="wb-stat-box">
  <div class="wb-stat-number" contenteditable="true">99.99%</div>
  <div class="wb-stat-label" contenteditable="true">Uptime Guarantee</div>
</div>`
  }
};
