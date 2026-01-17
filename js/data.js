// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  DATA MODULE - Fetches and caches data from Google Sheets                  ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const DataManager = {
    // Data store
    data: {
        settings: {},
        news: [],
        events: [],
        faculty: [],
        research: [],
        publications: [],
        courses: [],
        projects: [],
        labs: [],
        jobs: [],
        alumni: [],
        partners: [],
        students: []
    },
    
    // Previous data for change detection
    previousData: JSON.parse(localStorage.getItem('previousDataSnapshot') || '{}'),
    
    // Change log
    changeLog: [],
    
    // Loading state
    isLoading: false,
    lastUpdated: null,
    cacheBust: Date.now(),

    // ═══════════════════════════════════════════════════════════════════════════
    // CSV PARSING
    // ═══════════════════════════════════════════════════════════════════════════
    
    parseCSV(csvText, returnRaw = false) {
        const rows = [];
        let currentRow = [];
        let currentVal = '';
        let inQuotes = false;

        let csv = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        csv = csv.replace(/Â·/g, '·').replace(/Â /g, ' ').replace(/Â/g, '');

        for (let i = 0; i < csv.length; i++) {
            const char = csv[i];
            const nextChar = csv[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentVal += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                currentRow.push(currentVal);
                currentVal = '';
            } else if (char === '\n' && !inQuotes) {
                currentRow.push(currentVal);
                if (currentRow.length > 0) rows.push(currentRow);
                currentRow = [];
                currentVal = '';
            } else {
                currentVal += char;
            }
        }

        if (currentVal || currentRow.length) {
            currentRow.push(currentVal);
            if (currentRow.length > 0) rows.push(currentRow);
        }

        if (returnRaw) return rows;
        if (rows.length < 2) return [];

        const headers = rows[0].map(h => 
            (h || '').replace(/^["']|["']$/g, '').trim().toLowerCase().replace(/\s+/g, '_')
        );
        
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i];
            const row = {};
            headers.forEach((key, idx) => {
                if (key) {
                    let val = values[idx] || '';
                    val = val.replace(/^["']|["']$/g, '').trim();
                    row[key] = val;
                }
            });
            data.push(row);
        }
        return data;
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // FETCH METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    async fetchSheet(tabName) {
        try {
            const url = getSheetURL(tabName, this.cacheBust);
            if (!url) return [];
            
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Failed to fetch ${tabName}`);
            
            const csv = await response.text();
            return this.parseCSV(csv, tabName === 'Settings');
        } catch (err) {
            console.error(`Error fetching ${tabName}:`, err);
            return [];
        }
    },

    async fetchSettings() {
        try {
            const rows = await this.fetchSheet(CONFIG.tabs.settings);
            const settings = {};

            rows.forEach(row => {
                if (!row || row.length < 2) return;
                const keyCell = row[0];
                const valCell = row[1];

                if (keyCell.includes('\n') || valCell.includes('\n')) {
                    const keys = keyCell.split('\n');
                    const vals = valCell.split('\n');
                    const count = Math.max(keys.length, vals.length);

                    for (let i = 0; i < count; i++) {
                        const k = (keys[i] || '').trim();
                        const v = (vals[i] || '').trim();
                        if (k && k.toLowerCase() !== 'key') {
                            settings[k] = v;
                        }
                    }
                } else {
                    const k = keyCell.trim();
                    const v = valCell.trim();
                    if (k && k.toLowerCase() !== 'key') {
                        settings[k] = v;
                    }
                }
            });
            
            return settings;
        } catch (err) {
            console.error('Error parsing settings:', err);
            return {};
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LOAD ALL DATA
    // ═══════════════════════════════════════════════════════════════════════════
    
    async loadAll() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.changeLog = [];
        
        const timeStr = new Date().toLocaleTimeString('tr-TR');
        
        try {
            // Fetch all data in parallel
            const [
                settings, news, events, faculty, research, publications,
                courses, projects, labs, jobs, alumni, partners, students
            ] = await Promise.all([
                this.fetchSettings(),
                this.fetchSheet(CONFIG.tabs.news),
                this.fetchSheet(CONFIG.tabs.events),
                this.fetchSheet(CONFIG.tabs.faculty),
                this.fetchSheet(CONFIG.tabs.research),
                this.fetchSheet(CONFIG.tabs.publications),
                this.fetchSheet(CONFIG.tabs.courses),
                this.fetchSheet(CONFIG.tabs.projects),
                this.fetchSheet(CONFIG.tabs.labs),
                this.fetchSheet(CONFIG.tabs.jobs),
                this.fetchSheet(CONFIG.tabs.alumni),
                this.fetchSheet(CONFIG.tabs.partners),
                this.fetchSheet(CONFIG.tabs.students)
            ]);

            // Update data store
            this.data.settings = settings;
            this.data.news = news;
            this.data.events = events;
            this.data.faculty = faculty;
            this.data.research = research;
            this.data.publications = publications;
            this.data.courses = courses;
            this.data.projects = projects;
            this.data.labs = labs;
            this.data.jobs = jobs;
            this.data.alumni = alumni;
            this.data.partners = partners;
            this.data.students = students;

            // Detect changes
            this.detectChanges(timeStr);
            
            // Save snapshot
            this.saveSnapshot();
            
            this.lastUpdated = Date.now();
            localStorage.setItem('lastUpdatedTs', String(this.lastUpdated));
            
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            this.isLoading = false;
        }
        
        return this.data;
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CHANGE DETECTION
    // ═══════════════════════════════════════════════════════════════════════════
    
    detectChanges(timeStr) {
        const currentLang = localStorage.getItem('lang') || 'en';
        
        const sheets = [
            { name: 'Settings', data: this.data.settings, isSettings: true },
            { name: 'News', data: this.data.news },
            { name: 'Events', data: this.data.events },
            { name: 'Faculty', data: this.data.faculty },
            { name: 'Research', data: this.data.research },
            { name: 'Publications', data: this.data.publications },
            { name: 'Courses', data: this.data.courses },
            { name: 'Projects', data: this.data.projects },
            { name: 'Labs', data: this.data.labs },
            { name: 'Jobs', data: this.data.jobs },
            { name: 'Alumni', data: this.data.alumni },
            { name: 'Partners', data: this.data.partners },
            { name: 'Students', data: this.data.students }
        ];
        
        for (const sheet of sheets) {
            const oldData = this.previousData[sheet.name];
            const newData = sheet.data;
            
            if (!newData || (Array.isArray(newData) && newData.length === 0) || 
                (!Array.isArray(newData) && Object.keys(newData).length === 0)) {
                continue;
            }
            
            const changes = sheet.isSettings 
                ? this.compareSettings(oldData, newData, currentLang)
                : this.compareData(oldData, newData, sheet.name, currentLang);
            
            const message = this.generateChangeMessage(changes, currentLang);
            const changeType = this.getChangeType(changes);
            
            this.changeLog.push({
                name: sheet.name,
                changeType,
                message,
                time: timeStr,
                changes
            });
        }
    },
    
    compareData(oldData, newData, sheetName, lang) {
        const changes = { added: [], removed: [], modified: [], unchanged: 0 };
        
        if (!oldData || !Array.isArray(oldData)) {
            if (newData && Array.isArray(newData)) {
                changes.added = newData.map(r => this.getRecordTitle(r, lang));
            }
            return changes;
        }
        
        if (!newData || !Array.isArray(newData)) return changes;
        
        const oldMap = new Map();
        const newMap = new Map();
        
        oldData.forEach(record => {
            const id = this.getRecordId(record);
            oldMap.set(id, { record, hash: this.hashRecord(record) });
        });
        
        newData.forEach(record => {
            const id = this.getRecordId(record);
            newMap.set(id, { record, hash: this.hashRecord(record) });
        });
        
        newMap.forEach((value, id) => {
            const oldItem = oldMap.get(id);
            if (!oldItem) {
                changes.added.push(this.getRecordTitle(value.record, lang));
            } else if (oldItem.hash !== value.hash) {
                changes.modified.push({
                    title: this.getRecordTitle(value.record, lang),
                    fields: this.findChangedFields(oldItem.record, value.record)
                });
            } else {
                changes.unchanged++;
            }
        });
        
        oldMap.forEach((value, id) => {
            if (!newMap.has(id)) {
                changes.removed.push(this.getRecordTitle(value.record, lang));
            }
        });
        
        return changes;
    },
    
    compareSettings(oldSettings, newSettings, lang) {
        const changes = { added: [], removed: [], modified: [], unchanged: 0 };
        
        if (!oldSettings || Object.keys(oldSettings).length === 0) {
            changes.added = Object.keys(newSettings || {});
            return changes;
        }
        
        const oldKeys = Object.keys(oldSettings || {});
        const newKeys = Object.keys(newSettings || {});
        
        newKeys.forEach(key => {
            if (!(key in oldSettings)) {
                changes.added.push(key);
            } else if (oldSettings[key] !== newSettings[key]) {
                changes.modified.push({ 
                    title: key, 
                    oldValue: oldSettings[key],
                    newValue: newSettings[key]
                });
            } else {
                changes.unchanged++;
            }
        });
        
        oldKeys.forEach(key => {
            if (!(key in newSettings)) {
                changes.removed.push(key);
            }
        });
        
        return changes;
    },
    
    getRecordId(record) {
        return record.id || record.name || record.title || record.title_en || 
               record.name_en || record.company || record.code || 
               JSON.stringify(record).substring(0, 50);
    },
    
    getRecordTitle(record, lang) {
        const title = record.title_tr || record.title_en || record.title ||
                     record.name_tr || record.name_en || record.name ||
                     record.company || record.code || record.id || '?';
        return title.length > 30 ? title.substring(0, 30) + '...' : title;
    },
    
    hashRecord(record) {
        const str = JSON.stringify(record);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },
    
    findChangedFields(oldRecord, newRecord) {
        const changed = [];
        const allKeys = new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]);
        
        allKeys.forEach(key => {
            if (JSON.stringify(oldRecord[key]) !== JSON.stringify(newRecord[key])) {
                changed.push(key);
            }
        });
        
        return changed.slice(0, 3);
    },
    
    generateChangeMessage(changes, lang) {
        const parts = [];
        const isTr = lang === 'tr';
        
        if (changes.added.length > 0) {
            parts.push(isTr 
                ? `<span style="color:#22c55e;">+${changes.added.length} yeni</span>`
                : `<span style="color:#22c55e;">+${changes.added.length} new</span>`);
        }
        
        if (changes.modified.length > 0) {
            parts.push(isTr 
                ? `<span style="color:#f59e0b;">✏️ ${changes.modified.length} güncellendi</span>`
                : `<span style="color:#f59e0b;">✏️ ${changes.modified.length} updated</span>`);
        }
        
        if (changes.removed.length > 0) {
            parts.push(isTr 
                ? `<span style="color:#ef4444;">-${changes.removed.length} silindi</span>`
                : `<span style="color:#ef4444;">-${changes.removed.length} removed</span>`);
        }
        
        if (parts.length === 0) {
            return isTr ? '✓ Değişiklik yok' : '✓ No changes';
        }
        
        return parts.join(' · ');
    },
    
    getChangeType(changes) {
        if (changes.added.length > 0 && changes.modified.length === 0 && changes.removed.length === 0) return 'added';
        if (changes.removed.length > 0 && changes.added.length === 0 && changes.modified.length === 0) return 'removed';
        if (changes.modified.length > 0) return 'modified';
        return 'unchanged';
    },
    
    saveSnapshot() {
        const snapshot = {};
        for (const [key, value] of Object.entries(this.data)) {
            snapshot[key.charAt(0).toUpperCase() + key.slice(1)] = 
                Array.isArray(value) ? [...value] : {...value};
        }
        this.previousData = snapshot;
        try {
            localStorage.setItem('previousDataSnapshot', JSON.stringify(snapshot));
        } catch (e) {
            console.warn('Could not save snapshot:', e);
        }
    },
    
    clearHistory() {
        localStorage.removeItem('previousDataSnapshot');
        this.previousData = {};
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // REFRESH
    // ═══════════════════════════════════════════════════════════════════════════
    
    async refresh() {
        this.cacheBust = Date.now();
        return this.loadAll();
    }
};
