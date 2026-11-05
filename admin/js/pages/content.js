/* ==========================================================
   কনটেন্ট ম্যানেজমেন্ট: প্রজেক্ট, টিম, FAQ, টেক স্ট্যাক
   ========================================================== */
const ORD='select=*&order=sort_order.asc,created_at.asc';

/* ---------- জেনেরিক তালিকা (ক্রম বদল, প্রকাশ সুইচ, এডিট, মুছুন) ---------- */
async function renderList(el,cfg){
  let rows=await sb.select(cfg.table,ORD),q='';
  const draw=()=>{
    const shown=q?rows.filter(r=>(cfg.title(r)+' '+(cfg.sub?cfg.sub(r):'')).toLowerCase().includes(q)):rows;
    el.innerHTML=`<div class="ph"><div><h2>${cfg.label} <span class="m" style="font-size:16px">(${bnum(rows.length)})</span></h2><p>${cfg.desc}</p></div><div class="acts"><button class="btn p" id="add">${ic('plus')} ${cfg.addText}</button></div></div>
    ${rows.length>5?`<div class="toolbar"><div class="search">${ic('search')}<input type="search" id="q" placeholder="খুঁজুন..." value="${esc(q)}"></div></div>`:''}
    ${shown.length?`<div class="list" id="lst">${shown.map((r,i)=>itemHTML(r,i,shown.length)).join('')}</div>`:`<div class="empty"><div class="ei">${ic(cfg.icon)}</div><h3>${q?'কিছু পাওয়া যায়নি':'এখনো কিছু নেই'}</h3><p>${q?'অন্য শব্দে খুঁজুন।':'"'+cfg.addText+'" বাটনে চাপ দিয়ে শুরু করুন।'}</p></div>`}`;
    $('#add').onclick=()=>cfg.form(null,reload);
    const qi=$('#q');if(qi){qi.oninput=()=>{q=qi.value.trim().toLowerCase();const pos=qi.selectionStart;draw();const n=$('#q');n.focus();n.setSelectionRange(pos,pos)}}
    bind();
  };
  const itemHTML=(r,i,n)=>{
    const th=cfg.thumb?cfg.thumb(r):null,rd=cfg.round?' round':'';
    return `<div class="item" data-id="${r.id}">
      ${!q?`<span class="grip" title="টেনে ক্রম বদলান">${ic('grip')}</span>`:''}
      ${!q?`<div class="ord"><button data-mv="-1" aria-label="উপরে" ${i===0?'disabled':''}>${ic('up')}</button><button data-mv="1" aria-label="নিচে" ${i===n-1?'disabled':''}>${ic('down')}</button></div>`:''}
      ${cfg.thumb?(th?`<img class="thumb${rd}" src="${esc(th)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`:`<div class="ph0${rd}">${ic(cfg.round?'team':'img')}</div>`):''}
      <div class="tt"><b>${esc(cfg.title(r))}</b><small>${cfg.sub?cfg.sub(r):''}</small></div>
      <div class="acts">${cfg.publish!==false?`<label class="sw" title="ওয়েবসাইটে দেখাও"><input type="checkbox" data-pub ${r.is_published?'checked':''}><i></i></label>`:''}
        <button class="btn sm" data-e>${ic('edit')} এডিট</button><button class="btn sm d ico" data-d aria-label="মুছুন">${ic('trash')}</button></div></div>`;
  };
  const reload=async()=>{rows=await sb.select(cfg.table,ORD);draw()};
  async function persist(){
    const ch=[];rows.forEach((r,i)=>{const v=(i+1)*10;if(r.sort_order!==v){r.sort_order=v;ch.push(sb.update(cfg.table,'id=eq.'+r.id,{sort_order:v}))}});
    if(ch.length){try{await Promise.all(ch);ui.ok('ক্রম সেভ হয়েছে')}catch(e){fail(e);reload()}}
  }
  function bind(){
    $$('.item',el).forEach(it=>{
      const r=rows.find(x=>x.id===it.dataset.id);
      $('[data-e]',it).onclick=()=>cfg.form(r,reload);
      $('[data-d]',it).onclick=()=>cfg.remove(r,reload);
      const pub=$('[data-pub]',it);if(pub)pub.onchange=async()=>{
        try{await sb.update(cfg.table,'id=eq.'+r.id,{is_published:pub.checked});r.is_published=pub.checked;ui.ok(pub.checked?'ওয়েবসাইটে দেখানো হচ্ছে':'ওয়েবসাইট থেকে লুকানো হয়েছে',cfg.title(r))}
        catch(e){pub.checked=!pub.checked;fail(e)}};
      $$('[data-mv]',it).forEach(b=>b.onclick=()=>{const i=rows.indexOf(r),j=i+ +b.dataset.mv;if(j<0||j>=rows.length)return;[rows[i],rows[j]]=[rows[j],rows[i]];draw();persist()});
      const grip=$('.grip',it);if(grip){
        grip.onpointerdown=()=>it.draggable=true;
        it.ondragstart=e=>{e.dataTransfer.setData('text/plain',r.id);e.dataTransfer.effectAllowed='move';it.classList.add('dragging')};
        it.ondragend=()=>{it.draggable=false;it.classList.remove('dragging');$$('.over',el).forEach(x=>x.classList.remove('over'))};
        it.ondragover=e=>{e.preventDefault();it.classList.add('over')};it.ondragleave=()=>it.classList.remove('over');
        it.ondrop=e=>{e.preventDefault();const from=rows.findIndex(x=>x.id===e.dataTransfer.getData('text/plain')),to=rows.indexOf(r);if(from<0||from===to)return;const [m]=rows.splice(from,1);rows.splice(to,0,m);draw();persist()};
      }
    });
  }
  draw();
}
async function confirmDelete(cfg,r,reload,extra){
  const ok=await ui.confirm({title:`${cfg.single} মুছে ফেলবেন?`,message:`<b>"${esc(cfg.title(r))}"</b> স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো যাবে না।`,confirmText:'হ্যাঁ, মুছে ফেলুন',danger:true});
  if(!ok)return;
  const ld=ui.loading('মুছে ফেলা হচ্ছে...');
  try{await sb.remove(cfg.table,'id=eq.'+r.id);if(extra)await extra(r).catch(()=>{})}catch(e){ld.close();return fail(e,'মোছা যায়নি')}
  ld.close();ui.success(`${cfg.single} মুছে ফেলা হয়েছে`,`"${esc(cfg.title(r))}" আর নেই।`,{auto:1800});await reload();
}

/* ==================== প্রজেক্ট ==================== */
const PROJ={table:'projects',label:'প্রজেক্ট',single:'প্রজেক্ট',icon:'proj',addText:'নতুন প্রজেক্ট',round:false,
  desc:'ওয়েবসাইটে যে প্রজেক্টগুলো দেখা যায়। ছবি ও ক্রম এখান থেকেই বদলান।',
  title:r=>r.name_bn,thumb:r=>(r.images&&r.images[0])||r.image_url,
  sub:r=>`<span class="badge ${r.category==='app'?'blue':''}">${r.category==='app'?'মোবাইল অ্যাপ':'ওয়েবসাইট'}</span><span>${esc(r.name_en)}</span>${(r.images&&r.images.length>1)?`<span class="badge">${ic('img')} ${bnum(r.images.length)}টি ছবি</span>`:''}`,
  form:(r,done)=>projectForm(r,done),remove:(r,done)=>confirmDelete(PROJ,r,done,async r=>{for(const u of [...(r.images||[]),r.image_url])if(u)await sb.removeFile(u)})};

function projectForm(row,done){
  const isNew=!row,d=row||{category:'web',visual:'v1',size:'n',sort_order:100,is_published:true,tech:[],images:[]};
  /* গ্যালারি অবস্থা */
  let gal=((d.images&&d.images.length?d.images:(d.image_url?[d.image_url]:[]))).map(u=>({url:u}));
  const removed=[];
  const html=`
  <div class="gtitle">মূল তথ্য</div>
  <div class="row2">${F.text('p_bn','নাম (বাংলা) *',d.name_bn||'',{max:120})}${F.text('p_en','নাম (English) *',d.name_en||'',{max:160,help:'যেমন: Keyari · Web'})}</div>
  <div class="row2">${F.sel('p_cat','ধরন *',d.category,[['web','ওয়েবসাইট'],['app','মোবাইল অ্যাপ']])}${F.text('p_url','ওয়েবসাইটের ঠিকানা (ঐচ্ছিক)',d.url||'',{max:300,ph:'example.com'})}</div>
  ${F.area('p_desc','বিবরণ',d.description||'',{max:2000,h:110,help:'প্রজেক্ট খুললে এই লেখা দেখা যাবে।'})}
  <div class="field"><label>টেকনোলজি</label><div class="tagin" id="p_tech"></div><div class="help">লিখে Enter বা কমা চাপুন।</div></div>
  <div class="gtitle">ছবি গ্যালারি <span class="m" style="letter-spacing:0">— যত খুশি ছবি দিন, প্রতিটি অটো ৩০০ KB-র ভেতরে হবে</span></div>
  <div class="drop" id="p_drop" tabindex="0">${ic('upl')}<b>ছবি টেনে আনুন বা ক্লিক করে বাছুন</b><small>একসাথে অনেকগুলো দেওয়া যায় · ৩০ MB-র ছবিও চলবে · প্রথম ছবিটি কভার</small></div>
  <div class="gal" id="p_gal"></div>
  <div class="gtitle">ডিজাইন ও প্রকাশ</div>
  <div class="row3">${F.sel('p_vis','ব্যাকগ্রাউন্ড স্টাইল',d.visual,[['v1','স্টাইল ১'],['v2','স্টাইল ২'],['v3','স্টাইল ৩']],{help:'ছবি না থাকলে মকআপে এটি দেখা যায়।'})}${F.sel('p_size','কার্ডের আকার',d.size,[['w','বড় (চওড়া)'],['n','ছোট']])}${F.num('p_ord','ক্রম',d.sort_order,{help:'ছোট সংখ্যা আগে'})}</div>
  ${F.text('p_slug','Slug (ইউনিক আইডি)',d.slug||'',{help:'ফাঁকা রাখলে ইংরেজি নাম থেকে নিজে তৈরি হবে। পরে বদলাবেন না।'})}
  ${F.sw('p_pub','ওয়েবসাইটে দেখাও',d.is_published,'বন্ধ করলে প্রজেক্টটি লুকানো থাকবে')}`;
  ui.form({title:isNew?'নতুন প্রজেক্ট যোগ করুন':'প্রজেক্ট এডিট করুন',sub:isNew?'তথ্য ও ছবি দিয়ে সেভ করুন':esc(d.name_bn),cls:'lg',html,submitText:isNew?'প্রজেক্ট যোগ করুন':'পরিবর্তন সেভ করুন',
    onMount:(f,h)=>{
      const tags=tagInput(f,'p_tech',d.tech||[]);f._tags=tags;
      const grid=$('#p_gal',f),drop=$('#p_drop',f);
      const drawGal=()=>{
        grid.innerHTML=gal.map((g,i)=>`<div class="gi${g.res?' new':''}" draggable="true" data-i="${i}"><img src="${esc(g.res?g.res.preview:g.url)}" alt="">${i===0?`<span class="badge on cv">${ic('star')} কভার</span>`:''}${g.res?`<span class="sz">${fmtBytes(g.res.blob.size)}</span>`:''}
          <div class="gx">${i>0?`<button type="button" data-a="cover" title="কভার করুন">${ic('star')}</button><button type="button" data-a="left" title="আগে আনুন">${ic('up')}</button>`:''}${i<gal.length-1?`<button type="button" data-a="right" title="পরে নিন">${ic('down')}</button>`:''}<button type="button" class="del" data-a="del" title="সরান">${ic('trash')}</button></div></div>`).join('');
        $$('.gi',grid).forEach(gi=>{
          const i=+gi.dataset.i;
          $$('[data-a]',gi).forEach(b=>b.onclick=ev=>{ev.stopPropagation();const a=b.dataset.a;
            if(a==='del'){const [g]=gal.splice(i,1);if(g.url)removed.push(g.url);if(g.res)URL.revokeObjectURL(g.res.preview)}
            else{const j=a==='left'?i-1:a==='right'?i+1:0;const [g]=gal.splice(i,1);gal.splice(j,0,g)}
            f.markDirty();drawGal()});
          gi.ondragstart=e=>{e.dataTransfer.setData('text/gi',String(i));gi.classList.add('dragging')};
          gi.ondragend=()=>{gi.classList.remove('dragging');$$('.over',grid).forEach(x=>x.classList.remove('over'))};
          gi.ondragover=e=>{if(e.dataTransfer.types.includes('text/gi')){e.preventDefault();gi.classList.add('over')}};gi.ondragleave=()=>gi.classList.remove('over');
          gi.ondrop=e=>{const from=e.dataTransfer.getData('text/gi');if(from==='')return;e.preventDefault();e.stopPropagation();const [g]=gal.splice(+from,1);gal.splice(i,0,g);f.markDirty();drawGal()};
        });
      };
      const addFiles=async files=>{
        files=files.filter(x=>x);if(!files.length)return;
        const res=await compressMany(files,'project');
        if(res.length){res.forEach(r=>gal.push({res:r}));f.markDirty();drawGal();
          const saved=res.reduce((a,r)=>a+r.original,0)-res.reduce((a,r)=>a+r.blob.size,0);
          ui.ok(`${bnum(res.length)}টি ছবি প্রস্তুত`,`${fmtBytes(saved)} ছোট হয়েছে`)}
      };
      drop.onclick=async()=>addFiles(await pickFiles({multiple:true}));
      drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')drop.click()};
      ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
      ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over')}));
      drop.addEventListener('drop',e=>addFiles([...(e.dataTransfer.files||[])]));
      drawGal();
      f._gal=()=>gal;
    },
    onSubmit:async(f)=>{
      const v=id=>$('#'+id,f).value.trim();
      if(!v('p_bn'))throw new Error('বাংলা নাম অবশ্যই দিতে হবে');
      if(!v('p_en'))throw new Error('ইংরেজি নাম অবশ্যই দিতে হবে');
      const ld=ui.loading('সেভ হচ্ছে...','');const uploaded=[];
      try{
        /* নতুন ছবি আপলোড */
        const news=gal.filter(g=>g.res);let k=0;
        for(const g of news){k++;ld.set(`ছবি আপলোড হচ্ছে (${bnum(k)}/${bnum(news.length)})`,fmtBytes(g.res.blob.size),(k-1)/news.length*100);g.url=await uploadBlob('project-images','projects',g.res);uploaded.push(g.url)}
        ld.set('তথ্য সেভ হচ্ছে...','',100);
        const images=gal.map(g=>g.url);
        const out={name_bn:v('p_bn'),name_en:v('p_en'),category:$('#p_cat',f).value,description:v('p_desc'),url:v('p_url')||null,tech:f._tags.get(),
          visual:$('#p_vis',f).value,size:$('#p_size',f).value,sort_order:parseInt($('#p_ord',f).value,10)||0,is_published:$('#p_pub',f).checked,
          images,image_url:images[0]||null};
        out.slug=slugify(v('p_slug'))||slugify(out.name_en)||(row&&row.slug)||'p-'+Date.now().toString(36);
        if(isNew)await sb.insert('projects',out);else await sb.update('projects','id=eq.'+row.id,out);
        /* সরানো ছবি স্টোরেজ থেকে মোছা (ব্যর্থ হলেও সেভ বাতিল নয়) */
        for(const u of removed)await sb.removeFile(u).catch(()=>{});
        gal.forEach(g=>g.res&&URL.revokeObjectURL(g.res.preview));
        ld.close();
        ui.success(isNew?'প্রজেক্ট যোগ হয়েছে':'প্রজেক্ট সেভ হয়েছে',`"${esc(out.name_bn)}" ওয়েবসাইটে ${out.is_published?'দেখানো হচ্ছে':'লুকানো আছে'}।`,{auto:2000});
        done();
      }catch(ex){ld.close();for(const u of uploaded)await sb.removeFile(u).catch(()=>{});if(ex.code==='23505')throw new Error('এই নাম/Slug আগেই আছে — অন্য একটি দিন।');throw new Error(errMsg(ex))}
    }});
}

/* ==================== টিম ==================== */
const TEAM={table:'team_members',label:'টিম সদস্য',single:'সদস্য',icon:'team',addText:'নতুন সদস্য',round:true,
  desc:'টিম সেকশনের সদস্যরা। প্রোফাইল ছবি দিলে অটো ১০০ KB-র ভেতরে আসবে।',
  title:r=>r.name,thumb:r=>r.photo_url,sub:r=>`<span>${esc(r.role||'—')}</span>${(r.skills||[]).length?`<span class="badge">${bnum(r.skills.length)}টি স্কিল</span>`:''}`,
  form:(r,d)=>teamForm(r,d),remove:(r,d)=>confirmDelete(TEAM,r,d,async r=>{if(r.photo_url)await sb.removeFile(r.photo_url)})};

function teamForm(row,done){
  const isNew=!row,d=row||{sort_order:100,is_published:true,skills:[]};
  let photo={url:d.photo_url||null,res:null,removed:false};
  const html=`
  <div class="field"><label>প্রোফাইল ছবি</label><div class="photo"><div class="pp" id="t_pp"></div><div class="pa"><button type="button" class="btn sm" id="t_pick">${ic('upl')} ছবি বাছুন</button><button type="button" class="btn sm d" id="t_rm">${ic('trash')} ছবি সরান</button><small class="dim" style="max-width:260px">যত বড় ছবিই দিন, ক্রপ করার পর নিজে থেকে ১০০ KB-র ভেতরে ছোট হবে।</small></div></div></div>
  <div class="row2">${F.text('t_name','নাম *',d.name||'',{max:120})}${F.text('t_role','পদবি',d.role||'',{max:120,ph:'যেমন: Frontend Developer'})}</div>
  ${F.text('t_init','অবতারের অক্ষর',d.initial||'',{max:4,help:'ছবি না থাকলে এই অক্ষর দেখাবে। ফাঁকা রাখলে নামের প্রথম অক্ষর।'})}
  <div class="field"><label>স্কিল ও দক্ষতা (শতাংশ)</label><div id="t_sk"></div><button type="button" class="btn sm" id="t_addsk">${ic('plus')} স্কিল যোগ করুন</button></div>
  <div class="row2">${F.num('t_ord','ক্রম',d.sort_order,{help:'ছোট সংখ্যা আগে'})}<div>${F.sw('t_pub','ওয়েবসাইটে দেখাও',d.is_published)}</div></div>`;
  ui.form({title:isNew?'নতুন সদস্য যোগ করুন':'সদস্য এডিট করুন',sub:isNew?'ছবি ও তথ্য দিন':esc(d.name),html,submitText:isNew?'সদস্য যোগ করুন':'পরিবর্তন সেভ করুন',
    onMount:(f)=>{
      const pp=$('#t_pp',f);
      const drawPhoto=()=>{const u=photo.res?photo.res.preview:(photo.removed?null:photo.url);
        pp.innerHTML=u?`<img src="${esc(u)}" alt="">`:ic('team');pp.classList.toggle('has',!!u);
        $('#t_rm',f).style.display=u?'':'none';
        $('#t_pick',f).innerHTML=ic('upl')+(u?' ছবি বদলান':' ছবি বাছুন')};
      $('#t_pick',f).onclick=async()=>{const [file]=await pickFiles();if(!file)return;const r=await openCropper(file);if(r){if(photo.res)URL.revokeObjectURL(photo.res.preview);photo.res=r;photo.removed=false;f.markDirty();drawPhoto();ui.ok('ছবি প্রস্তুত',`${fmtBytes(r.original)} → ${fmtBytes(r.blob.size)}`)}};
      $('#t_rm',f).onclick=()=>{photo.res=null;photo.removed=true;f.markDirty();drawPhoto()};
      drawPhoto();
      const sk=$('#t_sk',f);
      const addRow=(n='',l=80)=>{const r=document.createElement('div');r.className='skrow';
        r.innerHTML=`<input type="text" placeholder="যেমন: Flutter" value="${esc(n)}" maxlength="40"><div class="lv"><input type="number" min="0" max="100" value="${l}"><span class="m">%</span></div><button type="button" class="btn sm d ico" aria-label="সরান">${ic('x')}</button>`;
        $('button',r).onclick=()=>{r.remove();f.markDirty()};sk.appendChild(r)};
      (d.skills||[]).forEach(s=>addRow(s.name,s.level));if(!(d.skills||[]).length)addRow();
      $('#t_addsk',f).onclick=()=>{if($$('.skrow',sk).length>=8)return ui.info('সর্বোচ্চ ৮টি স্কিল');addRow();f.markDirty()};
      f._sk=()=>$$('.skrow',sk).map(r=>{const [a,b]=$$('input',r);return {name:a.value.trim(),level:Math.max(0,Math.min(100,parseInt(b.value,10)||0))}}).filter(x=>x.name);
    },
    onSubmit:async(f)=>{
      const name=$('#t_name',f).value.trim();if(!name)throw new Error('নাম অবশ্যই দিতে হবে');
      const ld=ui.loading('সেভ হচ্ছে...','');let newUrl=null;
      try{
        let photo_url=photo.removed?null:photo.url,oldToDelete=null;
        if(photo.res){ld.set('ছবি আপলোড হচ্ছে...',fmtBytes(photo.res.blob.size));photo_url=newUrl=await uploadBlob('team-images','team',photo.res);if(photo.url)oldToDelete=photo.url}
        else if(photo.removed&&photo.url)oldToDelete=photo.url;
        ld.set('তথ্য সেভ হচ্ছে...','');
        const out={name,role:$('#t_role',f).value.trim(),initial:$('#t_init',f).value.trim()||[...name][0]||'',skills:f._sk(),sort_order:parseInt($('#t_ord',f).value,10)||0,is_published:$('#t_pub',f).checked,photo_url};
        if(isNew)await sb.insert('team_members',out);else await sb.update('team_members','id=eq.'+row.id,out);
        if(oldToDelete)await sb.removeFile(oldToDelete).catch(()=>{});
        ld.close();ui.success(isNew?'সদস্য যোগ হয়েছে':'সদস্য সেভ হয়েছে',`"${esc(name)}" টিমে ${out.is_published?'দেখানো হচ্ছে':'লুকানো আছে'}।`,{auto:2000});done();
      }catch(ex){ld.close();if(newUrl)await sb.removeFile(newUrl).catch(()=>{});throw new Error(errMsg(ex))}
    }});
}

/* ==================== FAQ ==================== */
const FAQ={table:'faqs',label:'FAQ',single:'প্রশ্ন',icon:'faq',addText:'নতুন প্রশ্ন',desc:'সাধারণ জিজ্ঞাসা সেকশনের প্রশ্ন-উত্তর।',
  title:r=>r.question,sub:r=>esc((r.answer||'').slice(0,90))+((r.answer||'').length>90?'…':''),
  form:(r,d)=>simpleForm(FAQ,r,d,{title:'প্রশ্ন',html:d0=>`${F.text('f_q','প্রশ্ন *',d0.question||'',{max:300})}${F.area('f_a','উত্তর *',d0.answer||'',{max:2000,h:130})}<div class="row2">${F.num('f_ord','ক্রম',d0.sort_order)}<div>${F.sw('f_pub','ওয়েবসাইটে দেখাও',d0.is_published)}</div></div>`,
    read:f=>{const q=$('#f_q',f).value.trim(),a=$('#f_a',f).value.trim();if(!q)throw new Error('প্রশ্ন অবশ্যই দিতে হবে');if(!a)throw new Error('উত্তর অবশ্যই দিতে হবে');return{question:q,answer:a,sort_order:parseInt($('#f_ord',f).value,10)||0,is_published:$('#f_pub',f).checked}},label:o=>o.question}),
  remove:(r,d)=>confirmDelete(FAQ,r,d)};

/* ==================== টেক স্ট্যাক ==================== */
const TECH={table:'tech_stack',label:'টেক স্ট্যাক',single:'টেকনোলজি',icon:'stack',addText:'নতুন টেকনোলজি',desc:'সাইটে ঘুরতে থাকা টেকনোলজির তালিকা।',
  title:r=>r.name,sub:()=>'',
  form:(r,d)=>r?simpleForm(TECH,r,d,{title:'টেকনোলজি',html:d0=>`${F.text('s_n','নাম *',d0.name||'',{max:60})}<div class="row2">${F.num('s_ord','ক্রম',d0.sort_order)}<div>${F.sw('s_pub','ওয়েবসাইটে দেখাও',d0.is_published)}</div></div>`,
    read:f=>{const n=$('#s_n',f).value.trim();if(!n)throw new Error('নাম অবশ্যই দিতে হবে');return{name:n,sort_order:parseInt($('#s_ord',f).value,10)||0,is_published:$('#s_pub',f).checked}},label:o=>o.name}):techBulk(d),
  remove:(r,d)=>confirmDelete(TECH,r,d)};
function techBulk(done){
  ui.form({title:'টেকনোলজি যোগ করুন',sub:'একসাথে অনেকগুলো যোগ করা যায়',html:`<div class="field"><label>টেকনোলজির নাম</label><div class="tagin" id="s_tags"></div><div class="help">লিখে Enter বা কমা চাপুন। যেমন: Vue, Python, Docker</div></div>`,submitText:'যোগ করুন',
    onMount:f=>{f._t=tagInput(f,'s_tags',[])},
    onSubmit:async f=>{const t=f._t.get();if(!t.length)throw new Error('অন্তত একটি নাম দিন');
      let base=Date.now()%100000;const existing=(await sb.select('tech_stack','select=name,sort_order')),have=new Set(existing.map(x=>x.name.toLowerCase()));
      const max=Math.max(0,...existing.map(x=>x.sort_order));const fresh=t.filter(x=>!have.has(x.toLowerCase()));
      if(!fresh.length)throw new Error('এগুলো আগেই তালিকায় আছে');
      try{await sb.insert('tech_stack',fresh.map((n,i)=>({name:n,sort_order:max+10*(i+1)})))}catch(e){throw new Error(errMsg(e))}
      ui.success(`${bnum(fresh.length)}টি টেকনোলজি যোগ হয়েছে`,esc(fresh.join(', ')),{auto:2000});done()}});
}
function simpleForm(cfg,row,done,o){
  const isNew=!row,d=row||{sort_order:100,is_published:true};
  ui.form({title:isNew?`নতুন ${o.title} যোগ করুন`:`${o.title} এডিট করুন`,html:o.html(d),submitText:isNew?'যোগ করুন':'পরিবর্তন সেভ করুন',
    onSubmit:async f=>{const out=o.read(f);
      try{if(isNew)await sb.insert(cfg.table,out);else await sb.update(cfg.table,'id=eq.'+row.id,out)}catch(e){throw new Error(e.code==='23505'?'এটি আগেই আছে — অন্যটি দিন।':errMsg(e))}
      ui.success(isNew?`${cfg.single} যোগ হয়েছে`:`${cfg.single} সেভ হয়েছে`,`"${esc(o.label(out))}"`,{auto:1800});done()}});
}

PAGES.projects={title:'প্রজেক্ট',icon:'proj',render:el=>renderList(el,PROJ)};
PAGES.team={title:'টিম',icon:'team',render:el=>renderList(el,TEAM)};
PAGES.faqs={title:'FAQ',icon:'faq',render:el=>renderList(el,FAQ)};
PAGES.tech={title:'টেক স্ট্যাক',icon:'stack',render:el=>renderList(el,TECH)};
