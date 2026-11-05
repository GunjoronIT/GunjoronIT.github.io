/* ==========================================================
   Hero typewriter
   ========================================================== */
/* ---------- TYPEWRITER ---------- */
function typeLoop(){
  const W=()=>GJ.list('list.typewriter'),sp=()=>+GJ.A('typeSpeed')||80;
  let w=0,c=0,del=false;const el=$('#typed');
  (function t(){const ws=W(),s=ws[w%ws.length];el.textContent=s.slice(0,c);
    if(!del&&c<s.length){c++;setTimeout(t,sp())}
    else if(!del){del=true;setTimeout(t,1600)}
    else if(c>0){c--;setTimeout(t,Math.max(15,sp()*.45))}
    else{del=false;w=(w+1)%ws.length;setTimeout(t,300)}})();
}
