// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  I18N MODULE - Language switching and translation                          ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const I18n = {
    lang: localStorage.getItem('lang') || CONFIG.site.defaultLang,
    
    init() {
        this.setLang(this.lang, false);
    },
    
    setLang(lang, rerender = true) {
        this.lang = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('lang', lang);
        
        // Update language switcher buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent === lang.toUpperCase());
        });
        
        // Re-render pages if data is loaded
        if (rerender && DataManager.data.settings) {
            App.renderAll();
        }
    },
    
    // Translation helper - returns EN or TR based on current language
    t(en, tr) {
        if (this.lang === 'tr') {
            return tr || en;
        }
        return en;
    }
};

// Global translation shortcut
function t(en, tr) {
    return I18n.t(en, tr);
}
