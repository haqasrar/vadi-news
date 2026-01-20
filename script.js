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

// --- MAIN LOGIC ---
document.addEventListener("DOMContentLoaded", function() {
    loadAllData();
    generateDailyMessage();
    loadTheme();
});

let allNewsData = [];

// Helper: Format Date to AM/PM
function formatTime(dateString) {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        if(isNaN(date.getTime())) return dateString;
        return date.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true 
        });
    } catch (e) { return dateString; }
}

async function loadAllData() {
    try {
        const q = query(collection(db, "news"), orderBy("id", "desc"));
        const querySnapshot = await getDocs(q);
        allNewsData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.fbId = doc.id; // Store Firebase ID for sharing
            allNewsData.push(data);
        });
        renderNews('all');
    } catch (error) { console.error("Error loading news:", error); }
}

// --- THEME ---
window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('vadiTheme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('.theme-btn i');
    if(icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

function loadTheme() {
    if(localStorage.getItem('vadiTheme') === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.theme-btn i');
        if(icon) icon.className = 'fas fa-sun';
    }
}

// --- RENDER & FILTERS ---
function renderNews(filterCategory, searchQuery = "") {
    const ng = document.getElementById('news-grid');
    if(!ng) return;
    ng.innerHTML = "";

    allNewsData.forEach((i) => {
        const img = i.img || "https://via.placeholder.com/400";
        const cat = i.category || "News";
        const safeItem = JSON.stringify(i).replace(/'/g, "&#39;");
        
        if(i.type !== 'breaking') {
            ng.innerHTML += `
            <div class="news-card-modern">
                <div class="card-img-wrap" onclick='openArticlePage(${safeItem})'>
                    <img src="${img}"><div class="card-tag">${cat}</div>
                </div>
                <div class="card-content">
                    <h3 onclick='openArticlePage(${safeItem})'>${i.title}</h3>
                    <div class="card-footer">
                        <span style="color:var(--primary); font-weight:bold;">✍️ ${i.writer || "Admin"}</span>
                        <button class="share-btn" onclick="shareNews('${i.title.replace(/'/g, "\\'")}', '${i.fbId}')">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        }
    });
}

// --- ARTICLE VIEW (FIXES INVISIBLE TEXT) ---
window.openArticlePage = function(item) {
    document.getElementById('main-content-area').style.display = 'none';
    const page = document.getElementById('article-page-view');
    page.style.display = 'block';
    window.scrollTo(0,0);

    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true});

    document.getElementById('article-container').innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <button onclick="closeArticle()" style="background:none; border:none; color:var(--dark); cursor:pointer;"><i class="fas fa-arrow-left"></i> Back</button>
            <button class="awareness-btn" onclick="shareNews('${item.title.replace(/'/g, "\\'")}', '${item.fbId}')"><i class="fab fa-whatsapp"></i> Share</button>
        </div>
        <img src="${item.img}" style="width:100%; border-radius:12px; margin-bottom:15px;">
        <h1 style="color:var(--dark); margin-bottom:10px;">${item.title}</h1>
        <div style="font-size:0.8rem; color:var(--gray); margin-bottom:20px;">
            <i class="far fa-calendar-alt"></i> ${item.date || ""} | <i class="far fa-clock"></i> ${currentTime}
        </div>
        <div class="article-body" style="color:var(--dark); line-height:1.8; font-size:1.1rem; white-space:pre-wrap;">
            <b style="color:var(--primary)">${item.writer || "Admin"} :</b> ${item.desc}
        </div>`;
}

// --- SMART SHARING (FIXES IMAGE PREVIEW) ---
window.shareNews = function(title, fbId) {
    // We point to your Next.js domain so WhatsApp finds the Metadata (Image/Title)
    const shareUrl = `https://vadi-news.vercel.app/news/${fbId}`; 
    const text = encodeURIComponent(`*${title}*\n\nRead full story here:\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

window.closeArticle = () => {
    document.getElementById('article-page-view').style.display = 'none';
    document.getElementById('main-content-area').style.display = 'block';
}

function generateDailyMessage() {
    const el = document.getElementById('auto-message');
    if (!el) return;
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
    el.innerHTML = `"${msgs[day % msgs.length]}"`;
}