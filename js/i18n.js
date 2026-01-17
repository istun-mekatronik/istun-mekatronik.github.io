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
            
            // Also re-render current detail page if one is open
            if (typeof window.currentDetailIndex === 'number' && window.currentDetailIndex >= 0) {
                const pageId = Router.currentPage;
                if (pageId && pageId.includes('-detail')) {
                    // Try to find and call the render function
                    const funcNames = [
                        'render' + pageId.replace(/-/g, '') + 'Page',
                        'render' + pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-/g, '') + 'Page',
                        'render' + pageId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Page'
                    ];
                    for (const name of funcNames) {
                        if (typeof window[name] === 'function') {
                            window[name]();
                            break;
                        }
                    }
                }
            }
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
