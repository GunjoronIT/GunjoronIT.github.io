/* ==========================================================
   Spotlight, tilt, reveal on scroll, counters
   ========================================================== */
/* spotlight + tilt */
document.addEventListener('mousemove',e=>{const c=e.target.closest('.card');if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}});
function bindTilt(){$$('.tm').forEach(t=>{t.onmousemove=e=>{const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform=`perspective(800px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`};t.onmouseleave=()=>t.style.transform=''});}
bindTilt();
const ide=$('#ide');$('.hero').addEventListener('mousemove',e=>{if(innerWidth<1024)return;const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;ide.style.transform=`perspective(1200px) rotateY(${x*-8}deg) rotateX(${y*6}deg)`});

/* reveal */
function scramble(el){if(RM||el.dataset.sc)return;el.dataset.sc=1;const fin=el.dataset.txt||(el.dataset.txt=el.textContent),ch='!<>-_/[]{}=+*^?#01';let f=0;const T=16;
  (function s(){el.textContent=fin.split('').map((c,i)=>c===' '||i<f/T*fin.length?c:ch[Math.random()*ch.length|0]).join('');if(++f<=T)setTimeout(s,40);else el.textContent=fin})()}
// enter: play animation
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const t=e.target;t.classList.add('in');
  const ix=t.querySelector('.idx');if(ix)scramble(ix);counters(t)}),{threshold:.15});
// fully left the screen: reset so it plays again next time
const ioOut=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)return;const t=e.target;t.classList.remove('in');
  t.querySelectorAll('.idx').forEach(x=>delete x.dataset.sc);t.querySelectorAll('[data-count]').forEach(x=>{delete x.dataset.done;x.textContent=bn(0)})}),{threshold:0});
$$('.rv').forEach(el=>{io.observe(el);ioOut.observe(el)});
new IntersectionObserver(es=>es.forEach(e=>{if(e.intersectionRatio>=.4)$('#procEl').classList.add('go');else if(!e.isIntersecting)$('#procEl').classList.remove('go')}),{threshold:[0,.4]}).observe($('#procEl'));

/* counters */
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
function counters(root){root.querySelectorAll('[data-count]').forEach(el=>{if(el.dataset.done)return;el.dataset.done=1;const t=+el.dataset.count,s=performance.now();
  (function u(n){const k=Math.min(1,(n-s)/1400);el.textContent=bn(Math.round(t*(1-Math.pow(1-k,3))));if(k<1)requestAnimationFrame(u)})(s)})}
