/* ==========================================================
   Custom cursor & magnetic buttons
   ========================================================== */
/* ---------- CURSOR + MAGNETIC ---------- */
(function(){
  const c=$('.cur'),d=$('.cur-dot');let mx=0,my=0,cx=0,cy=0;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;d.style.transform=`translate(${mx-3}px,${my-3}px)`});
  (function l(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;c.style.transform=`translate(${cx-c.offsetWidth/2}px,${cy-c.offsetHeight/2}px)`;requestAnimationFrame(l)})();
  d.style.transform='translate(-50px,-50px)';c.style.left=c.style.top=d.style.left=d.style.top='0';
  document.addEventListener('mouseover',e=>{c.classList.toggle('hover',!!e.target.closest('a,button,.pj,input,textarea,label'))});
  document.addEventListener('mousemove',e=>{const m=e.target.closest('.mag');$$('.mag').forEach(b=>{if(b!==m)b.style.transform=''});
    if(m){const r=m.getBoundingClientRect();m.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`}});
})();
