class Application {
  constructor() {
    this.canvasEl = document.getElementById('canvas-content');
    this.authManager = new AuthManager();
    this.themeManager = new ThemeManager();
    this.editor = new CanvasEditor(this.canvasEl);
    this.exporter = new WebsiteExporter(this.editor, this.themeManager);
    
    this.history = [];
    this.historyStep = -1;
    this.maxHistory = 20;

    window.authManager = this.authManager;
    window.themeManager = this.themeManager;
    window.editor = this.editor;
    window.exporter = this.exporter;
    window.app = this;

    this.init();
  }

  init() {
    this.initIconCatalog();
    this.renderBlockLibrary();
    this.renderElementsLibrary();
    this.renderTemplatesModal();
    this.renderIconPickerModal();
    this.setupEventListeners();
    this.setupModals();
    this.setupTextSelectionToolbar();

    if (window.BUILDER_TEMPLATES && window.BUILDER_TEMPLATES.length > 0) {
      this.editor.loadTemplate(window.BUILDER_TEMPLATES[0].id);
    }

    if (this.authManager.isLoggedIn()) {
      this.showView('studio');
    } else {
      this.showView('landing');
    }
  }

  showView(viewName) {
    const landingView = document.getElementById('landing-showcase-view');
    const studioView = document.getElementById('app-studio-view');
    if (!landingView || !studioView) return;

    if (viewName === 'studio') {
      landingView.style.display = 'none';
      studioView.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (this.editor) {
        this.editor.render();
      }
    } else {
      landingView.style.display = 'block';
      studioView.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  launchStudio() {
    if (this.authManager && this.authManager.isLoggedIn()) {
      this.showView('studio');
      this.showToast(`Welcome to EnterpriseBuilder Studio, ${this.authManager.currentUser.name}!`);
    } else {
      this.authManager.openGoogleLoginModal();
    }
  }

  toggleLandingFaq(btn) {
    if (!btn) return;
    const item = btn.closest('.landing-faq-item');
    if (!item) return;
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.landing-faq-item').forEach(el => el.classList.remove('active'));
    if (!isActive) {
      item.classList.add('active');
    }
  }

  switchSidebarTab(tab) {
    const secBtn = document.getElementById('tab-btn-sections');
    const elemBtn = document.getElementById('tab-btn-elements');
    const secContent = document.getElementById('block-library-content');
    const elemContent = document.getElementById('elements-library-content');

    if (tab === 'sections') {
      if (secBtn) secBtn.classList.add('active');
      if (elemBtn) elemBtn.classList.remove('active');
      if (secContent) secContent.style.display = 'block';
      if (elemContent) elemContent.style.display = 'none';
    } else {
      if (secBtn) secBtn.classList.remove('active');
      if (elemBtn) elemBtn.classList.add('active');
      if (secContent) secContent.style.display = 'none';
      if (elemContent) elemContent.style.display = 'block';
    }
  }

  saveState() {
    try {
      const state = {
        sections: JSON.parse(JSON.stringify(this.editor.sections)),
        theme: { ...this.themeManager.currentTheme }
      };

      if (this.historyStep < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyStep + 1);
      }

      this.history.push(state);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      } else {
        this.historyStep++;
      }
    } catch(e) {}
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      const prevState = this.history[this.historyStep];
      this.editor.sections = JSON.parse(JSON.stringify(prevState.sections));
      this.themeManager.setTheme(prevState.theme);
      this.editor.render();
      if (this.editor.selectedSectionIndex !== null && this.editor.sections[this.editor.selectedSectionIndex]) {
        this.updateInspector(this.editor.sections[this.editor.selectedSectionIndex]);
      }
      this.showToast('Action undone');
    }
  }

  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      const nextState = this.history[this.historyStep];
      this.editor.sections = JSON.parse(JSON.stringify(nextState.sections));
      this.themeManager.setTheme(nextState.theme);
      this.editor.render();
      if (this.editor.selectedSectionIndex !== null && this.editor.sections[this.editor.selectedSectionIndex]) {
        this.updateInspector(this.editor.sections[this.editor.selectedSectionIndex]);
      }
      this.showToast('Action redone');
    }
  }

  renderBlockLibrary() {
    const listEl = document.getElementById('block-library-content');
    if (!listEl || !window.BUILDER_BLOCKS) return;

    const categories = {};
    for (const [key, b] of Object.entries(window.BUILDER_BLOCKS)) {
      if (!categories[b.category]) categories[b.category] = [];
      categories[b.category].push({ key, ...b });
    }

    let html = '';
    for (const [catName, blocks] of Object.entries(categories)) {
      html += `
        <div class="block-category">
          <div class="category-header">
            <span>${catName}</span>
            <span style="background:#ede9fe; color:var(--abi-dark-blue); padding:2px 7px; border-radius:4px; font-size:0.75rem; font-weight:700;">${blocks.length}</span>
          </div>
          <div class="block-list">
      `;

      blocks.forEach(b => {
        const isFreeBlock = ['nav-corporate', 'nav-minimal', 'hero-split', 'hero-centered', 'about-story', 'features-grid', 'stats-counter', 'contact-form', 'footer-corporate', 'footer-simple'].includes(b.key);
        const isPro = !isFreeBlock;
        const proBadge = isPro ? '<span class="pro-item-badge">PRO</span>' : '';

        html += `
          <div class="block-item-card" draggable="true" data-block-key="${b.key}" data-is-pro="${isPro}">
            <div class="block-item-info">
              <div class="block-icon"><i class="${b.icon}"></i></div>
              <span class="block-name">${b.name} ${proBadge}</span>
            </div>
            <button type="button" class="block-add-btn" title="Click to add or drag to canvas"><i class="fa-solid fa-plus"></i></button>
          </div>
        `;
      });

      html += `</div></div>`;
    }

    listEl.innerHTML = html;

    listEl.querySelectorAll('.block-item-card').forEach(card => {
      const blockKey = card.dataset.blockKey;
      const isPro = card.dataset.isPro === 'true';

      card.addEventListener('dragstart', (e) => {
        if (isPro && window.authManager && !window.authManager.isPaidPlan()) {
          window.authManager.openUpgradeModal('pro-block');
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/plain', blockKey);
        e.dataTransfer.setData('application/x-block-key', blockKey);
        e.dataTransfer.effectAllowed = 'copy';
        card.classList.add('is-dragging');
        window.currentDraggingBlockKey = blockKey;
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        window.currentDraggingBlockKey = null;
        if (window.editor) {
          window.editor.removeDropIndicator();
          const frame = document.getElementById('canvas-frame');
          if (frame) frame.classList.remove('drag-over');
        }
      });

      card.addEventListener('click', (e) => {
        if (isPro && window.authManager && !window.authManager.isPaidPlan()) {
          window.authManager.openUpgradeModal('pro-block');
          return;
        }
        if (window.editor) {
          window.editor.addBlock(blockKey);
        }
      });
    });
  }

  renderElementsLibrary() {
    const listEl = document.getElementById('elements-library-content');
    if (!listEl || !window.BUILDER_ELEMENTS) return;

    const categories = {};
    for (const [key, elDef] of Object.entries(window.BUILDER_ELEMENTS)) {
      if (!categories[elDef.category]) categories[elDef.category] = [];
      categories[elDef.category].push({ key, ...elDef });
    }

    let html = '';
    for (const [catName, elems] of Object.entries(categories)) {
      html += `
        <div class="block-category">
          <div class="category-header">
            <span>${catName}</span>
            <span style="background:#ede9fe; color:var(--abi-dark-blue); padding:2px 7px; border-radius:4px; font-size:0.75rem; font-weight:700;">${elems.length}</span>
          </div>
          <div class="block-list">
      `;

      elems.forEach(elItem => {
        let badgeHtml = '';
        if (elItem.tier === 'free') {
          badgeHtml = '<span style="background: #dcfce7; color: #166534; font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">FREE</span>';
        } else if (elItem.tier === 'pro') {
          badgeHtml = '<span class="pro-item-badge" style="margin-left: 6px;">PRO</span>';
        } else if (elItem.tier === 'enterprise') {
          badgeHtml = '<span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">ENTERPRISE</span>';
        }

        html += `
          <div class="element-item-card" draggable="true" data-elem-key="${elItem.key}" data-elem-tier="${elItem.tier || 'free'}">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div class="element-icon"><i class="${elItem.icon}"></i></div>
              <span class="element-name">${elItem.name} ${badgeHtml}</span>
            </div>
            <button type="button" class="block-add-btn" style="font-size: 0.95rem;" title="Click to insert into selected section or drag to canvas"><i class="fa-solid fa-plus"></i></button>
          </div>
        `;
      });

      html += `</div></div>`;
    }

    listEl.innerHTML = html;

    listEl.querySelectorAll('.element-item-card').forEach(card => {
      const elemKey = card.dataset.elemKey;

      card.addEventListener('dragstart', (e) => {
        if (window.authManager && !window.authManager.canUseElement(elemKey)) {
          const plan = window.authManager.getPlan();
          const elemTier = card.dataset.elemTier;
          if (elemTier === 'enterprise' && plan === 'pro') {
            window.authManager.openUpgradeModal('enterprise-component');
          } else {
            window.authManager.openUpgradeModal('pro-component');
          }
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/plain', elemKey);
        e.dataTransfer.setData('application/x-elem-key', elemKey);
        e.dataTransfer.effectAllowed = 'copy';
        card.classList.add('is-dragging');
        window.currentDraggingElementKey = elemKey;
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        window.currentDraggingElementKey = null;
      });

      card.addEventListener('click', () => {
        if (window.authManager && !window.authManager.canUseElement(elemKey)) {
          const plan = window.authManager.getPlan();
          const elemTier = card.dataset.elemTier;
          if (elemTier === 'enterprise' && plan === 'pro') {
            window.authManager.openUpgradeModal('enterprise-component');
          } else {
            window.authManager.openUpgradeModal('pro-component');
          }
          return;
        }
        if (window.editor) {
          window.editor.addElement(elemKey);
        }
      });
    });
  }

  renderTemplatesModal() {
    const gridEl = document.getElementById('template-cards-grid');
    const chipsEl = document.getElementById('template-category-chips');
    if (!gridEl || !window.BUILDER_TEMPLATES) return;

    this.selectedTemplateCategory = 'all';

    if (chipsEl) {
      const categories = ['All', ...new Set(window.BUILDER_TEMPLATES.map(t => t.category))];
      chipsEl.innerHTML = categories.map(cat => `
        <button type="button" class="segment-btn ${cat === 'All' ? 'active' : ''}" style="white-space: nowrap; padding: 4px 10px;" data-cat="${cat}" onclick="window.app && window.app.selectTemplateCategory('${cat}')">
          ${cat}
        </button>
      `).join('');
    }

    this.filterTemplates();
  }

  selectTemplateCategory(cat) {
    this.selectedTemplateCategory = cat;
    const chips = document.querySelectorAll('#template-category-chips button');
    chips.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === cat);
    });
    this.filterTemplates();
  }

  filterTemplates() {
    const gridEl = document.getElementById('template-cards-grid');
    const searchInput = document.getElementById('template-search-input');
    const countBadge = document.getElementById('template-count-badge');
    if (!gridEl || !window.BUILDER_TEMPLATES) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCat = this.selectedTemplateCategory || 'all';

    const filtered = window.BUILDER_TEMPLATES.filter(t => {
      const matchesCat = (selectedCat === 'all' || selectedCat === 'All') || t.category === selectedCat;
      const matchesSearch = !query ||
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${window.BUILDER_TEMPLATES.length} Templates`;
    }

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: #c4b5fd; margin-bottom: 0.75rem;"></i>
          <h4>No templates match your search</h4>
          <p style="font-size: 0.88rem; margin-top: 0.25rem;">Try another search term or click 'All' to browse all 52 company templates.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(t => {
      const primaryColor = (t.theme && t.theme.primary) ? t.theme.primary : '#2563eb';
      const accentColor = (t.theme && t.theme.accent) ? t.theme.accent : '#06b6d4';
      const isFreeTmpl = ['apex-corporate', 'sterling-management', 'stratton-capital-ma', 'beacon-operations', 'vanguard-audit'].includes(t.id);
      const isProTmpl = [
        'nexus-tech-saas', 'hypercloud-devops', 'cortex-ai-copilot', 'shieldvault-cybersecurity',
        'flowmetrics-analytics', 'syncpulse-hrtech', 'meridian-private-equity', 'novacrest-hedgefund',
        'aegis-wealth-advisors', 'zenith-neobank', 'apex-insurance-group', 'vanguard-law-firm',
        'lexington-ip-patents', 'horizon-immigration-law', 'clarion-compliance-esg', 'solace-health-clinic',
        'genovance-biotech', 'lumina-dental-studio', 'vitalmind-telehealth', 'aura-agency'
      ].includes(t.id);

      let badgeHtml = '<span style="position: absolute; top: 10px; left: 10px; z-index: 2; background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; font-size: 0.68rem; font-weight: 800; padding: 2px 7px; border-radius: 4px;">ENTERPRISE</span>';
      if (isFreeTmpl) {
        badgeHtml = '<span style="position: absolute; top: 10px; left: 10px; z-index: 2; background: #dcfce7; color: #166534; font-size: 0.68rem; font-weight: 800; padding: 2px 7px; border-radius: 4px;">FREE</span>';
      } else if (isProTmpl) {
        badgeHtml = '<span class="pro-item-badge" style="position: absolute; top: 10px; left: 10px; z-index: 2; padding: 2px 7px; font-size: 0.68rem;">PRO</span>';
      }

      return `
        <div class="template-card" onclick="window.app.loadTemplateAndClose('${t.id}')">
          <div class="template-preview" style="background: linear-gradient(135deg, ${primaryColor}15, ${accentColor}30); color: ${primaryColor};">
            ${badgeHtml}
            <i class="${t.icon}"></i>
            <span style="position: absolute; top: 10px; right: 10px; background: #ffffff; color: var(--text-main); font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.08);">${t.category}</span>
          </div>
          <div class="template-info">
            <div class="template-name">${t.name}</div>
            <div class="template-desc">${t.description}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-muted);">
              <span><i class="fa-solid fa-cubes"></i> ${t.blocks.length} Sections</span>
              <span style="color: var(--abi-dark-blue); font-weight: 700;">Load Template &rarr;</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  loadTemplateAndClose(templateId) {
    if (window.authManager) {
      if (!window.authManager.canUseTemplate(templateId)) {
        const plan = window.authManager.getPlan();
        if (plan === 'pro') {
          window.authManager.openUpgradeModal('enterprise-template');
        } else {
          window.authManager.openUpgradeModal('pro-template');
        }
        return;
      }
    }
    this.editor.loadTemplate(templateId);
    this.closeModal('templates-modal');
  }

  initIconCatalog() {
    this.iconCatalog = [
      { name: 'Arrow Right', icon: 'fa-solid fa-arrow-right', category: 'Arrows & Direction' },
      { name: 'Arrow Left', icon: 'fa-solid fa-arrow-left', category: 'Arrows & Direction' },
      { name: 'Arrow Up', icon: 'fa-solid fa-arrow-up', category: 'Arrows & Direction' },
      { name: 'Arrow Down', icon: 'fa-solid fa-arrow-down', category: 'Arrows & Direction' },
      { name: 'Arrow Trend Up', icon: 'fa-solid fa-arrow-trend-up', category: 'Arrows & Direction' },
      { name: 'Arrow Trend Down', icon: 'fa-solid fa-arrow-trend-down', category: 'Arrows & Direction' },
      { name: 'Arrow Right Long', icon: 'fa-solid fa-arrow-right-long', category: 'Arrows & Direction' },
      { name: 'Arrow Rotate Right', icon: 'fa-solid fa-rotate-right', category: 'Arrows & Direction' },
      { name: 'Arrow Rotate Left', icon: 'fa-solid fa-rotate-left', category: 'Arrows & Direction' },
      { name: 'Chevron Right', icon: 'fa-solid fa-chevron-right', category: 'Arrows & Direction' },
      { name: 'Chevron Left', icon: 'fa-solid fa-chevron-left', category: 'Arrows & Direction' },
      { name: 'Chevron Up', icon: 'fa-solid fa-chevron-up', category: 'Arrows & Direction' },
      { name: 'Chevron Down', icon: 'fa-solid fa-chevron-down', category: 'Arrows & Direction' },
      { name: 'Angle Right', icon: 'fa-solid fa-angle-right', category: 'Arrows & Direction' },
      { name: 'Angle Left', icon: 'fa-solid fa-angle-left', category: 'Arrows & Direction' },
      { name: 'Circle Arrow Right', icon: 'fa-solid fa-circle-arrow-right', category: 'Arrows & Direction' },
      { name: 'Circle Arrow Left', icon: 'fa-solid fa-circle-arrow-left', category: 'Arrows & Direction' },
      { name: 'Circle Arrow Up', icon: 'fa-solid fa-circle-arrow-up', category: 'Arrows & Direction' },
      { name: 'Circle Arrow Down', icon: 'fa-solid fa-circle-arrow-down', category: 'Arrows & Direction' },
      { name: 'External Link', icon: 'fa-solid fa-arrow-up-right-from-square', category: 'Arrows & Direction' },
      { name: 'Location Arrow', icon: 'fa-solid fa-location-arrow', category: 'Arrows & Direction' },

      { name: 'Bolt', icon: 'fa-solid fa-bolt', category: 'General' },
      { name: 'Star', icon: 'fa-solid fa-star', category: 'General' },
      { name: 'Heart', icon: 'fa-solid fa-heart', category: 'General' },
      { name: 'Check', icon: 'fa-solid fa-check', category: 'General' },
      { name: 'Check Circle', icon: 'fa-solid fa-circle-check', category: 'General' },
      { name: 'Check Double', icon: 'fa-solid fa-check-double', category: 'General' },
      { name: 'Sparkles', icon: 'fa-solid fa-sparkles', category: 'General' },
      { name: 'Rocket', icon: 'fa-solid fa-rocket', category: 'General' },
      { name: 'Fire', icon: 'fa-solid fa-fire', category: 'General' },
      { name: 'Award', icon: 'fa-solid fa-award', category: 'General' },
      { name: 'Crown', icon: 'fa-solid fa-crown', category: 'General' },
      { name: 'Trophy', icon: 'fa-solid fa-trophy', category: 'General' },
      { name: 'Gem', icon: 'fa-solid fa-gem', category: 'General' },
      { name: 'Cube', icon: 'fa-solid fa-cube', category: 'General' },
      { name: 'Cubes', icon: 'fa-solid fa-cubes', category: 'General' },
      { name: 'Shapes', icon: 'fa-solid fa-shapes', category: 'General' },
      { name: 'Tag', icon: 'fa-solid fa-tag', category: 'General' },
      { name: 'Tags', icon: 'fa-solid fa-tags', category: 'General' },
      { name: 'Flag', icon: 'fa-solid fa-flag', category: 'General' },
      { name: 'Compass', icon: 'fa-solid fa-compass', category: 'General' },
      { name: 'Location', icon: 'fa-solid fa-location-dot', category: 'General' },
      { name: 'Eye', icon: 'fa-solid fa-eye', category: 'General' },
      { name: 'Search', icon: 'fa-solid fa-magnifying-glass', category: 'General' },
      { name: 'Plus', icon: 'fa-solid fa-plus', category: 'General' },
      { name: 'Minus', icon: 'fa-solid fa-minus', category: 'General' },
      { name: 'X-Mark', icon: 'fa-solid fa-xmark', category: 'General' },
      { name: 'Info Circle', icon: 'fa-solid fa-circle-info', category: 'General' },
      { name: 'Exclamation', icon: 'fa-solid fa-circle-exclamation', category: 'General' },
      
      { name: 'Briefcase', icon: 'fa-solid fa-briefcase', category: 'Business' },
      { name: 'Building', icon: 'fa-solid fa-building', category: 'Business' },
      { name: 'Handshake', icon: 'fa-solid fa-handshake', category: 'Business' },
      { name: 'Chart Line', icon: 'fa-solid fa-chart-line', category: 'Business' },
      { name: 'Chart Pie', icon: 'fa-solid fa-chart-pie', category: 'Business' },
      { name: 'Chart Column', icon: 'fa-solid fa-chart-column', category: 'Business' },
      { name: 'Wallet', icon: 'fa-solid fa-wallet', category: 'Business' },
      { name: 'Credit Card', icon: 'fa-solid fa-credit-card', category: 'Business' },
      { name: 'Coins', icon: 'fa-solid fa-coins', category: 'Business' },
      { name: 'Calculator', icon: 'fa-solid fa-calculator', category: 'Business' },
      { name: 'Scale', icon: 'fa-solid fa-scale-balanced', category: 'Business' },
      { name: 'Receipt', icon: 'fa-solid fa-receipt', category: 'Business' },
      { name: 'File Invoice', icon: 'fa-solid fa-file-invoice-dollar', category: 'Business' },
      { name: 'Signature', icon: 'fa-solid fa-signature', category: 'Business' },
      { name: 'Piggy Bank', icon: 'fa-solid fa-piggy-bank', category: 'Business' },
      { name: 'Vault', icon: 'fa-solid fa-vault', category: 'Business' },
      
      { name: 'Cloud', icon: 'fa-solid fa-cloud', category: 'Tech & Code' },
      { name: 'Server', icon: 'fa-solid fa-server', category: 'Tech & Code' },
      { name: 'Database', icon: 'fa-solid fa-database', category: 'Tech & Code' },
      { name: 'Microchip', icon: 'fa-solid fa-microchip', category: 'Tech & Code' },
      { name: 'Brain', icon: 'fa-solid fa-brain', category: 'Tech & Code' },
      { name: 'Robot', icon: 'fa-solid fa-robot', category: 'Tech & Code' },
      { name: 'Code', icon: 'fa-solid fa-code', category: 'Tech & Code' },
      { name: 'Terminal', icon: 'fa-solid fa-terminal', category: 'Tech & Code' },
      { name: 'Network', icon: 'fa-solid fa-network-wired', category: 'Tech & Code' },
      { name: 'Laptop', icon: 'fa-solid fa-laptop-code', category: 'Tech & Code' },
      { name: 'Mobile', icon: 'fa-solid fa-mobile-screen', category: 'Tech & Code' },
      { name: 'JavaScript', icon: 'fa-brands fa-js', category: 'Programming Languages' },
      { name: 'Python', icon: 'fa-brands fa-python', category: 'Programming Languages' },
      { name: 'React', icon: 'fa-brands fa-react', category: 'Programming Languages' },
      { name: 'Node.js', icon: 'fa-brands fa-node-js', category: 'Programming Languages' },
      { name: 'HTML5', icon: 'fa-brands fa-html5', category: 'Programming Languages' },
      { name: 'CSS3', icon: 'fa-brands fa-css3-alt', category: 'Programming Languages' },
      { name: 'Java', icon: 'fa-brands fa-java', category: 'Programming Languages' },
      { name: 'PHP', icon: 'fa-brands fa-php', category: 'Programming Languages' },
      { name: 'Rust', icon: 'fa-brands fa-rust', category: 'Programming Languages' },
      { name: 'Golang / Docker', icon: 'fa-brands fa-docker', category: 'Programming Languages' },
      { name: 'AWS Cloud', icon: 'fa-brands fa-aws', category: 'Programming Languages' },
      { name: 'Linux', icon: 'fa-brands fa-linux', category: 'Programming Languages' },
      { name: 'Git', icon: 'fa-brands fa-git-alt', category: 'Programming Languages' },
      { name: 'Vue.js', icon: 'fa-brands fa-vuejs', category: 'Programming Languages' },
      { name: 'Angular', icon: 'fa-brands fa-angular', category: 'Programming Languages' },
      { name: 'Swift', icon: 'fa-brands fa-swift', category: 'Programming Languages' },
      { name: 'WordPress', icon: 'fa-brands fa-wordpress', category: 'Programming Languages' },
      { name: 'Laravel', icon: 'fa-brands fa-laravel', category: 'Programming Languages' },
      { name: 'Sass', icon: 'fa-brands fa-sass', category: 'Programming Languages' },
      { name: 'Ubuntu', icon: 'fa-brands fa-ubuntu', category: 'Programming Languages' },

      { name: 'Shield', icon: 'fa-solid fa-shield-halved', category: 'Security' },
      { name: 'Lock', icon: 'fa-solid fa-lock', category: 'Security' },
      { name: 'Unlock', icon: 'fa-solid fa-lock-open', category: 'Security' },
      { name: 'Key', icon: 'fa-solid fa-key', category: 'Security' },
      { name: 'Fingerprint', icon: 'fa-solid fa-fingerprint', category: 'Security' },
      { name: 'User Shield', icon: 'fa-solid fa-user-shield', category: 'Security' },
      { name: 'File Shield', icon: 'fa-solid fa-file-shield', category: 'Security' },
      { name: 'Shield Check', icon: 'fa-solid fa-shield-virus', category: 'Security' },
      
      { name: 'User', icon: 'fa-solid fa-user', category: 'People' },
      { name: 'Users', icon: 'fa-solid fa-users', category: 'People' },
      { name: 'User Tie', icon: 'fa-solid fa-user-tie', category: 'People' },
      { name: 'User Group', icon: 'fa-solid fa-user-group', category: 'People' },
      { name: 'People Roof', icon: 'fa-solid fa-people-roof', category: 'People' },
      { name: 'User Check', icon: 'fa-solid fa-user-check', category: 'People' },
      { name: 'User Plus', icon: 'fa-solid fa-user-plus', category: 'People' },
      { name: 'Address Card', icon: 'fa-solid fa-address-card', category: 'People' },

      { name: 'Envelope', icon: 'fa-solid fa-envelope', category: 'Communication' },
      { name: 'Phone', icon: 'fa-solid fa-phone', category: 'Communication' },
      { name: 'Comment', icon: 'fa-solid fa-comment', category: 'Communication' },
      { name: 'Comments', icon: 'fa-solid fa-comments', category: 'Communication' },
      { name: 'Paper Plane', icon: 'fa-solid fa-paper-plane', category: 'Communication' },
      { name: 'Bell', icon: 'fa-solid fa-bell', category: 'Communication' },
      { name: 'Headphones', icon: 'fa-solid fa-headphones', category: 'Communication' },
      { name: 'Bullhorn', icon: 'fa-solid fa-bullhorn', category: 'Communication' },
      { name: 'Share Nodes', icon: 'fa-solid fa-share-nodes', category: 'Communication' },

      { name: 'Gear', icon: 'fa-solid fa-gear', category: 'Tools & Media' },
      { name: 'Gears', icon: 'fa-solid fa-gears', category: 'Tools & Media' },
      { name: 'Wrench', icon: 'fa-solid fa-wrench', category: 'Tools & Media' },
      { name: 'Palette', icon: 'fa-solid fa-palette', category: 'Tools & Media' },
      { name: 'Camera', icon: 'fa-solid fa-camera', category: 'Tools & Media' },
      { name: 'Video', icon: 'fa-solid fa-video', category: 'Tools & Media' },
      { name: 'Play', icon: 'fa-solid fa-play', category: 'Tools & Media' },
      { name: 'Download', icon: 'fa-solid fa-download', category: 'Tools & Media' },
      { name: 'Upload', icon: 'fa-solid fa-upload', category: 'Tools & Media' },
      { name: 'Layer Group', icon: 'fa-solid fa-layer-group', category: 'Tools & Media' },
      { name: 'Folder', icon: 'fa-solid fa-folder', category: 'Tools & Media' },
      { name: 'File', icon: 'fa-solid fa-file-lines', category: 'Tools & Media' },
      
      { name: 'LinkedIn', icon: 'fa-brands fa-linkedin', category: 'Social & Brands' },
      { name: 'Twitter / X', icon: 'fa-brands fa-x-twitter', category: 'Social & Brands' },
      { name: 'GitHub', icon: 'fa-brands fa-github', category: 'Social & Brands' },
      { name: 'YouTube', icon: 'fa-brands fa-youtube', category: 'Social & Brands' },
      { name: 'Facebook', icon: 'fa-brands fa-facebook', category: 'Social & Brands' },
      { name: 'Instagram', icon: 'fa-brands fa-instagram', category: 'Social & Brands' },
      { name: 'Slack', icon: 'fa-brands fa-slack', category: 'Social & Brands' },
      { name: 'Discord', icon: 'fa-brands fa-discord', category: 'Social & Brands' },
      { name: 'Google', icon: 'fa-brands fa-google', category: 'Social & Brands' },
      { name: 'Apple', icon: 'fa-brands fa-apple', category: 'Social & Brands' },
      { name: 'WhatsApp', icon: 'fa-brands fa-whatsapp', category: 'Social & Brands' },
      { name: 'Telegram', icon: 'fa-brands fa-telegram', category: 'Social & Brands' }
    ];

    this.selectedIconCategory = 'All';
    this.iconChangeCallback = null;
  }

  renderIconPickerModal() {
    const chipsEl = document.getElementById('icon-category-chips');
    if (!chipsEl || !this.iconCatalog) return;

    const categories = ['All', ...new Set(this.iconCatalog.map(i => i.category))];
    chipsEl.innerHTML = categories.map(cat => `
      <button type="button" class="segment-btn ${cat === 'All' ? 'active' : ''}" style="white-space: nowrap; padding: 4px 10px;" data-icon-cat="${cat}" onclick="window.app && window.app.selectIconCategory('${cat}')">
        ${cat}
      </button>
    `).join('');

    this.filterIcons();
  }

  selectIconCategory(cat) {
    this.selectedIconCategory = cat;
    const chips = document.querySelectorAll('#icon-category-chips button');
    chips.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.iconCat === cat);
    });
    this.filterIcons();
  }

  filterIcons() {
    const gridEl = document.getElementById('icon-picker-grid');
    const searchInput = document.getElementById('icon-search-input');
    if (!gridEl || !this.iconCatalog) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCat = this.selectedIconCategory || 'All';

    const filtered = this.iconCatalog.filter(item => {
      const matchesCat = (selectedCat === 'All') || item.category === selectedCat;
      const matchesSearch = !query ||
        item.name.toLowerCase().includes(query) ||
        item.icon.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-icons" style="font-size: 2rem; color: #c4b5fd; margin-bottom: 0.5rem;"></i>
          <p style="font-size: 0.88rem;">No icons found matching "${query}"</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(item => `
      <button type="button" class="icon-picker-item" title="${item.name}" onclick="window.app && window.app.selectIcon('${item.icon}')" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 10px 4px; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: all 0.15s ease;">
        <i class="${item.icon}" style="font-size: 1.3rem; color: var(--abi-dark-blue);"></i>
        <span style="font-size: 0.68rem; color: var(--text-muted); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65px;">${item.name}</span>
      </button>
    `).join('');
  }

  openIconPicker(callback) {
    this.iconChangeCallback = callback;
    const searchInput = document.getElementById('icon-search-input');
    if (searchInput) searchInput.value = '';
    this.selectIconCategory('All');
    this.openModal('icon-modal');
  }

  selectIcon(iconClass) {
    if (this.iconChangeCallback) {
      this.iconChangeCallback(iconClass);
    }
    this.closeModal('icon-modal');
  }

  updateInspector(section) {
    const secNameEl = document.getElementById('inspector-selected-name');
    const bgModeButtons = document.querySelectorAll('[data-bg-mode]');
    const solidGroup = document.getElementById('group-solid-color');
    const gradGroup = document.getElementById('group-gradient');
    const bgInput = document.getElementById('inspector-sec-bg');
    const bgHexInput = document.getElementById('inspector-sec-bg-hex');
    const gradCol1 = document.getElementById('inspector-grad-color1');
    const gradHex1 = document.getElementById('inspector-grad-hex1');
    const gradCol2 = document.getElementById('inspector-grad-color2');
    const gradHex2 = document.getElementById('inspector-grad-hex2');
    const gradAngle = document.getElementById('inspector-grad-angle');
    const padInput = document.getElementById('inspector-sec-padding');

    if (!section) {
      if (secNameEl) secNameEl.textContent = 'No section selected';
      if (solidGroup) solidGroup.style.display = 'none';
      if (gradGroup) gradGroup.style.display = 'none';
      bgModeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.bgMode === 'default'));
      return;
    }

    const blockDef = (window.BUILDER_BLOCKS && window.BUILDER_BLOCKS[section.blockId]) 
      ? window.BUILDER_BLOCKS[section.blockId] 
      : { name: 'Custom Section' };

    if (secNameEl) {
      secNameEl.innerHTML = `<span class="badge-selected-sec" title="${blockDef.name}">${blockDef.name}</span>`;
    }

    const mode = section.bgType || (section.bg ? (section.bg.includes('gradient') ? 'gradient' : 'color') : 'default');

    bgModeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.bgMode === mode);
    });

    if (solidGroup) solidGroup.style.display = (mode === 'color') ? 'block' : 'none';
    if (gradGroup) gradGroup.style.display = (mode === 'gradient') ? 'block' : 'none';

    const currentColor = (section.bg && section.bg.startsWith('#')) ? section.bg : '#ffffff';
    if (bgInput) bgInput.value = currentColor;
    if (bgHexInput) bgHexInput.value = currentColor;

    const gradCol3 = document.getElementById('inspector-grad-color3');
    const gradHex3 = document.getElementById('inspector-grad-hex3');
    const gradCol3Wrap = document.getElementById('col-grad-color3-wrap');
    const labelCol2 = document.getElementById('label-grad-color2');
    const btnMode2 = document.getElementById('grad-mode-2color');
    const btnMode3 = document.getElementById('grad-mode-3color');

    if (section.gradient) {
      const c1 = section.gradient.color1 || '#6d28d9';
      const c2 = section.gradient.color2 || '#00cfff';
      const c3 = section.gradient.color3 || '';
      const ang = section.gradient.angle || '135deg';

      if (gradCol1) gradCol1.value = c1;
      if (gradHex1) gradHex1.value = c1;
      if (gradCol2) gradCol2.value = c2;
      if (gradHex2) gradHex2.value = c2;
      if (gradCol3) gradCol3.value = c3 || '#ec4899';
      if (gradHex3) gradHex3.value = c3 || '#ec4899';
      if (gradAngle) gradAngle.value = ang;

      const is3Color = Boolean(c3);
      if (gradCol3Wrap) gradCol3Wrap.style.display = is3Color ? 'block' : 'none';
      if (labelCol2) labelCol2.textContent = is3Color ? 'Color 3' : 'Color 2';
      if (btnMode2) btnMode2.classList.toggle('active', !is3Color);
      if (btnMode3) btnMode3.classList.toggle('active', is3Color);
    } else {
      if (gradCol1) gradCol1.value = '#6d28d9';
      if (gradHex1) gradHex1.value = '#6d28d9';
      if (gradCol2) gradCol2.value = '#00cfff';
      if (gradHex2) gradHex2.value = '#00cfff';
      if (gradCol3) gradCol3.value = '#ec4899';
      if (gradHex3) gradHex3.value = '#ec4899';
      if (gradAngle) gradAngle.value = '135deg';
      if (gradCol3Wrap) gradCol3Wrap.style.display = 'none';
      if (labelCol2) labelCol2.textContent = 'Color 2';
      if (btnMode2) btnMode2.classList.add('active');
      if (btnMode3) btnMode3.classList.remove('active');
    }

    const textColInput = document.getElementById('inspector-sec-text-color');
    const textHexInput = document.getElementById('inspector-sec-text-hex');
    const currentTextColor = section.textColor || '#23124f';
    if (textColInput) textColInput.value = currentTextColor;
    if (textHexInput) textHexInput.value = currentTextColor;

    if (padInput) padInput.value = section.padding || '3.5';
  }

  setDeviceView(device) {
    document.querySelectorAll('.device-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.device === device);
    });

    const frame = document.getElementById('canvas-frame');
    if (frame) {
      frame.classList.remove('tablet', 'mobile');
      if (device === 'tablet') frame.classList.add('tablet');
      if (device === 'mobile') frame.classList.add('mobile');
    }
  }

  setupEventListeners() {
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setDeviceView(btn.dataset.device);
      });
    });

    const primaryInput = document.getElementById('theme-primary-picker');
    if (primaryInput) {
      primaryInput.addEventListener('input', (e) => {
        this.themeManager.setTheme({ primary: e.target.value });
      });
    }

    const accentInput = document.getElementById('theme-accent-picker');
    if (accentInput) {
      accentInput.addEventListener('input', (e) => {
        this.themeManager.setTheme({ accent: e.target.value });
      });
    }

    const bgInput = document.getElementById('inspector-sec-bg');
    const bgHexInput = document.getElementById('inspector-sec-bg-hex');
    if (bgInput) {
      bgInput.addEventListener('input', (e) => {
        if (bgHexInput) bgHexInput.value = e.target.value;
        this.editor.setSolidColor(e.target.value);
      });
    }
    if (bgHexInput) {
      bgHexInput.addEventListener('change', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
          if (bgInput) bgInput.value = val;
          this.editor.setSolidColor(val);
        }
      });
    }

    const gradCol1 = document.getElementById('inspector-grad-color1');
    const gradHex1 = document.getElementById('inspector-grad-hex1');
    const gradCol2 = document.getElementById('inspector-grad-color2');
    const gradHex2 = document.getElementById('inspector-grad-hex2');
    const gradCol3 = document.getElementById('inspector-grad-color3');
    const gradHex3 = document.getElementById('inspector-grad-hex3');
    const gradCol3Wrap = document.getElementById('col-grad-color3-wrap');
    const gradAngle = document.getElementById('inspector-grad-angle');

    const updateGrad = () => {
      const c1 = gradCol1 ? gradCol1.value : '#6d28d9';
      const c2 = gradCol2 ? gradCol2.value : '#00cfff';
      const is3Color = gradCol3Wrap && gradCol3Wrap.style.display !== 'none';
      const c3 = is3Color ? (gradCol3 ? gradCol3.value : '#ec4899') : '';
      const ang = gradAngle ? gradAngle.value : '135deg';
      this.editor.setGradient(c1, c2, ang, c3);
    };

    if (gradCol1) {
      gradCol1.addEventListener('input', (e) => {
        if (gradHex1) gradHex1.value = e.target.value;
        updateGrad();
      });
    }
    if (gradHex1) {
      gradHex1.addEventListener('change', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
          if (gradCol1) gradCol1.value = val;
          updateGrad();
        }
      });
    }

    if (gradCol3) {
      gradCol3.addEventListener('input', (e) => {
        if (gradHex3) gradHex3.value = e.target.value;
        updateGrad();
      });
    }
    if (gradHex3) {
      gradHex3.addEventListener('change', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
          if (gradCol3) gradCol3.value = val;
          updateGrad();
        }
      });
    }

    if (gradCol2) {
      gradCol2.addEventListener('input', (e) => {
        if (gradHex2) gradHex2.value = e.target.value;
        updateGrad();
      });
    }
    if (gradHex2) {
      gradHex2.addEventListener('change', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
          if (gradCol2) gradCol2.value = val;
          updateGrad();
        }
      });
    }

    if (gradAngle) {
      gradAngle.addEventListener('change', () => {
        updateGrad();
      });
    }

    const textColInput = document.getElementById('inspector-sec-text-color');
    const textHexInput = document.getElementById('inspector-sec-text-hex');
    if (textColInput) {
      textColInput.addEventListener('input', (e) => {
        if (textHexInput) textHexInput.value = e.target.value;
        this.editor.setTextColor(e.target.value);
      });
    }
    if (textHexInput) {
      textHexInput.addEventListener('change', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
          if (textColInput) textColInput.value = val;
          this.editor.setTextColor(val);
        }
      });
    }

    const padInput = document.getElementById('inspector-sec-padding');
    if (padInput) {
      padInput.addEventListener('input', (e) => {
        this.editor.updateSectionProperty('padding', e.target.value);
      });
    }
  }

  setupModals() {
    document.querySelectorAll('[data-open-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = btn.dataset.openModal;
        this.openModal(modalId);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
  }

  openModal(modalId) {
    if (modalId === 'preview-modal') {
      if (window.authManager && !window.authManager.canPreview()) {
        window.authManager.openUpgradeModal('preview');
        return;
      }
    } else if (modalId === 'code-modal') {
      if (window.authManager && !window.authManager.canViewCode()) {
        window.authManager.openUpgradeModal('code-view');
        return;
      }
    }
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      if (modalId === 'code-modal') {
        const codeView = document.getElementById('code-preview-area');
        if (codeView && this.exporter) {
          codeView.value = this.exporter.generateFullHTML(true);
        }
      } else if (modalId === 'preview-modal') {
        this.updateLivePreviewModal();
      }
    }
  }

  updateLivePreviewModal() {
    const iframe = document.getElementById('live-preview-iframe');
    const dummyUrlEl = document.getElementById('preview-dummy-url');
    if (iframe && this.exporter) {
      const fullHtml = this.exporter.generateFullHTML(true);
      iframe.srcdoc = fullHtml;
    }
    if (dummyUrlEl && this.editor && this.editor.sections.length > 0) {
      const firstSec = this.editor.sections[0];
      const blockDef = window.BUILDER_BLOCKS ? window.BUILDER_BLOCKS[firstSec.blockId] : null;
      const slug = blockDef ? blockDef.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'site';
      dummyUrlEl.textContent = `${slug}-preview.live/home`;
    }
  }

  openPreviewInNewTab() {
    if (window.authManager && !window.authManager.canPreview()) {
      window.authManager.openUpgradeModal('preview');
      return;
    }
    if (!this.exporter) return;
    const fullHtml = this.exporter.generateFullHTML(true);
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      this.showToast('Opened live preview in new tab');
    } else {
      alert('Please allow popups to open the preview in a new tab.');
    }
  }

  setModalPreviewDevice(device) {
    const btnDesktop = document.getElementById('preview-device-desktop');
    const btnTablet = document.getElementById('preview-device-tablet');
    const btnMobile = document.getElementById('preview-device-mobile');
    const iframe = document.getElementById('live-preview-iframe');

    if (btnDesktop) btnDesktop.classList.toggle('active', device === 'desktop');
    if (btnTablet) btnTablet.classList.toggle('active', device === 'tablet');
    if (btnMobile) btnMobile.classList.toggle('active', device === 'mobile');

    if (iframe) {
      if (device === 'mobile') {
        iframe.style.width = '375px';
      } else if (device === 'tablet') {
        iframe.style.width = '768px';
      } else {
        iframe.style.width = '100%';
      }
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  setupTextSelectionToolbar() {
    const toolbar = document.getElementById('wb-text-format-toolbar');
    const colorPicker = document.getElementById('wb-floating-text-color-picker');
    const colorBar = document.getElementById('wb-selected-color-bar');
    if (!toolbar) return;

    let savedRange = null;

    const saveCurrentRange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRange = sel.getRangeAt(0).cloneRange();
      }
    };

    const restoreSavedRange = () => {
      if (savedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }
    };

    const updateToolbarPosition = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        toolbar.style.display = 'none';
        return;
      }

      const anchorNode = sel.anchorNode;
      const editableParent = anchorNode ? (anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode).closest('[contenteditable="true"]') : null;
      if (!editableParent || !document.getElementById('canvas-content').contains(editableParent)) {
        toolbar.style.display = 'none';
        return;
      }

      const text = sel.toString().trim();
      if (!text) {
        toolbar.style.display = 'none';
        return;
      }

      saveCurrentRange();

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      toolbar.style.display = 'flex';
      const tbWidth = toolbar.offsetWidth || 280;
      const tbHeight = toolbar.offsetHeight || 38;

      let left = rect.left + (rect.width / 2) - (tbWidth / 2);
      let top = rect.top - tbHeight - 8;

      if (top < 10) {
        top = rect.bottom + 8;
      }
      if (left < 10) left = 10;
      if (left + tbWidth > window.innerWidth - 10) {
        left = window.innerWidth - tbWidth - 10;
      }

      toolbar.style.left = `${left + window.scrollX}px`;
      toolbar.style.top = `${top + window.scrollY}px`;
    };

    document.addEventListener('selectionchange', () => {
      setTimeout(updateToolbarPosition, 10);
    });

    document.addEventListener('mouseup', (e) => {
      if (toolbar.contains(e.target)) return;
      setTimeout(updateToolbarPosition, 20);
    });

    document.addEventListener('keyup', (e) => {
      if (toolbar.contains(e.target)) return;
      setTimeout(updateToolbarPosition, 20);
    });

    document.addEventListener('mousedown', (e) => {
      if (!toolbar.contains(e.target)) {
        const sel = window.getSelection();
        if (sel && sel.isCollapsed) {
          toolbar.style.display = 'none';
        }
      }
    });

    toolbar.querySelectorAll('.wb-format-btn[data-command]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        restoreSavedRange();
        const cmd = btn.dataset.command;
        document.execCommand(cmd, false, null);
        saveCurrentRange();
        if (this.editor && this.editor.getSelectedSection()) {
          const sec = this.editor.getSelectedSection();
          const wrapper = this.editor.canvas.children[this.editor.selectedSectionIndex];
          if (wrapper) {
            sec.html = wrapper.querySelector('.section-content').innerHTML;
            this.saveState();
          }
        }
      });
    });

    const applyTextColorToSelection = (color) => {
      restoreSavedRange();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, color);

      if (colorBar) colorBar.style.backgroundColor = color;
      if (colorPicker) colorPicker.value = color;

      if (this.editor && this.editor.getSelectedSection()) {
        const sec = this.editor.getSelectedSection();
        const wrapper = this.editor.canvas.children[this.editor.selectedSectionIndex];
        if (wrapper) {
          wrapper.querySelectorAll('[style*="color"]').forEach(spanEl => {
            spanEl.setAttribute('data-has-custom-color', 'true');
          });
          sec.html = wrapper.querySelector('.section-content').innerHTML;
          this.saveState();
          this.showToast('Updated selected text color');
        }
      }
      saveCurrentRange();
    };

    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        applyTextColorToSelection(e.target.value);
      });
      colorPicker.addEventListener('change', (e) => {
        applyTextColorToSelection(e.target.value);
      });
    }

    toolbar.querySelectorAll('.wb-format-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const color = swatch.dataset.color;
        applyTextColorToSelection(color);
      });
    });
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--abi-green); font-size:1.1rem;"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
        else if (toast.remove) toast.remove();
      }, 250);
    }, 2800);
  }
}

function startApp() {
  if (!window.app) {
    window.app = new Application();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

window.Application = Application;
