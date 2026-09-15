function isColorDark(hex) {
  if (!hex) return true;
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substr(0, 2), 16) || 0;
  const g = parseInt(hex.substr(2, 2), 16) || 0;
  const b = parseInt(hex.substr(4, 2), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.65;
}

class CanvasEditor {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.sections = [];
    this.selectedSectionIndex = null;
    this.dropIndicator = null;
    this.currentDropIndex = null;
    
    this.initSortable();
    this.initDragDropZones();
    this.initGlobalMobileNavListener();
  }

  initGlobalMobileNavListener() {
    if (!this.canvas) return;
    this.canvas.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.wb-nav-toggle');
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        const navContainer = toggleBtn.closest('.wb-nav-inner') || toggleBtn.closest('.wb-navbar') || toggleBtn.parentElement;
        if (navContainer) {
          const collapse = navContainer.querySelector('.wb-nav-collapse');
          if (collapse) {
            collapse.classList.toggle('is-open');
          }
        }
        return;
      }
      const navLink = e.target.closest('.wb-nav-links a');
      if (navLink) {
        const collapse = navLink.closest('.wb-nav-collapse');
        if (collapse && collapse.classList.contains('is-open')) {
          collapse.classList.remove('is-open');
        }
      }
    });
  }

  initSortable() {
    if (typeof Sortable !== 'undefined' && this.canvas) {
      if (this.sortableInstance) {
        this.sortableInstance.destroy();
      }
      this.sortableInstance = new Sortable(this.canvas, {
        animation: 180,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        filter: '.canvas-drop-indicator',
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined && evt.oldIndex !== evt.newIndex) {
            const item = this.sections.splice(evt.oldIndex, 1)[0];
            this.sections.splice(evt.newIndex, 0, item);
            this.selectedSectionIndex = evt.newIndex;
            this.syncNavLinksWithSections();
            this.render();
            if (window.app) {
              window.app.saveState();
              window.app.updateInspector(this.sections[this.selectedSectionIndex]);
            }
          }
        }
      });
    }
  }

  initDragDropZones() {
    if (!this.canvas) return;

    const canvasFrame = document.getElementById('canvas-frame') || this.canvas;
    const canvasContainer = document.querySelector('.app-canvas-container') || this.canvas;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      canvasFrame.classList.add('drag-over');

      if (window.currentDraggingElementKey) {
        return;
      }

      const wrappers = Array.from(this.canvas.querySelectorAll('.canvas-section-wrapper'));
      if (wrappers.length === 0) {
        this.currentDropIndex = 0;
        this.showDropIndicator(null, true);
        return;
      }

      let targetIdx = wrappers.length;
      let targetWrapper = wrappers[wrappers.length - 1];
      let insertBefore = false;

      for (let i = 0; i < wrappers.length; i++) {
        const rect = wrappers[i].getBoundingClientRect();
        const midY = rect.top + (rect.height / 2);

        if (e.clientY < midY) {
          targetIdx = i;
          targetWrapper = wrappers[i];
          insertBefore = true;
          break;
        } else if (e.clientY <= rect.bottom) {
          targetIdx = i + 1;
          targetWrapper = wrappers[i];
          insertBefore = false;
          break;
        }
      }

      this.currentDropIndex = targetIdx;
      this.showDropIndicator(targetWrapper, insertBefore);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.relatedTarget && (canvasFrame.contains(e.relatedTarget) || canvasContainer.contains(e.relatedTarget))) {
        return;
      }
      canvasFrame.classList.remove('drag-over');
      this.removeDropIndicator();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvasFrame.classList.remove('drag-over');

      const elemKey = e.dataTransfer.getData('application/x-elem-key') || window.currentDraggingElementKey;
      if (elemKey && window.BUILDER_ELEMENTS && window.BUILDER_ELEMENTS[elemKey]) {
        this.removeDropIndicator();
        this.currentDropIndex = null;
        window.currentDraggingElementKey = null;
        
        let targetWrapper = e.target.closest('.canvas-section-wrapper');
        let secIdx = targetWrapper ? parseInt(targetWrapper.dataset.index, 10) : this.selectedSectionIndex;
        if (isNaN(secIdx) || secIdx === null || secIdx < 0) secIdx = (this.sections.length > 0 ? 0 : null);
        
        this.addElement(elemKey, secIdx, e.target);
        return;
      }

      const blockKey = e.dataTransfer.getData('application/x-block-key') ||
                       e.dataTransfer.getData('text/plain') ||
                       window.currentDraggingBlockKey;

      const insertIdx = (this.currentDropIndex !== null && this.currentDropIndex !== undefined)
        ? this.currentDropIndex
        : this.sections.length;

      this.removeDropIndicator();
      this.currentDropIndex = null;
      window.currentDraggingBlockKey = null;

      if (blockKey && window.BUILDER_BLOCKS && window.BUILDER_BLOCKS[blockKey]) {
        this.insertBlockAt(blockKey, insertIdx);
      }
    };

    canvasContainer.addEventListener('dragover', handleDragOver);
    canvasContainer.addEventListener('dragleave', handleDragLeave);
    canvasContainer.addEventListener('drop', handleDrop);
  }

  showDropIndicator(targetWrapper, insertBefore) {
    if (!this.dropIndicator) {
      this.dropIndicator = document.createElement('div');
      this.dropIndicator.className = 'canvas-drop-indicator';
    }

    if (!targetWrapper) {
      this.canvas.appendChild(this.dropIndicator);
    } else if (insertBefore) {
      if (this.dropIndicator.nextSibling !== targetWrapper) {
        targetWrapper.parentNode.insertBefore(this.dropIndicator, targetWrapper);
      }
    } else {
      if (this.dropIndicator.previousSibling !== targetWrapper) {
        targetWrapper.parentNode.insertBefore(this.dropIndicator, targetWrapper.nextSibling);
      }
    }
  }

  removeDropIndicator() {
    if (this.dropIndicator && this.dropIndicator.parentNode) {
      this.dropIndicator.parentNode.removeChild(this.dropIndicator);
    }
  }

  insertBlockAt(blockKey, targetIndex = null) {
    if (!window.BUILDER_BLOCKS) return;
    const blockDef = window.BUILDER_BLOCKS[blockKey];
    if (!blockDef) return;

    if (window.authManager && !window.authManager.canAddSection(this.sections.length)) {
      window.authManager.openUpgradeModal('section-limit');
      return;
    }

    const sectionObj = {
      id: 'sec_' + Math.random().toString(36).substr(2, 9),
      blockId: blockKey,
      html: blockDef.html,
      bgType: 'default',
      bg: '',
      gradient: {
        color1: '#6d28d9',
        color2: '#00cfff',
        angle: '135deg'
      },
      padding: ''
    };

    if (targetIndex === null || targetIndex === undefined || targetIndex >= this.sections.length) {
      this.sections.push(sectionObj);
      this.selectedSectionIndex = this.sections.length - 1;
    } else {
      const idx = Math.max(0, Math.min(targetIndex, this.sections.length));
      this.sections.splice(idx, 0, sectionObj);
      this.selectedSectionIndex = idx;
    }

    this.syncNavLinksWithSections();
    this.render();
    if (window.app) {
      window.app.saveState();
      window.app.showToast('Added ' + blockDef.name);
      window.app.updateInspector(this.sections[this.selectedSectionIndex]);
    }
  }

  addBlock(blockKey, index = null) {
    if (index === null || index === undefined) {
      this.insertBlockAt(blockKey, this.sections.length);
    } else {
      this.insertBlockAt(blockKey, index + 1);
    }
  }

  addElement(elementKey, sectionIndex = null, dropTarget = null) {
    if (!window.BUILDER_ELEMENTS) return;
    const elemDef = window.BUILDER_ELEMENTS[elementKey];
    if (!elemDef) return;

    if (window.authManager && !window.authManager.canUseElement(elementKey)) {
      const plan = window.authManager.getPlan();
      if (elemDef.tier === 'enterprise' && plan === 'pro') {
        window.authManager.openUpgradeModal('enterprise-component', elemDef.name);
      } else {
        window.authManager.openUpgradeModal('pro-component', elemDef.name);
      }
      return;
    }

    if (this.sections.length === 0) {
      this.insertBlockAt('hero-split', 0);
      sectionIndex = 0;
    }

    let targetIdx = (sectionIndex !== null && sectionIndex !== undefined && this.sections[sectionIndex])
      ? sectionIndex
      : (this.selectedSectionIndex !== null && this.sections[this.selectedSectionIndex] ? this.selectedSectionIndex : 0);

    const sec = this.sections[targetIdx];
    const wrapper = this.canvas.children[targetIdx];
    if (!wrapper || !sec) return;

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = elemDef.html.trim();
    const newElement = tempContainer.firstElementChild;

    let targetContainer = null;

    if (dropTarget && wrapper.contains(dropTarget) && dropTarget !== wrapper) {
      if (dropTarget.closest('form')) {
        targetContainer = dropTarget.closest('form');
      } else if (dropTarget.closest('.wb-hero-actions')) {
        targetContainer = dropTarget.closest('.wb-hero-actions');
      } else if (dropTarget.closest('.wb-grid-2, .wb-grid-3, .wb-grid-4')) {
        targetContainer = dropTarget.closest('.wb-grid-2, .wb-grid-3, .wb-grid-4');
      } else if (dropTarget.closest('.wb-card')) {
        targetContainer = dropTarget.closest('.wb-card');
      } else if (dropTarget.closest('.wb-container')) {
        targetContainer = dropTarget.closest('.wb-container');
      }
    }

    if (!targetContainer) {
      if (elemDef.category === 'Buttons & Links') {
        targetContainer = wrapper.querySelector('.wb-hero-actions') ||
                          wrapper.querySelector('.wb-nav-cta') ||
                          wrapper.querySelector('form') ||
                          wrapper.querySelector('.wb-card') ||
                          wrapper.querySelector('.wb-container');
      } else if (elemDef.category === 'Form Inputs & Fields') {
        targetContainer = wrapper.querySelector('form') ||
                          wrapper.querySelector('.wb-card') ||
                          wrapper.querySelector('.wb-container');
      } else if (elemDef.category === 'Cards & Components') {
        targetContainer = wrapper.querySelector('.wb-grid-2, .wb-grid-3, .wb-grid-4') ||
                          wrapper.querySelector('.wb-container');
      } else {
        targetContainer = wrapper.querySelector('.wb-header-center') ||
                          wrapper.querySelector('.wb-card') ||
                          wrapper.querySelector('.wb-container');
      }
    }

    if (!targetContainer) {
      targetContainer = wrapper.querySelector('.wb-container') || wrapper.querySelector('.section-content');
    }

    if (targetContainer && newElement) {
      targetContainer.appendChild(newElement);
      sec.html = wrapper.querySelector('.section-content').innerHTML;
      this.attachElementControls(wrapper, sec);
      
      if (window.app) {
        window.app.saveState();
        window.app.showToast('Added ' + elemDef.name);
      }
    }
  }

  attachElementControls(wrapper, sec) {
    if (!wrapper || !sec) return;

    const contentArea = wrapper.querySelector('.section-content');
    if (!contentArea) return;

    const selectors = [
      '.wb-btn',
      '.wb-form-group',
      '.wb-feature-icon',
      '.wb-badge',
      '.wb-card',
      '.wb-stat-box',
      '.wb-pricing-card',
      '.wb-team-card',
      '.wb-testimonial-card',
      '.wb-faq-item',
      '.wb-pricing-features li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img', 'hr',
      'input', 'textarea', 'select'
    ];

    const elements = contentArea.querySelectorAll(selectors.join(', '));

    elements.forEach(el => {
      if (el.closest('.section-toolbar') || el.closest('.wb-elem-toolbar') || el.classList.contains('wb-nav-toggle')) return;

      el.classList.add('wb-deletable-elem');
      if (!el.getAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }

      let toolbar = el.querySelector(':scope > .wb-elem-toolbar');
      if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.className = 'wb-elem-toolbar';
        
        const hasIcon = !!el.querySelector('i[class*="fa-"]') || el.tagName === 'I';
        const changeIconBtn = hasIcon ? `<button type="button" class="wb-elem-tool-btn change-icon" title="Change Icon"><i class="fa-solid fa-icons"></i></button>` : '';

        toolbar.innerHTML = `
          ${changeIconBtn}
          <button type="button" class="wb-elem-tool-btn move-up" title="Move element before"><i class="fa-solid fa-chevron-up"></i></button>
          <button type="button" class="wb-elem-tool-btn move-down" title="Move element after"><i class="fa-solid fa-chevron-down"></i></button>
          <button type="button" class="wb-elem-tool-btn delete danger" title="Delete element"><i class="fa-solid fa-trash-can"></i></button>
        `;

        const iconBtn = toolbar.querySelector('.change-icon');
        const upBtn = toolbar.querySelector('.move-up');
        const downBtn = toolbar.querySelector('.move-down');
        const delBtn = toolbar.querySelector('.delete');

        if (iconBtn) {
          iconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const iconEl = el.tagName === 'I' ? el : el.querySelector('i[class*="fa-"]');
            if (iconEl && window.app) {
              window.app.openIconPicker((newIconClass) => {
                const currentClasses = Array.from(iconEl.classList);
                currentClasses.forEach(c => {
                  if (c.startsWith('fa-') || c === 'fa-solid' || c === 'fa-regular' || c === 'fa-brands') {
                    iconEl.classList.remove(c);
                  }
                });
                newIconClass.split(' ').forEach(c => {
                  if (c) iconEl.classList.add(c);
                });
                sec.html = contentArea.innerHTML;
                window.app.saveState();
                window.app.showToast('Updated icon');
              });
            }
          });
        }

        upBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const prev = el.previousElementSibling;
          if (prev && !prev.classList.contains('section-toolbar') && !prev.classList.contains('canvas-drop-indicator')) {
            el.parentNode.insertBefore(el, prev);
            sec.html = contentArea.innerHTML;
            if (window.app) {
              window.app.saveState();
              window.app.showToast('Moved element up');
            }
          }
        });

        downBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const next = el.nextElementSibling;
          if (next && !next.classList.contains('section-toolbar') && !next.classList.contains('canvas-drop-indicator')) {
            el.parentNode.insertBefore(next, el);
            sec.html = contentArea.innerHTML;
            if (window.app) {
              window.app.saveState();
              window.app.showToast('Moved element down');
            }
          }
        });

        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          el.remove();
          sec.html = contentArea.innerHTML;
          this.syncNavLinksWithSections();
          if (window.app) {
            window.app.saveState();
            window.app.showToast('Element removed');
          }
        });

        el.addEventListener('focus', () => {
          contentArea.querySelectorAll('.wb-deletable-elem.is-focused').forEach(other => {
            if (other !== el) other.classList.remove('is-focused');
          });
          el.classList.add('is-focused');
        });

        el.addEventListener('blur', (e) => {
          if (!el.contains(e.relatedTarget)) {
            el.classList.remove('is-focused');
          }
        });

        el.appendChild(toolbar);
      }
    });
  }

  removeSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    this.sections.splice(index, 1);
    
    if (this.selectedSectionIndex === index) {
      this.selectedSectionIndex = this.sections.length > 0 ? Math.max(0, index - 1) : null;
    } else if (this.selectedSectionIndex > index) {
      this.selectedSectionIndex--;
    }

    this.syncNavLinksWithSections();
    this.render();
    if (window.app) {
      window.app.saveState();
      window.app.showToast('Removed section');
      if (this.selectedSectionIndex !== null && this.sections[this.selectedSectionIndex]) {
        window.app.updateInspector(this.sections[this.selectedSectionIndex]);
      } else {
        window.app.updateInspector(null);
      }
    }
  }

  duplicateSection(index) {
    if (index < 0 || index >= this.sections.length) return;

    if (window.authManager && !window.authManager.canAddSection(this.sections.length)) {
      window.authManager.openUpgradeModal('section-limit');
      return;
    }

    const original = this.sections[index];
    const currentWrapper = this.canvas.children[index];
    const liveContent = currentWrapper ? currentWrapper.querySelector('.section-content').innerHTML : original.html;

    const copy = {
      id: 'sec_' + Math.random().toString(36).substr(2, 9),
      blockId: original.blockId,
      html: liveContent,
      bgType: original.bgType || 'default',
      bg: original.bg || '',
      gradient: original.gradient ? { ...original.gradient } : { color1: '#6d28d9', color2: '#00cfff', angle: '135deg' },
      padding: original.padding || ''
    };

    this.sections.splice(index + 1, 0, copy);
    this.selectedSectionIndex = index + 1;
    this.render();
    if (window.app) {
      window.app.saveState();
      window.app.showToast('Duplicated section');
      window.app.updateInspector(this.sections[this.selectedSectionIndex]);
    }
  }

  moveSection(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.sections.length) return;

    const temp = this.sections[index];
    this.sections[index] = this.sections[newIndex];
    this.sections[newIndex] = temp;
    this.selectedSectionIndex = newIndex;

    this.syncNavLinksWithSections();
    this.render();
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(this.sections[this.selectedSectionIndex]);
    }
  }

  selectSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    this.selectedSectionIndex = index;
    const wrappers = this.canvas.querySelectorAll('.canvas-section-wrapper');
    wrappers.forEach((w, i) => {
      w.classList.toggle('selected', i === index);
    });

    if (window.app && this.sections[index]) {
      window.app.updateInspector(this.sections[index]);
    }
  }

  getSelectedSection() {
    if (this.selectedSectionIndex === null || !this.sections[this.selectedSectionIndex]) {
      if (this.sections.length > 0) {
        this.selectSection(0);
        return this.sections[0];
      }
      return null;
    }
    return this.sections[this.selectedSectionIndex];
  }

  setBackgroundMode(mode) {
    const sec = this.getSelectedSection();
    if (!sec) return;

    sec.bgType = mode;

    if (mode === 'default') {
      sec.bg = '';
    } else if (mode === 'color') {
      if (!sec.bg || sec.bg.includes('gradient')) {
        sec.bg = '#ffffff';
      }
    } else if (mode === 'gradient') {
      if (!sec.gradient) {
        sec.gradient = { color1: '#6d28d9', color2: '#00cfff', angle: '135deg' };
      }
    }

    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(sec);
    }
  }

  setSolidColor(color) {
    const sec = this.getSelectedSection();
    if (!sec) return;

    sec.bgType = 'color';
    sec.bg = color;
    
    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(sec);
    }
  }

  setGradientStopsCount(count) {
    const sec = this.getSelectedSection();
    if (!sec) return;

    if (count === 3 && window.authManager && !window.authManager.canUse3ColorGradient()) {
      window.authManager.openUpgradeModal('3color-grad');
      return;
    }

    if (!sec.gradient) {
      sec.gradient = { color1: '#6d28d9', color2: '#00cfff', color3: '', angle: '135deg' };
    }

    if (count === 3) {
      if (!sec.gradient.color3) sec.gradient.color3 = '#ec4899';
    } else {
      sec.gradient.color3 = '';
    }

    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(sec);
      window.app.showToast(`Switched to ${count}-color gradient`);
    }
  }

  setGradient(color1, color2, angle, color3 = undefined) {
    const sec = this.getSelectedSection();
    if (!sec) return;

    sec.bgType = 'gradient';
    if (!sec.gradient) sec.gradient = {};
    if (color1 !== undefined && color1 !== null) sec.gradient.color1 = color1;
    if (color2 !== undefined && color2 !== null) sec.gradient.color2 = color2;
    if (color3 !== undefined) sec.gradient.color3 = color3;
    if (angle) sec.gradient.angle = angle;

    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(sec);
    }
  }

  setGradientPreset(color1, color2, angle = '135deg', color3 = '') {
    this.setGradient(color1, color2, angle, color3);
    if (window.app) {
      window.app.showToast('Applied gradient preset');
    }
  }

  resetSelectedSectionBackground() {
    const sec = this.getSelectedSection();
    if (!sec) return;

    sec.bgType = 'default';
    sec.bg = '';
    sec.gradient = { color1: '#6d28d9', color2: '#00cfff', color3: '', angle: '135deg' };

    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(sec);
      window.app.showToast('Reset background to default');
    }
  }

  autoArrangeSections() {
    if (!this.sections || this.sections.length <= 1) {
      if (window.app) window.app.showToast('Sections already arranged');
      return;
    }

    const priorityMap = {
      'navigation': 1,
      'hero': 2,
      'about': 3,
      'features': 4,
      'services': 4,
      'stats': 5,
      'testimonials': 6,
      'pricing': 7,
      'team': 8,
      'faq': 9,
      'cta': 10,
      'contact': 11,
      'footer': 12
    };

    const getSectionCategory = (sec) => {
      const blockDef = window.BUILDER_BLOCKS ? window.BUILDER_BLOCKS[sec.blockId] : null;
      const bId = (sec.blockId || '').toLowerCase();
      const bCat = (blockDef ? blockDef.category : '').toLowerCase();

      if (bId.includes('nav') || bCat.includes('navigation')) return 'navigation';
      if (bId.includes('hero') || bCat.includes('hero')) return 'hero';
      if (bId.includes('about') || bCat.includes('about')) return 'about';
      if (bId.includes('feature') || bCat.includes('feature') || bId.includes('service') || bCat.includes('service')) return 'features';
      if (bId.includes('stat') || bCat.includes('stat')) return 'stats';
      if (bId.includes('testimonial') || bCat.includes('testimonial') || bId.includes('review')) return 'testimonials';
      if (bId.includes('pricing') || bCat.includes('pricing')) return 'pricing';
      if (bId.includes('team') || bCat.includes('team') || bId.includes('leadership')) return 'team';
      if (bId.includes('faq') || bCat.includes('faq')) return 'faq';
      if (bId.includes('cta') || bCat.includes('call to action') || bId.includes('banner')) return 'cta';
      if (bId.includes('contact') || bCat.includes('contact') || bId.includes('form')) return 'contact';
      if (bId.includes('footer') || bCat.includes('footer')) return 'footer';
      return 'other';
    };

    const indexed = this.sections.map((sec, originalIdx) => ({
      sec,
      originalIdx,
      weight: priorityMap[getSectionCategory(sec)] || 50
    }));

    indexed.sort((a, b) => {
      if (a.weight !== b.weight) {
        return a.weight - b.weight;
      }
      return a.originalIdx - b.originalIdx;
    });

    const currentlySelectedSec = this.selectedSectionIndex !== null ? this.sections[this.selectedSectionIndex] : null;

    this.sections = indexed.map(item => item.sec);

    if (currentlySelectedSec) {
      const newIdx = this.sections.indexOf(currentlySelectedSec);
      this.selectedSectionIndex = newIdx !== -1 ? newIdx : 0;
    }

    this.syncNavLinksWithSections();
    this.render();

    if (window.app) {
      window.app.saveState();
      window.app.showToast('Auto-arranged website flow & synced menus');
      if (this.selectedSectionIndex !== null && this.sections[this.selectedSectionIndex]) {
        window.app.updateInspector(this.sections[this.selectedSectionIndex]);
      }
    }
  }

  syncNavLinksWithSections() {
    const presentSections = [];
    const sectionNameMap = {
      'about': 'About Us',
      'features': 'Services',
      'services': 'Services',
      'stats': 'Metrics',
      'testimonials': 'Clients',
      'pricing': 'Pricing',
      'team': 'Our Team',
      'faq': 'FAQ',
      'contact': 'Contact'
    };

    this.sections.forEach(sec => {
      const temp = document.createElement('div');
      temp.innerHTML = sec.html;
      const idEl = temp.querySelector('[id]');
      let foundId = idEl ? idEl.id.trim() : '';

      if (!foundId && sec.blockId) {
        if (sec.blockId.includes('about')) foundId = 'about';
        else if (sec.blockId.includes('feature') || sec.blockId.includes('service')) foundId = 'services';
        else if (sec.blockId.includes('pricing')) foundId = 'pricing';
        else if (sec.blockId.includes('testimonial')) foundId = 'testimonials';
        else if (sec.blockId.includes('team')) foundId = 'team';
        else if (sec.blockId.includes('faq')) foundId = 'faq';
        else if (sec.blockId.includes('contact')) foundId = 'contact';
      }

      if (foundId && foundId !== 'hero' && !foundId.includes('nav') && !foundId.includes('footer')) {
        const titleEl = temp.querySelector('.wb-title, h1, h2, h3, .wb-badge span');
        let label = titleEl ? titleEl.textContent.trim().split(/\s+/).slice(0, 2).join(' ') : '';
        if (!label || label.length > 18) {
          label = sectionNameMap[foundId] || (foundId.charAt(0).toUpperCase() + foundId.slice(1));
        }
        if (!presentSections.find(s => s.id === foundId)) {
          presentSections.push({ id: foundId, label });
        }
      }
    });

    this.sections.forEach(sec => {
      const isNav = sec.blockId && (sec.blockId.includes('nav') || sec.html.includes('wb-navbar') || sec.html.includes('wb-nav-links'));
      if (isNav) {
        const temp = document.createElement('div');
        temp.innerHTML = sec.html;
        const navList = temp.querySelector('.wb-nav-links');
        if (navList) {
          const validIds = new Set(presentSections.map(s => s.id));
          navList.querySelectorAll('a[href^="#"]').forEach(a => {
            const h = a.getAttribute('href').replace('#', '').trim();
            if (h && !validIds.has(h)) {
              const li = a.closest('li');
              if (li) li.remove();
              else a.remove();
            }
          });
          sec.html = temp.innerHTML;
        }
      }
    });
  }

  setTextColor(color) {
    const sec = this.getSelectedSection();
    if (!sec) return;

    sec.textColor = color;
    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(sec);
      window.app.showToast('Updated text color');
    }
  }

  resetSelectedSectionTextColor() {
    const sec = this.getSelectedSection();
    if (!sec) return;

    sec.textColor = '';
    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(sec);
      window.app.showToast('Reset text color to default');
    }
  }

  resetSelectedSectionPadding() {
    const sec = this.getSelectedSection();
    if (!sec) return;

    sec.padding = '';
    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(sec);
      window.app.showToast('Reset padding to default');
    }
  }

  resetSelectedSectionStyle() {
    const sec = this.getSelectedSection();
    if (!sec) return;

    sec.bgType = 'default';
    sec.bg = '';
    sec.textColor = '';
    sec.gradient = { color1: '#6d28d9', color2: '#00cfff', angle: '135deg' };
    sec.padding = '';

    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) {
      window.app.saveState();
      window.app.updateInspector(sec);
      window.app.showToast('Reset section styling to default');
    }
  }

  updateSectionProperty(prop, value) {
    const sec = this.getSelectedSection();
    if (!sec) return;

    if (prop === 'bg') {
      sec.bgType = 'color';
      sec.bg = value;
    } else if (prop === 'padding') {
      sec.padding = value;
    } else {
      sec[prop] = value;
    }

    this.applyStylesToSectionDOM(this.selectedSectionIndex);
    if (window.app) window.app.saveState();
  }

  applyStylesToSectionDOM(index) {
    if (index === null || index === undefined || !this.sections[index]) return;
    const sec = this.sections[index];
    const wrapper = this.canvas.children[index];
    if (!wrapper) return;

    const innerSec = wrapper.querySelector('.wb-section') || wrapper.querySelector('.wb-navbar') || wrapper.querySelector('.wb-footer');
    if (!innerSec) return;

    if (sec.bgType === 'color' && sec.bg) {
      innerSec.style.backgroundImage = 'none';
      innerSec.style.backgroundColor = sec.bg;
      innerSec.style.background = sec.bg;
      if (isColorDark(sec.bg)) {
        innerSec.classList.add('has-dark-bg');
        innerSec.classList.remove('has-gradient-bg');
      } else {
        innerSec.classList.remove('has-dark-bg', 'has-gradient-bg');
      }
    } else if (sec.bgType === 'gradient' && sec.gradient) {
      const g = sec.gradient;
      const c1 = g.color1 || '#6d28d9';
      const c2 = g.color2 || '#00cfff';
      const c3 = g.color3;
      const stops = c3 ? `${c1}, ${c3}, ${c2}` : `${c1}, ${c2}`;
      const gradStr = (g.angle === 'circle')
        ? `radial-gradient(circle, ${stops})`
        : `linear-gradient(${g.angle || '135deg'}, ${stops})`;
      innerSec.style.backgroundImage = 'none';
      innerSec.style.backgroundColor = '';
      innerSec.style.background = gradStr;
      innerSec.classList.add('has-gradient-bg');
      innerSec.classList.remove('has-dark-bg');
    } else if (sec.bgType === 'default' || !sec.bgType) {
      innerSec.style.removeProperty('background');
      innerSec.style.removeProperty('background-color');
      innerSec.style.removeProperty('background-image');
      innerSec.classList.remove('has-gradient-bg', 'has-dark-bg');
    }

    if (sec.textColor) {
      innerSec.style.color = sec.textColor;
      innerSec.querySelectorAll('h1, h2, h3, h4, h5, h6, .wb-title, .wb-hero-headline, .wb-feature-title, .wb-team-name, .wb-faq-question, .wb-price-amount, .wb-testimonial-quote, .wb-user-name, .wb-stat-number, p, .wb-desc, .wb-hero-sub, .wb-feature-desc, .wb-faq-answer, .wb-stat-label, .wb-user-role, .wb-price-period, span, a').forEach(el => {
        if (!el.closest('.section-toolbar') && !el.closest('.wb-elem-toolbar') && !el.classList.contains('wb-btn') && !el.classList.contains('wb-badge')) {
          if (!el.getAttribute('data-has-custom-color') && !el.style.color) {
            el.style.color = sec.textColor;
          }
        }
      });
    } else {
      innerSec.style.removeProperty('color');
      innerSec.querySelectorAll('h1, h2, h3, h4, h5, h6, .wb-title, .wb-hero-headline, .wb-feature-title, .wb-team-name, .wb-faq-question, .wb-price-amount, .wb-testimonial-quote, .wb-user-name, .wb-stat-number, p, .wb-desc, .wb-hero-sub, .wb-feature-desc, .wb-faq-answer, .wb-stat-label, .wb-user-role, .wb-price-period, span, a').forEach(el => {
        if (!el.closest('.section-toolbar') && !el.closest('.wb-elem-toolbar') && !el.classList.contains('wb-btn') && !el.classList.contains('wb-badge')) {
          if (!el.getAttribute('data-has-custom-color')) {
            el.style.removeProperty('color');
          }
        }
      });
    }

    if (sec.padding) {
      innerSec.style.padding = `${sec.padding}rem 0`;
    } else {
      innerSec.style.removeProperty('padding');
    }
  }

  render() {
    if (!this.canvas) return;

    if (this.sections.length === 0) {
      this.canvas.innerHTML = `
        <div class="canvas-empty">
          <i class="fa-solid fa-layer-group"></i>
          <h3>Your website canvas is empty</h3>
          <p>Drag sections from the left sidebar or click to insert them.</p>
        </div>
      `;
      if (window.app) window.app.updateInspector(null);
      return;
    }

    this.canvas.innerHTML = '';

    this.sections.forEach((sec, idx) => {
      const blockDef = (window.BUILDER_BLOCKS && window.BUILDER_BLOCKS[sec.blockId])
        ? window.BUILDER_BLOCKS[sec.blockId]
        : { name: 'Custom Section' };

      const wrapper = document.createElement('div');
      wrapper.className = 'canvas-section-wrapper' + (this.selectedSectionIndex === idx ? ' selected' : '');
      wrapper.dataset.index = idx;

      wrapper.innerHTML = `
        <div class="section-toolbar">
          <span class="section-label drag-handle" style="cursor: grab; user-select: none;"><i class="fa-solid fa-grip-vertical"></i> ${blockDef.name}</span>
          <button type="button" class="section-tool-btn" title="Move Up" onclick="window.editor.moveSection(${idx}, -1)"><i class="fa-solid fa-arrow-up"></i></button>
          <button type="button" class="section-tool-btn" title="Move Down" onclick="window.editor.moveSection(${idx}, 1)"><i class="fa-solid fa-arrow-down"></i></button>
          <button type="button" class="section-tool-btn" title="Duplicate" onclick="window.editor.duplicateSection(${idx})"><i class="fa-solid fa-copy"></i></button>
          <button type="button" class="section-tool-btn" title="Style Section" onclick="window.editor.selectSection(${idx})"><i class="fa-solid fa-sliders"></i></button>
          <button type="button" class="section-tool-btn danger" title="Delete" onclick="window.editor.removeSection(${idx})"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="section-content">${sec.html}</div>
      `;

      wrapper.addEventListener('click', (e) => {
        if (!e.target.closest('.section-toolbar') && !e.target.closest('.wb-elem-del-btn') && !e.target.closest('.wb-nav-toggle')) {
          this.selectSection(idx);
        }
      });

      wrapper.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.addEventListener('input', () => {
          sec.html = wrapper.querySelector('.section-content').innerHTML;
          if (window.app) window.app.saveState();
        });
      });

      this.canvas.appendChild(wrapper);
      this.applyStylesToSectionDOM(idx);
      this.attachElementControls(wrapper, sec);
    });

    this.initSortable();
  }

  loadTemplate(templateId, isInitial = false) {
    if (!window.BUILDER_TEMPLATES) return;
    const tmpl = window.BUILDER_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    if (!isInitial && window.authManager && !window.authManager.canUseTemplate(templateId)) {
      const isEnterprise = !window.authManager.freeTemplateIds.includes(templateId) && window.authManager.getPlan() === 'pro';
      window.authManager.openUpgradeModal(isEnterprise ? 'enterprise-template' : 'template-access', tmpl.name);
      return;
    }

    if (window.themeManager && tmpl.theme) {
      window.themeManager.setTheme(tmpl.theme);
    }

    this.sections = tmpl.blocks.map(blockKey => {
      const blockDef = window.BUILDER_BLOCKS ? window.BUILDER_BLOCKS[blockKey] : null;
      return {
        id: 'sec_' + Math.random().toString(36).substr(2, 9),
        blockId: blockKey,
        html: blockDef ? blockDef.html : '',
        bgType: 'default',
        bg: '',
        gradient: { color1: '#6d28d9', color2: '#00cfff', angle: '135deg' },
        padding: ''
      };
    });

    this.selectedSectionIndex = this.sections.length > 0 ? 0 : null;
    this.render();
    if (window.app) {
      window.app.saveState();
      window.app.showToast('Loaded ' + tmpl.name);
      if (this.selectedSectionIndex !== null) {
        window.app.updateInspector(this.sections[this.selectedSectionIndex]);
      }
    }
  }

  getCleanHTML() {
    if (!this.canvas) return '';
    let output = '';
    const wrappers = this.canvas.querySelectorAll('.canvas-section-wrapper');
    wrappers.forEach(wrapper => {
      const content = wrapper.querySelector('.section-content');
      if (content) {
        const clone = content.cloneNode(true);
        clone.querySelectorAll('.wb-elem-toolbar, .wb-elem-del-btn').forEach(btn => btn.remove());
        clone.querySelectorAll('.wb-deletable-elem').forEach(el => {
          el.classList.remove('wb-deletable-elem', 'is-focused', 'is-active');
          if (el.getAttribute('tabindex') === '0') el.removeAttribute('tabindex');
        });
        clone.querySelectorAll('.wb-nav-collapse').forEach(c => c.classList.remove('is-open'));
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        output += clone.innerHTML + '\n\n';
      }
    });
    return output;
  }
}

window.CanvasEditor = CanvasEditor;
