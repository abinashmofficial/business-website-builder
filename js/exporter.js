class WebsiteExporter {
  constructor(editor, themeManager) {
    this.editor = editor;
    this.themeManager = themeManager;
    this.siteMeta = {
      title: 'ApexCorp | Next-Gen Enterprise Solutions',
      description: 'Accelerate your enterprise growth with resilient cloud infrastructure and AI-driven automation.',
      author: 'ApexCorp Inc.'
    };
    this.cachedCanvasCSS = '';
    this.fetchCanvasCSS();
  }

  async fetchCanvasCSS() {
    try {
      const tag = document.querySelector('link[href*="canvas.css"]');
      if (tag && tag.href) {
        const res = await fetch(tag.href);
        if (res.ok) {
          this.cachedCanvasCSS = await res.text();
        }
      }
    } catch (e) {}
  }

  generateFullHTML(includeInlineCSS = true) {
    const cleanBody = this.editor.getCleanHTML();
    const themeCSS = this.themeManager.getThemeCSS();

    let embeddedCSS = this.cachedCanvasCSS;
    if (!embeddedCSS) {
      const tag = document.querySelector('link[href*="canvas.css"]');
      if (tag) {
        try {
          for (let sheet of document.styleSheets) {
            if (sheet.href && sheet.href.includes('canvas.css')) {
              let rules = [];
              for (let r of sheet.cssRules) {
                rules.push(r.cssText);
              }
              embeddedCSS = rules.join('\n');
              break;
            }
          }
        } catch (e) {}
      }
    }

    let cssBlock = '';
    if (includeInlineCSS) {
      cssBlock = `
  <link rel="stylesheet" href="css/canvas.css">
  <style>
    ${themeCSS}
    ${embeddedCSS ? '\n' + embeddedCSS : ''}
  </style>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.siteMeta.title}</title>
  <meta name="description" content="${this.siteMeta.description}">
  <meta name="author" content="${this.siteMeta.author}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
${cssBlock}
</head>
<body>
${cleanBody}

  <script>
    document.querySelectorAll('.wb-nav-toggle').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const header = this.closest('.wb-navbar') || document.querySelector('.wb-navbar');
        if (header) {
          const collapse = header.querySelector('.wb-nav-collapse');
          if (collapse) {
            collapse.classList.toggle('is-open');
          }
        }
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          const collapse = document.querySelector('.wb-nav-collapse');
          if (collapse && collapse.classList.contains('is-open')) {
            collapse.classList.remove('is-open');
          }
        }
      });
    });
  </script>
</body>
</html>`;
  }

  downloadHTML() {
    if (window.authManager && !window.authManager.canExport()) {
      window.authManager.openUpgradeModal('export-html');
      return;
    }
    try {
      const htmlContent = this.generateFullHTML(true);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
      if (window.app) window.app.showToast('Downloaded index.html');
    } catch(err) {
      console.error(err);
      alert('Download error: ' + err.message);
    }
  }

  async downloadZIP() {
    if (window.authManager && !window.authManager.canExport()) {
      window.authManager.openUpgradeModal('export-zip');
      return;
    }
    try {
      if (typeof JSZip === 'undefined') {
        this.downloadHTML();
        return;
      }

      const zip = new JSZip();
      
      let cssContent = this.cachedCanvasCSS;
      if (!cssContent) {
        const canvasStyleTag = document.querySelector('link[href*="canvas.css"]');
        if (canvasStyleTag) {
          try {
            const res = await fetch(canvasStyleTag.href);
            cssContent = await res.text();
          } catch(e) {}
        }
      }

      zip.file('index.html', this.generateFullHTML(true));
      zip.folder('css').file('canvas.css', cssContent || '');

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'business-website.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
      if (window.app) window.app.showToast('Downloaded full website ZIP package!');
    } catch (err) {
      console.error(err);
      this.downloadHTML();
    }
  }

  exportToPDF() {
    if (window.authManager && !window.authManager.canExport()) {
      window.authManager.openUpgradeModal('export-pdf');
      return;
    }
    try {
      const fullHtml = this.generateFullHTML(true);
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(printIframe);

      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(fullHtml);
      iframeDoc.close();

      const printCSS = iframeDoc.createElement('style');
      printCSS.textContent = `
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .wb-section, .wb-navbar, .wb-footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `;
      iframeDoc.head.appendChild(printCSS);

      const triggerPrint = () => {
        setTimeout(() => {
          try {
            printIframe.contentWindow.focus();
            printIframe.contentWindow.print();
            if (window.app) window.app.showToast('Preparing PDF export preview...');
          } catch (e) {
            window.print();
          } finally {
            setTimeout(() => {
              if (printIframe.parentNode) printIframe.parentNode.removeChild(printIframe);
            }, 3000);
          }
        }, 350);
      };

      if (printIframe.contentWindow.document.readyState === 'complete') {
        triggerPrint();
      } else {
        printIframe.onload = triggerPrint;
      }
    } catch (err) {
      console.error(err);
      window.print();
    }
  }
}

window.WebsiteExporter = WebsiteExporter;
