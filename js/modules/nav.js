/* ==========================================================
   Navigation, scroll progress, mobile menu
   ========================================================== */
/* ---------- NAV / PROGRESS ---------- */
let lastY=0;
const ttB=$('#totop'),ttPg=$('#ttPg'),ttPct=$('#ttPct'),ttHd=$('#ttHd');
/* স্মুথ স্ক্রোল প্রগ্রেস: rAF + ইজিং (lerp) */
let ttTarget=0,ttCur=0,ttRaf=0,ttMax=1,secTick=0;
const progEl=$('#prog'),navEl=$('#nav'),mnavEl=$('#mnav');
const calcMax=()=>{ttMax=Math.max(1,document.documentElement.scrollHeight-innerHeight)};
function ttRender(){
  ttCur+=(ttTarget-ttCur)*0.14;
  if(Math.abs(ttTarget-ttCur)<0.0004)ttCur=ttTarget;
  const n=Math.round(ttCur*100);
  ttPg.style.strokeDashoffset=(157.08*(1-ttCur)).toFixed(3);
  ttHd.style.transform='rotate('+(ttCur*360).toFixed(2)+'deg)';
  const t=n>=99?'EOF':n+'<i>%</i>';
  if(ttPct._t!==t){ttPct.innerHTML=t;ttPct._t=t}
  ttB.classList.toggle('eof',n>=99);
  progEl.style.width=(ttCur*100).toFixed(2)+'%';
  ttRaf=ttCur===ttTarget?0:requestAnimationFrame(ttRender);
}
function secUpdate(){
  secTick=0;let cur='';
  $$('section[id],header[id]').forEach(s=>{if(s.getBoundingClientRect().top<innerHeight*.4)cur=s.id});
  $$('.links a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur));
}
function onScr(){
  const y=scrollY;
  ttTarget=Math.min(1,Math.max(0,y/ttMax));
  ttB.classList.toggle('show',y>400);
  navEl.classList.toggle('hide',y>lastY&&y>300&&!mnavEl.classList.contains('open'));lastY=y;
  if(!ttRaf)ttRaf=requestAnimationFrame(ttRender);
  if(!secTick)secTick=requestAnimationFrame(secUpdate);
}
calcMax();
addEventListener('scroll',onScr,{passive:true});
addEventListener('resize',()=>{calcMax();onScr()},{passive:true});
addEventListener('load',()=>{calcMax();onScr()});
if('ResizeObserver' in window)new ResizeObserver(()=>{calcMax();onScr()}).observe(document.body);
ttCur=ttTarget=Math.min(1,scrollY/ttMax);onScr();
const mn=$('#mnav'),bgr=$('#burger');
function setM(o){mn.classList.toggle('open',o);bgr.classList.toggle('on',o);mn.setAttribute('aria-hidden',!o);document.body.style.overflow=o?'hidden':''}
bgr.onclick=()=>setM(!mn.classList.contains('open'));
$$('#mnav a.ml').forEach((a,i)=>{a.style.transitionDelay=(i*55+80)+'ms';a.addEventListener('click',()=>setM(false))});
$$('.mn-foot a').forEach(a=>a.addEventListener('click',()=>setM(false)));
$('#mSearch').onclick=()=>{setM(false);setTimeout(openPal,200)};
ttB.onclick=()=>{scrollTo({top:0,behavior:'smooth'});toast('> window.scrollTo(0, 0) ✓')};
