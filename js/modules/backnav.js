/* ==========================================================
   মোবাইলের "ব্যাক" বাটন: ধাপে ধাপে ফিরে আসে, হঠাৎ সাইট থেকে বেরিয়ে যায় না।
   ক্রম: লাইটবক্স → প্রজেক্ট পপআপ / মেনু / সার্চ → হোমে (উপরে) → তারপর সাইট থেকে বের।
   ========================================================== */
(function(){
  const S=()=>({gj:'site'});
  try{history.scrollRestoration='manual'}catch(e){}
  /* পেজ খোলার সময় একটি "সেন্টিনেল" এন্ট্রি বসাই, যাতে ব্যাক চাপলে আমরাই প্রথমে খবর পাই */
  if(!(history.state&&history.state.gj==='site')){
    history.replaceState({gj:'home'},'',location.href);
    history.pushState(S(),'',location.href);
  }
  const click=sel=>{const b=document.querySelector(sel);if(b){b.click();return true}return false};
  function closeTopLayer(){
    if(document.querySelector('.lb.open'))return click('.lb .lb-x');
    if(document.getElementById('pal')?.classList.contains('open')){closePal();return true}
    if(document.getElementById('modal')?.classList.contains('open')){closeP();return true}
    if(document.getElementById('mnav')?.classList.contains('open')){setM(false);return true}
    return false;
  }
  addEventListener('popstate',e=>{
    if(e.state&&e.state.gj==='site')return;       /* সামনের দিকে যাওয়া — কিছু করার নেই */
    if(closeTopLayer()){history.pushState(S(),'',location.href);return}
    if(scrollY>120){scrollTo({top:0,behavior:'smooth'});history.replaceState({gj:'home'},'',location.pathname+location.search);history.pushState(S(),'',location.pathname+location.search);return}
    history.back();                               /* হোমে আছি, কিছু খোলা নেই — এবার সাইট থেকে বের হই */
  });
  /* ভেতরের লিংকে ক্লিক করলে নতুন হিস্ট্রি এন্ট্রি না বানিয়ে স্মুথ স্ক্রল */
  window.goTo=function(h){const t=h&&h.length>1&&document.querySelector(h);if(!t)return;t.scrollIntoView({behavior:'smooth'});history.replaceState(history.state,'',h)};
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');if(!a)return;const h=a.getAttribute('href');
    if(!h||h.length<2||!document.querySelector(h))return;
    e.preventDefault();goTo(h);
  });
})();
