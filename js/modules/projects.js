/* ==========================================================
   Project filters & modal
   ========================================================== */
/* filters */
$$('.flt').forEach(b=>b.onclick=()=>{$$('.flt').forEach(x=>x.classList.remove('on'));b.classList.add('on');const f=b.dataset.f;
  $$('.pj').forEach(p=>{const show=f==='all'||p.dataset.t===f;p.classList.toggle('out',!show);
    if(show){p.style.opacity=0;p.style.transform='translateY(20px)';requestAnimationFrame(()=>requestAnimationFrame(()=>{p.style.opacity=1;p.style.transform='none';setTimeout(()=>{p.style.opacity='';p.style.transform='';p.classList.add('in')},450)}))}});
  $$('.pj:not(.out)').forEach((p,i,arr)=>{p.classList.remove('w','n');p.classList.add(f==='all'?projects.find(x=>x.id===p.dataset.id).size:(arr.length===2?'w':'n'))});
});

/* modal */
function openP(id){const p=projects.find(x=>x.id===id);if(!p)return;
  const imgs=(p.imgs||[]).filter(Boolean),has=imgs.length>0;
  $('#mbox').classList.toggle('wide',has);
  $('#mbox').innerHTML=`<div class="mh ${has?'has-gal':esc(p.v)}">${has?galleryHTML(imgs,p.name):mk(p)}<button class="x" aria-label="বন্ধ">✕</button></div><div class="mc"><div class="mono g" style="font-size:12px">// ${esc(p.type)}</div><h3>${esc(p.name)}</h3><div class="en m" style="font-family:var(--en)">${esc(p.en)}</div><p class="m" style="margin-top:16px;font-size:16.5px">${esc(p.d)}</p>
  <div class="cs"><div><small>ধরন</small>${esc(p.type)}</div><div><small>প্ল্যাটফর্ম</small>${p.t==='app'?'Android · iOS':'Web · সব ডিভাইস'}</div><div><small>টিম</small>গুঞ্জরণ</div></div>
  <div class="chips">${p.tech.map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div>
  <div style="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap"><a href="#contact" class="btn btn-p btn-sm" onclick="closeP()">এমন প্রজেক্ট চাই →</a><button class="btn btn-o btn-sm" onclick="closeP()">ফিরে যান</button></div></div>`;
  if(has)bindGallery($('#mbox'),imgs);
  $('#mbox').scrollTop=0;
  $('#modal').classList.add('open');$('.mb .x').onclick=closeP}
function closeP(){$('#modal').classList.remove('open')}
$('#modal').onclick=e=>{if(e.target.id==='modal')closeP()};
function bindProjectCards(){$$('.pj').forEach(p=>{p.onclick=()=>openP(p.dataset.id);p.onkeydown=e=>{if(e.key==='Enter')openP(p.dataset.id)}});}
bindProjectCards();
