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

// --- HASH ROUTING SYSTEM ---
window.checkUrlHash = () => {
    const hash = window.location.hash;
    console.log("Routing Hash:", hash);
    if (hash === '#about') {
        showAboutUs();
    } else if (hash.startsWith('#article=')) {
        const artId = hash.split('=')[1];
        openArticlePage(artId);
    }
};

window.addEventListener('hashchange', checkUrlHash);

// --- DATA LOADING ---
async function loadAllData() {
    try {
        // Add cache busting to prevent stale data on Vercel
        const response = await fetch(API_URL + '?_=' + new Date().getTime());
        const data = await response.json();

        // Guard: API may return an error object instead of an array
        if (!Array.isArray(data)) {
            throw new Error(data.error || 'API did not return an array. Check server logs.');
        }

        allNewsData = data;

        // Load Ads
        try {
            const adRes = await fetch('api/get_ads.php');
            const adData = await adRes.json();
            if (adData) renderAds(adData);
        } catch (e) { console.log("Ad load error", e); }

        // date field already mapped in PHP, but keep fallback
        allNewsData = allNewsData.map(item => ({
            ...item,
            date: item.date || item.created_at || 'Recent'
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
            <div class="article-card" onclick='openArticlePage(${articleId(visualNews)})' style="position:relative; height:300px; border:none; cursor:pointer;">
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

    // Reset hash if it is not a specific article hash
    if (window.location.hash && !window.location.hash.startsWith('#article=')) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }

    // Logic
    if (category === 'all') {
        window.location.hash = ''; // Clear hash!
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
                    <div class="article-card" onclick='openArticlePage(${articleId(item)})'>
                        <div class="card-img">
                            <img src="${item.img}" loading="lazy">
                            <span class="card-tag">${item.category || 'News'}</span>
                        </div>
                        <div class="card-body">
                            <div class="card-meta">📅 ${item.date || 'Recent'}</div>
                            <h3 class="card-title">${item.title}</h3>
                            <div class="card-excerpt">${item.summary || ''}</div>
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
        <div class="hero-item hero-main-cell main-story" onclick='openArticlePage(${articleId(items[0])})' style="cursor:pointer">
            <img src="${items[0].img}">
            <span class="hero-tag">TOP STORY</span>
            <div class="overlay">
                <h2>${items[0].title}</h2>
                <p style="font-size:0.9rem; opacity:0.9; margin-top:5px;">${items[0].summary || ''}...</p>
            </div>
        </div>`;
    }
    // Sub Stories (Right Stack)
    if (items[1]) {
        html += `
        <div class="hero-item hero-sub-cell" onclick='openArticlePage(${articleId(items[1])})'>
            <img src="${items[1].img}">
            <div class="overlay"><h2>${items[1].title}</h2></div>
        </div>`;
    }
    if (items[2]) {
        html += `
        <div class="hero-item hero-sub-cell" onclick='openArticlePage(${articleId(items[2])})'>
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
            <div class="article-card" onclick='openArticlePage(${articleId(item)})'>
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
            <div class="list-item" onclick='openArticlePage(${articleId(item)})'>
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
            <div class="scroll-card article-card" onclick='openArticlePage(${articleId(item)})'>
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
        // Debugging: Log what we are trying to render
        const breaking = allNewsData.filter(n => (n.type === 'breaking' || n.category === 'breaking' || n.category === 'Updates'));
        console.log("Ticker Items Found:", breaking);

        if (breaking.length > 0) {
            el.innerHTML = breaking.map(n => `🔴 ${n.title}`).join("&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;");
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
            <div class="mini-list-item" onclick='openArticlePage(${articleId(item)})'>
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

// Helper: pass just the article ID to openArticlePage for lightweight onclick
function articleId(item) {
    return item && item.id ? item.id : 0;
}


// --- ARTICLE VIEW (Overlay) ---

window.openArticlePage = async (itemOrId) => {
    // itemOrId may be a small metadata object (from feed) or a full object
    const id = typeof itemOrId === 'object' ? itemOrId.id : itemOrId;

    // Show overlay with a loading spinner immediately
    const overlay = document.getElementById('article-page-view');
    const wrapper = document.getElementById('article-content-wrapper');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    wrapper.innerHTML = '<div style="text-align:center;padding:60px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading article...</p></div>';

    try {
        const res = await fetch(`/api/get_article.php?id=${id}`);
        if (!res.ok) throw new Error('Failed to load article');
        const item = await res.json();

        // Update Meta
        document.title = item.title + " | Vadi E Kashmir";

        // Generate Body with Smart Image Injection
        let formattedBody = "";
        if (item.category === 'Article' || item.category === 'Awareness') {
            // Native HTML formatting for rich text
            formattedBody = `<div class="ql-editor">${item.desc || item.summary || ""}</div>`;
        } else {
            const lines = (item.desc || item.summary || "").split('\n');
            let gallery = item.gallery || [];
            let gIndex = 0;

            lines.forEach((line, idx) => {
                if (line.trim().length > 0) formattedBody += `<p>${line}</p>`;

                if (gIndex < gallery.length && (idx + 1) % 3 === 0) {
                    formattedBody += `<div class="article-body-image"><img src="${gallery[gIndex]}"></div>`;
                    gIndex++;
                }
            });

            if (gIndex < gallery.length) {
                formattedBody += `<div class="article-bottom-grid">`;
                while (gIndex < gallery.length) {
                    formattedBody += `<div class="grid-image-item"><img src="${gallery[gIndex]}"></div>`;
                    gIndex++;
                }
                formattedBody += `</div>`;
            }
        }

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
            <div data-html2canvas-ignore="true" style="margin-top:40px; border-top:1px solid #eee; padding-top:20px; display:flex; flex-wrap:wrap; gap:12px;">
                <button onclick="shareArticle('${item.title.replace(/'/g, "\\'")}', '${item.id}')" 
                    style="background:#25d366; color:white; border:none; padding:12px 24px; border-radius:30px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; transition:0.2s;">
                    <i class="fab fa-whatsapp"></i> Share on WhatsApp
                </button>
                <button onclick="downloadPDF('${item.title.replace(/'/g, "\\'")}')" 
                    style="background:#b91c1c; color:white; border:none; padding:12px 24px; border-radius:30px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; transition:0.2s;">
                    <i class="fas fa-file-pdf"></i> Share as PDF
                </button>
            </div>
        `;

    } catch (e) {
        wrapper.innerHTML = `<p style="color:red;text-align:center;padding:40px;">Failed to load article. Please try again.<br><small>${e.message}</small></p>`;
    }
};

window.closeArticle = () => {
    document.getElementById('article-page-view').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.title = "Vadi E Kashmir | Your Trusted News Source";
};

window.downloadPDF = async (title) => {
    // If no title provided, try to find it in the DOM
    if (!title) {
        const titleEl = document.querySelector('.art-title');
        title = titleEl ? titleEl.innerText : 'Article';
    }

    const element = document.getElementById('pdf-container-element');
    const brandNode = document.getElementById('pdf-brand-branding');
    
    // 1. Prepare for Newspaper Look
    brandNode.style.display = 'block';
    element.classList.add('is-generating-pdf'); // Triggers justified text in CSS

    // Fill date stamp
    const dateStamp = document.getElementById('pdf-date-stamp');
    if (dateStamp) {
        const now = new Date();
        dateStamp.innerText = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const opt = {
        margin:       [0.5, 0.5],
        filename:     `${title.substring(0, 50)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
        // Ensure all images are loaded
        const images = element.querySelectorAll('img');
        const promises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        });
        await Promise.all(promises);

        // Standardize image page breaks
        images.forEach(img => img.style.pageBreakInside = 'avoid');

        // 2. Generate PDF
        const worker = html2pdf().set(opt).from(element);

        // Check if we should SHARE or DOWNLOAD
        if (navigator.share && navigator.canShare) {
            const pdfBlob = await worker.output('blob');
            const pdfFile = new File([pdfBlob], opt.filename, { type: 'application/pdf' });

            if (navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    files: [pdfFile],
                    title: title,
                    text: 'Check out this article from Vadi E Kashmir'
                });
            } else {
                await worker.save();
            }
        } else {
            await worker.save();
        }

    } catch (err) {
        console.error("PDF Export/Share Error:", err);
        // Fallback to simple save if share fails
        try { await html2pdf().set(opt).from(element).save(); } catch(e) {}
    } finally {
        // Cleanup
        brandNode.style.display = 'none';
        element.classList.remove('is-generating-pdf');
    }
};

window.shareArticle = async (title, id) => {
    // New Share URL with Preview Support
    const shareUrl = `https://vediekashmir.vercel.app/news/${id}`;

    const shareText = `*${title.toUpperCase()}*\n\nRead full story:\n${shareUrl}\n\nTeam Vadi-E-Kashmir`;

    try {
        // Try native share if on mobile
        if (navigator.share) {
            await navigator.share({
                title: title,
                text: shareText,
                url: shareUrl
            });
        } else {
            throw new Error("No native share");
        }
    } catch (e) {
        // Fallback to WhatsApp
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
    }
};


// About Us Renderer
window.showAboutUs = () => {
    // Set active link in nav
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    const aboutLink = Array.from(document.querySelectorAll('.nav-links a')).find(a => a.innerText.includes('About'));
    if (aboutLink) aboutLink.classList.add('active');

    // Hide Home specific elements
    document.getElementById('hero-section').style.display = 'none';
    const videoSec = document.getElementById('video-section');
    if (videoSec) videoSec.style.display = 'none';

    // Update main feed column
    const feedCol = document.querySelector('.news-feed-column');
    if (feedCol) {
        feedCol.innerHTML = `
            <div class="about-container">
                <div class="about-header-3d">
                    <h2>About Us</h2>
                    <p class="about-subtitle">The Voice of the Valley</p>
                </div>
                
                <div class="vision-card-3d">
                    <h3>Our Vision</h3>
                    <p>Vadi E Kashmir was founded to provide transparent, accurate, and unbiased journalism from the heart of Jammu & Kashmir. We aim to amplify the voices of the valley, bridging the gap between local narratives and the global stage. Our commitment is to truth, integrity, and journalistic excellence.</p>
                </div>

                <div class="team-section">
                    <h3>Our Team</h3>
                    <div class="team-grid-3d">
                        <!-- Faisal Khan -->
                        <div class="member-card-3d founder-card">
                            <div class="member-avatar">
                                <img src="images/founder.jpeg" alt="Faisal Khan" style="display: none;" onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';" onerror="this.style.display='none';">
                                <div class="fallback-icon">
                                    <i class="fas fa-user-tie"></i>
                                </div>
                            </div>
                            <h4>Faisal Khan</h4>
                            <span class="member-role role-founder">Founder & Editor-in-Chief</span>
                            <p class="member-bio">I am currently pursuing a degree in Automobile Engineering in Srinagar, Kashmir. I completed my Class 10 education from RANA Army Goodwill School, Hajin, and my Class 12 education from Government Higher Secondary School, Hajin. Recently, I was honored with an award by Youth Inspiration and a filmmaker, presented by a senior Army officer in recognition of my contributions to society. Although I am not a professional journalist, I have actively highlighted public grievances and community concerns with the support and cooperation of the local administration, contributing to positive community engagement and public welfare.</p>
                            <div class="member-socials">
                                <a href="https://x.com/MrFaisalPathan1" target="_blank"><i class="fab fa-twitter"></i></a>
                                <a href="https://www.instagram.com/faisukhan2620?igsh=MXhyMnY5bHB0ZjRnYg==" target="_blank"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>

                        <!-- Mohammad Asrar -->
                        <div class="member-card-3d developer-card">
                            <div class="member-avatar">
                                <img src="images/Asrar.png" alt="Mohammad Asrar" style="display: none;" onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';" onerror="this.style.display='none';">
                                <div class="fallback-icon">
                                    <i class="fas fa-code"></i>
                                </div>
                            </div>
                            <h4>Mohammad Asrar</h4>
                            <span class="member-role role-dev">Lead Developer & Designer</span>
                            <p class="member-bio">I am Mohammad Asrar ul Haque Ahanger, a developer from Kashmir who believes in using technology, innovation, and knowledge to contribute to society. My vision is to showcase the talent, creativity, and potential of Kashmir through meaningful work, inspire positive change, and help build a brighter future for the next generation.</p>
                            <div class="member-socials">
                                <a href="haqasrar264@gmail.com"><i class="fas fa-envelope"></i></a>
                                <a href="tel:+916005136257"><i class="fas fa-phone"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    window.scrollTo(0, 0);
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadAllData();
    applyTheme();
    checkUrlHash(); // Route to appropriate page based on hash

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
                            <div class="list-item" onclick='openArticlePage(${articleId(item)})'>
                                <img src="${item.img}">
                                <div class="list-content"><h3>${item.title}</h3></div>
                            </div>
                        `).join('')}
                    </div></div>`;
            }
        });
    }
});
