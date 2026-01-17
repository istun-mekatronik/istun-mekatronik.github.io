// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  ADMIN MODULE - Admin panel functionality                                  ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const Admin = {
    open() {
        document.getElementById('adminModal').classList.add('show');
        
        // Load sheet embed
        const sheetId = CONFIG.sheetId;
        const embedUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&rm=embedded`;
        document.getElementById('sheetEmbed').src = embedUrl;
        document.getElementById('openSheetLink').href = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
        document.getElementById('settingSheetId').value = sheetId;
        
        // Render data status
        this.renderDataStatus();
        this.renderChangeLog();
    },
    
    close() {
        document.getElementById('adminModal').classList.remove('show');
        
        // Clear hash if present
        if (window.location.hash === '#admin') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    },
    
    showTab(tab) {
        // Hide all tabs
        document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        
        // Show selected tab
        document.getElementById(`adminTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).style.display = 'block';
        event.target.closest('.admin-tab').classList.add('active');
    },
    
    renderDataStatus() {
        const container = document.getElementById('adminDataStatus');
        const data = DataManager.data;
        const lang = I18n.lang;
        
        const sheets = [
            { name: 'Settings', count: Object.keys(data.settings).length, icon: 'fa-cog' },
            { name: 'News', count: data.news.length, icon: 'fa-newspaper' },
            { name: 'Events', count: data.events.length, icon: 'fa-calendar' },
            { name: 'Faculty', count: data.faculty.length, icon: 'fa-user-tie' },
            { name: 'Research', count: data.research.length, icon: 'fa-flask' },
            { name: 'Publications', count: data.publications.length, icon: 'fa-book' },
            { name: 'Courses', count: data.courses.length, icon: 'fa-graduation-cap' },
            { name: 'Projects', count: data.projects.length, icon: 'fa-rocket' },
            { name: 'Labs', count: data.labs.length, icon: 'fa-microscope' },
            { name: 'Jobs', count: data.jobs.length, icon: 'fa-briefcase' },
            { name: 'Alumni', count: data.alumni.length, icon: 'fa-medal' },
            { name: 'Partners', count: data.partners.length, icon: 'fa-handshake' },
            { name: 'Students', count: data.students.length, icon: 'fa-user-graduate' }
        ];
        
        container.innerHTML = sheets.map(s => `
            <div class="data-status-item">
                <i class="fa-solid ${s.icon}"></i>
                <span>${s.name}</span>
                <strong>${s.count}</strong>
            </div>
        `).join('');
    },
    
    renderChangeLog() {
        const container = document.getElementById('adminChangeLog');
        const log = DataManager.changeLog;
        const lang = I18n.lang;
        
        if (log.length === 0) {
            container.innerHTML = `<p class="text-muted">${lang === 'tr' ? 'Değişiklik yok' : 'No changes'}</p>`;
            return;
        }
        
        // Filter to only show changed items
        const changed = log.filter(item => item.changeType !== 'unchanged');
        
        if (changed.length === 0) {
            container.innerHTML = `
                <div class="change-summary success">
                    <i class="fa-solid fa-check-circle"></i>
                    ${lang === 'tr' ? 'Tüm veriler güncel' : 'All data up to date'}
                </div>
            `;
            return;
        }
        
        container.innerHTML = changed.map(item => `
            <div class="change-item ${item.changeType}">
                <strong>${item.name}</strong>
                <span>${item.message}</span>
                <small>${item.time}</small>
            </div>
        `).join('');
    },
    
    saveSettings() {
        const newSheetId = document.getElementById('settingSheetId').value.trim();
        
        if (newSheetId && newSheetId !== CONFIG.sheetId) {
            localStorage.setItem('sheetId', newSheetId);
            alert(I18n.lang === 'tr' ? 'Kaydedildi! Sayfa yenilenecek.' : 'Saved! Page will reload.');
            location.reload();
        } else {
            alert(I18n.lang === 'tr' ? 'Değişiklik yok.' : 'No changes.');
        }
    }
};
