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

// --- 1. DATA LOADING ---
async function loadAllData() {
    // ADS
    try {
        const adDoc = await getDoc(doc(db, "settings", "ads"));
        if (adDoc.exists()) {
            const adData = adDoc.data();
            const widget = document.getElementById('ad-widget-container');
            if(widget) {
                widget.style.display = 'block';
                if (adData.type === 'manual') {
                    const bioHtml = adData.bio ? `<p style="font-size:0.85rem; color:#555; margin-top:10px;">${formatText(adData.bio)}</p>` : '';
                    document.getElementById('ad-content').innerHTML = `<a href="${adData.link||'#'}" target="_blank"><img src="${adData.img}" style="width:100%; border-radius:8px;"></a>${bioHtml}`;
                } else {
                    document.getElementById('ad-content').innerHTML = adData.code;
                }
            }
        }
    } catch (e) { console.log("Ad load error", e); }

    // NEWS
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
    // Hide Article Page
    document.getElementById('article-page-view').style.display = 'none';
    // Show Main Content
    document.getElementById('main-content-area').style.display = 'block';
    window.scrollTo(0, 0);
}

// --- 4. RENDER NEWS LIST ---
window.filterNews = function(category) {
    window.closeArticle(); // Ensure we are on home page
    document.querySelectorAll('.search-input').forEach(input => input.value = "");
    renderNews(category);
}

window.performSearch = function(el) {
    window.closeArticle(); // Ensure we are on home page
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

        if(i.type === 'breaking') {
             const link = i.link ? `<a href="${i.link}" target="_blank" style="text-decoration:underline;">${i.title}</a>` : i.title;
             breakHTML += `🔴 ${link} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `;
        }
        
        if(i.isTrending && tl) {
            tl.innerHTML += `<li onclick='openArticlePage(${safeItem})' style="margin-bottom:10px; cursor:pointer; font-weight:bold; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:5px;">📈 ${i.title}</li>`;
        }

        if(i.type !== 'breaking') {
            let match = false;
            if (filterCategory === 'search') { if (i.title.toLowerCase().includes(searchQuery)) match = true; } 
            else if (filterCategory === 'all') { match = true; } 
            else if (cat === filterCategory) { match = true; }

            if (match) {
                if (filterCategory === 'all' && (index === 0 || i.type === 'hero') && hCount < 1) {
                    if(hCount === 0) {
                        hm.innerHTML = `
                        <div class="hero-card" onclick='openArticlePage(${safeItem})' style="cursor:pointer;">
                            <img src="${img}">
                            <div class="overlay"><div class="meta">${cat}</div><h2>${i.title}</h2></div>
                        </div>`;
                        hCount++;
                    }
                } else {
                    ng.innerHTML += `
                    <div class="news-card-modern">
                        <div class="card-img-wrap" onclick='openArticlePage(${safeItem})'>
                            <img src="${img}"><div class="card-tag">${cat}</div>
                        </div>
                        <div class="card-content">
                            <h3 onclick='openArticlePage(${safeItem})'>${i.title}</h3>
                            <div class="card-footer">
                                <div style="display:flex; flex-direction:column;">
                                     <span class="author-name" style="font-weight:bold; color:#d32f2f;">✍️ ${writerName}</span>
                                     <span class="author-name" style="font-size:0.75em; color:#888;">${i.date ? i.date.split(',')[0] : ''}</span>
                                </div>
                                <button class="share-btn" onclick="${shareOnClick}" style="margin-left:auto;"><i class="fab fa-whatsapp"></i></button>
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
    
    // 1. Split text into paragraphs
    // We try to split by Double Newline first, if not, then single newline, or periods
    let paragraphs = description.split(/\n\n|\n/);
    if (paragraphs.length < 2) {
        // If it's one giant block, try splitting by sentences roughly
        paragraphs = description.match( /[^.!?]+[.!?]+/g ) || [description];
    }

    let finalHTML = "";
    let imageIndex = 0;
    
    // Logic: Insert an image every 2-3 paragraphs roughly
    // Or simpler: distribute images evenly
    
    paragraphs.forEach((para, index) => {
        // Clean the paragraph
        if(para.trim() === "") return;
        
        finalHTML += `<p style="margin-bottom:15px; line-height:1.8; font-size:1.1rem; color:#333;">${formatText(para)}</p>`;

        // CHECK: Is it time to insert an image?
        // We insert after every 3rd paragraph, OR if we are halfway and have images left
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

    // If any images remain, dump them at the bottom
    if (galleryImages && imageIndex < galleryImages.length) {
        finalHTML += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px;">`;
        for (let i = imageIndex; i < galleryImages.length; i++) {
            finalHTML += `<img src="${galleryImages[i]}" style="width:100%; border-radius:8px;" onclick="viewFullImage(this.src)">`;
        }
        finalHTML += `</div>`;
    }

    return finalHTML;
}

// --- 6. OPEN ARTICLE PAGE (THE NEW "PAGE" LOGIC) ---
window.openArticlePage = function(item) {
    // 1. Hide Main Content
    document.getElementById('main-content-area').style.display = 'none';
    
    // 2. Show Article Page
    const page = document.getElementById('article-page-view');
    page.style.display = 'block';
    window.scrollTo(0,0);

    // 3. Populate Data
    
    // HEADER: Share Button (Top Right)
    const headerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 15px 0; border-bottom:1px solid #eee; margin-bottom:15px;">
            <button onclick="closeArticle()" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#333;">
                <i class="fas fa-arrow-left"></i> Back
            </button>
            <button onclick="shareNews('${item.title.replace(/'/g, "\\'")}', '${item.img}')" 
                    style="background:#25D366; color:white; border:none; padding:8px 16px; border-radius:20px; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:5px;">
                <i class="fab fa-whatsapp"></i> Share
            </button>
        </div>
    `;

    // MAIN PHOTO
    let mediaHTML = "";
    if(item.video && item.video.trim() !== "") {
        const safeUrl = getEmbedUrl(item.video);
        mediaHTML = `<iframe src="${safeUrl}" width="100%" height="250" frameborder="0" allowfullscreen style="border-radius:10px; margin-bottom:15px;"></iframe>`;
    } else {
        mediaHTML = `<img src="${item.img}" style="width:100%; border-radius:10px; margin-bottom:15px; max-height:400px; object-fit:cover;">`;
    }

    // META DATA
    const writerName = item.writer || item.author || "Admin";
    const dateStr = item.date || "";

    // CONTENT MIXING
    // We pass the description and the gallery array (excluding the main image if it duplicates)
    // Assuming 'gallery' contains extra images.
    let contentHTML = "";
    
    // WRITER NAME : DESCRIPTION
    // We start the first paragraph with the writer name in RED
    contentHTML += `<div style="margin-bottom:20px;">
                        <span style="color:#d32f2f; font-weight:bold; font-size:1.1rem;">${writerName} : </span>
                    </div>`;

    // Now inject the rest of the text mixed with photos
    contentHTML += mixTextAndImages(item.desc, item.gallery);


    // INJECT INTO DOM
    document.getElementById('article-container').innerHTML = `
        ${headerHTML}
        ${mediaHTML}
        <h1 style="font-size:1.8rem; font-weight:bold; line-height:1.3; margin-bottom:10px; color:var(--text);">${item.title}</h1>
        
        <div style="font-size:0.9rem; color:#666; margin-bottom:20px; display:flex; gap:10px; align-items:center;">
             <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
             <span>|</span>
             <span><i class="far fa-clock"></i> ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
    // (Same video logic as before)
    if (!url) return "";
    if (url.includes("youtu")) {
         let videoId = url.split("v=")[1] || url.split("/").pop();
         const ampersandPosition = videoId.indexOf("&");
         if(ampersandPosition != -1) videoId = videoId.substring(0, ampersandPosition);
         return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
}

// (Share function remains same as previous version)
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
    el.innerHTML = `"${msgs[0]}"`;
}