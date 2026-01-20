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

// --- HELPER: FORMAT DATE (AM/PM) ---
function formatTime(dateString) {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        // If date is invalid (e.g. manually typed string), return as is
        if(isNaN(date.getTime())) return dateString;

        // Returns format: "Jan 15, 2026, 1:27 PM"
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
        });
    } catch (e) {
        return dateString;
    }
}

// --- 1. DATA LOADING ---
async function loadAllData() {
    // ADS SECTION
    try {
        const adDoc = await getDoc(doc(db, "settings", "ads"));
        if (adDoc.exists()) {
            const adData = adDoc.data();
            const widget = document.getElementById('ad-widget-container');
            
            if(widget) {
                widget.style.display = 'block'; 
                
                if (adData.type === 'manual') {
                    const targetLink = adData.link || '#';
                    const imgHtml = `<img src="${adData.img}" style="width:100%; border-radius:8px; display:block; box-shadow:0 2px 5px rgba(0,0,0,0.1);">`;
                    const bioHtml = adData.bio ? `<p style="font-size:0.9rem; color:#333; margin-top:10px; line-height:1.4; font-weight:500;">${formatText(adData.bio)}</p>` : '';

                    document.getElementById('ad-content').innerHTML = `
                        <a href="${targetLink}" target="_blank" style="text-decoration:none; display:block; color:inherit; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                            ${imgHtml}
                            ${bioHtml}
                            <div style="margin-top:8px; font-size:0.8rem; color:#b91c1c; font-weight:bold; text-align:right;">
                                Open Link <i class="fas fa-external-link-alt"></i>
                            </div>
                        </a>
                    `;
                } else {
                    document.getElementById('ad-content').innerHTML = adData.code;
                }
            }
        }
    } catch (e) { console.log("Ad load error", e); }

    // NEWS SECTION
    try {
        const q = query(collection(db, "news"), orderBy("id", "desc"));
        const querySnapshot = await getDocs(q);
        
        allNewsData = [];
        querySnapshot.forEach((doc) => {
            allNewsData.push(doc.data());
        });
        
        if(allNewsData.length > 0) document.getElementById('ticker-box').innerHTML = "";
        
        renderNews('all');
    } catch (error) {
        console.error("Error loading news:", error);
        document.getElementById('ticker-box').innerText = "Connection Error.";
    }
}

// --- 2. THEME ---
window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-btn i');
    if(document.body.classList.contains('dark-mode')){
        localStorage.setItem('vadiTheme', 'dark');
        if(icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    } else {
        localStorage.setItem('vadiTheme', 'light');
        if(icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('vadiTheme');
    if(savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.theme-btn i');
        if(icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    }
}

// --- 3. NAVIGATION & VIEW SWITCHING ---
window.closeArticle = function() {
    document.getElementById('article-page-view').style.display = 'none';
    document.getElementById('main-content-area').style.display = 'block';
    window.scrollTo(0, 0);
}

// --- 4. RENDER NEWS LIST ---
window.filterNews = function(category) {
    window.closeArticle(); 
    document.querySelectorAll('.search-input').forEach(input => input.value = "");
    renderNews(category);
}

window.performSearch = function(el) {
    window.closeArticle(); 
    const query = el ? el.value.toLowerCase() : document.querySelector('.search-input').value.toLowerCase();
    renderNews('search', query);
}

function renderNews(filterCategory, searchQuery = "") {
    const hm = document.getElementById('hero-main'), 
          ng = document.getElementById('news-grid'), 
          tl = document.getElementById('trending-list');
    
    if(hm) hm.innerHTML = ""; if(ng) ng.innerHTML = ""; if(tl) tl.innerHTML = "";

    const heroSec = document.getElementById('hero-section');
    if (filterCategory === 'all' && searchQuery === "") {
        if(heroSec) heroSec.style.display = 'grid';
        if(document.getElementById('feed-title')) document.getElementById('feed-title').innerText = "Latest Headlines";
    } else {
        if(heroSec) heroSec.style.display = 'none';
        const title = filterCategory === 'search' ? `Search Results for "${searchQuery}"` : `${filterCategory} News`;
        if(document.getElementById('feed-title')) document.getElementById('feed-title').innerText = title;
    }

    let breakHTML = "", hCount = 0;

    allNewsData.forEach((i, index) => {
        const img = i.img || "https://via.placeholder.com/400";
        const cat = i.category || "News"; 
        const safeItem = JSON.stringify(i).replace(/'/g, "&#39;");
        const shareOnClick = `shareNews('${i.title.replace(/'/g, "\\'")}', '${img}')`;
        const writerName = i.writer || i.author || "Desk";
        const formattedDate = formatTime(i.date); // FIX: Uses correct date format

        // Breaking News Ticker
        if(i.type === 'breaking') {
             const link = i.link ? `<a href="${i.link}" target="_blank" style="text-decoration:underline;">${i.title}</a>` : i.title;
             breakHTML += `🔴 ${link} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `;
        }
        
        // Trending List Sidebar
        if(i.isTrending && tl) {
            tl.innerHTML += `
                <li onclick='openArticlePage(${safeItem})' style="display:flex; gap:10px; margin-bottom:15px; cursor:pointer; border-bottom:1px solid #eee; padding-bottom:10px;">
                    <img src="${img}" style="width:60px; height:60px; object-fit:cover; border-radius:5px;">
                    <div>
                        <div style="font-weight:bold; font-size:0.9rem; line-height:1.2;">${i.title}</div>
                        <div style="font-size:0.7rem; color:var(--primary); margin-top:2px;">Read Story</div>
                    </div>
                </li>`;
        }

        if(i.type !== 'breaking') {
            let match = false;
            if (filterCategory === 'search') { if (i.title.toLowerCase().includes(searchQuery)) match = true; } 
            else if (filterCategory === 'all') { match = true; } 
            else if (cat === filterCategory) { match = true; }

            if (match) {
                // Hero Section (First item only)
                if (filterCategory === 'all' && (index === 0 || i.type === 'hero') && hCount < 1) {
                    if(hCount === 0) {
                        hm.innerHTML = `
                        <div class="hero-card" onclick='openArticlePage(${safeItem})'>
                            <img src="${img}">
                            <div class="overlay">
                                <span style="background:var(--primary); padding:2px 8px; border-radius:4px; font-size:0.8rem;">${cat}</span>
                                <h2>${i.title}</h2>
                                <small>📅 ${formattedDate}</small>
                            </div>
                        </div>`;
                        hCount++;
                    }
                } else {
                    // Standard Grid Items
                    ng.innerHTML += `
                    <div class="news-card-modern">
                        <div class="card-img-wrap" onclick='openArticlePage(${safeItem})'>
                            <img src="${img}"><div class="card-tag">${cat}</div>
                        </div>
                        <div class="card-content">
                            <h3 onclick='openArticlePage(${safeItem})'>${i.title}</h3>
                            <div class="card-footer">
                                <div style="display:flex; flex-direction:column;">
                                     <span class="author-name" style="font-weight:bold; color:var(--primary);">✍️ ${writerName}</span>
                                     <span class="author-name" style="font-size:0.75em; color:#888;">${formattedDate}</span>
                                </div>
                                <button class="share-btn" onclick="${shareOnClick}"><i class="fab fa-whatsapp"></i></button>
                            </div>
                        </div>
                    </div>`;
                }
            }
        }
    });

    const t = document.getElementById('ticker-box');
    if(t && breakHTML) t.innerHTML = breakHTML;
    else if(t) t.innerHTML = "Welcome to Vadi E Kashmir – 24/7 Breaking News Updates";
}

// --- 5. SMART ARTICLE MIXER (TEXT + PHOTOS) ---
function mixTextAndImages(description, galleryImages) {
    if (!description) return "";
    
    let paragraphs = description.split(/\n\n|\n/);
    if (paragraphs.length < 2) {
        paragraphs = description.match( /[^.!?]+[.!?]+/g ) || [description];
    }

    let finalHTML = "";
    let imageIndex = 0;
    
    paragraphs.forEach((para, index) => {
        if(para.trim() === "") return;
        
        finalHTML += `<p style="margin-bottom:15px; line-height:1.8; font-size:1.1rem; color:var(--dark);">${formatText(para)}</p>`;

        if ((index + 1) % 2 === 0 && galleryImages && imageIndex < galleryImages.length) {
            finalHTML += `
                <div style="margin: 20px 0;">
                    <img src="${galleryImages[imageIndex]}" 
                         style="width:100%; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);" 
                         onclick="viewFullImage(this.src)">
                </div>
            `;
            imageIndex++;
        }
    });

    if (galleryImages && imageIndex < galleryImages.length) {
        finalHTML += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px;">`;
        for (let i = imageIndex; i < galleryImages.length; i++) {
            finalHTML += `<img src="${galleryImages[i]}" style="width:100%; border-radius:8px;" onclick="viewFullImage(this.src)">`;
        }
        finalHTML += `</div>`;
    }

    return finalHTML;
}

// --- 6. OPEN ARTICLE PAGE ---
window.openArticlePage = function(item) {
    document.getElementById('main-content-area').style.display = 'none';
    const page = document.getElementById('article-page-view');
    page.style.display = 'block';
    window.scrollTo(0,0);

    const formattedDate = formatTime(item.date); // FIX: Uses correct date format

    const headerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 15px 0; border-bottom:1px solid #eee; margin-bottom:15px;">
            <button onclick="closeArticle()" style="background:none; border:none; font-size:1.1rem; cursor:pointer; color:var(--dark); display:flex; align-items:center; gap:5px;">
                <i class="fas fa-arrow-left"></i> Back
            </button>
            <button onclick="shareNews('${item.title.replace(/'/g, "\\'")}', '${item.img}')" 
                    style="background:#25D366; color:white; border:none; padding:8px 16px; border-radius:20px; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:5px;">
                <i class="fab fa-whatsapp"></i> Share
            </button>
        </div>
    `;

    let mediaHTML = "";
    if(item.video && item.video.trim() !== "") {
        const safeUrl = getEmbedUrl(item.video);
        mediaHTML = `<iframe src="${safeUrl}" width="100%" height="250" frameborder="0" allowfullscreen style="border-radius:10px; margin-bottom:15px;"></iframe>`;
    } else {
        mediaHTML = `<img src="${item.img}" style="width:100%; border-radius:10px; margin-bottom:15px; max-height:400px; object-fit:cover;">`;
    }

    const writerName = item.writer || item.author || "Admin";

    let contentHTML = "";
    contentHTML += `<div style="margin-bottom:20px;">
                        <span style="color:var(--primary); font-weight:bold; font-size:1.1rem;">${writerName} : </span>
                    </div>`;

    contentHTML += mixTextAndImages(item.desc, item.gallery);

    document.getElementById('article-container').innerHTML = `
        ${headerHTML}
        ${mediaHTML}
        <h1 style="font-size:1.8rem; font-weight:bold; line-height:1.3; margin-bottom:10px; color:var(--dark);">${item.title}</h1>
        
        <div style="font-size:0.9rem; color:#666; margin-bottom:20px; display:flex; gap:10px; align-items:center;">
             <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
        </div>

        <div class="article-body">
            ${contentHTML}
        </div>
        
        <div style="height:50px;"></div> `;
}

// --- 7. UTILS ---
window.viewFullImage = function(src) {
    window.open(src, '_blank');
}

function formatText(text) {
    if (!text) return "";
    let formatted = text.replace(/\n/g, "<br>");
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return formatted.replace(urlPattern, url => `<a href="${url}" target="_blank" style="color:#b91c1c; text-decoration:underline; word-break:break-all;">${url}</a>`);
}

function getEmbedUrl(url) {
    if (!url) return "";
    if (url.includes("youtu")) {
         let videoId = url.split("v=")[1] || url.split("/").pop();
         const ampersandPosition = videoId.indexOf("&");
         if(ampersandPosition != -1) videoId = videoId.substring(0, ampersandPosition);
         return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
}

window.shareNews = async function(title, imageUrl) {
    const websiteUrl = window.location.origin;
    const captionText = `${title}\n\nRead more: ${websiteUrl}`;
    try { await navigator.clipboard.writeText(captionText); alert("✅ Caption Copied!\nPaste in WhatsApp."); } catch (err) {}
    if (navigator.share && navigator.canShare) {
        try { await navigator.share({ title: 'Vadi E Kashmir', text: captionText, url: websiteUrl }); } catch (error) {}
    } else {
        const text = encodeURIComponent(`*${title}*\n\nRead full story here:\n${websiteUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }
}

function generateDailyMessage() {
    const el = document.getElementById('auto-message');
    if (!el) return;
    const msgs = [ 
        "🚗 Traffic Safety: Speed thrills but kills. Drive slowly and reach home safely.",
        "💧 Save Water: A drop of water is worth more than a sack of gold to a thirsty man.",
        "🌳 Environment: He that plants a tree loves others beside himself.",
        "🚭 Health: Your body hears everything your mind says. Stay positive, stay healthy.",
        "⚡ Energy: Energy saved is energy generated. Switch off lights when not in use.",
        "🚮 Cleanliness: Keep your city clean. Use dustbins and avoid plastic.",
        "🏥 Health: An apple a day keeps the doctor away. Eat fresh, live long.",
        "🛑 Traffic: Don't use mobile phones while driving. Your life is precious.",
        "🤝 Community: United we stand, divided we fall. Help your neighbors.",
        "🩸 Donation: Blood donation is the real act of humanity. Save a life today."
    ];
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    el.innerHTML = `"${msgs[day % msgs.length]}"`;
}