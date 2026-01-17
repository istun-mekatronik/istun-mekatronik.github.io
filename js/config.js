// ╔════════════════════════════════════════════════════════════════════════════╗
// ║  İSTUN WEBSITE CONFIGURATION                                               ║
// ║  Edit this file to configure data sources and site settings                ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const CONFIG = {
    // ═══════════════════════════════════════════════════════════════════════════
    // OPTION A: SINGLE SHEET (Recommended for small teams)
    // All tabs in one Google Sheet, use protected ranges for sensitive tabs
    // ═══════════════════════════════════════════════════════════════════════════
    
    mode: 'single', // 'single' or 'multi'
    
    // Your main Google Sheet ID (found in URL after /d/)
    sheetId: '1MrgcCLRlEUTGaKUI62GcdmlIRqPPwfETx6AREZzpGKI',
    
    // Tab names (must match exactly your Google Sheet tab names)
    tabs: {
        settings: 'Settings',
        news: 'News',
        events: 'Events',
        faculty: 'Faculty',
        research: 'Research',
        publications: 'Publications',
        courses: 'Courses',
        projects: 'Projects',
        labs: 'Labs',
        jobs: 'Jobs',
        alumni: 'Alumni',
        partners: 'Partners',
        students: 'Students'
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // OPTION B: MULTIPLE SHEETS (For larger teams with role-based access)
    // Uncomment and configure if you need separate sheets per department
    // ═══════════════════════════════════════════════════════════════════════════
    
    /*
    mode: 'multi',
    
    sheets: {
        core: {
            id: 'SHEET_ID_FOR_ADMIN_ONLY',
            tabs: ['Settings', 'Partners'],
            description: 'Core settings - Admin only'
        },
        academic: {
            id: 'SHEET_ID_FOR_FACULTY',
            tabs: ['Faculty', 'Research', 'Publications', 'Courses'],
            description: 'Academic content - Faculty can edit'
        },
        students: {
            id: 'SHEET_ID_FOR_STUDENT_AFFAIRS',
            tabs: ['Students', 'Projects', 'Alumni'],
            description: 'Student content - Student Affairs can edit'
        },
        communications: {
            id: 'SHEET_ID_FOR_PR_TEAM',
            tabs: ['News', 'Events', 'Jobs', 'Labs'],
            description: 'Communications - PR team can edit'
        }
    },
    */

    // ═══════════════════════════════════════════════════════════════════════════
    // SITE SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════
    
    site: {
        name: 'İSTUN Mechatronics Engineering',
        defaultLang: 'en',
        supportedLangs: ['en', 'tr'],
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ADMIN SETTINGS
    // ═══════════════════════════════════════════════════════════════════════════
    
    admin: {
        // How to access admin panel (hidden from regular users)
        accessMethods: {
            urlHash: '#admin',           // Add #admin to URL
            keyboard: 'Ctrl+Shift+A'     // Keyboard shortcut
        },
        // Note: Real security comes from Google Sheet permissions
        // This just hides the admin UI from casual visitors
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE DEFINITIONS
    // Which tabs each page needs
    // ═══════════════════════════════════════════════════════════════════════════
    
    pages: {
        home: {
            file: 'pages/home.html',
            requires: ['settings', 'news', 'events', 'research', 'projects', 'partners'],
            nav: { en: 'Home', tr: 'Ana Sayfa', icon: 'fa-house' }
        },
        about: {
            file: 'pages/about.html',
            requires: ['settings'],
            nav: { en: 'About', tr: 'Hakkında', icon: 'fa-landmark' }
        },
        news: {
            file: 'pages/news.html',
            requires: ['news', 'events'],
            nav: { en: 'News', tr: 'Haberler', icon: 'fa-newspaper', badge: 'news' }
        },
        research: {
            file: 'pages/research.html',
            requires: ['research', 'faculty'],
            nav: { en: 'Research', tr: 'Araştırma', icon: 'fa-flask' }
        },
        publications: {
            file: 'pages/publications.html',
            requires: ['publications'],
            nav: { en: 'Publications', tr: 'Yayınlar', icon: 'fa-book' }
        },
        labs: {
            file: 'pages/labs.html',
            requires: ['labs'],
            nav: { en: 'Labs', tr: 'Lablar', icon: 'fa-microscope' }
        },
        faculty: {
            file: 'pages/faculty.html',
            requires: ['faculty', 'publications', 'courses', 'research', 'students', 'projects'],
            nav: { en: 'Faculty', tr: 'Akademisyenler', icon: 'fa-users' }
        },
        students: {
            file: 'pages/students.html',
            requires: ['students'],
            nav: { en: 'Students', tr: 'Öğrenciler', icon: 'fa-user-graduate' }
        },
        alumni: {
            file: 'pages/alumni.html',
            requires: ['alumni', 'settings'],
            nav: { en: 'Alumni', tr: 'Mezunlar', icon: 'fa-medal' }
        },
        projects: {
            file: 'pages/projects.html',
            requires: ['projects'],
            nav: { en: 'Projects', tr: 'Projeler', icon: 'fa-diagram-project' }
        },
        courses: {
            file: 'pages/courses.html',
            requires: ['courses'],
            nav: { en: 'Courses', tr: 'Dersler', icon: 'fa-book-open' }
        },
        jobs: {
            file: 'pages/jobs.html',
            requires: ['jobs'],
            nav: { en: 'Jobs', tr: 'İş İlanları', icon: 'fa-briefcase', badge: 'jobs' }
        },
        partners: {
            file: 'pages/partners.html',
            requires: ['partners'],
            nav: { en: 'Partners', tr: 'Ortaklar', icon: 'fa-handshake' }
        },
        contact: {
            file: 'pages/contact.html',
            requires: ['settings'],
            nav: { en: 'Contact', tr: 'İletişim', icon: 'fa-envelope' }
        },
        
        // Detail pages (no nav entry - accessed via links)
        'news-detail': {
            file: 'pages/news-detail.html',
            requires: ['news'],
            nav: null
        },
        'event-detail': {
            file: 'pages/event-detail.html',
            requires: ['events'],
            nav: null
        },
        'project-detail': {
            file: 'pages/project-detail.html',
            requires: ['projects'],
            nav: null
        },
        'lab-detail': {
            file: 'pages/lab-detail.html',
            requires: ['labs'],
            nav: null
        },
        'research-detail': {
            file: 'pages/research-detail.html',
            requires: ['research'],
            nav: null
        },
        'job-detail': {
            file: 'pages/job-detail.html',
            requires: ['jobs'],
            nav: null
        },
        'profile': {
            file: 'pages/profile.html',
            requires: ['faculty', 'publications', 'courses', 'research', 'students', 'projects'],
            nav: null
        }
    },

    // Navigation sections for sidebar
    navSections: [
        { title: { en: 'Overview', tr: 'Genel' }, pages: ['home', 'about', 'news'] },
        { title: { en: 'Research', tr: 'Araştırma' }, pages: ['research', 'publications', 'labs'] },
        { title: { en: 'People', tr: 'Kişiler' }, pages: ['faculty', 'students', 'alumni'] },
        { title: { en: 'Academics', tr: 'Akademik' }, pages: ['projects', 'courses'] },
        { title: { en: 'Resources', tr: 'Kaynaklar' }, pages: ['jobs', 'partners', 'contact'] }
    ]
};

// Helper to get sheet URL for a tab
function getSheetURL(tabName, cacheBust = Date.now()) {
    if (CONFIG.mode === 'single') {
        return `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&cb=${cacheBust}`;
    } else {
        // Multi-sheet mode: find which sheet contains this tab
        for (const [key, sheet] of Object.entries(CONFIG.sheets)) {
            if (sheet.tabs.includes(tabName)) {
                return `https://docs.google.com/spreadsheets/d/${sheet.id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&cb=${cacheBust}`;
            }
        }
        console.error(`Tab "${tabName}" not found in any sheet configuration`);
        return null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getSheetURL };
}
