/* ==========================================================
   Hero typewriter
   ========================================================== */
/* ---------- TYPEWRITER ---------- */
function typeLoop(){
  const words=['প্রিমিয়াম ওয়েবসাইট','মোবাইল অ্যাপ','সুন্দর UI/UX','স্কেলযোগ্য API'];
  let w=0,c=0,del=false;const el=$('#typed');
  (function t(){const s=words[w];el.textContent=s.slice(0,c);
    if(!del&&c<s.length){c++;setTimeout(t,80)}
    else if(!del){del=true;setTimeout(t,1600)}
    else if(c>0){c--;setTimeout(t,35)}
    else{del=false;w=(w+1)%words.length;setTimeout(t,300)}})();
}
