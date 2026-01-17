// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  ROUTER MODULE - Handles page navigation and loading                       ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const Router = {
    currentPage: null,
    loadedPages: {},
    
    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    init() {
        this.buildSidebar();
        this.setupKeyboardShortcuts();
        
        // Check URL hash for initial page
        const hash = window.location.hash.replace('#', '');
        if (hash === 'admin') {
            Admin.open();
            this.goTo('home');
        } else if (hash && CONFIG.pages[hash]) {
            this.goTo(hash);
        } else {
            this.goTo('home');
        }
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash === 'admin') {
                Admin.open();
            } else if (hash && CONFIG.pages[hash]) {
                this.goTo(hash);
            }
        });
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // BUILD SIDEBAR NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    buildSidebar() {
        const sidebar = document.getElementById('sidebar');
        const lang = I18n.lang;
        
        let html = '';
        
        for (const section of CONFIG.navSections) {
            html += `
                <div class="nav-section">
                    <div class="nav-section-title">
                        <span data-en>${section.title.en}</span>
                        <span data-tr>${section.title.tr}</span>
                    </div>
            `;
            
            for (const pageId of section.pages) {
                const page = CONFIG.pages[pageId];
                if (!page) continue;
                
                const badgeHtml = page.nav.badge 
                    ? `<span class="nav-badge" id="${pageId}Badge">0</span>` 
                    : '';
                
                html += `
                    <a class="nav-item" data-page="${pageId}" onclick="Router.goTo('${pageId}', this)">
                        <i class="fa-solid ${page.nav.icon}"></i>
                        <span data-en>${page.nav.en}</span>
                        <span data-tr>${page.nav.tr}</span>
                        ${badgeHtml}
                    </a>
                `;
            }
            
            html += '</div>';
        }
        
        // Next Event Card
        html += `
            <div class="sidebar-card" id="nextEventCard">
                <div class="sidebar-card-title">
                    <i class="fa-solid fa-calendar-day"></i>
                    <span data-en>Next Event</span><span data-tr>Yaklaşan Etkinlik</span>
                </div>
                <p id="nextEventText" style="font-size:0.75rem;color:var(--text-muted);margin:0.5rem 0;">
                    <span data-en>Loading...</span><span data-tr>Yükleniyor...</span>
                </p>
                <button class="btn btn-sm btn-ghost" style="width:100%;" onclick="Router.goTo('news')">
                    <span data-en>View Events</span><span data-tr>Etkinlikler</span>
                </button>
            </div>
        `;
        
        // Data panel at bottom
        html += `
            <div class="sidebar-data-panel" id="sidebarDataPanel">
                <button class="sidebar-data-toggle" onclick="Router.toggleDataPanel()">
                    <div class="sidebar-data-toggle-left">
                        <i class="fa-solid fa-database"></i>
                        <span data-en>Data</span><span data-tr>Veri</span>
                    </div>
                    <div class="sidebar-data-toggle-right">
                        <span class="data-status-dot" id="dataStatusDot"></span>
                        <i class="fa-solid fa-chevron-up"></i>
                    </div>
                </button>
                <div class="sidebar-data-content">
                    <div class="data-info-row">
                        <span class="data-info-label">
                            <span data-en>Updated</span><span data-tr>Güncelleme</span>
                        </span>
                        <span class="data-info-value" id="lastUpdatedTime">—</span>
                    </div>
                    <div class="data-actions-row">
                        <button class="btn btn-ghost btn-sm" onclick="App.refresh()" id="refreshBtn">
                            <i class="fa-solid fa-rotate"></i>
                            <span data-en>Refresh</span><span data-tr>Yenile</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        sidebar.innerHTML = html;
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    async goTo(pageId, navEl = null) {
        const pageConfig = CONFIG.pages[pageId];
        if (!pageConfig) {
            console.error(`Page "${pageId}" not found`);
            return;
        }
        
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (navEl) {
            navEl.classList.add('active');
        } else {
            const nav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
            if (nav) nav.classList.add('active');
        }
        
        // Load page if not cached
        if (!this.loadedPages[pageId]) {
            await this.loadPage(pageId, pageConfig);
        }
        
        // Show page
        this.showPage(pageId);
        this.currentPage = pageId;
        
        // Close sidebar on mobile
        this.closeSidebar();
        
        // Scroll to top
        document.getElementById('mainContent').scrollTop = 0;
        
        // Always call render function if data is ready (for page updates on navigation)
        if (DataManager.data.settings) {
            this.callRenderFunction(pageId);
        }
    },
    
    callRenderFunction(pageId) {
        // Try multiple naming conventions
        const variations = [
            `render${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`,
            `render${pageId}Page`,
            `render${pageId.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).charAt(0).toUpperCase() + pageId.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).slice(1)}Page`
        ];
        
        for (const fnName of variations) {
            const fn = window[fnName];
            if (typeof fn === 'function') {
                try {
                    fn();
                } catch (err) {
                    console.error(`Error calling ${fnName}:`, err);
                }
                return;
            }
        }
    },
    
    async loadPage(pageId, pageConfig) {
        try {
            const response = await fetch(pageConfig.file);
            if (!response.ok) throw new Error(`Failed to load ${pageConfig.file}`);
            
            const html = await response.text();
            
            // Create page container
            const pageDiv = document.createElement('div');
            pageDiv.id = pageId;
            pageDiv.className = 'page';
            pageDiv.innerHTML = html;
            
            document.getElementById('mainContent').appendChild(pageDiv);
            this.loadedPages[pageId] = true;
            
            // Execute any script tags in the loaded HTML
            const scripts = pageDiv.querySelectorAll('script');
            for (const oldScript of scripts) {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                document.head.appendChild(newScript);
                oldScript.remove();
            }
            
            // Wait a tick for scripts to execute, then render
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Execute page render function if data is ready
            // Handle page IDs with hyphens (like 'job-detail' → 'Job-detail' or convert to camelCase)
            let fnName = `render${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`;
            let renderFn = window[fnName];
            
            // Also try with bracket notation for hyphenated names
            if (!renderFn) {
                renderFn = window[`render${pageId}Page`];
            }
            
            // Try camelCase version (job-detail → renderJobDetailPage)
            if (!renderFn) {
                const camelCaseId = pageId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                fnName = `render${camelCaseId.charAt(0).toUpperCase() + camelCaseId.slice(1)}Page`;
                renderFn = window[fnName];
            }
            
            if (typeof renderFn === 'function' && DataManager.data.settings) {
                renderFn();
            }
            
        } catch (err) {
            console.error(`Error loading page ${pageId}:`, err);
            // Show error in page area
            const pageDiv = document.createElement('div');
            pageDiv.id = pageId;
            pageDiv.className = 'page';
            pageDiv.innerHTML = `
                <div class="page-header">
                    <h1>Error Loading Page</h1>
                    <p class="subtitle">Could not load ${pageConfig.file}</p>
                </div>
                <p>Please check that the file exists and try refreshing.</p>
            `;
            document.getElementById('mainContent').appendChild(pageDiv);
            this.loadedPages[pageId] = true;
        }
    },
    
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show requested page
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
        }
        
        // Hide loading screen
        const loading = document.getElementById('loadingScreen');
        if (loading) loading.style.display = 'none';
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SIDEBAR CONTROLS
    // ═══════════════════════════════════════════════════════════════════════════
    
    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
        document.querySelector('.sidebar-overlay').classList.toggle('show');
    },
    
    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.querySelector('.sidebar-overlay').classList.remove('show');
    },
    
    toggleDataPanel() {
        document.getElementById('sidebarDataPanel').classList.toggle('open');
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════════════════
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+A for admin
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                Admin.open();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                Admin.close();
            }
        });
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UPDATE BADGES
    // ═══════════════════════════════════════════════════════════════════════════
    
    updateBadges() {
        const data = DataManager.data;
        
        // News badge
        const newsBadge = document.getElementById('newsBadge');
        if (newsBadge) {
            newsBadge.textContent = data.news.length;
        }
        
        // Jobs badge
        const jobsBadge = document.getElementById('jobsBadge');
        if (jobsBadge) {
            jobsBadge.textContent = data.jobs.length;
        }
        
        // Notification badge (upcoming events)
        const notifBadge = document.getElementById('notifBadge');
        if (notifBadge) {
            const upcomingEvents = data.events.filter(e => new Date(e.date) >= new Date()).length;
            notifBadge.textContent = upcomingEvents;
            notifBadge.setAttribute('data-count', upcomingEvents);
        }
        
        // Next event card in sidebar
        const nextEventText = document.getElementById('nextEventText');
        if (nextEventText && data.events.length > 0) {
            // Find the next upcoming event
            const now = new Date();
            const upcoming = data.events
                .filter(e => new Date(e.date) >= now)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (upcoming.length > 0) {
                const next = upcoming[0];
                const title = I18n.t(next.title_en, next.title_tr) || next.title || 'Event';
                nextEventText.innerHTML = `<strong>${next.date}</strong><br>${title}`;
            } else {
                nextEventText.innerHTML = I18n.t('No upcoming events', 'Yaklaşan etkinlik yok');
            }
        }
        
        // Update last updated time
        const ts = DataManager.lastUpdated;
        const timeEl = document.getElementById('lastUpdatedTime');
        if (timeEl && ts) {
            const d = new Date(ts);
            timeEl.textContent = d.toLocaleTimeString(I18n.lang === 'tr' ? 'tr-TR' : 'en-US', 
                { hour: '2-digit', minute: '2-digit' });
        }
    }
};
