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

// --- THEME ---
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

// --- DATA LOAD ---
async function loadAllData() {
    try {
        const querySnapshot = await getDocs(query(collection(db, "news"), orderBy("id", "desc")));
        allNewsData = querySnapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
        renderNews('all');
    } catch (e) { console.error("Firebase error", e); }
}

function renderNews(category) {
    const hm = document.getElementById('hero-main'), ng = document.getElementById('news-grid'), ticker = document.getElementById('ticker-box');
    hm.innerHTML = ""; ng.innerHTML = ""; 
    const filtered = category === 'all' ? allNewsData : allNewsData.filter(n => n.category === category);
    ticker.innerHTML = allNewsData.slice(0, 5).map(n => `🔴 ${n.title}`).join(" &nbsp;&nbsp;&nbsp;&nbsp; ");

    if (category === 'all' && filtered.length > 0) {
        const top = filtered[0];
        hm.innerHTML = `<div class="hero-card" onclick='openArticlePage(${JSON.stringify(top).replace(/'/g, "&#39;")})'>
            <img src="${top.img}" style="width:100%; height:400px; object-fit:cover;"><div class="overlay"><h2>${top.title}</h2></div></div>`;
    }

    filtered.forEach((n, idx) => {
        if(category === 'all' && idx === 0) return;
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        ng.innerHTML += `<div class="news-card-modern" onclick='openArticlePage(${safe})'>
            <div class="card-img-wrap"><img src="${n.img}"><div class="card-tag">${n.category}</div></div>
            <div class="card-content"><h3>${n.title}</h3><div class="card-footer" style="color:var(--primary); font-weight:bold; margin-top:10px;">✍️ ${n.writer || "Admin"}</div></div></div>`;
    });
}

// --- SEARCH & NAVIGATION ---
window.performSearch = (el) => {
    const term = el.value.toLowerCase();
    document.getElementById('hero-main').innerHTML = "";
    document.getElementById('feed-title').innerText = `Search: "${term}"`;
    const filtered = allNewsData.filter(n => n.title.toLowerCase().includes(term));
    const ng = document.getElementById('news-grid');
    ng.innerHTML = filtered.map(n => {
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        return `<div class="news-card-modern" onclick='openArticlePage(${safe})'>
            <div class="card-img-wrap"><img src="${n.img}"><div class="card-tag">${n.category}</div></div>
            <div class="card-content"><h3>${n.title}</h3></div></div>`;
    }).join("");
};

window.filterNews = (cat) => {
    window.closeArticle();
    renderNews(cat);
};

window.openArticlePage = (item) => {
    document.getElementById('main-content-area').style.display = 'none';
    const view = document.getElementById('article-page-view');
    view.style.display = 'block';
    applyTheme();
    window.scrollTo(0,0);
    document.getElementById('article-container').innerHTML = `
        <button onclick="closeArticle()" style="margin-bottom:20px; cursor:pointer; font-weight:bold;">← BACK</button>
        <img src="${item.img}" style="width:100%; border-radius:12px; margin-bottom:20px; max-height:450px; object-fit:cover;">
        <h1>${item.title}</h1>
        <div style="margin: 20px 0; font-weight:bold; color:var(--primary);">${item.writer || "Admin"} :</div>
        <div class="article-body">${item.desc}</div>`;
};

window.closeArticle = () => {
    document.getElementById('article-page-view').style.display = 'none';
    document.getElementById('main-content-area').style.display = 'block';
};

function generateDailyMessage() {
    const el = document.getElementById('auto-message');
    const msgs = ["🚗 Drive safely.", "💧 Save water.", "🌳 Plant a tree.", "🚭 Stay healthy."];
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    if(el) el.innerHTML = `"${msgs[day % msgs.length]}"`;
}

document.addEventListener("DOMContentLoaded", () => { loadAllData(); generateDailyMessage(); applyTheme(); });