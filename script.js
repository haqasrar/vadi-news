// --- FIREBASE SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAj1lPZymdb6jSPrf8ZSfBIIlvc-7JqLho",
    authDomain: "vadi-e-kashmir.firebaseapp.com",
    projectId: "vadi-e-kashmir",
    storageBucket: "vadi-e-kashmir.firebasestorage.app",
    messagingSenderId: "330323093016",
    appId: "1:330323093016:web:a4204fac189bf119b5c56d",
    measurementId: "G-6MPEY5VH7L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allNewsData = [];

// --- THEME ENGINE (FIXES PERSISTENCE) ---
function applyTheme() {
    const isDark = localStorage.getItem('vadiTheme') === 'dark';
    if (isDark) { document.body.classList.add('dark-mode'); } 
    else { document.body.classList.remove('dark-mode'); }
    const icon = document.querySelector('.theme-btn i');
    if(icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

document.addEventListener("DOMContentLoaded", () => {
    loadAllData();
    generateDailyMessage();
    applyTheme();
});

// --- MANUAL SHARE (Clipboard + WhatsApp) ---
window.shareNews = async (title, fbId) => {
    const shareUrl = `https://vadi-news.vercel.app/news/${fbId}`;
    const fullText = `*${title}*\n\nRead full story here:\n${shareUrl}`;
    try {
        await navigator.clipboard.writeText(fullText);
        alert("✅ Title & Link Copied!\nNow open WhatsApp and paste in description.");
        window.open(`https://wa.me/`, '_blank');
    } catch (err) {
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
    }
};

async function loadAllData() {
    try {
        const q = query(collection(db, "news"), orderBy("id", "desc"));
        const querySnapshot = await getDocs(q);
        allNewsData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.fbId = doc.id;
            allNewsData.push(data);
        });
        renderNews();
    } catch (error) { console.error("Data error:", error); }
}

// --- RENDER CONTENT ---
function renderNews() {
    const hm = document.getElementById('hero-main'), ng = document.getElementById('news-grid'), 
          tl = document.getElementById('trending-list'), ticker = document.getElementById('ticker-box');

    if(!hm || !ng) return;
    hm.innerHTML = ""; ng.innerHTML = ""; if(tl) tl.innerHTML = "";

    // 1. Marquee
    const updates = allNewsData.filter(n => n.type === 'breaking' || n.category === 'Updates');
    if(ticker) ticker.innerHTML = updates.map(n => `🔴 ${n.title}`).join(" &nbsp;&nbsp;&nbsp;&nbsp; ");

    // 2. Hero Headline
    if (allNewsData.length > 0) {
        const top = allNewsData[0];
        hm.innerHTML = `
            <div class="hero-card" onclick='openArticlePage(${JSON.stringify(top).replace(/'/g, "&#39;")})'>
                <img src="${top.img}">
                <div class="overlay"><span style="background:var(--primary); padding:2px 8px; border-radius:4px;">${top.category}</span><h2>${top.title}</h2></div>
            </div>`;
    }

    // 3. News Grid & Trending
    allNewsData.forEach((i, idx) => {
        const safeItem = JSON.stringify(i).replace(/'/g, "&#39;");
        if(i.isTrending && tl) tl.innerHTML += `<li onclick='openArticlePage(${safeItem})' style="cursor:pointer; padding:10px 0; border-bottom:1px solid #eee;">📈 ${i.title}</li>`;
        if(idx > 0 && i.type !== 'breaking') {
            ng.innerHTML += `
            <div class="news-card-modern">
                <div class="card-img-wrap" onclick='openArticlePage(${safeItem})'><img src="${i.img}"><div class="card-tag">${i.category}</div></div>
                <div class="card-content">
                    <h3 onclick='openArticlePage(${safeItem})'>${i.title}</h3>
                    <div class="card-footer"><span>✍️ ${i.writer || "Admin"}</span><button class="share-btn" onclick="event.stopPropagation(); shareNews('${i.title.replace(/'/g, "\\'")}', '${i.fbId}')"><i class="fab fa-whatsapp"></i></button></div>
                </div>
            </div>`;
        }
    });
}

// --- ARTICLE PAGE (FIXES TEXT VISIBILITY) ---
window.openArticlePage = (item) => {
    document.getElementById('main-content-area').style.display = 'none';
    const page = document.getElementById('article-page-view');
    page.style.display = 'block';
    window.scrollTo(0,0);
    applyTheme();

    const ampmTime = new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', hour12: true});

    document.getElementById('article-container').innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <button onclick="closeArticle()" style="background:none; border:none; color:var(--dark); font-weight:bold; cursor:pointer;"><i class="fas fa-arrow-left"></i> BACK</button>
            <button class="share-btn" style="background:#25D366; color:white; padding:8px 18px; border-radius:25px; border:none; font-weight:bold; cursor:pointer;" onclick="shareNews('${item.title.replace(/'/g, "\\'")}', '${item.fbId}')"><i class="fab fa-whatsapp"></i> SHARE</button>
        </div>
        <img src="${item.img}" style="width:100%; max-height:450px; object-fit:cover; border-radius:12px; margin-bottom:20px;">
        <h1 style="color:var(--dark); margin-bottom:15px;">${item.title}</h1>
        <div style="font-size:0.85rem; color:var(--primary); margin-bottom:20px; font-weight:bold;"><i class="far fa-calendar-alt"></i> ${item.date || ""} | <i class="far fa-clock"></i> ${ampmTime}</div>
        <div class="article-body"><b style="color:var(--primary)">${item.writer || "Admin"} :</b> ${item.desc}</div>`;
};

window.toggleTheme = () => {
    const isDark = !document.body.classList.contains('dark-mode');
    localStorage.setItem('vadiTheme', isDark ? 'dark' : 'light');
    applyTheme();
};

window.closeArticle = () => {
    document.getElementById('article-page-view').style.display = 'none';
    document.getElementById('main-content-area').style.display = 'block';
    applyTheme();
};

function generateDailyMessage() {
    const el = document.getElementById('auto-message'); if(!el) return;
    const msgs = ["🚗 Drive safely.", "💧 Save water.", "🌳 Plant a tree.", "🚭 Stay healthy.", "🚮 Keep clean."];
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    el.innerHTML = `"${msgs[day % msgs.length]}"`;
}