// Removed Firebase Imports
// Using PHP/MySQL API
const API_URL = 'api/get_news.php';




// --- THEME ENGINE ---
window.toggleTheme = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('vadiTheme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('.theme-toggle-btn i');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
};

function applyTheme() {
    const isDark = localStorage.getItem('vadiTheme') === 'dark';

    if (isDark) {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.theme-toggle-btn i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

// --- GLOBAL VARIABLES ---
let allNewsData = [];
let currentCategory = 'all';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    setupSearch();
    checkUrlHash(); // Check for article ID in URL
});

// --- DATA LOADING ---
async function loadAllData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allNewsData = data;
        // Load Ads
        try {
            const adRes = await fetch('api/get_ads.php');
            const adData = await adRes.json();
            if (adData) renderAds(adData);
        } catch (e) { console.log("Ad load error", e); }

        // Initial Render
        // Fix Date Issue (Backend sends created_at, Frontend uses date)
        allNewsData = allNewsData.map(item => ({
            ...item,
            date: item.created_at || item.date // Fallback
        }));

        renderHomeLayout();
        renderTicker();
        renderSidebarWidgets();

    } catch (e) {
        console.error("Load error", e);
        document.getElementById('hero-grid').innerHTML = `<p style="color:red; text-align:center; padding:20px;">Error loading news. Please refresh.<br><small>${e.message}</small></p>`;
    }
}

// --- RENDERING CONTROLLERS ---

function renderHomeLayout() {
    // 1. Reset Visibility
    document.getElementById('hero-section').style.display = 'block';

    // 2. Render Hero (Top 3)
    // Priority: Type='hero' -> Type='breaking' -> Recent
    let heroes = allNewsData.filter(n => n.type === 'hero');
    if (heroes.length < 3) {
        const others = allNewsData.filter(n => n.type !== 'hero' && n.img).slice(0, 3 - heroes.length);
        heroes = [...heroes, ...others];
    }
    renderHeroGrid(heroes);

    // 3. Render J&K Section (Grid)
    const jkNews = allNewsData.filter(n => n.category === 'J & K' || n.category === 'Kashmir').slice(0, 4);
    renderGridSection('cat-jk-grid', jkNews);

    // 4. Render Nation Section (List)
    const nationNews = allNewsData.filter(n => n.category === 'Nation' || n.category === 'India').slice(0, 5);
    renderListSection('cat-nation-list', nationNews);

    // 5. Render Sports Section (Scroll)
    const sportsNews = allNewsData.filter(n => n.category === 'Sports').slice(0, 6);
    renderScrollSection('cat-sports-scroll', sportsNews);

    // 6. Big Picture (Visual)
    const visualNews = allNewsData.find(n => n.img && n.category !== 'Videos' && !heroes.includes(n));
    if (visualNews) {
        document.getElementById('big-picture-slot').innerHTML = `
            <div class="article-card" onclick='openArticlePage(${safeJSON(visualNews)})' style="position:relative; height:300px; border:none; cursor:pointer;">
                <img src="${visualNews.img}" style="width:100%; height:100%; object-fit:cover; filter:brightness(0.7);">
                <div style="position:absolute; bottom:20px; left:20px; color:white; text-shadow:0 2px 4px rgba(0,0,0,0.8);">
                    <span style="background:var(--primary); padding:4px 8px; font-weight:700; font-size:0.7rem; margin-bottom:10px; display:inline-block;">IN PICTURES</span>
                    <h2 style="font-family:var(--font-heading); font-size:1.8rem; margin:0;">${visualNews.title}</h2>
                </div>
            </div>
        `;
    }


}

// Reuse for Category Switching
window.filterByCategory = (category) => {
    // Active State
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    // Find link matching category (approximate)
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    const activeLink = links.find(a => a.innerText.includes(category) || (category === 'all' && a.innerText.includes('Home')));
    if (activeLink) activeLink.classList.add('active');

    // Logic
    if (category === 'all') {
        const feedCol = document.querySelector('.news-feed-column');
        // Restore Home HTML Structure if needed (simplified: just reload clean structure or re-render)
        // Since we modified innerHTML of feed-column in category view, we need to revert.
        // Easiest is to reload page or rebuild DOM. For SPA seamlessly:
        location.reload(); // Simplest way to restore complex layout grid without managing state of deleted DOM elements.
        return;
    }

    // Hide Home Specifics
    document.getElementById('hero-section').style.display = 'none';
    document.getElementById('video-section').style.display = 'none';

    // Filter Data
    const filtered = allNewsData.filter(n => n.category === category || (category === 'Videos' && n.hasVideo));

    const feedCol = document.querySelector('.news-feed-column');
    feedCol.innerHTML = `
        <div class="category-block">
            <div class="section-header">
                <h2>${category + ' News'}</h2>
            </div>
             <div class="category-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                ${filtered.length ? filtered.map(item => `
                    <div class="article-card" onclick='openArticlePage(${safeJSON(item)})'>
                        <div class="card-img">
                            <img src="${item.img}" loading="lazy">
                            <span class="card-tag">${item.category || 'News'}</span>
                        </div>
                        <div class="card-body">
                            <div class="card-meta">📅 ${item.date || 'Recent'}</div>
                            <h3 class="card-title">${item.title}</h3>
                            <div class="card-excerpt">${item.summary || item.desc?.substring(0, 80) + '...'}</div>
                        </div>
                    </div>
                `).join('') : '<p>No news found in this category.</p>'}
             </div>
        </div>
    `;
    window.scrollTo(0, 0);
};


// --- COMPONENT RENDERERS ---

function renderHeroGrid(items) {
    const container = document.getElementById('hero-grid');
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px;"><h3>No news found.</h3><p>Please log in to the admin panel and add simple news items to get started.</p></div>';
        return;
    }

    let html = '';
    // Main Story (Big Left)
    if (items[0]) {
        html += `
        <div class="hero-item hero-main-cell main-story" onclick='openArticlePage(${safeJSON(items[0])})'>
            <img src="${items[0].img}">
            <span class="hero-tag">TOP STORY</span>
            <div class="overlay">
                <h2>${items[0].title}</h2>
                <p style="font-size:0.9rem; opacity:0.9; margin-top:5px;">${items[0].summary || items[0].desc?.substring(0, 100)}...</p>
            </div>
        </div>`;
    }
    // Sub Stories (Right Stack)
    if (items[1]) {
        html += `
        <div class="hero-item hero-sub-cell" onclick='openArticlePage(${safeJSON(items[1])})'>
            <img src="${items[1].img}">
            <div class="overlay"><h2>${items[1].title}</h2></div>
        </div>`;
    }
    if (items[2]) {
        html += `
        <div class="hero-item hero-sub-cell" onclick='openArticlePage(${safeJSON(items[2])})'>
            <img src="${items[2].img}">
            <div class="overlay"><h2>${items[2].title}</h2></div>
        </div>`;
    }
    container.innerHTML = html;
}

function renderGridSection(id, items) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = items.map(item => `
            <div class="article-card" onclick='openArticlePage(${safeJSON(item)})'>
                <div class="card-img">
                    <img src="${item.img}" loading="lazy">
                     <span class="card-tag">${item.category || 'News'}</span>
                </div>
                <div class="card-body">
                    <div class="card-meta">📅 ${item.date || 'Just Now'}</div>
                    <h3 class="card-title">${item.title}</h3>
                </div>
            </div>
        `).join('');
    }
}

function renderListSection(id, items) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = items.map(item => `
            <div class="list-item" onclick='openArticlePage(${safeJSON(item)})'>
                <img src="${item.img}" loading="lazy">
                <div class="list-content">
                    <h3>${item.title}</h3>
                    <span>${item.date || 'Recent'} • ✍️ ${item.author || 'Admin'}</span>
                </div>
            </div>
        `).join('');
    }
}

function renderScrollSection(id, items) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = items.map(item => `
            <div class="scroll-card article-card" onclick='openArticlePage(${safeJSON(item)})'>
                <div class="card-img"><img src="${item.img}" loading="lazy"></div>
                <div class="card-body">
                    <h3 class="card-title" style="font-size:1rem;">${item.title}</h3>
                </div>
            </div>
        `).join('');
    }
}



function renderTicker() {
    const el = document.getElementById('breaking-ticker');
    if (el) {
        const breaking = allNewsData.filter(n => n.type === 'breaking' || n.category === 'Updates');
        if (breaking.length > 0) {
            el.innerHTML = breaking.map(n => `🔴 ${n.title}`).join(" &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; ");
        } else {
            el.innerHTML = "Welcome to Vadi E Kashmir — Your Source for Truth.";
        }
    }
}

function renderSidebarWidgets() {
    // Trending Tab
    const trending = allNewsData.filter(n => n.isTrending).slice(0, 5);
    const container = document.getElementById('sidebar-tab-content');
    if (container) {
        container.innerHTML = trending.map((item, i) => `
            <div class="mini-list-item" onclick='openArticlePage(${safeJSON(item)})'>
                <div class="mini-count">${i + 1}</div>
                <div class="mini-title">${item.title}</div>
            </div>
        `).join('');
    }

    // Daily Awareness
    const quotes = [
        "The best way to verify a news is to wait.",
        "Truth is rare, rumor is common.",
        "Think before you share.",
        "Your voice matters.",
        "Peace is the ultimate goal."
    ];
    document.getElementById('daily-quote').innerText = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
}

// --- ADS & HELPERS ---

function renderAds(adData) {
    const headerAd = document.getElementById('header-ad');
    const sidebarAd = document.getElementById('sidebar-ad-slot');

    const adHTML = `<a href="${adData.link || '#'}" target="_blank"><img src="${adData.img}" style="width:100%; height:100%; object-fit:cover;"></a>`;

    if (headerAd && adData.img) headerAd.innerHTML = adHTML;
    if (sidebarAd && adData.img) sidebarAd.innerHTML = adHTML;
}

function safeJSON(item) {
    if (!item) return "{}";
    return JSON.stringify(item).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}


// --- ARTICLE VIEW (Overlay) ---

window.openArticlePage = (item) => {
    // Update Meta
    document.title = item.title + " | Vadi E Kashmir";

    const overlay = document.getElementById('article-page-view');
    overlay.style.display = 'block';

    // Generate Body with Smart Image Injection
    const lines = (item.desc || item.summary || "").split('\n');
    let formattedBody = "";
    let gallery = item.gallery || [];
    let gIndex = 0;

    // Logic: Inject an image every 3 paragraphs
    lines.forEach((line, idx) => {
        if (line.trim().length > 0) formattedBody += `<p>${line}</p>`;

        if (gIndex < gallery.length && (idx + 1) % 3 === 0) {
            formattedBody += `<div class="article-body-image"><img src="${gallery[gIndex]}"></div>`;
            gIndex++;
        }
    });

    // Append remaining images at bottom
    if (gIndex < gallery.length) {
        formattedBody += `<div class="article-bottom-grid">`;
        while (gIndex < gallery.length) {
            formattedBody += `<div class="grid-image-item"><img src="${gallery[gIndex]}"></div>`;
            gIndex++;
        }
        formattedBody += `</div>`;
    }

    const wrapper = document.getElementById('article-content-wrapper');
    wrapper.innerHTML = `
        <img src="${item.img}" class="art-head-img">
        <h1 class="art-title">${item.title}</h1>
        <div class="art-meta">
            <span>✍️ ${item.author || "Admin"}</span>
            <span style="margin:0 10px">•</span>
            <span>📅 ${item.date || "Today"}</span>
            <span style="margin:0 10px">•</span>
            <span>📂 ${item.category}</span>
        </div>
        <div class="art-body">${formattedBody}</div>
        <div style="margin-top:40px; border-top:1px solid #eee; padding-top:20px;">
            <button onclick="shareArticle('${item.title.replace(/'/g, "\\'")}', '${item.img}')" 
                style="background:#25d366; color:white; border:none; padding:10px 20px; border-radius:30px;">
                <i class="fab fa-whatsapp"></i> Share this News
            </button>
        </div>
    `;

    document.body.style.overflow = 'hidden'; // Stop background scrolling
};

window.closeArticle = () => {
    document.getElementById('article-page-view').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.title = "Vadi E Kashmir | Your Trusted News Source";
};

window.shareArticle = async (title, url) => {
    const shareText = `*${title.toUpperCase()}*\n\nRead more at:\nhttps://vediekashmir.vercel.app\n\n_Vadi-E-Kashmir_`;
    try {
        await navigator.clipboard.writeText(shareText);
        alert("Link copied! Open WhatsApp to paste.");
        window.open('https://wa.me/');
    } catch (e) {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
    }
};


// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadAllData();
    applyTheme();

    // Search Listener
    const searchInput = document.getElementById('navSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const term = e.target.value.toLowerCase();
                const matched = allNewsData.filter(n => n.title.toLowerCase().includes(term));
                // Hijack Main Column for Search Results
                const feedCol = document.querySelector('.news-feed-column');
                document.getElementById('hero-section').style.display = 'none';
                feedCol.innerHTML = `
                    <div class="category-block"><div class="section-header"><h2>Search: "${term}"</h2></div>
                    <div class="list-layout">
                        ${matched.map(item => `
                            <div class="list-item" onclick='openArticlePage(${safeJSON(item)})'>
                                <img src="${item.img}">
                                <div class="list-content"><h3>${item.title}</h3></div>
                            </div>
                        `).join('')}
                    </div></div>`;
            }
        });
    }
});
