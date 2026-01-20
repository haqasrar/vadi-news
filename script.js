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

// --- THEME ENGINE (Master Switch) ---
function applyCurrentTheme() {
    const isDark = localStorage.getItem('vadiTheme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    // Update the Moon/Sun icon
    const icon = document.querySelector('.theme-btn i');
    if(icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

document.addEventListener("DOMContentLoaded", function() {
    loadAllData();
    applyCurrentTheme(); // Load theme on home page
});

// --- MANUAL SHARE ---
window.shareNews = async (title, fbId) => {
    const shareUrl = `https://vadi-news.vercel.app/news/${fbId}`;
    const fullText = `*${title}*\n\nRead more at:\n${shareUrl}`;
    try {
        await navigator.clipboard.writeText(fullText);
        alert("✅ Title & Link Copied!\nNow paste it in WhatsApp.");
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
        renderNews('all');
    } catch (error) { console.error("Error:", error); }
}

function renderNews(filterCategory) {
    const hm = document.getElementById('hero-main');
    const ng = document.getElementById('news-grid');
    if(!ng || !hm) return;
    ng.innerHTML = ""; hm.innerHTML = "";

    if (allNewsData.length > 0) {
        const topNews = allNewsData[0];
        const safeTop = JSON.stringify(topNews).replace(/'/g, "&#39;");
        hm.innerHTML = `
            <div class="hero-card" onclick='openArticlePage(${safeTop})' style="cursor:pointer; width:100%;">
                <img src="${topNews.img}" style="width:100%; height:100%; object-fit:cover;">
                <div class="overlay">
                    <span style="background:var(--primary); padding:2px 8px; border-radius:4px;">${topNews.category}</span>
                    <h2>${topNews.title}</h2>
                </div>
            </div>`;
    }

    allNewsData.slice(1).forEach((i) => {
        const safeItem = JSON.stringify(i).replace(/'/g, "&#39;");
        ng.innerHTML += `
            <div class="news-card-modern">
                <div class="card-img-wrap" onclick='openArticlePage(${safeItem})'>
                    <img src="${i.img}"><div class="card-tag">${i.category}</div>
                </div>
                <div class="card-content">
                    <h3 onclick='openArticlePage(${safeItem})'>${i.title}</h3>
                    <div class="card-footer">
                        <span style="color:var(--primary); font-weight:bold;">✍️ ${i.writer || "Admin"}</span>
                        <button class="share-btn" onclick="event.stopPropagation(); shareNews('${i.title.replace(/'/g, "\\'")}', '${i.fbId}')">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    });
}

// --- ARTICLE VIEW (FIXES DARK THEME & INVISIBLE TEXT) ---
window.openArticlePage = function(item) {
    document.getElementById('main-content-area').style.display = 'none';
    const page = document.getElementById('article-page-view');
    page.style.display = 'block';
    window.scrollTo(0,0);

    // FORCE THEME APPLICATION ON NEW PAGE
    applyCurrentTheme();

    const currentTime = new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', hour12: true});

    // Fix: Using var(--dark) for color ensures text flips to white in Dark Mode
    document.getElementById('article-container').innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <button onclick="closeArticle()" style="background:none; border:none; color:var(--dark); cursor:pointer; font-weight:bold;">
                <i class="fas fa-arrow-left"></i> BACK
            </button>
            <button class="share-btn" style="background:#25D366; color:white; padding:8px 15px; border-radius:20px;" 
                    onclick="shareNews('${item.title.replace(/'/g, "\\'")}', '${item.fbId}')">
                <i class="fab fa-whatsapp"></i> SHARE
            </button>
        </div>
        
        <img src="${item.img}" style="width:100%; max-height:450px; object-fit:cover; border-radius:12px; margin-bottom:20px; box-shadow: var(--shadow);">
        
        <h1 style="color:var(--dark); margin-bottom:10px; font-family: 'Playfair Display', serif;">${item.title}</h1>
        
        <div style="font-size:0.85rem; color:var(--primary); margin-bottom:20px; font-weight:bold;">
            <i class="far fa-calendar-alt"></i> ${item.date || ""} | <i class="far fa-clock"></i> ${currentTime}
        </div>

        <div class="article-body" style="color:var(--dark); line-height:1.8; font-size:1.15rem; white-space:pre-wrap;">
            <b style="color:var(--primary)">${item.writer || "Admin"} :</b> ${item.desc}
        </div>
        
        <div style="height:100px;"></div>
    `;
}

window.toggleTheme = () => {
    const isDark = !document.body.classList.contains('dark-mode');
    localStorage.setItem('vadiTheme', isDark ? 'dark' : 'light');
    applyCurrentTheme();
};

window.closeArticle = () => {
    document.getElementById('article-page-view').style.display = 'none';
    document.getElementById('main-content-area').style.display = 'block';
    applyCurrentTheme(); // Ensure theme stays correct when returning home
};