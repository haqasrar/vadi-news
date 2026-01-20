import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// --- DATA & RENDER ---
async function loadAllData() {
    try {
        const querySnapshot = await getDocs(query(collection(db, "news"), orderBy("id", "desc")));
        allNewsData = querySnapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
        renderNews('all');
    } catch (e) { console.error("Firebase load error", e); }
}

function renderNews(category) {
    const hm = document.getElementById('hero-main'), ng = document.getElementById('news-grid'),
          tl = document.getElementById('trending-list'), ticker = document.getElementById('ticker-box');

    hm.innerHTML = ""; ng.innerHTML = ""; if(tl) tl.innerHTML = "";

    const filtered = category === 'all' ? allNewsData : allNewsData.filter(n => n.category === category);
    
    ticker.innerHTML = allNewsData.slice(0, 5).map(n => `🔴 ${n.title}`).join(" &nbsp;&nbsp;&nbsp;&nbsp; ");

    if (category === 'all' && filtered.length > 0) {
        const top = filtered[0];
        const safe = JSON.stringify(top).replace(/'/g, "&#39;");
        hm.innerHTML = `<div class="hero-card" onclick='openArticlePage(${safe})'>
            <img src="${top.img}"><div class="overlay"><h2>${top.title}</h2></div></div>`;
    }

    filtered.forEach((n, idx) => {
        if(category === 'all' && idx === 0) return;
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        if(n.isTrending && tl) tl.innerHTML += `<li onclick='openArticlePage(${safe})' style="cursor:pointer; padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.05);">📈 ${n.title}</li>`;
        
        // FIXED: Now specifically using n.writer and n.date from Firebase
        ng.innerHTML += `
            <div class="news-card-modern" onclick='openArticlePage(${safe})'>
                <div class="card-img-wrap"><img src="${n.img}"><div class="card-tag">${n.category}</div></div>
                <div class="card-content">
                    <h3>${n.title}</h3>
                    <div class="card-footer">
                        <span>✍️ ${n.writer || "Vadi News"}</span>
                        <span>📅 ${n.date || "Recent"}</span>
                    </div>
                </div>
            </div>`;
    });
}

// --- NAVIGATION & SEARCH ---
window.filterNews = (cat) => {
    window.closeArticle();
    renderNews(cat);
    document.querySelectorAll('nav a').forEach(a => {
        a.classList.remove('active');
        if(a.innerText.includes(cat) || (cat==='all' && a.innerText.includes('Home'))) a.classList.add('active');
    });
};

window.performSearch = (el) => {
    const term = el.value.toLowerCase();
    const hm = document.getElementById('hero-main');
    hm.innerHTML = ""; 
    document.getElementById('feed-title').innerText = `Search results for: "${term}"`;
    const filtered = allNewsData.filter(n => n.title.toLowerCase().includes(term));
    renderSearchResults(filtered);
};

function renderSearchResults(results) {
    const ng = document.getElementById('news-grid');
    ng.innerHTML = results.map(n => {
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        return `
            <div class="news-card-modern" onclick='openArticlePage(${safe})'>
                <div class="card-img-wrap"><img src="${n.img}"><div class="card-tag">${n.category}</div></div>
                <div class="card-content">
                    <h3>${n.title}</h3>
                    <div class="card-footer">
                        <span>✍️ ${n.writer || "Vadi News"}</span>
                        <span>📅 ${n.date || "Recent"}</span>
                    </div>
                </div>
            </div>`;
    }).join("");
}

// --- ARTICLE VIEW ---
window.openArticlePage = (item) => {
    document.getElementById('main-content-area').style.display = 'none';
    const view = document.getElementById('article-page-view');
    view.style.display = 'block';
    applyTheme();
    window.scrollTo(0,0);

    const time = new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', hour12: true});

    document.getElementById('article-container').innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <button onclick="closeArticle()" style="background:none; border:none; color:var(--dark); font-weight:bold; cursor:pointer;">← BACK</button>
            <button style="background:#25D366; color:white; border:none; padding:8px 15px; border-radius:20px; font-weight:bold; cursor:pointer;" 
                onclick="shareNewsManual('${item.title.replace(/'/g, "\\'")}', '${item.fbId}')">WhatsApp SHARE</button>
        </div>
        <img src="${item.img}" style="width:100%; border-radius:12px; margin-bottom:20px; max-height:450px; object-fit:cover;">
        <h1>${item.title}</h1>
        <div style="margin: 15px 0; font-size:0.9rem; font-weight:bold; color:var(--primary);">
            <i class="far fa-calendar-alt"></i> ${item.date || ""} | <i class="far fa-clock"></i> ${time} | ✍️ ${item.writer || "Vadi News"}
        </div>
        <div class="article-body">${item.desc}</div>`;
};

window.closeArticle = () => {
    document.getElementById('article-page-view').style.display = 'none';
    document.getElementById('main-content-area').style.display = 'block';
    applyTheme();
};

window.shareNewsManual = async (title, id) => {
    const link = `https://vadi-news.vercel.app/news/${id}`;
    await navigator.clipboard.writeText(`*${title}*\n\nRead more: ${link}`);
    alert("Title & Link copied! Now paste in WhatsApp.");
    window.open('https://wa.me/', '_blank');
};

function generateDailyMessage() {
    const el = document.getElementById('auto-message');
    const msgs = ["🚗 Drive safely.", "💧 Save water.", "🌳 Plant a tree.", "🚭 Stay healthy.", "🚮 Keep clean."];
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    if(el) el.innerHTML = `"${msgs[day % msgs.length]}"`;
}

document.addEventListener("DOMContentLoaded", () => { loadAllData(); generateDailyMessage(); applyTheme(); });