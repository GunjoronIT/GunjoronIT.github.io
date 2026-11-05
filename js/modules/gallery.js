/* ==========================================================
   প্রজেক্ট গ্যালারি (স্লাইডার + থাম্বনেইল) ও ফুলস্ক্রিন লাইটবক্স
   স্বাইপ, কীবোর্ড (← → Esc), ক্লিকে জুম — সব সাপোর্ট করে।
   ========================================================== */
function galleryHTML(imgs,name){
  const n=imgs.length;
  return `<div class="gal" data-n="${n}">
    <div class="gal-stage">
      <div class="gal-track">${imgs.map((u,i)=>`<figure class="gal-s${i===0?' on':''}" data-i="${i}"><img ${i<2?`src="${esc(u)}"`:`data-src="${esc(u)}"`} alt="${esc(name)} — ছবি ${i+1}" draggable="false" decoding="async"></figure>`).join('')}</div>
      ${n>1?`<button class="gal-nav prev" aria-label="আগের ছবি" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button><button class="gal-nav next" aria-label="পরের ছবি" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>`:''}
      <span class="gal-count"><b>1</b> / ${n}</span>
      <button class="gal-full" aria-label="ফুলস্ক্রিনে দেখুন" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>
    </div>
    ${n>1?`<div class="gal-thumbs">${imgs.map((u,i)=>`<button type="button" class="${i===0?'on':''}" data-i="${i}" aria-label="ছবি ${i+1}"><img src="${esc(u)}" alt="" loading="lazy" draggable="false"></button>`).join('')}</div>`:''}
  </div>`;
}

function bindGallery(root,imgs){
  const g=root.querySelector('.gal');if(!g)return;
  const track=g.querySelector('.gal-track'),stage=g.querySelector('.gal-stage'),n=imgs.length;
  const slides=[...g.querySelectorAll('.gal-s')],thumbs=[...g.querySelectorAll('.gal-thumbs button')],cnt=g.querySelector('.gal-count b');
  let i=0,sx=0,dx=0,drag=false,moved=false,w=1;
  const load=k=>{[k-1,k,k+1].forEach(j=>{const im=slides[(j+n)%n]&&slides[(j+n)%n].querySelector('img');if(im&&im.dataset.src){im.src=im.dataset.src;delete im.dataset.src}})};
  function go(k,anim=true){
    i=(k+n)%n;load(i);
    track.style.transition=anim?'':'none';track.style.transform=`translate3d(${-i*100}%,0,0)`;
    slides.forEach((s,j)=>s.classList.toggle('on',j===i));
    thumbs.forEach((t,j)=>{t.classList.toggle('on',j===i);if(j===i)t.scrollIntoView({block:'nearest',inline:'center',behavior:anim?'smooth':'auto'})});
    cnt.textContent=i+1;
  }
  g._go=go;
  g.querySelector('.prev')&&(g.querySelector('.prev').onclick=e=>{e.stopPropagation();go(i-1)});
  g.querySelector('.next')&&(g.querySelector('.next').onclick=e=>{e.stopPropagation();go(i+1)});
  thumbs.forEach(t=>t.onclick=()=>go(+t.dataset.i));
  g.querySelector('.gal-full').onclick=e=>{e.stopPropagation();openLightbox(imgs,i,k=>go(k))};
  /* স্বাইপ / ড্র্যাগ */
  stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag=true;moved=false;sx=e.clientX;dx=0;w=stage.clientWidth;track.style.transition='none';stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;if(Math.abs(dx)>6)moved=true;
    if(n>1)track.style.transform=`translate3d(calc(${-i*100}% + ${dx}px),0,0)`});
  const end=()=>{if(!drag)return;drag=false;track.style.transition='';
    if(moved&&n>1&&Math.abs(dx)>w*.15)go(dx<0?i+1:i-1);else go(i);
    if(!moved)openLightbox(imgs,i,k=>go(k))};
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',()=>{drag=false;go(i)});
  g.tabIndex=0;g.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(i+1);if(e.key==='ArrowLeft')go(i-1)});
  go(0,false);
}

/* ---------- লাইটবক্স ---------- */
function openLightbox(imgs,start,onChange){
  const n=imgs.length;let i=start,zoom=false;
  const lb=document.createElement('div');lb.className='lb';
  lb.innerHTML=`<div class="lb-top"><span class="lb-c"></span><span class="lb-hint">ক্লিক করলে জুম · স্বাইপ বা ← → দিয়ে বদলান</span><button class="lb-x" aria-label="বন্ধ" type="button">✕</button></div>
  <div class="lb-stage"><img class="lb-img" alt="" draggable="false"></div>
  ${n>1?`<button class="lb-nav prev" aria-label="আগের" type="button">‹</button><button class="lb-nav next" aria-label="পরের" type="button">›</button>
  <div class="lb-thumbs">${imgs.map((u,j)=>`<button type="button" data-i="${j}"><img src="${esc(u)}" alt="" draggable="false"></button>`).join('')}</div>`:''}`;
  document.body.appendChild(lb);requestAnimationFrame(()=>lb.classList.add('open'));
  const im=lb.querySelector('.lb-img'),st=lb.querySelector('.lb-stage'),c=lb.querySelector('.lb-c');
  function show(k,dir=0){
    i=(k+n)%n;zoom=false;lb.classList.remove('zoom');im.style.transform='';
    im.style.opacity=0;im.style.transform=`translateX(${dir*40}px)`;
    const nx=new Image();nx.onload=nx.onerror=()=>{im.src=imgs[i];requestAnimationFrame(()=>{im.style.opacity=1;im.style.transform=''})};nx.src=imgs[i];
    c.textContent=`${i+1} / ${n}`;
    lb.querySelectorAll('.lb-thumbs button').forEach((b,j)=>{b.classList.toggle('on',j===i);if(j===i)b.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})});
    onChange&&onChange(i);
  }
  const close=()=>{lb.classList.remove('open');document.removeEventListener('keydown',key,true);setTimeout(()=>lb.remove(),350)};
  function key(e){
    if(e.key==='Escape'){e.stopImmediatePropagation();e.preventDefault();close()}
    else if(e.key==='ArrowRight'){e.stopImmediatePropagation();show(i+1,1)}
    else if(e.key==='ArrowLeft'){e.stopImmediatePropagation();show(i-1,-1)}
  }
  document.addEventListener('keydown',key,true);
  lb.querySelector('.lb-x').onclick=close;
  lb.querySelector('.prev')&&(lb.querySelector('.prev').onclick=()=>show(i-1,-1));
  lb.querySelector('.next')&&(lb.querySelector('.next').onclick=()=>show(i+1,1));
  lb.querySelectorAll('.lb-thumbs button').forEach(b=>b.onclick=()=>show(+b.dataset.i,+b.dataset.i>i?1:-1));
  /* ক্লিকে জুম + মাউস মুভে প্যান; ব্যাকড্রপে ক্লিকে বন্ধ */
  let sx=0,dx=0,down=false,mv=false;
  st.addEventListener('pointerdown',e=>{down=true;mv=false;sx=e.clientX;dx=0});
  st.addEventListener('pointermove',e=>{
    if(zoom){const r=st.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;im.style.transformOrigin=`${50+px*100}% ${50+py*100}%`;return}
    if(down){dx=e.clientX-sx;if(Math.abs(dx)>8)mv=true}});
  st.addEventListener('pointerup',e=>{
    if(!down)return;down=false;
    if(!zoom&&mv&&n>1&&Math.abs(dx)>60){show(dx<0?i+1:i-1,dx<0?1:-1);return}
    if(mv)return;
    if(e.target===st){close();return}
    zoom=!zoom;lb.classList.toggle('zoom',zoom);im.style.transform=zoom?'scale(2.2)':'';if(!zoom)im.style.transformOrigin=''});
  show(i);
}
