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
        const querySnapshot = await getDocs(query(collection(db, "news"), orderBy("id", "desc")));
        allNewsData = querySnapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
        
        const adDocRef = doc(db, "settings", "ads");
        const adDocSnap = await getDoc(adDocRef);

        renderNews('all');
        renderTrending(); 
        
        if (adDocSnap.exists()) {
            renderAds(adDocSnap.data()); 
        }
    } catch (e) { console.error("Firebase load error", e); }
}

// --- RENDER TRENDING ---
function renderTrending() {
    const tl = document.getElementById('trending-list');
    if (!tl) return;
    tl.innerHTML = "";
    const trendingNews = allNewsData.filter(n => n.isTrending === true).slice(0, 5);
    trendingNews.forEach((n, index) => {
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        tl.innerHTML += `<li class="trending-item" onclick='openArticlePage(${safe})'><span class="trending-rank">0${index + 1}</span><div class="trending-text">${n.title}</div></li>`;
    });
}

// --- RENDER ADS ---
function renderAds(adData) {
    const adSlot = document.getElementById('ad-slot');
    if (!adSlot || !adData) return;
    adSlot.innerHTML = `<a href="${adData.link || '#'}" target="_blank"><img src="${adData.img}" alt="${adData.bio || 'Ad'}" style="width:100%; height:auto; display:block;"></a>`;
}

// --- MAIN RENDERING ---
function renderNews(category) {
    const hm = document.getElementById('hero-main'), ng = document.getElementById('news-grid'), ticker = document.getElementById('ticker-box');
    hm.innerHTML = ""; ng.innerHTML = "";
    const tickerNews = allNewsData.filter(n => n.type === 'breaking' || n.category === 'Updates');
    if(ticker) ticker.innerHTML = tickerNews.length > 0 ? tickerNews.map(n => `🔴 ${n.title}`).join(" &nbsp;&nbsp;&nbsp;&nbsp; ") : "Welcome to Vadi E Kashmir";
    const feedNews = allNewsData.filter(n => n.type !== 'breaking' && n.category !== 'Updates');
    const filtered = category === 'all' ? feedNews : feedNews.filter(n => n.category === category);

    if (category === 'all' && filtered.length > 0) {
        const top = filtered[0];
        hm.innerHTML = `<div class="hero-card" onclick='openArticlePage(${JSON.stringify(top).replace(/'/g, "&#39;")})'><img src="${top.img}"><div class="overlay"><span class="writer-top">✍️ ${top.author || "Admin"}</span><h2>${top.title}</h2></div></div>`;
    }

    filtered.forEach((n, idx) => {
        if(category === 'all' && idx === 0) return; 
        const safe = JSON.stringify(n).replace(/'/g, "&#39;");
        ng.innerHTML += `<div class="news-card-modern" onclick='openArticlePage(${safe})'><div class="card-img-wrap"><img src="${n.img}"><div class="card-tag">${n.category}</div></div><div class="card-content"><div class="writer-under-title">✍️ ${n.author || "Admin"}</div><h3>${n.title}</h3><div class="card-footer"><span>📅 ${n.date || "Recent"}</span></div></div></div>`;
    });
}

// --- ARTICLE VIEW & SHARE ---
window.openArticlePage = (item) => {
    // Dynamically update meta tags for the crawler when article is opened
    updateMetaForCrawler(item);

    document.getElementById('main-content-area').style.display = 'none';
    const view = document.getElementById('article-page-view');
    view.style.display = 'block';
    applyTheme();
    window.scrollTo(0,0);
    const time = new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', hour12: true});
    
    document.getElementById('article-container').innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px; padding: 10px;">
            <button onclick="closeArticle()" class="back-btn">← BACK</button>
            <button style="background:#25D366; color:white; border:none; padding:10px 20px; border-radius:30px; font-weight:bold; cursor:pointer;" 
                onclick="shareNewsManual('${item.title.replace(/'/g, "\\'")}', '${item.fbId}')"><i class="fab fa-whatsapp"></i> SHARE ON WHATSAPP</button>
        </div>
        <div class="article-inner">
            <img src="${item.img}" style="width:100%; border-radius:12px; margin-bottom:20px; max-height:450px; object-fit:cover;">
            <h1>${item.title}</h1>
            <div class="article-meta">
                <span>✍️ ${item.author || "Admin"}</span> | <span>📅 ${item.date || ""}</span> | <span><i class="far fa-clock"></i> ${time}</span>
            </div>
            <div class="article-body">${item.desc}</div>
        </div>`;
};

window.closeArticle = () => {
    document.getElementById('article-page-view').style.display = 'none';
    document.getElementById('main-content-area').style.display = 'block';
};

// --- THE MANUAL CLIPBOARD SHARE (NO SHARE.HTML) ---
window.shareNewsManual = async (title, id) => {
    const publicLink = `https://vediekashmir.netlify.app`;
    const shareText = `*${title.toUpperCase()}*\n\nRead more at:\n${publicLink}`;
    
    try {
        await navigator.clipboard.writeText(shareText);
        alert("News Details Copied! Now open WhatsApp, paste, and wait 2 seconds for the image.");
        window.open(`https://wa.me/`, '_blank');
    } catch (err) {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
};

// Function to update the Meta Photo for the crawler
function updateMetaForCrawler(item) {
    if (item) {
        const titleMeta = document.getElementById('meta-title');
        const imageMeta = document.getElementById('meta-image');
        if(titleMeta) titleMeta.setAttribute('content', item.title);
        if(imageMeta) imageMeta.setAttribute('content', item.img);
    }
}

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