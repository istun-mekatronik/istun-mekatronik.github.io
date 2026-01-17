// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  APP MODULE - Main application controller                                  ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const App = {
    isInitialized: false,
    
    async init() {
        console.log('🚀 İSTUN Website initializing...');
        
        // Check for custom sheet ID in localStorage
        const customSheetId = localStorage.getItem('sheetId');
        if (customSheetId) {
            CONFIG.sheetId = customSheetId;
        }
        
        // Initialize modules
        I18n.init();
        Router.init();
        
        // Load data
        await this.loadData();
        
        // Render all pages
        this.renderAll();
        
        this.isInitialized = true;
        console.log('✅ İSTUN Website ready!');
    },
    
    async loadData() {
        this.setLoading(true);
        
        try {
            await DataManager.loadAll();
            this.updateUI();
        } catch (err) {
            console.error('Error loading data:', err);
            this.showError('Failed to load data. Please check your internet connection.');
        }
        
        this.setLoading(false);
    },
    
    async refresh() {
        this.setLoading(true);
        
        try {
            await DataManager.refresh();
            this.renderAll();
            this.updateUI();
            
            // Show success feedback
            const btn = document.getElementById('refreshBtn');
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> <span data-en>Updated</span><span data-tr>Güncellendi</span>';
                setTimeout(() => btn.innerHTML = originalHTML, 1500);
            }
        } catch (err) {
            console.error('Error refreshing:', err);
        }
        
        this.setLoading(false);
    },
    
    setLoading(isLoading) {
        const btn = document.getElementById('refreshBtn');
        const dot = document.getElementById('dataStatusDot');
        
        if (btn) {
            btn.disabled = isLoading;
            if (isLoading) {
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ...';
            }
        }
        
        if (dot) {
            dot.classList.toggle('loading', isLoading);
        }
    },
    
    updateUI() {
        // Update site name from settings
        const siteName = DataManager.data.settings.site_name || CONFIG.site.name;
        document.getElementById('siteName').textContent = siteName;
        
        // Update badges
        Router.updateBadges();
        
        // Update data status indicator
        const hasChanges = DataManager.changeLog.some(c => c.changeType !== 'unchanged');
        const dot = document.getElementById('dataStatusDot');
        if (dot) {
            dot.classList.toggle('has-changes', hasChanges);
        }
    },
    
    renderAll() {
        // Each page has its own render function defined in its HTML file
        // This calls them if they exist
        const pages = ['home', 'about', 'news', 'faculty', 'research', 'publications', 
                       'courses', 'projects', 'labs', 'jobs', 'alumni', 'partners', 
                       'students', 'contact'];
        
        for (const page of pages) {
            const renderFn = window[`render${page.charAt(0).toUpperCase() + page.slice(1)}Page`];
            if (typeof renderFn === 'function') {
                try {
                    renderFn();
                } catch (err) {
                    console.error(`Error rendering ${page}:`, err);
                }
            }
        }
    },
    
    showError(message) {
        const main = document.getElementById('mainContent');
        main.innerHTML = `
            <div class="page active" style="text-align:center;padding:4rem 2rem;">
                <i class="fa-solid fa-exclamation-triangle" style="font-size:3rem;color:#ef4444;margin-bottom:1rem;"></i>
                <h2>${message}</h2>
                <button class="btn btn-accent" onclick="location.reload()">
                    <i class="fa-solid fa-rotate"></i> Retry
                </button>
            </div>
        `;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL HELPER FUNCTIONS (used by page templates)
// ═══════════════════════════════════════════════════════════════════════════

// Get tag color class based on category
function getTagClass(category) {
    const map = {
        'grant': 'tag-accent', 'research': 'tag-accent',
        'award': 'tag-green', 'competition': 'tag-green',
        'academic': 'tag-purple', 'capstone': 'tag-purple',
        'industry': 'tag-cyan', 'event': 'tag-pink',
        'seminar': 'tag-accent', 'workshop': 'tag-purple',
        'deadline': 'tag-red', 'phd': 'tag-accent', 'msc': 'tag-green'
    };
    return map[(category || '').toLowerCase()] || '';
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return { day: '--', month: '---' };
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { day: d.getDate(), month: months[d.getMonth()] };
}

// Clean text (fix encoding issues)
function cleanText(str) {
    if (!str) return '';
    return str.replace(/Â·/g, '·').replace(/Â /g, ' ').replace(/Â/g, '');
}

// Get data accessor
function getData() {
    return DataManager.data;
}

// Get settings accessor
function getSettings() {
    return DataManager.data.settings;
}
