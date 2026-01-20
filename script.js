import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
apiKey:"AIzaSyAj1lPZymdb6jSPrf8ZSfBIIlvc-7JqLho",
authDomain:"vadi-e-kashmir.firebaseapp.com",
projectId:"vadi-e-kashmir"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allNews = [];

document.addEventListener("DOMContentLoaded",()=>{
applyTheme();
loadNews();
});

function applyTheme(){
document.body.classList.toggle(
"dark-mode",
localStorage.getItem("vadiTheme")==="dark"
);
}

window.toggleTheme=()=>{
const dark=!document.body.classList.contains("dark-mode");
localStorage.setItem("vadiTheme",dark?"dark":"light");
applyTheme();
};

async function loadNews(){
const q=query(collection(db,"news"),orderBy("id","desc"));
const snap=await getDocs(q);
allNews=[];
snap.forEach(d=>allNews.push({...d.data(),fbId:d.id}));
render();
}

function render(){
const grid=document.getElementById("news-grid");
const hero=document.getElementById("hero-main");
grid.innerHTML="";

if(allNews.length){
hero.innerHTML=`
<div class="hero-card" onclick='openArticle(${JSON.stringify(allNews[0])})'>
<img src="${allNews[0].img}">
</div>`;
}

allNews.slice(1).forEach(n=>{
grid.innerHTML+=`
<div class="news-card-modern" onclick='openArticle(${JSON.stringify(n)})'>
<img src="${n.img}">
<h3>${n.title}</h3>
</div>`;
});
}

window.openArticle=(item)=>{
document.getElementById("main-content-area").style.display="none";
const page=document.getElementById("article-page-view");
page.style.display="block";
applyTheme();

document.getElementById("article-container").innerHTML=`
<button onclick="closeArticle()">← Back</button>
<img src="${item.img}">
<h1>${item.title}</h1>
<p>${item.desc}</p>
`;
};

window.closeArticle=()=>{
document.getElementById("article-page-view").style.display="none";
document.getElementById("main-content-area").style.display="block";
applyTheme();
};
