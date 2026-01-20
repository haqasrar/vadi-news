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

// --- DATA ---
async function loadAllData() {
    const querySnapshot = await getDocs(query(collection(db, "news"), orderBy("id", "desc")));
    allNewsData = querySnapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
    renderNews('all');
}

function renderNews(category) {
    const hm = document.getElementById('hero-main'), ng = document.getElementById('news-grid'),
          tl = document.getElementById('trending-list'), ticker = document.getElementById('ticker-box');

    hm.innerHTML = ""; ng.innerHTML = ""; if(tl) tl.innerHTML = "";

    const filtered = category === 'all' ? allNewsData : allNewsData.filter(n => n.category === category);

    // Marquee
    ticker.innerHTML = allNewsData.slice(0, 5).map(n => `🔴 ${n.title}`).join(" &nbsp;&nbsp; ");

    // Hero
    if (category === 'all' && filtered.length > 0) {
        const top = filtered[0];
        hm.innerHTML = `<div class="hero-card" onclick='openArticlePage(${JSON.stringify(top).replace(/'/g, "&#39;")})'>
            <img src="${top.img}"><div class="overlay"><h2>${top.title}</h2></div></div>`;
    }

    // Grid
    filtered.forEach((n, i) => {
        if(category === 'all' && i === 0) return;
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        if(n.isTrending && tl) tl.innerHTML += `<li onclick='openArticlePage(${safe})' style="cursor:pointer; margin-bottom:10px;">📈 ${n.title}</li>`;
        ng.innerHTML += `<div class="news-card-modern" onclick='openArticlePage(${safe})'>
            <div class="card-img-wrap"><img src="${n.img}"><div class="card-tag">${n.category}</div></div>
            <div class="card-content"><h3>${n.title}</h3><div class="card-footer"><span>${n.writer || "Admin"}</span></div></div></div>`;
    });
}

// --- NAVIGATION ---
window.filterNews = (cat) => {
    window.closeArticle();
    renderNews(cat);
};

window.openArticlePage = (item) => {
    document.getElementById('main-content-area').style.display = 'none';
    const view = document.getElementById('article-page-view');
    view.style.display = 'block';
    applyTheme();
    document.getElementById('article-container').innerHTML = `
        <button onclick="closeArticle()" style="margin-bottom:20px; cursor:pointer;">← Back</button>
        <img src="${item.img}" style="width:100%; border-radius:12px; margin-bottom:20px;">
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
    const msgs = [ "🚗 Traffic Safety: Speed thrills but kills. Drive slowly and reach home safely.",
        "💧 Save Water: A drop of water is worth more than a sack of gold to a thirsty man.",
        "🌳 Environment: He that plants a tree loves others beside himself.",
        "🚭 Health: Your body hears everything your mind says. Stay positive, stay healthy.",
        "⚡ Energy: Energy saved is energy generated. Switch off lights when not in use.",
        "🚮 Cleanliness: Keep your city clean. Use dustbins and avoid plastic.",
        "🏥 Health: An apple a day keeps the doctor away. Eat fresh, live long.",
        "🛑 Traffic: Don't use mobile phones while driving. Your life is precious.",
        "🤝 Community: United we stand, divided we fall. Help your neighbors.",
        "🩸 Donation: Blood donation is the real act of humanity. Save a life today.",
        "🌊 Water: Don't let the water run while you brush your teeth.",
        "🔥 Safety: Check your gas cylinder regulator before going to bed.",
        "🧠 Mental Health: It's okay not to be okay. Talk to someone if you feel low.",
        "🚴 Fitness: Take a walk or ride a bike. Your heart will thank you.",
        "🎓 Education: Education is the most powerful weapon which you can use to change the world.",
        "🚦 Rules: Red means stop, Green means go. Respect traffic lights.",
        "🔋 Future: Recycle e-waste. Don't throw batteries in the trash.",
        "😷 Hygiene: Wash your hands frequently to stop the spread of germs.",
        "👵 Respect: Respect your elders. They guided you when you couldn't walk.",
        "🐶 Animals: Be kind to street animals. They feel pain too."];
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    if(el) el.innerHTML = `"${msgs[day % msgs.length]}"`;
}

document.addEventListener("DOMContentLoaded", () => { loadAllData(); generateDailyMessage(); applyTheme(); });