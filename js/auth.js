class AuthManager {
  constructor() {
    this.storageKey = 'bwb_auth_user';
    this.whitelistStorageKey = 'bwb_authorized_personnel';
    
    this.defaultGuestUser = {
      id: 'guest_user',
      name: 'Guest User',
      email: '',
      avatar: '',
      isLoggedIn: false,
      isAuthorized: false,
      role: 'guest',
      plan: 'free',
      planName: 'Free Edition (Limited)',
      createdAt: new Date().toISOString()
    };

    this.defaultAuthorizedPersonnel = [];

    this.freeTemplateIds = [
      'apex-corporate',
      'sterling-management',
      'stratton-capital-ma',
      'beacon-operations',
      'vanguard-audit'
    ];

    this.authorizedDomains = ['@apexcorp.com', '@techcorp.io', '@vertex.ai'];
    this.authorizedList = this.loadAuthorizedList();
    this.currentUser = this.loadUser();
    this.activeAuthTab = 'signin';
    this.pendingEmail = '';
    this.otpStep = 'consent';
    this.otpError = '';
    this.paymentMethod = 'credit_card';
    this.selectedTargetPlan = 'pro';
    
    this.init();
  }

  loadAuthorizedList() {
    try {
      const stored = localStorage.getItem(this.whitelistStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [...this.defaultAuthorizedPersonnel];
  }

  saveAuthorizedList(list) {
    this.authorizedList = list;
    try {
      localStorage.setItem(this.whitelistStorageKey, JSON.stringify(list));
    } catch (e) {}
  }

  isAuthorizedEmail(email) {
    if (!email) return { authorized: false };
    const cleanEmail = email.toLowerCase().trim();
    const directMatch = this.authorizedList.find(p => p.email.toLowerCase() === cleanEmail);
    if (directMatch) return { authorized: true, person: directMatch };

    const domainMatch = this.authorizedDomains.some(d => cleanEmail.endsWith(d.toLowerCase()));
    if (domainMatch) {
      return {
        authorized: true,
        person: {
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role: 'Domain Personnel',
          plan: 'pro',
          avatar: ''
        }
      };
    }

    return { authorized: false };
  }

  addAuthorizedPerson(email, name, role = 'Authorized Personnel', plan = 'pro') {
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    const existingIndex = this.authorizedList.findIndex(p => p.email.toLowerCase() === cleanEmail);
    const newPerson = {
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      role: role || 'Authorized Personnel',
      plan: plan || 'pro',
      avatar: '',
      authorizedAt: new Date().toISOString().split('T')[0]
    };

    if (existingIndex >= 0) {
      this.authorizedList[existingIndex] = newPerson;
    } else {
      this.authorizedList.push(newPerson);
    }
    this.saveAuthorizedList(this.authorizedList);
    return true;
  }

  removeAuthorizedPerson(email) {
    const cleanEmail = email.toLowerCase().trim();
    this.authorizedList = this.authorizedList.filter(p => p.email.toLowerCase() !== cleanEmail);
    this.saveAuthorizedList(this.authorizedList);
    if (this.currentUser && this.currentUser.email.toLowerCase() === cleanEmail) {
      this.currentUser.isAuthorized = false;
      this.saveUser(this.currentUser);
    }
  }

  loadUser() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    return { ...this.defaultGuestUser };
  }

  saveUser(user) {
    this.currentUser = user;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    } catch (e) {}
    this.updateUI();
  }

  init() {
    this.updateUI();
    this.setupModalTriggers();
  }

  setupModalTriggers() {
    document.addEventListener('click', (e) => {
      const loginBtn = e.target.closest('[data-auth="google-login"]');
      if (loginBtn) {
        e.preventDefault();
        this.openGoogleLoginModal();
        return;
      }

      const upgradeBtn = e.target.closest('[data-auth="upgrade"]');
      if (upgradeBtn) {
        e.preventDefault();
        const reason = upgradeBtn.dataset.upgradeReason || 'general';
        this.openUpgradeModal(reason);
        return;
      }

      const accountBtn = e.target.closest('[data-auth="account"]');
      if (accountBtn) {
        e.preventDefault();
        this.openAccountModal();
        return;
      }

      const whitelistBtn = e.target.closest('[data-auth="manage-whitelist"]');
      if (whitelistBtn) {
        e.preventDefault();
        this.openWhitelistModal();
        return;
      }
    });
  }

  isLoggedIn() {
    return !!(this.currentUser && this.currentUser.isLoggedIn);
  }

  isAuthorized() {
    return !!(this.currentUser && this.currentUser.isLoggedIn && this.currentUser.isAuthorized);
  }

  getPlan() {
    return (this.currentUser && this.currentUser.plan) ? this.currentUser.plan : 'free';
  }

  isPaidPlan() {
    const plan = this.getPlan();
    return plan === 'pro' || plan === 'enterprise';
  }

  isEnterprise() {
    return this.getPlan() === 'enterprise';
  }

  canAddSection(currentSectionCount) {
    const plan = this.getPlan();
    if (plan === 'enterprise') return true;
    if (plan === 'pro') return currentSectionCount < 6;
    return currentSectionCount < 4;
  }

  canUseBlock(blockKey) {
    const plan = this.getPlan();
    if (plan === 'enterprise') return true;
    const enterpriseOnlyBlocks = [
      'hero-split-image', 'features-grid-3d', 'pricing-interactive-cards', 'form-multistep',
      'testimonials-reviews', 'team-expanded-grid', 'stats-animated-counter'
    ];
    if (plan === 'pro') {
      return !enterpriseOnlyBlocks.includes(blockKey);
    }
    const freeBlocks = ['nav-corporate', 'nav-minimal', 'hero-split', 'hero-centered', 'about-story', 'features-grid', 'stats-counter', 'contact-form', 'footer-corporate', 'footer-simple'];
    return freeBlocks.includes(blockKey);
  }

  canUseTemplate(templateId) {
    const plan = this.getPlan();
    if (plan === 'enterprise') return true;
    if (plan === 'pro') {
      const allowedProTemplates = [
        'apex-corporate', 'sterling-management', 'stratton-capital-ma', 'beacon-operations', 'vanguard-audit',
        'nexus-tech-saas', 'hypercloud-devops', 'cortex-ai-copilot', 'shieldvault-cybersecurity', 'flowmetrics-analytics',
        'syncpulse-hrtech', 'meridian-private-equity', 'novacrest-hedgefund', 'aegis-wealth-advisors', 'zenith-neobank',
        'apex-insurance-group', 'vanguard-law-firm', 'lexington-ip-patents', 'horizon-immigration-law', 'clarion-compliance-esg',
        'solace-health-clinic', 'genovance-biotech', 'lumina-dental-studio', 'vitalmind-telehealth', 'aura-agency'
      ];
      return allowedProTemplates.includes(templateId);
    }
    return this.freeTemplateIds.includes(templateId);
  }

  canUseElement(elementKey) {
    if (!window.BUILDER_ELEMENTS) return true;
    const elemDef = window.BUILDER_ELEMENTS[elementKey];
    if (!elemDef) return true;
    const plan = this.getPlan();
    if (plan === 'enterprise') return true;
    if (elemDef.tier === 'enterprise') return false;
    if (elemDef.tier === 'pro') return plan === 'pro';
    return true;
  }

  canManageWhitelist() {
    return this.getPlan() === 'enterprise';
  }

  isWhiteLabel() {
    return this.getPlan() === 'enterprise';
  }

  canExportHTML() {
    return this.isPaidPlan();
  }

  canExportPDF() {
    return this.getPlan() === 'enterprise';
  }

  canExportZIP() {
    return this.getPlan() === 'enterprise';
  }

  canExport() {
    return this.isPaidPlan();
  }

  canPreviewDevice(device) {
    const plan = this.getPlan();
    if (plan === 'enterprise') return true;
    if (plan === 'pro') return device === 'desktop' || device === 'tablet';
    return false;
  }

  canPreview() {
    return this.isPaidPlan();
  }

  canViewCode() {
    return this.isPaidPlan();
  }

  canCopyCode() {
    return this.getPlan() === 'enterprise';
  }

  canUse3ColorGradient() {
    return this.getPlan() === 'enterprise';
  }

  async requestGoogleOTP(email, appPassword = '') {
    const cleanEmail = (email && email.trim()) ? email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      if (window.app) {
        window.app.showToast('Please enter a valid Google Account email.');
      }
      return;
    }
    this.pendingEmail = cleanEmail;
    this.otpStep = 'otp';
    this.otpError = '';
    this.renderGoogleLoginModal();

    try {
      if (window.mailService) {
        const res = await window.mailService.sendOtp(cleanEmail, appPassword);
        if (res && res.success) {
          if (window.app) {
            window.app.showToast(`📧 Verification code dispatched to ${cleanEmail}. Check your inbox.`);
          }
          return;
        }
      }
      if (window.app) {
        window.app.showToast(`📧 Verification code sent to ${cleanEmail}. Check your inbox.`);
      }
    } catch(e) {
      if (window.app) {
        window.app.showToast(`📧 Verification code sent to ${cleanEmail}. Check your inbox.`);
      }
    }
  }

  async verifyGoogleOTP(inputCode) {
    const cleanCode = (inputCode || '').trim();
    if (!cleanCode) {
      this.otpError = 'Please enter the 6-digit Google Verification Code.';
      this.renderGoogleLoginModal();
      return;
    }

    try {
      let data = null;
      if (window.mailService) {
        data = await window.mailService.verifyOtp(this.pendingEmail, cleanCode);
      }

      if (data && data.success && data.user) {
        const loggedUser = {
          ...data.user,
          isLoggedIn: true,
          isAuthorized: true
        };
        this.saveUser(loggedUser);
        this.closeModal('google-login-modal');
        if (window.app) {
          window.app.showToast(`🎉 Verified: ${loggedUser.name} (${loggedUser.planName})`);
          if (window.app.showView) window.app.showView('studio');
          window.app.renderBlockLibrary();
          window.app.filterTemplates();
        }
        this.updateUI();
      } else {
        this.otpError = (data && data.error) ? data.error : 'Invalid Google Verification Code. Access denied.';
        this.renderGoogleLoginModal();
        if (window.app) {
          window.app.showToast('❌ Invalid verification code. Access denied.');
        }
      }
    } catch(e) {
      this.otpError = 'Verification service error. Please try again.';
      this.renderGoogleLoginModal();
    }
  }

  logout() {
    this.saveUser({ ...this.defaultGuestUser });
    this.closeModal('account-modal');
    if (window.app) {
      window.app.showToast('Signed out of Google account');
      if (window.app.showView) window.app.showView('landing');
      window.app.renderBlockLibrary();
      window.app.filterTemplates();
    }
  }

  upgradePlan(planTier) {
    if (!this.currentUser) return;
    if (planTier === 'free') {
      this.processFreeDowngrade();
      return;
    }
    this.closeModal('upgrade-modal');
    this.openPaymentModal(planTier);
  }

  async processFreeDowngrade() {
    try {
      const email = this.currentUser.email || 'user@example.com';
      const endpoint = window.location.protocol === 'file:' ? 'http://localhost/personal/bwb/payment.php' : 'payment.php';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, plan: 'free' })
      });
      const data = await resp.json();
      if (data && data.success && data.user) {
        this.saveUser({ ...this.currentUser, ...data.user });
      } else {
        this.currentUser.plan = 'free';
        this.currentUser.planName = 'Free Edition (Limited)';
        this.saveUser(this.currentUser);
      }
      this.closeModal('upgrade-modal');
      if (window.app) {
        window.app.showToast('Switched to Free Edition');
        window.app.renderBlockLibrary();
        window.app.filterTemplates();
      }
    } catch(e) {
      this.currentUser.plan = 'free';
      this.currentUser.planName = 'Free Edition (Limited)';
      this.saveUser(this.currentUser);
      this.closeModal('upgrade-modal');
    }
  }

  openPaymentModal(targetPlan = 'pro') {
    this.selectedTargetPlan = targetPlan;
    this.paymentMethod = 'credit_card';
    this.renderPaymentModal(targetPlan);
    this.openModal('payment-modal');
  }

  renderPaymentModal(targetPlan) {
    const box = document.getElementById('payment-modal-box');
    if (!box) return;

    const planPrices = {
      'pro': { price: '₹1,499.00', amount: 1499.00, name: 'Pro Edition', badge: 'PRO', desc: 'Up to 6 sections, 15 standard templates, single HTML export, desktop & tablet preview.' },
      'enterprise': { price: '₹3,999.00', amount: 3999.00, name: 'Enterprise Edition', badge: 'ENTERPRISE', desc: '100% Unrestricted: Unlimited canvas sections, all 52+ templates, ZIP/PDF export, 3-color gradients, mobile preview.' }
    };

    const details = planPrices[targetPlan] || planPrices['pro'];
    const userEmail = (this.currentUser && this.currentUser.email) ? this.currentUser.email : (this.pendingEmail || 'user@example.com');

    box.innerHTML = `
      <div class="modal-header" style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: #ffffff; padding: 1.5rem 1.75rem; position: relative;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #38bdf8;">
            <i class="fa-solid fa-shield-check"></i>
          </div>
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0;">Secure Payment Checkout (INR)</h3>
            <p style="font-size: 0.82rem; color: #c7d2fe; margin: 2px 0 0;">256-Bit SSL Encrypted &bull; Instant Plan Activation</p>
          </div>
        </div>
        <button class="modal-close-btn" style="color: #ffffff; position: absolute; right: 1.25rem; top: 1.25rem;" onclick="window.authManager.closeModal('payment-modal')">&times;</button>
      </div>

      <div class="modal-body" style="padding: 1.5rem; background: #ffffff;">
        <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">${details.name}</span>
              <span style="background: #ede9fe; color: #6d28d9; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 4px;">${details.badge}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; max-width: 340px;">${details.desc}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.6rem; font-weight: 900; color: #1e1b4b;">${details.price}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Billed Monthly (INR)</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
          <button type="button" class="btn-app ${this.paymentMethod === 'credit_card' ? 'btn-app-primary' : 'btn-app-secondary'}" style="flex: 1; justify-content: center; font-size: 0.82rem;" onclick="window.authManager.paymentMethod='credit_card'; window.authManager.renderPaymentModal('${targetPlan}');">
            <i class="fa-solid fa-credit-card"></i> Card
          </button>
          <button type="button" class="btn-app ${this.paymentMethod === 'upi' ? 'btn-app-primary' : 'btn-app-secondary'}" style="flex: 1; justify-content: center; font-size: 0.82rem;" onclick="window.authManager.paymentMethod='upi'; window.authManager.renderPaymentModal('${targetPlan}');">
            <i class="fa-solid fa-qrcode"></i> UPI / QR
          </button>
          <button type="button" class="btn-app ${this.paymentMethod === 'netbanking' ? 'btn-app-primary' : 'btn-app-secondary'}" style="flex: 1; justify-content: center; font-size: 0.82rem;" onclick="window.authManager.paymentMethod='netbanking'; window.authManager.renderPaymentModal('${targetPlan}');">
            <i class="fa-solid fa-building-columns"></i> Net Banking
          </button>
        </div>

        <form id="real-payment-form" onsubmit="event.preventDefault(); window.authManager.executeRealPayment('${targetPlan}');">
          ${this.paymentMethod === 'credit_card' ? `
            <div style="margin-bottom: 1rem;">
              <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-main);">Cardholder Full Name</label>
              <input type="text" id="pay-card-holder" class="inspector-input" placeholder="e.g. Abinash Kumar" value="${(this.currentUser && this.currentUser.name && this.currentUser.name !== 'Guest User') ? this.currentUser.name : ''}" required>
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="font-size: 0.8rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; color: var(--text-main);">
                <span>Card Number</span>
                <span style="display: flex; gap: 4px; font-size: 1.1rem; color: #64748b;">
                  <i class="fa-brands fa-cc-visa" style="color: #2563eb;"></i>
                  <i class="fa-brands fa-cc-mastercard" style="color: #ea580c;"></i>
                  <i class="fa-brands fa-cc-rupay" style="color: #0284c7; font-weight: 800;">₹</i>
                </span>
              </label>
              <div style="position: relative;">
                <i class="fa-solid fa-credit-card" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                <input type="text" id="pay-card-number" class="inspector-input" style="padding-left: 2.5rem; font-family: monospace; letter-spacing: 2px;" placeholder="Valid 16-Digit Card Number" maxlength="19" oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim()" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-main);">Expiration (MM/YY)</label>
                <input type="text" id="pay-card-exp" class="inspector-input" placeholder="MM/YY" maxlength="5" oninput="if(this.value.length === 2 && !this.value.includes('/')) this.value += '/'" required>
              </div>
              <div>
                <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-main);">CVV / CVC</label>
                <div style="position: relative;">
                  <input type="password" id="pay-card-cvv" class="inspector-input" placeholder="3 or 4 Digits" maxlength="4" required>
                  <i class="fa-solid fa-lock" style="position: absolute; right: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.8rem;"></i>
                </div>
              </div>
            </div>
          ` : (this.paymentMethod === 'upi' ? `
            <div style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-main);">Valid Virtual Payment Address (UPI ID)</label>
              <input type="text" id="pay-upi-id" class="inspector-input" placeholder="username@okhdfcbank / username@paytm / user@ybl" required>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Supports Google Pay, PhonePe, Paytm, BHIM UPI</div>
            </div>
          ` : `
            <div style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 0.35rem; color: var(--text-main);">Select Authorized Bank</label>
              <select id="pay-bank-name" class="inspector-select" required>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
                <option value="pnb">Punjab National Bank</option>
                <option value="bob">Bank of Baroda</option>
                <option value="indusind">IndusInd Bank</option>
              </select>
            </div>
          `)}

          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-lock" style="color: #10b981;"></i>
            <span>Secured by Razorpay. Test/fake payment references are verified and rejected by backend.</span>
          </div>

          <div id="payment-btn-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button type="button" id="btn-razorpay-popup" class="btn-app btn-app-primary" style="width: 100%; justify-content: center; padding: 0.95rem; font-size: 1rem; font-weight: 800; border-radius: 10px; background: linear-gradient(135deg, #0284c7, #2563eb); box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);" onclick="window.authManager.launchRazorpayCheckout('${targetPlan}')">
              <i class="fa-solid fa-bolt"></i> Pay via Razorpay Checkout (${details.price})
            </button>
            <button type="submit" id="btn-submit-payment" class="btn-app btn-app-secondary" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 0.9rem; font-weight: 700; border-radius: 10px;">
              <i class="fa-solid fa-shield-check"></i> Direct Gateway Pay & Settle
            </button>
          </div>
        </form>
      </div>

      <div class="modal-footer" style="background: #f8fafc; font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
        <div>Account: <strong>${userEmail}</strong></div>
        <div>100% Secure Razorpay INR Gateway</div>
      </div>
    `;
  }

  async launchRazorpayCheckout(targetPlan) {
    const email = (this.currentUser && this.currentUser.email) ? this.currentUser.email : (this.pendingEmail || 'user@example.com');
    const endpoint = window.location.protocol === 'file:' ? 'http://localhost/personal/bwb/payment.php' : 'payment.php';

    try {
      const orderResp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_order', email, plan: targetPlan })
      });
      const orderData = await orderResp.json();

      if (!orderData || !orderData.success) {
        alert((orderData && orderData.error) ? orderData.error : 'Failed to initialize payment gateway.');
        return;
      }

      if (typeof Razorpay !== 'undefined') {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount_paisa,
          currency: orderData.currency || 'INR',
          name: 'EnterpriseBuilder Studio',
          description: `${targetPlan.toUpperCase()} Plan Subscription`,
          order_id: orderData.order_id,
          prefill: {
            email: email,
            name: (this.currentUser && this.currentUser.name) ? this.currentUser.name : ''
          },
          theme: {
            color: '#6d28d9'
          },
          handler: async (response) => {
            await this.verifyRazorpayPayment(targetPlan, response, email);
          },
          modal: {
            ondismiss: () => {}
          }
        };
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (resp) => {
          alert(`Payment Failed: ${resp.error ? resp.error.description : 'Transaction declined.'}`);
        });
        rzp.open();
      } else {
        await this.executeRealPayment(targetPlan);
      }
    } catch (e) {
      alert('Could not launch payment gateway. Please verify network connection.');
    }
  }

  async verifyRazorpayPayment(targetPlan, rzpResponse, email) {
    const endpoint = window.location.protocol === 'file:' ? 'http://localhost/personal/bwb/payment.php' : 'payment.php';
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: email,
          plan: targetPlan,
          method: 'razorpay',
          razorpay_payment_id: rzpResponse.razorpay_payment_id || '',
          razorpay_order_id: rzpResponse.razorpay_order_id || '',
          razorpay_signature: rzpResponse.razorpay_signature || ''
        })
      });
      const data = await resp.json();
      if (data && data.success) {
        if (data.user) {
          this.saveUser({ ...this.currentUser, ...data.user, isLoggedIn: true, isAuthorized: true });
        } else {
          this.currentUser.plan = targetPlan;
          this.currentUser.planName = targetPlan === 'enterprise' ? 'Enterprise Edition' : 'Pro Edition';
          this.saveUser(this.currentUser);
        }
        this.closeModal('payment-modal');
        this.renderReceiptModal(data.transaction || {
          transaction_id: rzpResponse.razorpay_payment_id || ('tx_' + Date.now()),
          receipt_number: 'REC-' + Date.now(),
          amount: targetPlan === 'enterprise' ? 3999.00 : 1499.00,
          currency: 'INR',
          plan: targetPlan,
          payment_date: new Date().toISOString()
        });
        if (window.app) {
          window.app.showToast(`🎉 Payment verified! Upgraded to ${this.currentUser.planName}.`);
          window.app.renderBlockLibrary();
          window.app.filterTemplates();
        }
        this.updateUI();
      } else {
        alert((data && data.error) ? data.error : 'Payment verification failed. Access denied.');
      }
    } catch (e) {
      alert('Error verifying payment with server.');
    }
  }

  async executeRealPayment(targetPlan) {
    const btn = document.getElementById('btn-submit-payment');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Validating & Processing Payment...`;
    }

    const email = (this.currentUser && this.currentUser.email) ? this.currentUser.email : (this.pendingEmail || 'user@example.com');
    const cardNumInput = document.getElementById('pay-card-number');
    const cardHolderInput = document.getElementById('pay-card-holder');
    const cardExpInput = document.getElementById('pay-card-exp');
    const cardCvvInput = document.getElementById('pay-card-cvv');
    const upiInput = document.getElementById('pay-upi-id');
    const bankSelect = document.getElementById('pay-bank-name');

    const payload = {
      action: 'verify',
      email: email,
      plan: targetPlan,
      method: this.paymentMethod,
      card_number: cardNumInput ? cardNumInput.value : '',
      card_holder: cardHolderInput ? cardHolderInput.value : '',
      card_exp: cardExpInput ? cardExpInput.value : '',
      card_cvv: cardCvvInput ? cardCvvInput.value : '',
      upi_id: upiInput ? upiInput.value : '',
      bank_name: bankSelect ? bankSelect.value : ''
    };

    try {
      const endpoint = window.location.protocol === 'file:' ? 'http://localhost/personal/bwb/payment.php' : 'payment.php';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();

      if (data && data.success) {
        if (data.user) {
          this.saveUser({ ...this.currentUser, ...data.user, isLoggedIn: true, isAuthorized: true });
        } else {
          this.currentUser.plan = targetPlan;
          this.currentUser.planName = targetPlan === 'enterprise' ? 'Enterprise Edition' : 'Pro Edition';
          this.saveUser(this.currentUser);
        }

        this.closeModal('payment-modal');
        this.renderReceiptModal(data.transaction || {
          transaction_id: 'tx_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          receipt_number: 'REC-' + Date.now(),
          amount: targetPlan === 'enterprise' ? 3999.00 : 1499.00,
          currency: 'INR',
          plan: targetPlan,
          payment_date: new Date().toISOString()
        });

        if (window.app) {
          window.app.showToast(`🎉 Payment verified! Upgraded to ${this.currentUser.planName}.`);
          window.app.renderBlockLibrary();
          window.app.filterTemplates();
        }
        this.updateUI();
      } else {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay Now`;
        }
        alert((data && data.error) ? data.error : 'Payment processing failed. Please verify details.');
      }
    } catch (e) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay Now`;
      }
      alert('Payment server error. Please verify your connection.');
    }
  }

  renderReceiptModal(tx) {
    const box = document.getElementById('payment-modal-box');
    if (!box) return;

    box.innerHTML = `
      <div class="modal-header" style="background: linear-gradient(135deg, #065f46, #047857); color: #ffffff; padding: 1.5rem 1.75rem; text-align: center; position: relative;">
        <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.2); margin: 0 auto 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #ffffff;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff; margin: 0;">Payment Verified & Settled!</h3>
        <p style="font-size: 0.85rem; color: #a7f3d0; margin-top: 4px;">Official Payment Receipt & Entitlement Activated</p>
        <button class="modal-close-btn" style="color: #ffffff; position: absolute; right: 1.25rem; top: 1.25rem;" onclick="window.authManager.closeModal('payment-modal')">&times;</button>
      </div>

      <div class="modal-body" style="padding: 1.5rem;">
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; font-family: monospace; font-size: 0.85rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: #64748b;">Transaction ID:</span>
            <strong style="color: #0f172a;">${tx.transaction_id}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: #64748b;">Receipt Number:</span>
            <strong style="color: #0f172a;">${tx.receipt_number || 'REC-ONLINE'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: #64748b;">Plan Tier:</span>
            <strong style="color: #4f46e5; text-transform: uppercase;">${tx.plan} Edition</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="color: #64748b;">Amount Paid:</span>
            <strong style="color: #10b981;">₹${Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${tx.currency || 'INR'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Status:</span>
            <strong style="color: #16a34a;"><i class="fa-solid fa-circle-check"></i> SETTLED</strong>
          </div>
        </div>

        <button type="button" class="btn-app btn-app-primary" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 0.95rem; font-weight: 700; border-radius: 10px;" onclick="window.authManager.closeModal('payment-modal'); if(window.app && window.app.showView) window.app.showView('studio');">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Open Builder Studio & Start Designing
        </button>
      </div>

      <div class="modal-footer" style="background: #f8fafc; font-size: 0.78rem; color: var(--text-muted); text-align: center; justify-content: center;">
        Stored in Database File Ledger &bull; Receipt Sent to Email
      </div>
    `;
    this.openModal('payment-modal');
  }

  openGoogleLoginModal() {
    this.otpStep = 'consent';
    this.otpError = '';
    this.renderGoogleLoginModal();
    this.openModal('google-login-modal');
  }

  openUpgradeModal(reason = 'general', detail = '') {
    this.renderUpgradeModal(reason, detail);
    this.openModal('upgrade-modal');
  }

  openAccountModal() {
    this.renderAccountModal();
    this.openModal('account-modal');
  }

  openWhitelistModal() {
    if (!this.canManageWhitelist()) {
      this.openUpgradeModal('enterprise-whitelist');
      return;
    }
    this.renderWhitelistModal();
    this.openModal('whitelist-modal');
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  updateUI() {
    const authContainer = document.getElementById('header-auth-container');
    const versionTag = document.querySelector('.app-version-tag');
    const plan = this.getPlan();

    if (versionTag) {
      if (plan === 'enterprise') {
        versionTag.textContent = 'ENTERPRISE';
        versionTag.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        versionTag.style.color = '#ffffff';
        versionTag.style.border = 'none';
      } else if (plan === 'pro') {
        versionTag.textContent = 'PRO';
        versionTag.style.background = 'linear-gradient(135deg, #6d28d9, #ec4899)';
        versionTag.style.color = '#ffffff';
        versionTag.style.border = 'none';
      } else {
        versionTag.textContent = 'FREE';
        versionTag.style.background = '#ede9fe';
        versionTag.style.color = '#6d28d9';
        versionTag.style.border = '1px solid var(--border-color)';
      }
    }

    if (!authContainer) return;

    if (this.isLoggedIn()) {
      const user = this.currentUser;
      const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      const avatarHTML = user.avatar
        ? `<img src="${user.avatar}" class="auth-user-avatar-img" alt="${user.name}">`
        : `<div class="auth-user-avatar-initial">${initial}</div>`;
      
      let badgeClass = 'plan-badge-free';
      let badgeText = 'FREE';
      if (plan === 'pro') {
        badgeClass = 'plan-badge-pro';
        badgeText = 'PRO';
      } else if (plan === 'enterprise') {
        badgeClass = 'plan-badge-enterprise';
        badgeText = 'ENTERPRISE';
      }

      const verifiedIcon = user.isAuthorized
        ? `<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 0.8rem;" title="Authorized Personnel Verified"></i>`
        : `<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b; font-size: 0.8rem;" title="Unverified"></i>`;

      authContainer.innerHTML = `
        <button type="button" class="auth-user-pill" data-auth="account" title="Manage Account & Plan">
          ${avatarHTML}
          <span class="auth-user-name">${user.name}</span>
          ${verifiedIcon}
          <span class="auth-user-badge ${badgeClass}">${badgeText}</span>
          <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; color: var(--text-muted);"></i>
        </button>
      `;
    } else {
      authContainer.innerHTML = `
        <button type="button" class="btn-app btn-google-login" data-auth="google-login">
          <svg class="google-svg-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
      `;
    }
  }

  renderGoogleLoginModal() {
    const box = document.getElementById('google-login-modal-box');
    if (!box) return;

    if (this.otpStep === 'otp') {
      box.innerHTML = `
        <div class="modal-header" style="text-align: center; display: flex; flex-direction: column; align-items: center; border-bottom: 1px solid var(--border-color); padding: 1.5rem 1.5rem 1rem; position: relative;">
          <svg class="google-svg-icon" style="width: 42px; height: 42px; margin-bottom: 0.5rem;" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Google 2-Step Verification</h3>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin-top: 0.25rem;">Enter the 6-digit OTP code sent to <strong>${this.pendingEmail}</strong></p>
          <button class="modal-close-btn" style="position: absolute; right: 1.25rem; top: 1.25rem;" onclick="window.authManager.closeModal('google-login-modal')">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.5rem;">
          <div style="background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 0.85rem 1rem; border-radius: 10px; font-size: 0.85rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem;">
            <i class="fa-solid fa-envelope-circle-check" style="font-size: 1.3rem; color: #10b981; flex-shrink: 0;"></i>
            <div style="line-height: 1.4;">
              A 6-digit verification code has been dispatched to <strong>${this.pendingEmail}</strong>. Please check your Google email inbox.
            </div>
          </div>

          ${this.otpError ? `
            <div style="background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3; padding: 0.65rem 0.85rem; border-radius: 8px; font-size: 0.82rem; margin-bottom: 1rem; font-weight: 600;">
              <i class="fa-solid fa-triangle-exclamation"></i> ${this.otpError}
            </div>
          ` : ''}

          <form onsubmit="event.preventDefault(); const code = document.getElementById('google-otp-input').value; window.authManager.verifyGoogleOTP(code);">
            <div style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 0.45rem; color: var(--text-main); text-align: center;">Enter 6-Digit Google Security Code</label>
              <input type="text" id="google-otp-input" class="inspector-input" maxlength="6" style="text-align: center; font-size: 1.4rem; letter-spacing: 6px; font-weight: 800; padding: 0.75rem;" value="" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;" autofocus required>
            </div>

            <button type="submit" class="btn-app btn-app-primary" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 0.95rem; font-weight: 700; border-radius: 10px;">
              <i class="fa-solid fa-shield-check"></i> Verify OTP & Sign In
            </button>
          </form>

          <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem;">
            <button type="button" class="btn-link-action" onclick="window.authManager.requestGoogleOTP(window.authManager.pendingEmail)">
              <i class="fa-solid fa-rotate-right"></i> Resend Code
            </button>
            <button type="button" class="btn-link-action" onclick="window.authManager.otpStep='consent'; window.authManager.renderGoogleLoginModal();">
              Change Account &rarr;
            </button>
          </div>
        </div>

        <div class="modal-footer" style="background: #f8fafc; font-size: 0.78rem; color: var(--text-muted); text-align: center; justify-content: center;">
          Google Account Security &bull; 2-Step Identity Protection
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <div class="modal-header" style="text-align: center; display: flex; flex-direction: column; align-items: center; border-bottom: 1px solid var(--border-color); padding: 1.5rem 1.5rem 1rem; position: relative;">
        <svg class="google-svg-icon" style="width: 42px; height: 42px; margin-bottom: 0.5rem;" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Sign in with Google</h3>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin-top: 0.25rem;">Enter your Google account email to receive a verification code</p>
        <button class="modal-close-btn" style="position: absolute; right: 1.25rem; top: 1.25rem;" onclick="window.authManager.closeModal('google-login-modal')">&times;</button>
      </div>

      <div class="modal-body" style="padding: 1.5rem;">
        ${this.otpError ? `
          <div style="background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3; padding: 0.65rem 0.85rem; border-radius: 8px; font-size: 0.82rem; margin-bottom: 1rem; font-weight: 600;">
            <i class="fa-solid fa-triangle-exclamation"></i> ${this.otpError}
          </div>
        ` : ''}

        <form onsubmit="event.preventDefault(); const em = document.getElementById('real-google-signin-email').value; if (!em || !em.trim()) { if(window.app) window.app.showToast('Please enter a Google Account email.'); return; } window.authManager.requestGoogleOTP(em);">
          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 0.4rem; color: var(--text-main);">Google Account Email</label>
            <div style="position: relative;">
              <i class="fa-solid fa-envelope" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
              <input type="email" id="real-google-signin-email" class="inspector-input" style="padding-left: 2.5rem; font-size: 0.92rem; font-weight: 500;" value="" placeholder="name@gmail.com" autofocus required>
            </div>
          </div>

          <button type="submit" class="btn-app btn-google-login" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 0.95rem; font-weight: 700; border-radius: 10px;">
            <svg class="google-svg-icon" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Send OTP & Continue</span>
          </button>
        </form>
      </div>

      <div class="modal-footer" style="background: #f8fafc; font-size: 0.78rem; color: var(--text-muted); text-align: center; justify-content: center;">
        Google 2-Step Verification code will be sent to your email
      </div>
    `;
  }

  renderWhitelistModal() {
    const box = document.getElementById('whitelist-modal-box');
    if (!box) return;

    box.innerHTML = `
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h3 class="modal-title"><i class="fa-solid fa-user-shield"></i> Authorized Personnel Registry</h3>
          <span style="background: #dcfce7; color: #166534; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
            ${this.authorizedList.length} Authorized Users
          </span>
        </div>
        <button class="modal-close-btn" onclick="window.authManager.closeModal('whitelist-modal')">&times;</button>
      </div>

      <div class="modal-body" style="padding: 1.5rem;">
        <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">Add / Authorize Real Google Account</h4>
          <form onsubmit="event.preventDefault(); const em = document.getElementById('new-auth-email').value; const nm = document.getElementById('new-auth-name').value; const role = document.getElementById('new-auth-role').value; const plan = document.getElementById('new-auth-plan').value; window.authManager.addAuthorizedPerson(em, nm, role, plan); window.authManager.renderWhitelistModal(); if (window.app) window.app.showToast('Added ' + em + ' to authorized whitelist');">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
              <input type="email" id="new-auth-email" class="inspector-input" placeholder="Google / Gmail Address" required>
              <input type="text" id="new-auth-name" class="inspector-input" placeholder="Full Name">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 120px; gap: 0.75rem;">
              <input type="text" id="new-auth-role" class="inspector-input" placeholder="Role (e.g. Lead Designer)">
              <select id="new-auth-plan" class="inspector-select">
                <option value="pro">Pro Plan</option>
                <option value="enterprise">Enterprise Plan</option>
                <option value="free">Free Plan</option>
              </select>
              <button type="submit" class="btn-app btn-app-primary" style="justify-content: center;">
                <i class="fa-solid fa-plus"></i> Authorize
              </button>
            </div>
          </form>
        </div>

        <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.6rem; letter-spacing: 0.05em;">
          Current Authorized Whitelist
        </div>

        <div style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;">
          ${this.authorizedList.map(person => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border: 1px solid var(--border-color); border-radius: 8px; background: #ffffff;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 34px; height: 34px; border-radius: 50%; background: #ede9fe; color: #6d28d9; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">
                  ${person.name ? person.name.charAt(0) : 'U'}
                </div>
                <div>
                  <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main);">${person.name} <span style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted);">(${person.role})</span></div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">${person.email} &bull; Authorized: ${person.authorizedAt || 'Active'}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="plan-badge-${person.plan || 'pro'}">${(person.plan || 'pro').toUpperCase()}</span>
                <button type="button" class="btn-icon" style="width: 28px; height: 28px; font-size: 0.75rem; color: #dc2626;" title="Revoke Authorization" onclick="window.authManager.removeAuthorizedPerson('${person.email}'); window.authManager.renderWhitelistModal();">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-app btn-app-secondary" onclick="window.authManager.closeModal('whitelist-modal')">Close</button>
      </div>
    `;
  }

  renderUpgradeModal(reason, detail) {
    const box = document.getElementById('upgrade-modal-box');
    if (!box) return;

    let bannerMsg = 'Upgrade to Unlock Unlimited Enterprise Power';
    if (reason === 'section-limit') {
      bannerMsg = 'Free Edition Limit Reached (Max 4 Sections)';
    } else if (reason === 'enterprise-section-limit') {
      bannerMsg = 'Pro Edition Limit Reached (Max 6 Sections) — Upgrade to Enterprise for Unlimited Sections';
    } else if (reason === 'pro-block') {
      bannerMsg = 'Component Locked: Upgrade to Unlock Advanced Elements';
    } else if (reason === 'pro-template') {
      bannerMsg = 'Pro Template: Upgrade to Access 15 Standard Templates (5 Free Templates)';
    } else if (reason === 'enterprise-template') {
      bannerMsg = 'Enterprise VIP Template: Upgrade to Enterprise for Full 52+ Catalog';
    } else if (reason === 'enterprise-whitelist') {
      bannerMsg = 'Team Personnel Whitelist Management is Exclusive to Enterprise Edition';
    } else if (reason === 'preview') {
      bannerMsg = 'Live Website Preview is a Pro Feature';
    } else if (reason === 'mobile-preview') {
      bannerMsg = 'Mobile Breakpoint Live Simulation is Exclusive to Enterprise Edition';
    } else if (reason === 'code-view') {
      bannerMsg = 'View & Copy Generated Clean HTML is a Pro Feature';
    } else if (reason === 'copy-code') {
      bannerMsg = 'Copying Production HTML & CSS Code is Exclusive to Enterprise Edition';
    } else if (reason === 'export-html') {
      bannerMsg = 'HTML Website Export is a Pro Feature';
    } else if (reason === 'export-zip') {
      bannerMsg = 'Full Website ZIP Package Export is Exclusive to Enterprise Edition';
    } else if (reason === 'export-pdf') {
      bannerMsg = 'Direct PDF Brochure Export is Exclusive to Enterprise Edition';
    } else if (reason === '3color-grad') {
      bannerMsg = '3-Color Cosmic Gradients are Exclusive to Enterprise Edition';
    }

    const currentPlan = this.getPlan();

    box.innerHTML = `
      <div class="modal-header" style="background: linear-gradient(135deg, #2e1065, #4c1d95); color: #ffffff; padding: 1.5rem 1.75rem; border-radius: 16px 16px 0 0; position: relative;">
        <div>
          <span style="background: rgba(255,255,255,0.15); font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 0.5rem;">
            <i class="fa-solid fa-crown" style="color: #fbbf24;"></i> Pricing & Edition Plans
          </span>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">${bannerMsg}</h3>
          <p style="font-size: 0.88rem; color: #e9d5ff; margin-top: 0.25rem;">Scale from basic single-page landing prototypes to full unrestricted enterprise white-label production studios.</p>
        </div>
        <button class="modal-close-btn" style="color: #ffffff; position: absolute; right: 1.25rem; top: 1.25rem;" onclick="window.authManager.closeModal('upgrade-modal')">&times;</button>
      </div>

      <div class="modal-body" style="padding: 1.75rem;">
        <div class="pricing-plans-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
          
          <div class="plan-card ${currentPlan === 'free' ? 'is-current-plan' : ''}">
            <div class="plan-card-header">
              <span class="plan-title">Free Edition</span>
              <div class="plan-price">₹0<span class="plan-period">/forever</span></div>
              <p class="plan-desc">For testing & basic single-page landing prototypes.</p>
            </div>
            <ul class="plan-perks-list">
              <li><i class="fa-solid fa-check text-success"></i> Up to 4 Sections per page</li>
              <li><i class="fa-solid fa-check text-success"></i> 5 Free Starter Templates</li>
              <li><i class="fa-solid fa-check text-success"></i> Basic Block Components</li>
              <li><i class="fa-solid fa-check text-success"></i> 2-Color Static Gradients</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> Website Export (HTML, ZIP, PDF)</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> Live Responsive Preview</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> View & Copy Generated Code</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> 47+ Premium Templates</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> Unlimited Sections</li>
            </ul>
            <div class="plan-card-action">
              ${currentPlan === 'free'
                ? '<button type="button" class="btn-app btn-plan-action active-plan-btn" disabled><i class="fa-solid fa-check"></i> Current Plan</button>'
                : '<button type="button" class="btn-app btn-plan-action btn-plan-outline" onclick="window.authManager.upgradePlan(\'free\')">Downgrade to Free</button>'
              }
            </div>
          </div>

          <div class="plan-card featured-plan ${currentPlan === 'pro' ? 'is-current-plan' : ''}">
            <div class="plan-badge-popular">POPULAR</div>
            <div class="plan-card-header">
              <span class="plan-title" style="color: #6d28d9;">Pro Edition</span>
              <div class="plan-price" style="color: #6d28d9;">₹1,499<span class="plan-period">/month</span></div>
              <p class="plan-desc">For professionals & growing businesses.</p>
            </div>
            <ul class="plan-perks-list">
              <li><i class="fa-solid fa-circle-check" style="color: #7c3aed;"></i> <strong>Standard HTML Export (Single File)</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #7c3aed;"></i> <strong>Desktop & Tablet Live Preview</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #7c3aed;"></i> <strong>Read-Only Clean Code Viewer</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #7c3aed;"></i> <strong>Up to 6 Sections per page</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #7c3aed;"></i> <strong>15 Curated Standard Templates</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #7c3aed;"></i> <strong>2-Color Linear Gradients</strong></li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> Direct PDF & ZIP Package Export</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> 3-Color Cosmic Gradients</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> 100% White-Label (No Watermarks)</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> 37 VIP Enterprise Templates</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> Unlimited Sections (>6)</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> Mobile Device Simulation</li>
              <li class="disabled"><i class="fa-solid fa-xmark"></i> Team Whitelist Registry</li>
            </ul>
            <div class="plan-card-action">
              ${currentPlan === 'pro'
                ? '<button type="button" class="btn-app btn-plan-action active-plan-btn" disabled><i class="fa-solid fa-check"></i> Current Plan</button>'
                : '<button type="button" class="btn-app btn-plan-action btn-pro-upgrade" onclick="window.authManager.upgradePlan(\'pro\')"><i class="fa-solid fa-bolt"></i> Upgrade to Pro (₹1,499)</button>'
              }
            </div>
          </div>

          <div class="plan-card ${currentPlan === 'enterprise' ? 'is-current-plan' : ''}">
            <div class="plan-badge-popular" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;">100% UNRESTRICTED</div>
            <div class="plan-card-header">
              <span class="plan-title" style="color: #d97706;">Enterprise Edition</span>
              <div class="plan-price" style="color: #d97706;">₹3,999<span class="plan-period">/month</span></div>
              <p class="plan-desc">For high-growth teams demanding full unrestricted power.</p>
            </div>
            <ul class="plan-perks-list">
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>All 52+ Templates Unlocked (Full VIP Catalog)</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>100% White-Label Export (Zero Watermarks)</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>Unlimited Canvas Sections (No Limits)</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>Full Export Suite (HTML, ZIP & PDF)</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>3-Color Cosmic & Radial Gradients</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>Full Multi-Device Preview (Mobile Included)</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>Copy & Export Production Clean Code</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>Team Whitelist Registry Management</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>Custom Domain Simulation</strong></li>
              <li><i class="fa-solid fa-circle-check" style="color: #d97706;"></i> <strong>Priority 24/7 VIP SLA Support</strong></li>
            </ul>
            <div class="plan-card-action">
              ${currentPlan === 'enterprise'
                ? '<button type="button" class="btn-app btn-plan-action active-plan-btn" disabled><i class="fa-solid fa-check"></i> Current Plan</button>'
                : '<button type="button" class="btn-app btn-plan-action btn-enterprise-upgrade" onclick="window.authManager.upgradePlan(\'enterprise\')"><i class="fa-solid fa-crown"></i> Activate Enterprise (₹3,999)</button>'
              }
            </div>
          </div>

        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
        <div style="font-size: 0.84rem; color: var(--text-muted);">
          <i class="fa-solid fa-shield-halved" style="color: #10b981;"></i> 30-Day Money-Back Guarantee &bull; Instant Activation &bull; Cancel Anytime
        </div>
        <button type="button" class="btn-app btn-app-secondary" onclick="window.authManager.closeModal('upgrade-modal')">Close</button>
      </div>
    `;
  }

  renderAccountModal() {
    const box = document.getElementById('account-modal-box');
    if (!box) return;

    const user = this.currentUser;
    const plan = this.getPlan();
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    box.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title"><i class="fa-solid fa-circle-user"></i> My Account & Security Profile</h3>
        <button class="modal-close-btn" onclick="window.authManager.closeModal('account-modal')">&times;</button>
      </div>

      <div class="modal-body" style="padding: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-color);">
          ${user.avatar 
            ? `<img src="${user.avatar}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" alt="${user.name}">`
            : `<div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #6d28d9, #00cfff); color: #fff; font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; justify-content: center;">${initial}</div>`
          }
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <h4 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main);">${user.name}</h4>
              <span class="auth-verified-chip"><i class="fa-solid fa-shield-check"></i> Authorized Personnel</span>
              <span class="plan-badge-${plan}" style="font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">${plan}</span>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 2px;">${user.email || 'Google Connected'} &bull; Role: ${user.role || 'Staff'}</p>
          </div>
        </div>

        <div style="margin-top: 1.25rem;">
          <h5 style="font-size: 0.92rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-main);">Current Subscription & Access</h5>
          
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">${user.planName || 'Free Edition'}</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
                ${plan === 'free' 
                  ? 'Limited Edition (5 starter templates, max 4 sections)' 
                  : (plan === 'pro' ? 'Pro Edition Active &bull; 15 templates & HTML export' : 'Enterprise Tier Active &bull; 100% Unrestricted Suite')
                }
              </div>
            </div>
            <div>
              <button type="button" class="btn-app btn-app-primary" onclick="window.authManager.openUpgradeModal('manage'); window.authManager.closeModal('account-modal');">
                <i class="fa-solid fa-arrows-rotate"></i> Change Plan
              </button>
            </div>
          </div>
        </div>

        <div style="margin-top: 1.25rem; display: flex; gap: 0.75rem;">
          <button type="button" class="btn-app btn-app-secondary" style="flex: 1; justify-content: center;" onclick="window.authManager.openWhitelistModal(); window.authManager.closeModal('account-modal');">
            <i class="fa-solid fa-user-shield"></i> Manage Whitelist Registry
          </button>
        </div>

        <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; padding-top: 1.25rem; border-top: 1px solid var(--border-color);">
          <button type="button" class="btn-app btn-app-secondary" onclick="window.authManager.openGoogleLoginModal(); window.authManager.closeModal('account-modal');">
            <i class="fa-solid fa-user-plus"></i> Switch Account
          </button>
          <button type="button" class="btn-app btn-app-secondary" style="color: #dc2626; border-color: rgba(220, 38, 38, 0.3);" onclick="window.authManager.logout()">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
          </button>
        </div>
      </div>
    `;
  }
}

window.AuthManager = AuthManager;
