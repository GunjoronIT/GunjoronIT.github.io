/* ==========================================================
   Premium enhancements (orbs, ripple, sparkles, mouse trail...)
   ========================================================== */
/* ═══════════════════════════════════════════════════════════════
   PREMIUM ENHANCEMENTS — NEW JS (appended, no originals modified)
   ═══════════════════════════════════════════════════════════════ */

/* --- 2. Floating orbs in hero --- */
(function(){
  const hero=document.querySelector('.hero');
  if(!hero)return;
  for(let i=0;i<3;i++){
    const orb=document.createElement('div');
    orb.className='hero-orb';
    hero.appendChild(orb);
  }
})();

/* --- 4. Ripple effect on buttons --- */
document.addEventListener('click',function(e){
  const btn=e.target.closest('.btn,.btn-x,.btn-p,.flt,.cmds button');
  if(!btn)return;
  const rect=btn.getBoundingClientRect();
  const ink=document.createElement('span');
  ink.className='ripple-ink';
  const size=Math.max(rect.width,rect.height)*2;
  ink.style.width=ink.style.height=size+'px';
  ink.style.left=(e.clientX-rect.left-size/2)+'px';
  ink.style.top=(e.clientY-rect.top-size/2)+'px';
  btn.style.position=btn.style.position||'relative';
  btn.style.overflow='hidden';
  btn.appendChild(ink);
  ink.addEventListener('animationend',()=>ink.remove());
});

/* --- 10. Footer sparkles --- */
(function(){
  const footer=document.querySelector('footer');
  if(!footer||RM)return;
  footer.style.position='relative';footer.style.overflow='hidden';
  setInterval(()=>{
    if(document.hidden)return;
    const rect=footer.getBoundingClientRect();
    if(rect.top>innerHeight||rect.bottom<0)return;
    const spark=document.createElement('div');
    spark.className='footer-sparkle';
    spark.style.left=Math.random()*100+'%';
    spark.style.bottom=Math.random()*60+'%';
    spark.style.width=spark.style.height=(Math.random()*3+1)+'px';
    spark.style.animationDuration=(Math.random()*2+2)+'s';
    footer.appendChild(spark);
    spark.addEventListener('animationend',()=>spark.remove());
  },800);
})();

/* --- 11a. Mouse trail effect --- */
(function(){
  if(RM||!matchMedia('(hover:hover)').matches)return;
  const dots=[];const MAX=12;
  let lastX=0,lastY=0;
  document.addEventListener('mousemove',function(e){
    const dx=e.clientX-lastX,dy=e.clientY-lastY;
    if(Math.abs(dx)+Math.abs(dy)<6)return;
    lastX=e.clientX;lastY=e.clientY;
    const dot=document.createElement('div');
    dot.className='mouse-trail-dot';
    dot.style.left=e.clientX+'px';
    dot.style.top=e.clientY+'px';
    document.body.appendChild(dot);
    dots.push(dot);
    setTimeout(()=>{dot.style.opacity='0'},50);
    setTimeout(()=>{dot.remove();dots.shift()},350);
    while(dots.length>MAX){const old=dots.shift();old.remove()}
  });
})();

/* --- 11b. Enhanced parallax on hero --- */
(function(){
  if(RM)return;
  const hero=document.querySelector('.hero .wrap');
  if(!hero)return;
  const avail=hero.querySelector('.avail');
  const heroMeta=hero.querySelector('.hero-meta');
  document.querySelector('.hero').addEventListener('mousemove',function(e){
    if(innerWidth<1024)return;
    const x=(e.clientX/innerWidth-.5)*2;
    const y=(e.clientY/innerHeight-.5)*2;
    if(avail)avail.style.transform=`translate(${x*6}px,${y*4}px)`;
    if(heroMeta)heroMeta.style.transform=`translate(${x*-4}px,${y*-3}px)`;
  });
})();

/* --- 11c. Staggered counter animation for stats --- */
(function(){
  const statsEl=document.querySelector('.stats');
  if(!statsEl)return;
  const statIO=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      const bolds=statsEl.querySelectorAll('.st b');
      bolds.forEach(function(b,i){
        b.style.opacity='0';b.style.transform='translateY(16px)';
        b.style.transition='opacity .6s ease-out,transform .6s ease-out';
        b.style.transitionDelay=(i*120)+'ms';
        requestAnimationFrame(function(){requestAnimationFrame(function(){
          b.style.opacity='1';b.style.transform='none';
        })});
      });
    });
  },{threshold:0.3});
  statIO.observe(statsEl);
})();

/* --- 12. Service number count-up on scroll --- */
(function(){
  if(RM)return;
  const svcIO=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      const nums=entry.target.querySelectorAll('.svc .num');
      nums.forEach(function(n,i){
        if(n.dataset.animated)return;
        n.dataset.animated='1';
        const target=parseInt(n.textContent.replace('/',''),10);
        if(isNaN(target))return;
        let count=0;
        const iv=setInterval(function(){
          count++;
          n.textContent='/0'+count;
          if(count>=target)clearInterval(iv);
        },120);
      });
    });
  },{threshold:0.2});
  const svcSection=document.querySelector('#services');
  if(svcSection)svcIO.observe(svcSection);
})();

/* --- 3. Section glow dots (decorative dividers) --- */
(function(){
  if(RM)return;
  document.querySelectorAll('section').forEach(function(sec){
    const dot=document.createElement('div');
    dot.className='section-glow-dot';
    sec.appendChild(dot);
  });
})();
