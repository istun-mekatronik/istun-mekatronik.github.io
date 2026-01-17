// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  SEARCH MODULE - Global search across all data                             ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const Search = {
    timeout: null,
    results: [],
    
    perform(query) {
        clearTimeout(this.timeout);
        const container = document.getElementById('searchResults');
        
        if (!query || query.length < 2) {
            container.innerHTML = '';
            container.classList.remove('show');
            return;
        }
        
        this.timeout = setTimeout(() => {
            this.results = this.searchAll(query.toLowerCase());
            this.display(this.results, query);
        }, 150);
    },
    
    searchAll(query) {
        const results = [];
        const data = DataManager.data;
        
        // Search configurations
        const searchConfigs = [
            { 
                source: data.news, 
                type: 'news', 
                icon: 'fa-newspaper', 
                color: '#f59e0b',
                titleField: ['title_en', 'title_tr'],
                descField: ['description_en', 'description_tr'],
                metaField: 'date',
                action: (i) => `Router.goTo('news'); goToNewsDetail(${i})`
            },
            {
                source: data.events,
                type: 'events',
                icon: 'fa-calendar',
                color: '#8b5cf6',
                titleField: ['title_en', 'title_tr'],
                descField: ['description_en', 'description_tr'],
                metaField: 'date',
                action: (i) => `Router.goTo('news'); goToEventDetail(${i})`
            },
            {
                source: data.faculty,
                type: 'faculty',
                icon: 'fa-user-tie',
                color: '#6366f1',
                titleField: ['name'],
                descField: ['research_en', 'research_tr'],
                metaField: 'title',
                action: (i) => `Router.goTo('faculty'); goToProfile('${data.faculty[i]?.name}')`
            },
            {
                source: data.research,
                type: 'research',
                icon: 'fa-flask',
                color: '#10b981',
                titleField: ['name_en', 'name_tr'],
                descField: ['description_en', 'description_tr'],
                metaField: 'lead',
                action: (i) => `Router.goTo('research')`
            },
            {
                source: data.courses,
                type: 'courses',
                icon: 'fa-book',
                color: '#ec4899',
                titleField: ['name_en', 'name_tr', 'code'],
                descField: ['description_en', 'description_tr'],
                metaField: 'instructor',
                action: () => `Router.goTo('courses')`
            },
            {
                source: data.projects,
                type: 'projects',
                icon: 'fa-diagram-project',
                color: '#14b8a6',
                titleField: ['title_en', 'title_tr'],
                descField: ['description_en', 'description_tr'],
                metaField: 'team',
                action: (i) => `Router.goTo('projects'); goToProjectDetail(${i})`
            },
            {
                source: data.labs,
                type: 'labs',
                icon: 'fa-microscope',
                color: '#06b6d4',
                titleField: ['name_en', 'name_tr'],
                descField: ['equipment_en', 'equipment_tr'],
                metaField: 'room',
                action: (i) => `Router.goTo('labs'); goToLabDetail(${i})`
            },
            {
                source: data.jobs,
                type: 'jobs',
                icon: 'fa-briefcase',
                color: '#22c55e',
                titleField: ['title_en', 'title_tr'],
                descField: ['description_en', 'description_tr'],
                metaField: 'company',
                action: (i) => `Router.goTo('jobs'); goToJobDetail(${i})`
            },
            {
                source: data.publications,
                type: 'publications',
                icon: 'fa-file-lines',
                color: '#6366f1',
                titleField: ['title'],
                descField: ['authors'],
                metaField: 'journal',
                action: () => `Router.goTo('publications')`
            }
        ];
        
        for (const config of searchConfigs) {
            if (!config.source) continue;
            
            config.source.forEach((item, index) => {
                // Get searchable text from title and description fields
                let titleText = '';
                let descText = '';
                
                for (const field of config.titleField) {
                    if (item[field]) titleText += ' ' + item[field];
                }
                for (const field of config.descField) {
                    if (item[field]) descText += ' ' + item[field];
                }
                
                const searchText = (titleText + ' ' + descText).toLowerCase();
                
                if (searchText.includes(query)) {
                    results.push({
                        type: config.type,
                        title: titleText.trim(),
                        meta: item[config.metaField] || '',
                        icon: config.icon,
                        color: config.color,
                        action: config.action(index)
                    });
                }
            });
        }
        
        return results;
    },
    
    display(results, query) {
        const container = document.getElementById('searchResults');
        const lang = I18n.lang;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <i class="fa-solid fa-search"></i>
                    <p>${lang === 'tr' ? 'Sonuç bulunamadı' : 'No results found'}</p>
                </div>
            `;
            container.classList.add('show');
            return;
        }
        
        // Group by type
        const grouped = {};
        results.forEach(r => {
            if (!grouped[r.type]) grouped[r.type] = [];
            grouped[r.type].push(r);
        });
        
        const typeNames = {
            news: lang === 'tr' ? 'Haberler' : 'News',
            events: lang === 'tr' ? 'Etkinlikler' : 'Events',
            faculty: lang === 'tr' ? 'Akademisyenler' : 'Faculty',
            research: lang === 'tr' ? 'Araştırma' : 'Research',
            courses: lang === 'tr' ? 'Dersler' : 'Courses',
            projects: lang === 'tr' ? 'Projeler' : 'Projects',
            labs: lang === 'tr' ? 'Laboratuvarlar' : 'Labs',
            jobs: lang === 'tr' ? 'İş İlanları' : 'Jobs',
            publications: lang === 'tr' ? 'Yayınlar' : 'Publications'
        };
        
        let html = '';
        for (const [type, items] of Object.entries(grouped)) {
            html += `<div class="search-category">${typeNames[type] || type}</div>`;
            items.slice(0, 3).forEach((item, idx) => {
                const globalIdx = results.indexOf(item);
                html += `
                    <div class="search-result-item" onclick="Search.clickResult(${globalIdx})">
                        <div class="search-result-icon" style="background:${item.color}20;color:${item.color};">
                            <i class="fa-solid ${item.icon}"></i>
                        </div>
                        <div class="search-result-content">
                            <div class="search-result-title">${this.highlight(item.title, query)}</div>
                            <div class="search-result-meta">${item.meta}</div>
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
        container.classList.add('show');
    },
    
    highlight(text, query) {
        if (!text) return '';
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    clickResult(index) {
        const result = this.results[index];
        if (result && result.action) {
            eval(result.action); // Execute the action
            document.getElementById('searchInput').value = '';
            document.getElementById('searchResults').classList.remove('show');
        }
    },
    
    show() {
        const input = document.getElementById('searchInput');
        if (input.value.length >= 2) {
            document.getElementById('searchResults').classList.add('show');
        }
    },
    
    hideDelayed() {
        setTimeout(() => {
            document.getElementById('searchResults').classList.remove('show');
        }, 200);
    }
};
