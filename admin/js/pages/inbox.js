/* ==========================================================
   ড্যাশবোর্ড, বার্তা, সাবস্ক্রাইবার
   ========================================================== */
const SVC={website:'ওয়েবসাইট',mobile_app:'মোবাইল অ্যাপ',ui_ux:'UI/UX',other:'অন্যান্য'};
const cnt=async(t,qs='')=>{try{const r=await sb.select(t,'select=id'+qs);return r.length}catch(e){return null}};

PAGES.dashboard={title:'ড্যাশবোর্ড',icon:'dash',async render(el){
  const [np,nt,nf,ns,nm,nsub,msgs,setup]=await Promise.all([cnt('projects'),cnt('team_members'),cnt('faqs'),cnt('tech_stack'),cnt('contact_messages','&is_read=eq.false'),cnt('newsletter_subscribers'),
    sb.select('contact_messages','select=*&order=created_at.desc&limit=5').catch(()=>[]),
    sb.select('site_settings','select=key&limit=1').then(()=>true).catch(()=>false)]);
  const hr=new Date().getHours(),greet=hr<5?'শুভ রাত্রি':hr<12?'শুভ সকাল':hr<16?'শুভ দুপুর':hr<18?'শুভ বিকাল':'শুভ সন্ধ্যা';
  el.innerHTML=`<div class="ph"><div><h2>${greet} 👋</h2><p>আপনার সাইটের সারসংক্ষেপ ও দ্রুত কাজগুলো।</p></div><div class="acts"><a class="btn p" href="../" target="_blank" rel="noopener">${ic('ext')} সাইট দেখুন</a></div></div>
  ${setup?'':`<div class="alert">${ic('warn')}<div><b>নতুন ফিচারের সেটআপ বাকি আছে</b><span class="m">Supabase SQL Editor-এ <code>supabase/03-cms-upgrade.sql</code> চালালে লেখা/ডিজাইন/অ্যানিমেশন এডিটর, টিম ছবি ও প্রজেক্ট গ্যালারি চালু হবে।</span></div></div>`}
  <div class="stats">
    <div class="card stat" data-go="projects"><div class="si">${ic('proj')}</div><div><b>${np==null?'—':bnum(np)}</b><span>প্রজেক্ট</span></div></div>
    <div class="card stat" data-go="team"><div class="si b">${ic('team')}</div><div><b>${nt==null?'—':bnum(nt)}</b><span>টিম সদস্য</span></div></div>
    <div class="card stat" data-go="messages"><div class="si r">${ic('mail')}</div><div><b>${nm==null?'—':bnum(nm)}</b><span>নতুন বার্তা</span></div></div>
    <div class="card stat" data-go="subscribers"><div class="si a">${ic('bell')}</div><div><b>${nsub==null?'—':bnum(nsub)}</b><span>সাবস্ক্রাইবার</span></div></div>
  </div>
  <div class="dgrid"><div class="card"><h3>সাম্প্রতিক বার্তা <a class="btn sm" href="#/messages">সব দেখুন</a></h3>
    ${msgs.length?msgs.map(m=>`<div class="mini" data-m="${m.id}"><span class="dot ${m.is_read?'read':''}"></span><div style="flex:1;min-width:0"><b>${esc(m.name)} <span class="m mono" style="font-size:12px;font-weight:400">${esc(m.contact)}</span></b><p>${esc(m.message)}</p></div><span class="dim" style="font-size:12px;white-space:nowrap">${fmtDate(m.created_at)}</span></div>`).join(''):`<div class="empty" style="padding:30px"><p>এখনো কোনো বার্তা আসেনি।</p></div>`}</div>
  <div class="card"><h3>দ্রুত কাজ</h3><div class="qa">
    <button data-q="newproj">${ic('plus')} নতুন প্রজেক্ট</button><button data-q="newmem">${ic('team')} নতুন সদস্য</button>
    <a href="#/texts">${ic('type')} লেখা বদলান</a><a href="#/design">${ic('palette')} ডিজাইন বদলান</a>
    <a href="#/anim">${ic('spark')} অ্যানিমেশন</a><a href="#/settings">${ic('cog')} সেটিংস</a></div>
    <p class="m" style="font-size:12.5px;margin-top:16px;line-height:1.7">FAQ: ${nf==null?'—':bnum(nf)}টি · টেক স্ট্যাক: ${ns==null?'—':bnum(ns)}টি</p></div></div>`;
  $$('[data-go]',el).forEach(c=>c.onclick=()=>navigate(c.dataset.go));
  $$('[data-m]',el).forEach(c=>c.onclick=()=>navigate('messages'));
  $('[data-q=newproj]',el).onclick=()=>projectForm(null,()=>navigate('projects'));
  $('[data-q=newmem]',el).onclick=()=>teamForm(null,()=>navigate('team'));
  $$('.qa a,.card h3 a',el).forEach(a=>a.onclick=e=>{e.preventDefault();navigate(a.getAttribute('href').slice(2))});
}};

/* ---------- বার্তা ---------- */
PAGES.messages={title:'বার্তা',icon:'mail',async render(el){
  let rows=await sb.select('contact_messages','select=*&order=created_at.desc&limit=300'),flt='all',q='';
  const sync=()=>{App.unread=rows.filter(r=>!r.is_read).length;updateBadge()};sync();
  const draw=()=>{
    let list=rows.filter(r=>flt==='all'||!r.is_read);
    if(q)list=list.filter(r=>(r.name+r.contact+r.message).toLowerCase().includes(q));
    el.innerHTML=`<div class="ph"><div><h2>কন্টাক্ট বার্তা <span class="m" style="font-size:16px">(${bnum(rows.length)})</span></h2><p>ওয়েবসাইটের ফর্ম দিয়ে ভিজিটরদের পাঠানো বার্তা।</p></div><div class="acts">${App.unread?`<button class="btn" id="readall">${ic('check')} সব পড়া হয়েছে</button>`:''}</div></div>
    <div class="toolbar"><div class="seg"><button data-f="all" class="${flt==='all'?'on':''}">সব</button><button data-f="unread" class="${flt==='unread'?'on':''}">অপঠিত ${App.unread?`(${bnum(App.unread)})`:''}</button></div><div class="search">${ic('search')}<input type="search" id="mq" placeholder="নাম, যোগাযোগ বা বার্তায় খুঁজুন..." value="${esc(q)}"></div></div>
    ${list.length?`<div class="list">${list.map(r=>`<div class="card msg ${r.is_read?'':'unread'}" data-id="${r.id}"><div class="mh"><div><b>${esc(r.name)}</b> <span class="mono g" style="font-size:13px">${esc(r.contact)}</span></div><span class="dim" style="font-size:12px">${fmtDate(r.created_at)}</span></div>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${(r.services||[]).map(s=>`<span class="badge">${esc(SVC[s]||s)}</span>`).join('')}${r.budget!=null?`<span class="badge on">বাজেট ৳${Number(r.budget).toLocaleString('en-IN')}</span>`:''}${r.is_read?'':'<span class="badge red">নতুন</span>'}</div><p>${esc(r.message)}</p></div>`).join('')}</div>`
      :`<div class="empty"><div class="ei">${ic('mail')}</div><h3>${rows.length?'কিছু পাওয়া যায়নি':'এখনো কোনো বার্তা আসেনি'}</h3><p>${rows.length?'ফিল্টার বা সার্চ বদলান।':'কেউ কন্টাক্ট ফর্ম পাঠালে এখানে দেখা যাবে।'}</p></div>`}`;
    $$('[data-f]',el).forEach(b=>b.onclick=()=>{flt=b.dataset.f;draw()});
    const qi=$('#mq',el);qi.oninput=()=>{q=qi.value.trim().toLowerCase();const p=qi.selectionStart;draw();const n=$('#mq',el);n.focus();n.setSelectionRange(p,p)};
    $('#readall',el)&&($('#readall',el).onclick=async()=>{try{await sb.update('contact_messages','is_read=eq.false',{is_read:true});rows.forEach(r=>r.is_read=true);sync();draw();ui.ok('সব বার্তা পড়া হয়েছে চিহ্নিত')}catch(e){fail(e)}});
    $$('.msg',el).forEach(c=>c.onclick=()=>open(rows.find(r=>r.id===c.dataset.id)));
  };
  async function setRead(r,v){await sb.update('contact_messages','id=eq.'+r.id,{is_read:v});r.is_read=v;sync()}
  async function open(r){
    if(!r.is_read)setRead(r,true).then(draw).catch(()=>{});
    const isMail=/@/.test(r.contact),tel=r.contact.replace(/[^\d+]/g,'');
    const h=ui.modal({cls:'lg',title:esc(r.name),sub:fmtDate(r.created_at),
      body:`<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="badge on mono">${esc(r.contact)}</span>${(r.services||[]).map(s=>`<span class="badge">${esc(SVC[s]||s)}</span>`).join('')}${r.budget!=null?`<span class="badge blue">বাজেট ৳${Number(r.budget).toLocaleString('en-IN')}</span>`:''}</div><div class="msgfull">${esc(r.message)}</div>`,
      actions:[{label:ic('trash')+' মুছুন',cls:'d',onClick:async hh=>{hh.close();const ok=await ui.confirm({title:'বার্তা মুছবেন?',message:`<b>${esc(r.name)}</b>-এর বার্তাটি স্থায়ীভাবে মুছে যাবে।`,confirmText:'হ্যাঁ, মুছুন',danger:true});if(!ok)return false;
          try{await sb.remove('contact_messages','id=eq.'+r.id);rows=rows.filter(x=>x.id!==r.id);sync();draw();ui.success('বার্তা মুছে ফেলা হয়েছে','',{auto:1600})}catch(e){fail(e,'মোছা যায়নি')}return false}},
        {label:ic('copy')+' কপি',onClick:async()=>{try{await navigator.clipboard.writeText(r.contact);ui.ok('কপি হয়েছে',r.contact)}catch(e){ui.bad('কপি করা যায়নি')}return false}},
        {label:ic('mail')+' উত্তর দিন',cls:'p',onClick:()=>{window.open(isMail?`mailto:${r.contact}`:/\d{6,}/.test(tel)?`tel:${tel}`:'#','_blank');return false}},
        {label:'বন্ধ',value:true}]});
    return h;
  }
  draw();
}};

/* ---------- সাবস্ক্রাইবার ---------- */
PAGES.subscribers={title:'সাবস্ক্রাইবার',icon:'bell',async render(el){
  let rows=await sb.select('newsletter_subscribers','select=*&order=created_at.desc&limit=2000'),q='';
  const draw=()=>{
    const list=q?rows.filter(r=>r.email.toLowerCase().includes(q)):rows;
    el.innerHTML=`<div class="ph"><div><h2>নিউজলেটার সাবস্ক্রাইবার <span class="m" style="font-size:16px">(${bnum(rows.length)})</span></h2><p>ফুটারের ফর্মে যারা ইমেইল দিয়েছেন।</p></div><div class="acts"><button class="btn" id="cpy" ${rows.length?'':'disabled'}>${ic('copy')} সব ইমেইল কপি</button><button class="btn p" id="csv" ${rows.length?'':'disabled'}>${ic('dl')} CSV ডাউনলোড</button></div></div>
    ${rows.length>6?`<div class="toolbar"><div class="search">${ic('search')}<input type="search" id="sq" placeholder="ইমেইল খুঁজুন..." value="${esc(q)}"></div></div>`:''}
    ${list.length?`<div class="tblwrap"><table class="tbl"><thead><tr><th>ইমেইল</th><th>যুক্ত হয়েছেন</th><th></th></tr></thead><tbody>${list.map(r=>`<tr><td><b>${esc(r.email)}</b></td><td class="m">${fmtDate(r.created_at)}</td><td style="text-align:right"><button class="btn sm d ico" data-x="${r.id}" aria-label="মুছুন">${ic('trash')}</button></td></tr>`).join('')}</tbody></table></div>`
     :`<div class="empty"><div class="ei">${ic('bell')}</div><h3>${rows.length?'কিছু পাওয়া যায়নি':'এখনো কেউ যুক্ত হয়নি'}</h3></div>`}`;
    const sq=$('#sq',el);if(sq)sq.oninput=()=>{q=sq.value.trim().toLowerCase();const p=sq.selectionStart;draw();const n=$('#sq',el);n.focus();n.setSelectionRange(p,p)};
    $('#cpy',el).onclick=async()=>{try{await navigator.clipboard.writeText(rows.map(r=>r.email).join(', '));ui.ok('কপি হয়েছে',bnum(rows.length)+'টি ইমেইল')}catch(e){ui.bad('কপি করা যায়নি')}};
    $('#csv',el).onclick=()=>{
      const q2=v=>'"'+String(v).replace(/"/g,'""').replace(/^([=+\-@])/,"'$1")+'"';
      const csv='email,subscribed_at\n'+rows.map(r=>q2(r.email)+','+q2(r.created_at)).join('\n');
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}));a.download='subscribers.csv';a.click();ui.ok('CSV ডাউনলোড হচ্ছে')};
    $$('[data-x]',el).forEach(b=>b.onclick=async()=>{const r=rows.find(x=>x.id===b.dataset.x);
      if(!await ui.confirm({title:'সাবস্ক্রাইবার মুছবেন?',message:`<b>${esc(r.email)}</b> তালিকা থেকে মুছে যাবে।`,confirmText:'হ্যাঁ, মুছুন',danger:true}))return;
      try{await sb.remove('newsletter_subscribers','id=eq.'+r.id);rows=rows.filter(x=>x.id!==r.id);draw();ui.success('মুছে ফেলা হয়েছে','',{auto:1500})}catch(e){fail(e,'মোছা যায়নি')}});
  };
  draw();
}};
