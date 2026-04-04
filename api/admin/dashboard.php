<?php
// Check Cookie instead of Session
if(!isset($_COOKIE['admin_token']) || $_COOKIE['admin_token'] !== md5("vadi_secure_9988")){
    header("Location: /admin/index.php"); 
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Admin Dashboard - Vadi E Kashmir</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <style>
        /* --- RESET & BASE --- */
        * { box-sizing: border-box; outline: none; }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f4f6f9; display: flex; height: 100vh; overflow: hidden; }
        
        /* LAYOUT */
        .sidebar { width: 250px; background: #111827; color: white; display: flex; flex-direction: column; flex-shrink: 0; transition: 0.3s; z-index: 100; }
        .brand { padding: 20px; text-align: center; border-bottom: 1px solid #374151; }
        .brand-logo { width: 60px; height: 60px; object-fit: cover; border-radius: 50%; border: 2px solid #b91c1c; display: block; margin: 0 auto 10px; }
        .nav-links { list-style: none; padding: 0; margin-top: 20px; flex-grow: 1; overflow-y: auto; }
        .nav-links li { padding: 15px 20px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 10px; color: #9ca3af; white-space: nowrap; }
        .nav-links li:hover, .nav-links li.active { background: #b91c1c; color: white; }
        .logout-btn { padding: 20px; text-align: center; cursor: pointer; background: #1f2937; border-top: 1px solid #374151; color: #fff; text-decoration: none; display: block; }

        /* CONTENT */
        .main { flex-grow: 1; padding: 30px; overflow-y: auto; width: 100%; }
        .page-section { display: none; }
        .page-section.active { display: block; animation: fadeIn 0.3s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto 30px auto; }
        h2 { border-bottom: 2px solid #f3f4f6; padding-bottom: 15px; margin-top: 0; color: #111; font-size: 1.5rem; }
        
        /* FORMS */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        label { display: block; margin-top: 15px; font-weight: bold; color: #555; font-size: 0.9rem; }
        input, select, textarea { width: 100%; padding: 12px; margin-top: 5px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
        button.btn { background: #b91c1c; color: white; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 20px; width: 100%; font-size: 1rem; transition: 0.3s; }
        button.btn:disabled { background: #ccc; cursor: not-allowed; }

        /* TABLES */
        .table-container { width: 100%; overflow-x: auto; border: 1px solid #eee; border-radius: 6px; }
        .trend-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .trend-table th, .trend-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .delete-btn { background: #fee2e2; color: #b91c1c; padding: 6px 12px; border-radius: 4px; border: 1px solid #fecaca; font-weight: bold; font-size: 0.85rem; cursor: pointer; }

        /* MOBILE FIX */
        @media (max-width: 900px) {
            body { flex-direction: column; height: auto !important; min-height: 100vh; overflow-y: auto !important; }
            .sidebar { width: 100%; height: auto; position: sticky; top: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .brand { padding: 10px 15px; display: flex; align-items: center; justify-content: space-between; }
            .brand-logo { width: 35px; height: 35px; margin: 0; }
            .nav-links { display: flex; flex-direction: row; overflow-x: auto; padding: 10px 15px; gap: 10px; }
            .nav-links li { padding: 8px 16px; background: #374151; border-radius: 50px; font-size: 0.85rem; }
            .logout-btn { position: absolute; top: 15px; right: 15px; padding: 5px 10px; font-size: 0.8rem; background: #b91c1c; border-radius: 4px; border: none; }
            .main { padding: 15px; overflow: visible !important; }
            .form-grid { grid-template-columns: 1fr; gap: 0; }
        }
    </style>
</head>
<body>

    <div class="sidebar">
        <div class="brand">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="/images/Logo.png" class="brand-logo" alt="Logo">
                <div style="font-weight:bold; color:#b91c1c;">VADI <span>ADMIN</span></div>
            </div>
            <a href="logout.php" class="logout-btn">Logout</a>
        </div>
        <ul class="nav-links">
            <li onclick="showPage('news-page', this)" class="active"><i class="fas fa-pen"></i> Post</li>
            <li onclick="showPage('manage-news-page', this)"><i class="fas fa-trash"></i> Delete</li>
            <li onclick="showPage('ticker-page', this)"><i class="fas fa-bolt"></i> Ticker</li>
            <li onclick="showPage('trending-page', this)"><i class="fas fa-chart-line"></i> Trend</li>
            <li onclick="showPage('ads-page', this)"><i class="fas fa-ad"></i> Ads</li>
        </ul>
    </div>

    <div class="main" id="dashboardMain">
        <!-- 1. POST NEWS -->
        <div id="news-page" class="page-section active">
            <div class="card">
                <h2>📝 Post News</h2>
                <form id="newsForm">
                    <div class="form-grid">
                        <div>
                            <label>Layout</label>
                            <select id="newsType" name="type"><option value="standard">Standard (Grid)</option><option value="hero">Hero (Top)</option></select>
                        </div>
                        <div>
                            <label>Category</label>
                            <select id="newsCategory" name="category">
                                <option value="Article">Article</option>
                                <option value="J & K">J & K</option>
                                <option value="Nation">Nation</option>
                                <option value="Updates">Updates</option>
                                <option value="Business">Business</option>
                                <option value="Sports">Sports</option>
                                <option value="Technology">Technology</option>
                                <option value="Education">Education</option>
                            </select>
                        </div>
                    </div>
                    <label>Headline</label><input type="text" id="title" name="title" required>
                    <label>Writer</label><input type="text" id="author" name="author" placeholder="Admin">
                    <label>Content / Description (For Articles, use this editor carefully. Add images natively above or use formatting below)</label>
                    <div id="editor-container" style="height: 300px; background: white;"></div>
                    <input type="hidden" id="desc" name="desc">
                    
                    <!-- We will use Base64 for images to keep it simple or handle multipart -->
                    <label>Main Image (Automatically Compresses)</label><input type="file" id="mainImg">
                    
                    <label>Gallery (Multiple)</label><input type="file" id="galleryImg" multiple>
                    <label>Video URL</label><input type="text" id="videoLink" name="video">
                    
                    <button type="submit" class="btn" id="publishBtn">Publish News</button>
                </form>
            </div>
        </div>

        <!-- 2. MANAGE NEWS -->
        <div id="manage-news-page" class="page-section">
            <div class="card">
                <h2>🗑️ Delete News</h2>
                <div class="table-container">
                    <table class="trend-table"><thead><tr><th>News</th><th>Category</th><th>Action</th></tr></thead><tbody id="manageNewsBody"></tbody></table>
                </div>
            </div>
        </div>
        
        <!-- 3. TICKER -->
        <div id="ticker-page" class="page-section">
            <div class="card">
                <h2>⚡ Ticker</h2>
                <form id="tickerForm">
                    <label>Text</label><input type="text" id="tickerTitle" required>
                    <label>Link</label><input type="text" id="tickerLink">
                    <button type="submit" class="btn">Add</button>
                </form>
            </div>
        </div>
        
        <!-- 4. TRENDING -->
        <div id="trending-page" class="page-section">
            <div class="card">
                <h2>📈 Trending</h2>
                <div class="table-container">
                    <table class="trend-table"><thead><tr><th>News</th><th>Date</th><th>Trend</th></tr></thead><tbody id="trendingListBody"></tbody></table>
                </div>
            </div>
        </div>
        
        <!-- 5. ADS -->
        <div id="ads-page" class="page-section">
            <div class="card">
                <h2>📢 Manage Ads</h2>
                <h3>Manual Ad</h3>
                <form id="manualAdForm">
                    <label>Image</label><input type="file" id="adImg" required>
                    <label>Bio / Description</label><textarea id="adBio"></textarea>
                    <label>Link</label><input type="text" id="adLink">
                    <button type="submit" class="btn">Set Ad</button>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/quill-image-drop-module@1.0.3/image-drop.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/quill-image-resize-module@3.0.0/image-resize.min.js"></script>
    <script>
        // Register Modules
        Quill.register('modules/imageDrop', QuillImageDrop.ImageDrop);
        Quill.register('modules/imageResize', ImageResize.default || ImageResize);

        var quill = new Quill('#editor-container', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['image', 'link', 'blockquote'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['clean']
                ],
                imageDrop: true,
                imageResize: {
                    displaySize: true
                }
            }
        });

        // --- NAVIGATION ---
        window.showPage = function(pid, el) {
            document.querySelectorAll('.page-section').forEach(p=>p.classList.remove('active'));
            document.getElementById(pid).classList.add('active');
            document.querySelectorAll('.nav-links li').forEach(l=>l.classList.remove('active'));
            el.classList.add('active');
            
            if(pid==='trending-page') loadTrend();
            if(pid==='manage-news-page') loadManage();
        }

        // --- UTILS: Smart Image Compression (Reuse from previous admin.html) ---
        const resizeImage = (file) => new Promise((resolve) => {
            if(!file) resolve(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 800; // Resize huge photos to 800px width
                    
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress quality 70%
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        // --- API CALLS ---

        // 1. POST NEWS
        document.getElementById('newsForm').addEventListener('submit', async(e) => {
            e.preventDefault();
            const btn = document.getElementById('publishBtn');
            btn.disabled = true; 
            btn.innerText = "Compressing & Uploading...";

            const f = document.getElementById('mainImg').files[0];
            const gf = document.getElementById('galleryImg').files;
            
            let img = "";
            if(f) {
                img = await resizeImage(f); 
            }
            
            let gal = []; 
            for(let g of gf) {
                gal.push(await resizeImage(g));
            }

            // Use Quill HTML content
            let descValue = quill.root.innerHTML;
            if (descValue === '<p><br></p>') descValue = ""; 

            const data = {
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                desc: descValue,
                type: document.getElementById('newsType').value,
                category: document.getElementById('newsCategory').value,
                video: document.getElementById('videoLink').value,
                main_image: img,
                gallery: gal
            };

            try {
                // Absolute path /api/post_news.php
                const response = await fetch('/api/post_news.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                
                if(result.success) {
                    alert("✅ Published Successfully!"); 
                    e.target.reset();
                } else {
                    alert("Error: " + result.message);
                }
            } catch(err) { 
                console.error(err); 
                alert("Network Error!"); 
            } finally {
                btn.disabled = false;
                btn.innerText = "Publish News";
            }
        });

        // 2. TICKER
        document.getElementById('tickerForm').addEventListener('submit', async(e)=>{
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerText;
            btn.disabled = true;
            btn.innerText = "Adding...";

            const data = {
                title: document.getElementById('tickerTitle').value,
                link: document.getElementById('tickerLink').value
            };
            
            try {
                const response = await fetch('/api/post_ticker.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                // Parse JSON response
                const result = await response.json();
                
                if(result.success) {
                    alert("✅ Ticker Added Successfully!"); 
                    e.target.reset();
                } else {
                    alert("❌ Error: " + (result.error || result.message || "Failed to add ticker"));
                }
            } catch(err) { 
                console.error(err); 
                alert("Network Error: " + err.message);
            } finally {
                btn.disabled = false;
                btn.innerText = originalText;
            }
        });

        // 3. LOAD DATA (Trending/Manage)
        async function fetchNews() {
            // Absolute path /api/get_news.php with cache busting
            const res = await fetch('/api/get_news.php?_=' + new Date().getTime());
            return await res.json();
        }

        async function loadManage() {
            const b = document.getElementById('manageNewsBody'); 
            b.innerHTML = "Loading...";
            try {
                const news = await fetchNews();
                b.innerHTML = "";
                news.forEach(i => {
                    const tr = document.createElement('tr');
                    // Pass ID and Type to delete function
                    tr.innerHTML = `<td>${i.title.substring(0,30)}...</td><td>${i.category||i.type}</td><td><button class="delete-btn" onclick="deleteNews(${i.id}, '${i.type}')">Delete</button></td>`;
                    b.appendChild(tr);
                });
            } catch(e) { b.innerHTML = "Error loading news."; }
        }

        async function deleteNews(id, type) {
            if(confirm("Delete this " + (type || 'news') + " item?")) {
                try {
                    const response = await fetch('/api/delete_news.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({id: id, type: type})
                    });
                    const result = await response.json();
                    if(result.success) {
                        alert("Deleted!");
                        loadManage();
                    } else {
                        alert("Failed to delete: " + (result.error || "Unknown error"));
                        console.error(result);
                    }
                } catch(e) {
                    alert("Network Error: " + e.message);
                }
            }
        }

        async function loadTrend() {
            const b = document.getElementById('trendingListBody'); 
            b.innerHTML = "Loading...";
            try {
                const news = await fetchNews();
                b.innerHTML = "";
                news.forEach(i => {
                    if(i.type !== 'breaking') { 
                        const tr = document.createElement('tr');
                        tr.innerHTML = `<td>${i.title.substring(0,30)}...</td><td>${i.created_at}</td><td><input type="checkbox" ${i.is_trending == 1 ?'checked':''} onchange="toggleTrend(${i.id}, this.checked)"></td>`;
                        b.appendChild(tr);
                    }
                });
            } catch(e) { b.innerHTML = "Error."; }
        }

        async function toggleTrend(id, status) {
            await fetch('/api/toggle_trending.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({id: id, status: status})
            });
        }
        
    </script>
</body>
</html>
