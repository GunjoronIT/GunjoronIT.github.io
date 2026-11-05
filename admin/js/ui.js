/* ==========================================================
   অ্যাডমিন UI কিট — আইকন, পপআপ (মডাল/কনফার্ম/সাকসেস/এরর/লোডিং), টোস্ট, ফর্ম হেল্পার
   সব পপআপ এখান থেকেই আসে, তাই পুরো অ্যাডমিনে একই রকম দেখায়।
   ========================================================== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bnum=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const fmtDate=d=>new Date(d).toLocaleString('bn-BD',{dateStyle:'medium',timeStyle:'short'});
const fmtBytes=b=>b<1024?bnum(b)+' B':b<1048576?bnum((b/1024).toFixed(b<10240?1:0))+' KB':bnum((b/1048576).toFixed(1))+' MB';
const slugify=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- আইকন ---------- */
const IC={
  dash:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  proj:'<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 22h8M12 18v4"/>',
  team:'<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  faq:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  code:'<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  type:'<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  palette:'<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3a2 2 0 0 1 1.5-3.2H17a5 5 0 0 0 5-5C22 6 17.5 2 12 2z"/>',
  spark:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ext:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  img:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  up:'<path d="m18 15-6-6-6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',
  upl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',
  warn:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  grip:'<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  stack:'<path d="m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
  reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
  zoom:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
  star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1z"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>'
};
const ic=(n,cls='')=>`<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;

/* ---------- টোস্ট ---------- */
const ui={};
ui.toast=(type,title,msg='',ms=3800)=>{
  let box=$('#toasts');if(!box){box=document.createElement('div');box.id='toasts';document.body.appendChild(box)}
  const el=document.createElement('div');el.className='ts '+type;
  const icn={ok:'check',bad:'x',info:'info',warn:'warn'}[type]||'info';
  el.innerHTML=`<div class="ti">${ic(icn)}</div><div><b>${esc(title)}</b>${msg?`<p>${esc(msg)}</p>`:''}</div><button class="tx" aria-label="বন্ধ">${ic('x')}</button><i class="tb" style="animation-duration:${ms}ms"></i>`;
  box.appendChild(el);
  const close=()=>{if(el._c)return;el._c=1;el.classList.add('out');setTimeout(()=>el.remove(),300)};
  el.querySelector('.tx').onclick=close;setTimeout(close,ms);return close;
};
ui.ok=(t,m)=>ui.toast('ok',t,m);ui.bad=(t,m)=>ui.toast('bad',t,m,5500);ui.info=(t,m)=>ui.toast('info',t,m);

/* ---------- মূল মডাল ---------- */
let modalStack=[];
ui.modal=function(o){
  const ov=document.createElement('div');ov.className='ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
  ov.innerHTML=`<div class="md ${o.cls||''}">${o.title?`<div class="mhd"><div class="t"><h3>${o.title}</h3>${o.sub?`<p>${o.sub}</p>`:''}</div>${o.closable===false?'':`<button class="mx" type="button" aria-label="বন্ধ">${ic('x')}</button>`}</div>`:''}<div class="mbd"></div>${o.footer===false?'':'<div class="mft"></div>'}</div>`;
  const body=ov.querySelector('.mbd'),foot=ov.querySelector('.mft');
  if(typeof o.body==='string')body.innerHTML=o.body;else if(o.body)body.appendChild(o.body);
  document.body.appendChild(ov);document.body.style.overflow='hidden';
  requestAnimationFrame(()=>ov.classList.add('open'));
  let closed=false;const prevFocus=document.activeElement;
  const h={el:ov,body,foot,close(v){
    if(closed)return;closed=true;ov.classList.remove('open');
    modalStack=modalStack.filter(x=>x!==h);if(!modalStack.length)document.body.style.overflow='';
    setTimeout(()=>ov.remove(),280);prevFocus&&prevFocus.focus&&prevFocus.focus({preventScroll:true});o.onClose&&o.onClose(v);h._res&&h._res(v)},
    wait(){return new Promise(r=>h._res=r)},
    busy(b){$$('button',foot||ov).forEach(x=>{if(!x.classList.contains('mx'))x.disabled=b})}};
  (o.actions||[]).forEach(a=>{
    const b=document.createElement('button');b.type='button';b.className='btn '+(a.cls||'');b.innerHTML=a.label;
    b.onclick=async()=>{if(a.onClick){b.classList.add('busy');try{const r=await a.onClick(h);if(r===false){b.classList.remove('busy');return}}catch(e){b.classList.remove('busy');throw e}}h.close(a.value)};
    foot&&foot.appendChild(b);a.el=b;
  });
  const x=ov.querySelector('.mx');if(x)x.onclick=()=>h.close(o.dismissValue);
  if(o.closable!==false&&o.backdrop!==false){let down=false;ov.addEventListener('mousedown',e=>{down=e.target===ov});ov.addEventListener('mouseup',e=>{if(down&&e.target===ov)h.close(o.dismissValue);down=false})}
  h.closable=o.closable!==false;modalStack.push(h);
  setTimeout(()=>{const f=o.focus?ov.querySelector(o.focus):ov.querySelector('input:not([type=hidden]):not([type=file]),textarea,select');(f||ov.querySelector('.btn.p,.btn.d'))?.focus({preventScroll:true})},120);
  return h;
};
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&modalStack.length){const t=modalStack[modalStack.length-1];if(t.closable)t.close()}
});

/* ---------- কনফার্ম / সাকসেস / এরর / ইনফো ---------- */
const bigIcon=(kind)=>`<div class="big ${kind}">${ic({ok:'check',bad:'x',warn:'warn',info:'info',trash:'trash'}[kind]||'info')}</div>`;
ui.confirm=({title='নিশ্চিত?',message='',confirmText='হ্যাঁ, এগিয়ে যান',cancelText='বাতিল',danger=false,kind})=>{
  const h=ui.modal({cls:'sm msgbox',closable:true,dismissValue:false,
    body:`<div class="big ${danger?'bad':'warn'}">${ic(danger?'trash':'warn')}</div><h3>${esc(title)}</h3><p>${message}</p>`,
    actions:[{label:esc(cancelText),value:false},{label:esc(confirmText),cls:danger?'d solid':'p',value:true}]});
  return h.wait();
};
ui.success=(title,message='',{auto=2200,action}={})=>{
  const h=ui.modal({cls:'sm msgbox',footer:action?undefined:false,
    body:`${bigIcon('ok')}<h3>${esc(title)}</h3>${message?`<p>${message}</p>`:''}${action?'':`<div class="autobar"><i style="animation-duration:${auto}ms"></i></div>`}`,
    actions:action?[{label:'ঠিক আছে',value:true},{label:action.label,cls:'p',onClick:action.onClick,value:'act'}]:[]});
  if(!action)setTimeout(()=>h.close(),auto);
  return h;
};
ui.error=(title,message='')=>ui.modal({cls:'sm msgbox',body:`${bigIcon('bad')}<h3>${esc(title)}</h3><p>${message}</p>`,actions:[{label:'বুঝেছি',cls:'p',value:true}]}).wait();
ui.notice=(title,message='',kind='info')=>ui.modal({cls:'sm msgbox',body:`${bigIcon(kind)}<h3>${esc(title)}</h3><p>${message}</p>`,actions:[{label:'ঠিক আছে',cls:'p',value:true}]}).wait();
/* ব্লকিং লোডিং পপআপ (আপলোড/কমপ্রেস চলার সময়) */
ui.loading=(title='অপেক্ষা করুন...',sub='')=>{
  const h=ui.modal({cls:'sm msgbox',closable:false,footer:false,backdrop:false,
    body:`<div class="spin" style="margin:0 auto 18px"></div><h3 data-t>${esc(title)}</h3><p data-s>${esc(sub)}</p><div class="prog ind"><i></i></div>`});
  const t=h.el.querySelector('[data-t]'),s=h.el.querySelector('[data-s]'),pg=h.el.querySelector('.prog');
  h.set=(a,b,pct)=>{if(a!=null)t.textContent=a;if(b!=null)s.textContent=b;if(pct!=null){pg.classList.remove('ind');pg.firstElementChild.style.width=Math.max(2,Math.min(100,pct))+'%'}};
  return h;
};
/* ফর্ম-মডাল: সেভ বাটন চাপলে onSubmit চলে; সফল হলে বন্ধ, ব্যর্থ হলে ভেতরেই লাল বার্তা */
ui.form=({title,sub,html,cls='',submitText='সেভ করুন',onMount,onSubmit,dirtyGuard=true})=>{
  const wrap=document.createElement('form');wrap.noValidate=true;wrap.innerHTML=`<div class="ferr" role="alert"></div>${html}`;
  let dirty=false;wrap.addEventListener('input',()=>dirty=true);wrap.addEventListener('change',()=>dirty=true);wrap.markDirty=()=>dirty=true;
  const h=ui.modal({title,sub,cls,body:wrap,dismissValue:undefined,
    actions:[{label:'বাতিল',value:false},{label:submitText,cls:'p',value:true,onClick:()=>submit()}]});
  const guardClose=h.close;
  h.close=async function(v){if(dirtyGuard&&dirty&&v===undefined&&!h._force){if(!await ui.confirm({title:'সেভ না করা পরিবর্তন আছে',message:'এখন বেরিয়ে গেলে আপনার করা পরিবর্তনগুলো হারিয়ে যাবে।',confirmText:'হ্যাঁ, বেরিয়ে যান',cancelText:'ফিরে যান',danger:true}))return}guardClose(v)};
  /* বাতিল বাটনও গার্ড পাবে */
  h.foot.firstElementChild.onclick=()=>h.close(undefined);
  const err=wrap.querySelector('.ferr');
  async function submit(){
    err.textContent='';
    try{const r=await onSubmit(wrap,h);if(r===false)return false;h._force=true;guardClose(true);return false}
    catch(e){err.textContent=e.message||String(e);h.body.scrollTo({top:0,behavior:'smooth'});return false}
  }
  wrap.onsubmit=e=>{e.preventDefault();h.foot.lastElementChild.click()};
  onMount&&onMount(wrap,h);
  return h;
};

/* ---------- ফর্ম হেল্পার ---------- */
const F={
  text:(id,l,v='',o={})=>`<div class="field"><label for="${id}">${l}</label><input type="${o.type||'text'}" id="${id}" value="${esc(v)}" ${o.ph?`placeholder="${esc(o.ph)}"`:''} ${o.max?`maxlength="${o.max}"`:''} autocomplete="off">${o.help?`<div class="help">${o.help}</div>`:''}</div>`,
  area:(id,l,v='',o={})=>`<div class="field"><label for="${id}">${l}</label><textarea id="${id}" ${o.max?`maxlength="${o.max}"`:''} ${o.ph?`placeholder="${esc(o.ph)}"`:''} style="${o.h?`min-height:${o.h}px`:''}">${esc(v)}</textarea>${o.help?`<div class="help">${o.help}</div>`:''}</div>`,
  num:(id,l,v=0,o={})=>`<div class="field"><label for="${id}">${l}</label><input type="number" id="${id}" value="${esc(v)}">${o.help?`<div class="help">${o.help}</div>`:''}</div>`,
  sel:(id,l,v,opts,o={})=>`<div class="field"><label for="${id}">${l}</label><select id="${id}">${opts.map(x=>`<option value="${esc(x[0])}" ${x[0]===v?'selected':''}>${esc(x[1])}</option>`).join('')}</select>${o.help?`<div class="help">${o.help}</div>`:''}</div>`,
  sw:(id,l,v,sub='')=>`<div class="togrow"><div class="tl">${l}${sub?`<small>${sub}</small>`:''}</div><label class="sw"><input type="checkbox" id="${id}" ${v?'checked':''}><i></i></label></div>`,
  color:(id,l,v,help='')=>`<div class="field"><label for="${id}_t">${l}</label><div class="colorf"><input type="color" id="${id}" value="${esc(v)}"><input type="text" id="${id}_t" value="${esc(v)}" maxlength="7" spellcheck="false"></div>${help?`<div class="help">${help}</div>`:''}</div>`,
  range:(id,l,v,o)=>`<div class="field"><label for="${id}">${l}</label><div class="rangef"><input type="range" id="${id}" min="${o.min}" max="${o.max}" step="${o.step}" value="${v}"><output id="${id}_o">${v}${o.unit||''}</output></div></div>`
};
/* কালার ইনপুট জোড়া (picker + hex) সিঙ্ক */
function wireColor(root,id,cb){
  const c=$('#'+id,root),t=$('#'+id+'_t',root);if(!c)return;
  c.oninput=()=>{t.value=c.value.toUpperCase();cb&&cb(c.value)};
  t.oninput=()=>{let v=t.value.trim();if(v&&v[0]!=='#')v='#'+v;if(/^#[0-9a-f]{6}$/i.test(v)){c.value=v;cb&&cb(v)}};
  t.onblur=()=>{t.value=c.value.toUpperCase()};
}
function wireRange(root,id,unit,cb){
  const r=$('#'+id,root),o=$('#'+id+'_o',root);if(!r)return;
  r.oninput=()=>{o.textContent=r.value+(unit||'');cb&&cb(r.value)};
}
/* ট্যাগ ইনপুট (যেমন টেকনোলজির তালিকা) */
function tagInput(root,id,initial=[]){
  const box=$('#'+id,root);let tags=[...initial];
  let drawing=false;
  const draw=()=>{drawing=true;box.innerHTML=tags.map((t,i)=>`<span class="tg">${esc(t)}<button type="button" data-i="${i}" aria-label="সরান">×</button></span>`).join('')+`<input type="text" placeholder="${tags.length?'':'লিখে Enter চাপুন...'}">`;drawing=false;
    $$('button',box).forEach(b=>b.onclick=e=>{e.stopPropagation();tags.splice(+b.dataset.i,1);box.closest('form')?.markDirty?.();draw();$('input',box).focus()});
    const inp=$('input',box);inp.onkeydown=e=>{
      if((e.key==='Enter'||e.key===',')&&inp.value.trim()){e.preventDefault();inp.value.split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>{if(!tags.includes(x))tags.push(x)});box.closest('form')?.markDirty?.();draw();$('input',box).focus()}
      else if(e.key==='Backspace'&&!inp.value&&tags.length){tags.pop();draw();$('input',box).focus()}};
    inp.onblur=()=>{if(!drawing&&inp.value.trim()){inp.value.split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>{if(!tags.includes(x))tags.push(x)});draw()}};
  };
  box.onclick=()=>$('input',box).focus();draw();
  return {get:()=>{const i=$('input',box);if(i&&i.value.trim())i.value.split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>{if(!tags.includes(x))tags.push(x)});return tags}};
}
/* বাটনে লোডিং */
const busy=async(btn,fn)=>{btn.classList.add('busy');try{return await fn()}finally{btn.classList.remove('busy')}};

/* পেজ রেজিস্ট্রি (pages/*.js এখানে নিজেদের যোগ করে) */
var PAGES={};
