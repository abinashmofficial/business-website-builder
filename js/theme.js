class ThemeManager {
  constructor() {
    this.currentTheme = {
      primary: '#2563eb',
      accent: '#06b6d4',
      secondary: '#0f172a',
      fontHeading: 'Plus Jakarta Sans',
      fontBody: 'Inter',
      radius: '12px'
    };
  }

  setTheme(themeObj) {
    this.currentTheme = { ...this.currentTheme, ...themeObj };
    this.applyToDOM();
    if (window.app) window.app.saveState();
  }

  applyToDOM() {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', this.currentTheme.primary);
    root.style.setProperty('--accent-color', this.currentTheme.accent);
    root.style.setProperty('--secondary-color', this.currentTheme.secondary);
    root.style.setProperty('--radius-md', this.currentTheme.radius);
    
    const canvas = document.getElementById('canvas-content');
    if (canvas) {
      canvas.style.setProperty('--primary-color', this.currentTheme.primary);
      canvas.style.setProperty('--accent-color', this.currentTheme.accent);
      canvas.style.setProperty('--secondary-color', this.currentTheme.secondary);
      canvas.style.setProperty('--radius-md', this.currentTheme.radius);
    }
  }

  getThemeCSS() {
    return `:root {
  --primary-color: ${this.currentTheme.primary};
  --primary-hover: ${this.currentTheme.primary};
  --accent-color: ${this.currentTheme.accent};
  --secondary-color: ${this.currentTheme.secondary};
  --radius-md: ${this.currentTheme.radius};
}`;
  }
}

window.ThemeManager = ThemeManager;
