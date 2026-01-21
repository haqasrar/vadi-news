import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAj1lPZymdb6jSPrf8ZSfBIIlvc-7JqLho",
    authDomain: "vadi-e-kashmir.firebaseapp.com",
    projectId: "vadi-e-kashmir",
    storageBucket: "vadi-e-kashmir.firebasestorage.app",
    messagingSenderId: "330323093016",
    appId: "1:330323093016:web:a4204fac189bf119b5c56d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allNewsData = [];

// --- THEME ENGINE ---
window.toggleTheme = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('vadiTheme', isDark ? 'dark' : 'light');
    applyTheme();
};

function applyTheme() {
    const isDark = localStorage.getItem('vadiTheme') === 'dark';
    if (isDark) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    const icon = document.querySelector('.theme-btn i');
    if(icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

// --- DATA LOADING ---
async function loadAllData() {
    try {
        // Fetch News
        const querySnapshot = await getDocs(query(collection(db, "news"), orderBy("id", "desc")));
        allNewsData = querySnapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
        
        // 1. FIXED: Fetch advertisement from settings/ads document
        const adDocRef = doc(db, "settings", "ads");
        const adDocSnap = await getDoc(adDocRef);

        renderNews('all');
        renderTrending(); 
        
        // 2. Render ad data if the document exists
        if (adDocSnap.exists()) {
            renderAds(adDocSnap.data()); 
        }
    } catch (e) { console.error("Firebase load error", e); }
}

// --- RENDER TRENDING (Top 5 ranks) ---
function renderTrending() {
    const tl = document.getElementById('trending-list');
    if (!tl) return;
    tl.innerHTML = "";

    // Filter news marked as trending in Firebase
    const trendingNews = allNewsData.filter(n => n.isTrending === true).slice(0, 5);

    trendingNews.forEach((n, index) => {
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        tl.innerHTML += `
            <li class="trending-item" onclick='openArticlePage(${safe})'>
                <span class="trending-rank">0${index + 1}</span>
                <div class="trending-text">${n.title}</div>
            </li>`;
    });
}

// --- RENDER ADS (Using img, link, and bio fields) ---
function renderAds(adData) {
    const adSlot = document.getElementById('ad-slot');
    if (!adSlot || !adData) return;
    
    // 3. Dynamic mapping from Firebase fields
    adSlot.innerHTML = `
        <a href="${adData.link || '#'}" target="_blank" title="${adData.bio || ''}">
            <img src="${adData.img}" alt="Advertisement" style="width:100%; height:auto; display:block; object-fit:cover;">
        </a>`;
}

// --- MAIN RENDERING LOGIC ---
function renderNews(category) {
    const hm = document.getElementById('hero-main'), 
          ng = document.getElementById('news-grid'),
          ticker = document.getElementById('ticker-box');

    hm.innerHTML = ""; ng.innerHTML = "";

    // Ticker logic (Updates or Breaking)
    const tickerNews = allNewsData.filter(n => n.type === 'breaking' || n.category === 'Updates');
    if(ticker) ticker.innerHTML = tickerNews.length > 0 
        ? tickerNews.map(n => `🔴 ${n.title}`).join(" &nbsp;&nbsp;&nbsp;&nbsp; ")
        : "Welcome to Vadi E Kashmir";

    // Feed logic
    const feedNews = allNewsData.filter(n => n.type !== 'breaking' && n.category !== 'Updates');
    const filtered = category === 'all' ? feedNews : feedNews.filter(n => n.category === category);

    // Hero Section (Top Story)
    if (category === 'all' && filtered.length > 0) {
        const top = filtered[0];
        const safe = JSON.stringify(top).replace(/'/g, "&#39;");
        hm.innerHTML = `
            <div class="hero-card" onclick='openArticlePage(${safe})'>
                <img src="${top.img}" style="width:100%; height:400px; object-fit:cover;">
                <div class="overlay">
                    <span class="writer-top">✍️ ${top.author || "Vadi News"}</span>
                    <h2>${top.title}</h2>
                </div>
            </div>`;
    }

    // Grid News (Dynamic Author and Date)
    filtered.forEach((n, idx) => {
        if(category === 'all' && idx === 0) return; 
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        
        ng.innerHTML += `
            <div class="news-card-modern" onclick='openArticlePage(${safe})'>
                <div class="card-img-wrap"><img src="${n.img}"><div class="card-tag">${n.category}</div></div>
                <div class="card-content">
                    <div class="writer-under-title">✍️ ${n.author || "Vadi News"}</div>
                    <h3>${n.title}</h3>
                    <div class="card-footer">
                        <span>📅 ${n.date || "Recent"}</span>
                    </div>
                </div>
            </div>`;
    });
}

// --- SEARCH & NAVIGATION ---
window.performSearch = (el) => {
    const term = el.value.toLowerCase();
    const hm = document.getElementById('hero-main');
    if(hm) hm.innerHTML = ""; 
    document.getElementById('feed-title').innerText = `Search results for: "${term}"`;
    
    const feedNews = allNewsData.filter(n => n.type !== 'breaking' && n.category !== 'Updates');
    const filtered = feedNews.filter(n => n.title.toLowerCase().includes(term));
    
    const ng = document.getElementById('news-grid');
    ng.innerHTML = filtered.map(n => {
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        return `
            <div class="news-card-modern" onclick='openArticlePage(${safe})'>
                <div class="card-img-wrap"><img src="${n.img}"><div class="card-tag">${n.category}</div></div>
                <div class="card-content">
                    <div class="writer-under-title">✍️ ${n.author || "Vadi News"}</div>
                    <h3>${n.title}</h3>
                </div>
            </div>`;
    }).join("");
};

window.filterNews = (cat) => {
    window.closeArticle();
    renderNews(cat);
    document.querySelectorAll('nav a').forEach(a => {
        a.classList.remove('active');
        if(a.innerText.includes(cat) || (cat==='all' && a.innerText.includes('Home'))) a.classList.add('active');
    });
};

// --- ARTICLE VIEW ---
window.openArticlePage = (item) => {
    document.getElementById('main-content-area').style.display = 'none';
    const view = document.getElementById('article-page-view');
    view.style.display = 'block';
    applyTheme();
    window.scrollTo(0,0);
    const time = new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', hour12: true});
    document.getElementById('article-container').innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px; padding: 20px;">
            <button onclick="closeArticle()" style="background:none; border:none; color:var(--dark); font-weight:bold; cursor:pointer;">← BACK</button>
            <button style="background:#25D366; color:white; border:none; padding:8px 15px; border-radius:20px; font-weight:bold; cursor:pointer;" 
                onclick="shareNewsManual('${item.title.replace(/'/g, "\\'")}', '${item.fbId}')">WhatsApp SHARE</button>
        </div>
        <div class="article-inner">
            <img src="${item.img}" style="width:100%; border-radius:12px; margin-bottom:20px; max-height:450px; object-fit:cover;">
            <h1>${item.title}</h1>
            <div style="margin: 15px 0; font-size:0.9rem; font-weight:bold; color:var(--primary);">
                <i class="far fa-calendar-alt"></i> ${item.date || ""} | <i class="far fa-clock"></i> ${time} | ✍️ ${item.author || "Vadi News"}
            </div>
            <div class="article-body">${item.desc}</div>
        </div>`;
};

window.closeArticle = () => {
    document.getElementById('article-page-view').style.display = 'none';
    document.getElementById('main-content-area').style.display = 'block';
    applyTheme();
};

window.shareNewsManual = async (title, id) => {
    const link = `https://vadi-news.vercel.app/news/${id}`;
    await navigator.clipboard.writeText(`*${title}*\n\nRead more: ${link}`);
    alert("Link Copied! You can now paste it in WhatsApp.");
};

function generateDailyMessage() {
    const el = document.getElementById('auto-message');
    const msgs = ["🚗 Drive safely.", "💧 Save water.", "🌳 Plant a tree.", "🚭 Stay healthy.", "🚮 Keep clean."];
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    if(el) el.innerHTML = `"${msgs[day % msgs.length]}"`;
}

document.addEventListener("DOMContentLoaded", () => { loadAllData(); generateDailyMessage(); applyTheme(); });