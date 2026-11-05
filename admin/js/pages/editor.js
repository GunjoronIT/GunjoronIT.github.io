/* ==========================================================
   সাইট এডিটর: লেখা, ডিজাইন, অ্যানিমেশন, সাধারণ সেটিংস
   সব সেটিংস site_settings টেবিলে (key → JSON) জমা হয়।
   ========================================================== */
async function loadSettings(){
  const rows=await sb.select('site_settings','select=key,value');const s={};rows.forEach(r=>s[r.key]=r.value);return s;
}
const saveSetting=(key,value)=>sb.upsert('site_settings',{key,value},'key');
const siteAction={label:ic('ext')+' সাইট দেখুন',onClick:()=>{window.open('../','_blank','noopener');return false}};
const SAVED_MSG='পরিবর্তন সেভ হয়েছে। ওয়েবসাইট খুললেই নতুন রূপ দেখা যাবে।';

/* ==================== লেখা ==================== */
const SEC_NAMES={nav:'মেনু (উপরের বার)',mnav:'মোবাইল মেনু',home:'হিরো (প্রথম অংশ)',about:'আমরা',services:'সার্ভিস',projects:'প্রজেক্ট শিরোনাম',process:'কাজের ধাপ',team:'টিম শিরোনাম',terminal:'টার্মিনাল',faq:'FAQ শিরোনাম',contact:'যোগাযোগ',footer:'ফুটার',page:'অন্যান্য',lists:'তালিকা (টাইপিং ও লোডিং)'};
const KINDS={h1:'বড় শিরোনাম',h2:'শিরোনাম',h3:'উপশিরোনাম',h4:'উপশিরোনাম',p:'অনুচ্ছেদ',a:'লিংক / বাটন',button:'বাটন',label:'ফর্ম লেবেল',li:'তালিকা',small:'ছোট লেখা',b:'হাইলাইট',span:'লেখা',div:'লেখা',em:'লেখা',ph:'ইনপুটের ইশারা'};

async function loadTextDefaults(){
  const html=await (await fetch('../index.html',{cache:'no-store'})).text();
  const doc=new DOMParser().parseFromString(html,'text/html');
  const fields=[];
  doc.querySelectorAll('[data-t]').forEach(el=>{
    const k=el.getAttribute('data-t'),sec=k.split('.')[0];
    fields.push({k,sec:SEC_NAMES[sec]?sec:'page',kind:KINDS[el.tagName.toLowerCase()]||'লেখা',def:el.textContent});
  });
  doc.querySelectorAll('[data-tp]').forEach(el=>{
    const k=el.getAttribute('data-tp');fields.push({k,sec:k==='ph.email'?'footer':k==='ph.search'?'page':'contact',kind:KINDS.ph,def:el.getAttribute('placeholder')||''});
  });
  GJ_SCHEMA.lists.forEach(l=>fields.push({k:l.k,sec:'lists',kind:'তালিকা (প্রতি লাইনে একটি)',def:l.def.join('\n'),help:l.help,label:l.l,list:true}));
  return fields;
}

PAGES.texts={title:'সাইটের লেখা',icon:'type',async render(el){
  let fields,saved;
  try{[fields,saved]=await Promise.all([loadTextDefaults(),loadSettings()])}
  catch(e){if(/site_settings/.test(e.message||''))saved={};else throw e;fields=await loadTextDefaults()}
  const st=(saved&&saved.texts)||{},vals={};
  fields.forEach(f=>vals[f.k]=Object.prototype.hasOwnProperty.call(st,f.k)?st[f.k]:f.def);
  const changed=()=>fields.filter(f=>vals[f.k]!==f.def).length;
  const secs=[...new Set(fields.map(f=>f.sec))].sort((a,b)=>Object.keys(SEC_NAMES).indexOf(a)-Object.keys(SEC_NAMES).indexOf(b));
  let cur=secs[0],q='',baseline=JSON.stringify(vals);
  App.dirty=()=>JSON.stringify(vals)!==baseline;
  el.innerHTML=`<div class="ph"><div><h2>সাইটের সব লেখা</h2><p>ওয়েবসাইটের প্রতিটি লেখা এখান থেকে বদলান। পরিবর্তিত ঘরগুলো হলুদ বর্ডারে দেখাবে।</p></div><div class="acts"><a class="btn" href="../" target="_blank" rel="noopener">${ic('ext')} সাইট দেখুন</a></div></div>
  <div class="toolbar"><div class="search">${ic('search')}<input type="search" id="tq" placeholder="যেকোনো লেখা খুঁজুন..."></div></div>
  <div class="chipsbar" id="tsecs"></div><div id="tlist"></div>
  <div class="stickybar" id="tbar"><div class="st"><span class="dotp"></span><span id="tst"></span></div><div style="display:flex;gap:8px"><button class="btn" id="tresetall">${ic('reset')} সব ডিফল্টে</button><button class="btn p" id="tsave">${ic('check')} সেভ করুন</button></div></div>`;
  const status=()=>{const n=changed(),d=App.dirty();$('#tbar').classList.toggle('dirty',d);$('#tst').textContent=d?'সেভ না করা পরিবর্তন আছে':(n?`${bnum(n)}টি লেখা কাস্টমাইজ করা আছে`:'সব লেখা ডিফল্ট অবস্থায়')};
  const drawSecs=()=>{$('#tsecs').innerHTML=secs.map(s=>{const c=fields.filter(f=>f.sec===s&&vals[f.k]!==f.def).length;return `<button data-s="${s}" class="${!q&&s===cur?'on':''}">${SEC_NAMES[s]}${c?` <span class="mono" style="font-size:11px">·${bnum(c)}</span>`:''}</button>`}).join('');
    $$('#tsecs button').forEach(b=>b.onclick=()=>{cur=b.dataset.s;q='';$('#tq').value='';drawSecs();drawList()})};
  const drawList=()=>{
    const list=q?fields.filter(f=>(f.def+' '+vals[f.k]+' '+(f.label||'')).toLowerCase().includes(q)):fields.filter(f=>f.sec===cur);
    $('#tlist').innerHTML=list.length?list.map(f=>{
      const big=f.list||f.def.length>70||/\n/.test(f.def)||vals[f.k].length>70;
      return `<div class="tfield${vals[f.k]!==f.def?' chg':''}" data-k="${esc(f.k)}"><div class="top2"><span class="kind">${esc(f.label||f.kind)}${q?` · ${SEC_NAMES[f.sec]}`:''}</span><button class="reset" type="button">${ic('reset')} ডিফল্টে ফেরান</button></div>
      ${big?`<textarea rows="${f.list?5:3}">${esc(vals[f.k])}</textarea>`:`<input type="text" value="${esc(vals[f.k])}">`}
      ${f.help?`<div class="defv">${esc(f.help)}</div>`:`<div class="defv" title="${esc(f.def)}">ডিফল্ট: ${esc(f.def)||'(ফাঁকা)'}</div>`}</div>`}).join(''):`<div class="empty"><div class="ei">${ic('search')}</div><h3>কিছু পাওয়া যায়নি</h3></div>`;
    $$('.tfield',$('#tlist')).forEach(w=>{
      const f=fields.find(x=>x.k===w.dataset.k),inp=$('input,textarea',w);
      inp.oninput=()=>{vals[f.k]=inp.value;w.classList.toggle('chg',vals[f.k]!==f.def);status()};
      inp.onchange=drawSecs;
      $('.reset',w).onclick=()=>{vals[f.k]=f.def;inp.value=f.def;w.classList.remove('chg');drawSecs();status()};
    });
  };
  $('#tq').oninput=e=>{q=e.target.value.trim().toLowerCase();drawSecs();drawList()};
  $('#tresetall').onclick=async()=>{if(!changed())return ui.info('সবকিছুই এখন ডিফল্টে আছে');
    if(await ui.confirm({title:'সব লেখা ডিফল্টে ফেরাবেন?',message:`${bnum(changed())}টি কাস্টম লেখা আগের অবস্থায় ফিরবে। (সেভ করলে তবেই কার্যকর হবে)`,confirmText:'হ্যাঁ, ফেরান',danger:true})){fields.forEach(f=>vals[f.k]=f.def);drawSecs();drawList();status()}};
  $('#tsave').onclick=async e=>{
    const out={};fields.forEach(f=>{if(vals[f.k]!==f.def)out[f.k]=vals[f.k]});
    await busy(e.currentTarget,async()=>{try{await saveSetting('texts',out);baseline=JSON.stringify(vals);status();ui.success('লেখা সেভ হয়েছে',SAVED_MSG,{action:siteAction})}catch(err){fail(err,'সেভ করা যায়নি')}});
  };
  drawSecs();drawList();status();
}};

/* ==================== ডিজাইন ==================== */
const PRESETS=[
  {n:'এমারাল্ড (ডিফল্ট)',v:{green:'#22E58B',blue:'#3D7BFF',bg:'#040A18',bg2:'#071230',panel:'#0A1838',text:'#E6EDFF',muted:'#8C9BC2'}},
  {n:'ওশান',v:{green:'#38BDF8',blue:'#6366F1',bg:'#030B1C',bg2:'#071634',panel:'#0A1C42',text:'#E6F0FF',muted:'#8FA6CC'}},
  {n:'ভায়োলেট',v:{green:'#A78BFA',blue:'#EC4899',bg:'#0A0716',bg2:'#120B26',panel:'#1A1033',text:'#F1EBFF',muted:'#A99BC9'}},
  {n:'সানসেট',v:{green:'#FB923C',blue:'#F43F5E',bg:'#130A08',bg2:'#1D0F0B',panel:'#2A1511',text:'#FFF1EA',muted:'#C9A59A'}},
  {n:'লাইম',v:{green:'#A3E635',blue:'#22D3EE',bg:'#060D07',bg2:'#0B170D',panel:'#102115',text:'#EDFFE9',muted:'#97B59B'}}
];
PAGES.design={title:'ডিজাইন',icon:'palette',async render(el){
  let saved={};try{saved=await loadSettings()}catch(e){if(!/site_settings/.test(e.message||''))throw e;ui.notice('সেটআপ বাকি','site_settings টেবিল পাওয়া যায়নি। '+SETUP_HINT,'warn')}
  const S=GJ_SCHEMA.design,defs={};S.forEach(f=>defs[f.k]=f.def);
  const d={...defs,...(saved.design||{})};let baseline=JSON.stringify(d);
  App.dirty=()=>JSON.stringify(d)!==baseline;
  const groups=[...new Set(S.map(f=>f.g))];
  el.innerHTML=`<div class="ph"><div><h2>ডিজাইন ও রঙ</h2><p>রঙ, গোলতা, প্রস্থ ও ফন্ট বদলান। ডানে সাথে সাথে প্রিভিউ দেখুন।</p></div><div class="acts"><button class="btn" id="dreset">${ic('reset')} ডিফল্টে ফেরান</button></div></div>
  <div class="split"><div><div class="gtitle">রেডিমেড থিম</div><div class="presets" id="dpre">${PRESETS.map((p,i)=>`<button class="preset" data-i="${i}"><span class="sw2"><i style="background:${p.v.green}"></i><i style="background:${p.v.blue}"></i><i style="background:${p.v.bg}"></i></span>${p.n}</button>`).join('')}</div>
  ${groups.map(g=>`<div class="gtitle">${g}</div>${S.filter(f=>f.g===g).map(f=>f.t==='color'?F.color('d_'+f.k,f.l,d[f.k],f.help):f.t==='range'?F.range('d_'+f.k,f.l,d[f.k],f):F.sel('d_'+f.k,f.l,d[f.k],f.opts)).join('')}`).join('')}</div>
  <div class="pvwrap"><div class="lbl">লাইভ প্রিভিউ</div><div class="pv" id="pv"><span class="badge" id="pvb">● নতুন প্রজেক্ট নিচ্ছি</span><h4>আমরা আইডিয়াকে <span class="gr">কোডে রূপ দিই।</span></h4><p id="pvp" style="font-size:13.5px">গুঞ্জরণ আইটি টিম — সুন্দর ও দ্রুত ডিজিটাল প্রোডাক্ট।</p><span class="pb" id="pvbtn">প্রজেক্ট শুরু করুন →</span><div class="pc" id="pvc"><b>পত্রদ্বীপ</b><div style="opacity:.7;margin-top:2px">ওয়েব প্ল্যাটফর্ম</div><span class="pch">React</span><span class="pch">Next.js</span></div></div>
  <p class="m" style="font-size:12.5px;margin-top:10px">ছোট প্রিভিউ — আসল সাইটে আরও অনেক জায়গায় এই রঙ ও আকার প্রয়োগ হয়।</p></div></div>
  <div class="stickybar" id="dbar"><div class="st"><span class="dotp"></span><span id="dst"></span></div><button class="btn p" id="dsave">${ic('check')} সেভ করুন</button></div>`;
  const rgbOf=h=>{const n=parseInt(h.slice(1),16);return `${n>>16},${(n>>8)&255},${n&255}`};
  const paint=()=>{
    const pv=$('#pv');pv.style.setProperty('--pg',d.green);pv.style.setProperty('--pb',d.blue);
    pv.style.background=`radial-gradient(300px 160px at 90% 0%,rgba(${rgbOf(d.blue)},.28),transparent 70%),${d.bg}`;pv.style.color=d.text;pv.style.fontFamily=d.font==='sans'?"'Space Grotesk','Noto Serif Bengali',sans-serif":"'Noto Serif Bengali',serif";
    $('#pvp').style.color=d.muted;const b=$('#pvbtn');b.style.background=d.green;b.style.color='#03140B';b.style.borderRadius=Math.min(+d.radius,18)+'px';
    const c=$('#pvc');c.style.background=d.panel;c.style.borderColor=`rgba(${rgbOf(d.green)},.3)`;c.style.borderRadius=d.radius+'px';c.style.color=d.text;
    $$('.pch',pv).forEach(x=>{x.style.borderColor=`rgba(${rgbOf(d.blue)},.5)`;x.style.color=d.muted});
    const bd=$('#pvb');bd.style.color=d.green;bd.style.borderColor=`rgba(${rgbOf(d.green)},.4)`;
    $('#dbar').classList.toggle('dirty',App.dirty());$('#dst').textContent=App.dirty()?'সেভ না করা পরিবর্তন আছে':'সর্বশেষ সেভ করা অবস্থায় আছে';
  };
  const bindAll=()=>S.forEach(f=>{
    if(f.t==='color'){wireColor(el,'d_'+f.k,v=>{d[f.k]=v.toUpperCase();paint()})}
    else if(f.t==='range'){wireRange(el,'d_'+f.k,f.unit,v=>{d[f.k]=+v;paint()})}
    else $('#d_'+f.k,el).onchange=e=>{d[f.k]=e.target.value;paint()};
  });
  const syncInputs=()=>S.forEach(f=>{const i=$('#d_'+f.k,el);if(!i)return;i.value=d[f.k];if(f.t==='color')$('#d_'+f.k+'_t',el).value=String(d[f.k]).toUpperCase();if(f.t==='range')$('#d_'+f.k+'_o',el).textContent=d[f.k]+(f.unit||'')});
  bindAll();paint();
  $$('#dpre .preset').forEach(b=>b.onclick=()=>{Object.assign(d,PRESETS[+b.dataset.i].v);syncInputs();paint();ui.info('থিম বসেছে',PRESETS[+b.dataset.i].n+' — সেভ করলে সাইটে কার্যকর হবে')});
  $('#dreset').onclick=async()=>{if(await ui.confirm({title:'ডিজাইন ডিফল্টে ফেরাবেন?',message:'সব রঙ ও আকার আসল অবস্থায় ফিরবে। (সেভ করলে তবেই কার্যকর হবে)',confirmText:'হ্যাঁ, ফেরান',danger:true})){Object.assign(d,defs);syncInputs();paint()}};
  $('#dsave').onclick=async e=>{await busy(e.currentTarget,async()=>{try{await saveSetting('design',{...d});baseline=JSON.stringify(d);paint();ui.success('ডিজাইন সেভ হয়েছে',SAVED_MSG,{action:siteAction})}catch(err){fail(err,'সেভ করা যায়নি')}})};
}};

/* ==================== অ্যানিমেশন ==================== */
const REVEAL_HINT={up:'কার্ড ও লেখা নিচ থেকে ধীরে উঠে আসে',fade:'শুধু ধীরে ফুটে ওঠে',zoom:'হালকা জুম হয়ে আসে',left:'বাম পাশ থেকে স্লাইড করে আসে',right:'ডান পাশ থেকে স্লাইড করে আসে',none:'সব কন্টেন্ট সাথে সাথে দেখা যাবে'};
PAGES.anim={title:'অ্যানিমেশন',icon:'spark',async render(el){
  let saved={};try{saved=await loadSettings()}catch(e){if(!/site_settings/.test(e.message||''))throw e;ui.notice('সেটআপ বাকি','site_settings টেবিল পাওয়া যায়নি। '+SETUP_HINT,'warn')}
  const S=GJ_SCHEMA.anim,defs={};S.forEach(f=>defs[f.k]=f.def);
  const a={...defs,...(saved.anim||{})};let baseline=JSON.stringify(a);App.dirty=()=>JSON.stringify(a)!==baseline;
  const groups=[...new Set(S.map(f=>f.g))];
  el.innerHTML=`<div class="ph"><div><h2>অ্যানিমেশন ও ইফেক্ট</h2><p>কোন ইফেক্ট চলবে, কত দ্রুত চলবে — সব নিজের পছন্দমতো ঠিক করুন। ধীর ফোনে সাইট হালকা রাখতে কিছু ইফেক্ট বন্ধ করতে পারেন।</p></div><div class="acts"><button class="btn" id="areset">${ic('reset')} ডিফল্টে ফেরান</button></div></div>
  <div class="row2" style="align-items:start">${[groups.filter((_,i)=>i%2===0),groups.filter((_,i)=>i%2===1)].map(gs=>`<div>${gs.map(g=>`<div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:14px">${g}</h3>${S.filter(f=>f.g===g).map(f=>f.t==='bool'?F.sw('a_'+f.k,f.l,a[f.k]):f.t==='range'?F.range('a_'+f.k,f.l,a[f.k],f):`${F.sel('a_'+f.k,f.l,a[f.k],f.opts)}<div class="help" id="a_hint" style="margin:-8px 0 14px"></div>`).join('')}</div>`).join('')}</div>`).join('')}</div>
  <div class="stickybar" id="abar"><div class="st"><span class="dotp"></span><span id="ast"></span></div><button class="btn p" id="asave">${ic('check')} সেভ করুন</button></div>`;
  const st=()=>{$('#abar').classList.toggle('dirty',App.dirty());$('#ast').textContent=App.dirty()?'সেভ না করা পরিবর্তন আছে':'সর্বশেষ সেভ করা অবস্থায় আছে';const h=$('#a_hint');if(h)h.textContent=REVEAL_HINT[a.reveal]||''};
  const bind=()=>S.forEach(f=>{const i=$('#a_'+f.k,el);if(!i)return;
    if(f.t==='bool')i.onchange=()=>{a[f.k]=i.checked;st()};
    else if(f.t==='range')wireRange(el,'a_'+f.k,f.unit,v=>{a[f.k]=+v;st()});
    else i.onchange=()=>{a[f.k]=i.value;st()}});
  bind();st();
  $('#areset').onclick=async()=>{if(await ui.confirm({title:'অ্যানিমেশন ডিফল্টে ফেরাবেন?',message:'সব সুইচ ও গতি আসল অবস্থায় ফিরবে। (সেভ করলে তবেই কার্যকর হবে)',confirmText:'হ্যাঁ, ফেরান',danger:true})){Object.assign(a,defs);S.forEach(f=>{const i=$('#a_'+f.k,el);if(!i)return;if(f.t==='bool')i.checked=a[f.k];else{i.value=a[f.k];if(f.t==='range')$('#a_'+f.k+'_o',el).textContent=a[f.k]+(f.unit||'')}});st()}};
  $('#asave').onclick=async e=>{await busy(e.currentTarget,async()=>{try{await saveSetting('anim',{...a});baseline=JSON.stringify(a);st();ui.success('অ্যানিমেশন সেভ হয়েছে',SAVED_MSG,{action:siteAction})}catch(err){fail(err,'সেভ করা যায়নি')}})};
}};

/* ==================== সাধারণ সেটিংস ==================== */
PAGES.settings={title:'সেটিংস',icon:'cog',async render(el){
  let saved={};try{saved=await loadSettings()}catch(e){if(!/site_settings/.test(e.message||''))throw e;ui.notice('সেটআপ বাকি','site_settings টেবিল পাওয়া যায়নি। '+SETUP_HINT,'warn')}
  const S=GJ_SCHEMA,g={...Object.fromEntries(S.general.map(f=>[f.k,f.def])),...(saved.general||{})};g.hidden=[...(g.hidden||[])];
  let baseline=JSON.stringify(g);App.dirty=()=>JSON.stringify(g)!==baseline;
  el.innerHTML=`<div class="ph"><div><h2>সাধারণ সেটিংস</h2><p>সাইটের টাইটেল, সার্চ বিবরণ, সেকশন দেখানো/লুকানো এবং অ্যাকাউন্ট।</p></div></div>
  <div class="split"><div>
    <div class="card" style="margin-bottom:16px"><h3>সাইটের পরিচয় (SEO)</h3>${F.text('g_title','ব্রাউজার ট্যাব ও গুগলের টাইটেল',g.title,{max:90})}${F.area('g_desc','সংক্ষিপ্ত বিবরণ',g.description,{max:200,h:80,help:'গুগল সার্চে ও শেয়ার করলে এই লেখা দেখা যায় (প্রায় ১৫০ অক্ষর ভালো)।'})}${F.color('g_tc','মোবাইল ব্রাউজারের বার-এর রঙ',g.themeColor)}</div>
    <div class="card" style="margin-bottom:16px"><h3>সেকশন দেখান / লুকান</h3><p class="m" style="font-size:13px;margin-bottom:12px">বন্ধ করলে সেকশনটি ওয়েবসাইট ও মেনু দুই জায়গা থেকেই সরে যাবে।</p>${S.sections.map(s=>F.sw('g_s_'+s.id,s.l,!g.hidden.includes(s.id))).join('')}</div>
  </div><div>
    <div class="card"><h3>${ic('lock')} পাসওয়ার্ড বদলান</h3>${F.text('pw1','নতুন পাসওয়ার্ড','',{type:'password',help:'কমপক্ষে ৮ অক্ষর'})}${F.text('pw2','আবার লিখুন','',{type:'password'})}<button class="btn" id="pwsave">${ic('lock')} পাসওয়ার্ড আপডেট</button></div>
    <div class="card" style="margin-top:16px"><h3>${ic('info')} তথ্য</h3><p class="m" style="font-size:13px;line-height:1.8">লগইন: <b style="color:var(--text)">${esc((sb.user&&sb.user.email)||'')}</b><br>পরিবর্তন সেভ করলে ভিজিটররা পরের বার সাইট খুললেই নতুন রূপ পাবেন।<br>ছবির সীমা: প্রোফাইল ১০০ KB · প্রজেক্ট ৩০০ KB (অটো)।</p></div>
  </div></div>
  <div class="stickybar" id="gbar"><div class="st"><span class="dotp"></span><span id="gst"></span></div><button class="btn p" id="gsave">${ic('check')} সেভ করুন</button></div>`;
  const st=()=>{$('#gbar').classList.toggle('dirty',App.dirty());$('#gst').textContent=App.dirty()?'সেভ না করা পরিবর্তন আছে':'সর্বশেষ সেভ করা অবস্থায় আছে'};
  $('#g_title').oninput=e=>{g.title=e.target.value;st()};$('#g_desc').oninput=e=>{g.description=e.target.value;st()};
  wireColor(el,'g_tc',v=>{g.themeColor=v.toUpperCase();st()});
  S.sections.forEach(s=>$('#g_s_'+s.id).onchange=e=>{const i=g.hidden.indexOf(s.id);if(!e.target.checked&&i<0)g.hidden.push(s.id);if(e.target.checked&&i>-1)g.hidden.splice(i,1);st()});
  st();
  $('#gsave').onclick=async e=>{await busy(e.currentTarget,async()=>{try{await saveSetting('general',{...g});baseline=JSON.stringify(g);st();ui.success('সেটিংস সেভ হয়েছে',SAVED_MSG,{action:siteAction})}catch(err){fail(err,'সেভ করা যায়নি')}})};
  $('#pwsave').onclick=async e=>{
    const a=$('#pw1').value,b=$('#pw2').value;
    if(a.length<8)return ui.error('পাসওয়ার্ড ছোট','কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন।');
    if(a!==b)return ui.error('পাসওয়ার্ড মিলছে না','দুই ঘরে একই পাসওয়ার্ড লিখুন।');
    if(!await ui.confirm({title:'পাসওয়ার্ড বদলাবেন?',message:'পরের বার থেকে নতুন পাসওয়ার্ড দিয়ে লগইন করতে হবে।',confirmText:'হ্যাঁ, বদলান'}))return;
    await busy(e.currentTarget,async()=>{try{await sb.updatePassword(a);$('#pw1').value=$('#pw2').value='';ui.success('পাসওয়ার্ড বদলানো হয়েছে','নতুন পাসওয়ার্ড মনে রাখুন।')}catch(err){fail(err,'পাসওয়ার্ড বদলানো যায়নি')}});
  };
}};
