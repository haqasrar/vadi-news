// --- FIREBASE SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAj1lPZymdb6jSPrf8ZSfBIIlvc-7JqLho",
    authDomain: "vadi-e-kashmir.firebaseapp.com",
    projectId: "vadi-e-kashmir",
    storageBucket: "vadi-e-kashmir.firebasestorage.app",
    messagingSenderId: "330323093016",
    appId: "1:330323093016:web:a4204fac189bf119b5c56d",
    measurementId: "G-6MPEY5VH7L"
};

// Initialize Firebase
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
            document.getElementById('ad-widget-container').style.display = 'block';
            if (adData.type === 'manual') {
                const bioHtml = adData.bio ? `<p style="font-size:0.85rem; color:#555; margin-top:10px;">${formatText(adData.bio)}</p>` : '';
                document.getElementById('ad-content').innerHTML = `<a href="${adData.link||'#'}" target="_blank"><img src="${adData.img}" style="width:100%; border-radius:8px;"></a>${bioHtml}`;
            } else {
                document.getElementById('ad-content').innerHTML = adData.code;
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

// --- 2. DARK MODE ---
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
    const icon = document.querySelector('.theme-btn i');
    if(savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if(icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    }
}

// --- 3. SEARCH & FILTER ---
window.performSearch = function(el) {
    const query = el ? el.value.toLowerCase() : document.querySelector('.search-input').value.toLowerCase();
    document.querySelectorAll('.search-input').forEach(input => { if(input !== el) input.value = query; });

    if(query.length > 0) {
        document.getElementById('hero-section').style.display = 'none';
        document.getElementById('feed-title').innerText = `Search Results for "${query}"`;
    } else {
        document.getElementById('hero-section').style.display = 'grid';
        document.getElementById('feed-title').innerText = "Latest Headlines";
    }
    renderNews('search', query);
}

window.filterNews = function(category) {
    document.querySelectorAll('.search-input').forEach(input => input.value = "");
    renderNews(category);
}

// --- 4. RENDER NEWS ---
function renderNews(filterCategory, searchQuery = "") {
    const t = document.getElementById('ticker-box'), 
          hm = document.getElementById('hero-main'), 
          hs = document.getElementById('hero-side'), 
          ng = document.getElementById('news-grid'), 
          tl = document.getElementById('trending-list');
    
    if(hm) hm.innerHTML = ""; if(hs) hs.innerHTML = ""; if(ng) ng.innerHTML = ""; if(tl) tl.innerHTML = "";

    const heroSec = document.getElementById('hero-section');
    if (filterCategory === 'all' && searchQuery === "") {
        if(heroSec) heroSec.style.display = 'grid';
        if(document.getElementById('feed-title')) document.getElementById('feed-title').innerText = "Latest Headlines";
    } else if (filterCategory !== 'search') {
        if(heroSec) heroSec.style.display = 'none';
        if(document.getElementById('feed-title')) document.getElementById('feed-title').innerText = filterCategory + " News";
    }

    let breakHTML = "", hCount = 0;

    allNewsData.forEach((i, index) => {
        const img = i.img || "https://via.placeholder.com/400";
        const cat = i.category || "News"; 
        const safeItem = JSON.stringify(i).replace(/'/g, "&#39;");

        // Pass 'img' to the share function here
        const shareOnClick = `shareNews('${i.title.replace(/'/g, "\\'")}', '${img}')`;

        if(i.type === 'breaking') {
             const link = i.link ? `<a href="${i.link}" target="_blank" style="text-decoration:underline;">${i.title}</a>` : i.title;
             breakHTML += `🔴 ${link} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `;
        }
        
        if(i.isTrending && tl) {
            tl.innerHTML += `<li onclick='openModal(${safeItem})' style="margin-bottom:10px; cursor:pointer; font-weight:bold; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:5px;">📈 ${i.title}</li>`;
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
                        <div class="hero-card" onclick='openModal(${safeItem})' style="cursor:pointer;">
                            <img src="${img}">
                            <div class="overlay"><div class="meta">${cat}</div><h2>${i.title}</h2></div>
                        </div>`;
                        hCount++;
                    }
                } else {
                    ng.innerHTML += `
                    <div class="news-card-modern">
                        <div class="card-img-wrap" onclick='openModal(${safeItem})'>
                            <img src="${img}"><div class="card-tag">${cat}</div>
                        </div>
                        <div class="card-content">
                            <h3 onclick='openModal(${safeItem})'>${i.title}</h3>
                            <div class="card-footer">
                                <span class="author-name">${i.date ? i.date.split(',')[0] : ''}</span>
                                <button class="share-btn" onclick="${shareOnClick}"><i class="fab fa-whatsapp"></i> Share</button>
                            </div>
                        </div>
                    </div>`;
                }
            }
        }
    });

    if(t && breakHTML) t.innerHTML = breakHTML;
    else if(t) t.innerHTML = "Welcome to Vadi E Kashmir – 24/7 Breaking News Updates";
}

// --- 5. SMART SHARING (IMAGE + COPY TEXT) ---

async function urlToFile(url, filename, mimeType){
    try {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        return new File([buf], filename, {type:mimeType});
    } catch(e) {
        console.log("Image conversion failed", e);
        return null;
    }
}

window.shareNews = async function(title, imageUrl) {
    const websiteUrl = window.location.origin;
    const captionText = `${title}\n\nRead more: ${websiteUrl}`;

    // STRATEGY: 
    // 1. Copy text to clipboard (Because WhatsApp usually drops it)
    // 2. Open Share Sheet with Image
    // 3. User pastes text

    try {
        await navigator.clipboard.writeText(captionText);
        // Alert the user so they know what to do
        alert("✅ Caption Copied!\n\n1. Select WhatsApp.\n2. PASTE the text in the caption box.");
    } catch (err) {
        console.log('Clipboard failed', err);
    }

    if (navigator.share && navigator.canShare) {
        try {
            let filesArray = [];
            if(imageUrl && !imageUrl.includes('placeholder')) {
                const file = await urlToFile(imageUrl, "news.png", "image/png");
                if(file) filesArray = [file];
            }

            if(filesArray.length > 0 && navigator.canShare({ files: filesArray })) {
                // Share the IMAGE
                await navigator.share({
                    files: filesArray,
                    text: captionText 
                });
            } else {
                // Share TEXT ONLY (Fallback)
                await navigator.share({
                    title: 'Vadi E Kashmir',
                    text: captionText,
                    url: websiteUrl
                });
            }
        } catch (error) {
            console.log('Share closed or failed');
        }
    } else {
        // Desktop Fallback
        const text = encodeURIComponent(`*${title}*\n\nRead full story here:\n${websiteUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }
}

function formatText(text) {
    if (!text) return "";
    let formatted = text.replace(/\n/g, "<br>");
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return formatted.replace(urlPattern, url => `<a href="${url}" target="_blank" style="color:#b91c1c; text-decoration:underline; word-break:break-all;">${url}</a>`);
}

// VIDEO CONVERTER
function getEmbedUrl(url) {
    if (!url) return "";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        if (url.includes("watch?v=")) videoId = url.split("watch?v=")[1].split("&")[0];
        else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
        else if (url.includes("embed/")) videoId = url.split("embed/")[1].split("?")[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("facebook.com") || url.includes("fb.watch")) {
        const encodedUrl = encodeURIComponent(url);
        return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=0&width=560`;
    }
    if (url.includes("instagram.com")) {
        if (!url.endsWith("/embed")) return url.split("?")[0].replace(/\/$/, "") + "/embed";
    }
    return url; 
}

window.openModal = function(item) {
    const m = document.getElementById('newsModal');
    document.getElementById('m-title').innerText = item.title;
    document.getElementById('m-author').innerText = item.author || "Admin";
    document.getElementById('m-date').innerText = item.date;
    document.getElementById('m-desc').innerHTML = formatText(item.desc);
    
    const shareBtn = document.getElementById('m-share-btn');
    if(shareBtn) { 
        const newBtn = shareBtn.cloneNode(true);
        shareBtn.parentNode.replaceChild(newBtn, shareBtn);
        newBtn.onclick = function() { shareNews(item.title, item.img); }; 
    }

    const v = document.getElementById('m-video'), im = document.getElementById('m-img');
    
    if(item.video && item.video.trim() !== "") { 
        im.style.display='none'; 
        v.style.display='block'; 
        const safeUrl = getEmbedUrl(item.video);
        if(safeUrl.includes("facebook.com")) {
             v.innerHTML=`<iframe src="${safeUrl}" width="100%" height="100%" frameborder="0" style="border:none;overflow:hidden" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>`;
        } else {
             v.innerHTML=`<iframe src="${safeUrl}" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`; 
        }
    }
    else { 
        v.style.display='none'; v.innerHTML = ""; im.style.display='block'; im.src=item.img; 
    }
    
    const g = document.getElementById('m-gallery'); g.innerHTML="";
    if(item.gallery && Array.isArray(item.gallery)) {
        item.gallery.forEach(s=>{ 
            g.innerHTML+=`<img src="${s}" style="width:100%; height:80px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="document.getElementById('m-img').src='${s}'; document.getElementById('m-img').style.display='block'; document.getElementById('m-video').style.display='none';">` 
        });
    }
    m.style.display='flex';
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