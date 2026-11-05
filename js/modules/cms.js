/* ==========================================================
   Supabase থেকে কনটেন্ট + সাইট সেটিংস লোড (প্রজেক্ট, টিম, FAQ, টেক স্ট্যাক, লেখা, ডিজাইন, অ্যানিমেশন)
   ব্যর্থ হলে HTML/data.js-এর ডিফল্ট থাকবে — সাইট কখনো ফাঁকা হবে না।
   ========================================================== */
(function(){
  const typeOf={web:'ওয়েবসাইট',app:'মোবাইল অ্যাপ'};
  const ord='order=sort_order.asc,created_at.asc';
  const safeImg=u=>/^https:\/\//i.test(u||'')?u:'';

  function observeReveal(){$$('.rv').forEach(el=>{io.observe(el);ioOut.observe(el)})}

  /* ক্যাশ থেকে আগেই লেখা বসানো (প্রিলোডারের আড়ালে) */
  GJ.applyTexts(GJ.settings.texts);

  async function loadSettings(){
    try{
      const rows=await sb.select('site_settings','select=key,value');
      const s={};rows.forEach(r=>s[r.key]=r.value);
      GJ.cache(s);GJ.applyAll(s);GJ.applyTexts(GJ.settings.texts);
    }catch(err){console.warn('[Supabase] সেটিংস লোড হয়নি (ডিফল্ট চলছে):',err.message)}
  }

  async function loadContent(){
    try{
      const [pr,tm,fq,st]=await Promise.all([
        sb.select('projects','select=*&'+ord),
        sb.select('team_members','select=*&'+ord),
        sb.select('faqs','select=*&'+ord),
        sb.select('tech_stack','select=*&'+ord)
      ]);
      projects=pr.map(r=>{
        const imgs=(Array.isArray(r.images)&&r.images.length?r.images:[r.image_url]).map(safeImg).filter(Boolean);
        return {id:r.slug,t:r.category,name:r.name_bn,en:r.name_en,type:typeOf[r.category]||'প্রজেক্ট',
          v:r.visual||'v1',size:r.size||'n',url:r.url||'',d:r.description||'',tech:r.tech||[],img:imgs[0]||'',imgs}});
      team=tm.map(r=>({n:r.name,i:r.initial||String(r.name).trim().charAt(0),role:r.role||'',photo:safeImg(r.photo_url),
        sk:(Array.isArray(r.skills)?r.skills:[]).map(s=>[s.name,s.level])}));
      faqs=fq.map(r=>[r.question,r.answer]);
      stack=st.map(r=>r.name);

      renderProjects();renderTeam();renderFaqs();renderStack();
      bindProjectCards();bindTilt();observeReveal();
      $$('.flt').forEach(x=>x.classList.toggle('on',x.dataset.f==='all'));
      /* হিরোর সংখ্যা আসল সংখ্যার সাথে মেলানো */
      const hc=$$('.hero-meta [data-count]');
      if(hc[0]){hc[0].dataset.count=projects.length;delete hc[0].dataset.done}
      if(hc[1]){hc[1].dataset.count=team.length;delete hc[1].dataset.done}
      if(started)counters($('.hero-meta'));
      if(typeof items!=='undefined'){
        for(let i=items.length-1;i>=0;i--)if(String(items[i][1]).startsWith('p:'))items.splice(i,1);
        projects.forEach(p=>items.push([p.name+' — '+p.type,'p:'+p.id]));
        if(typeof filt!=='undefined')filt=items;
      }
    }catch(err){
      console.warn('[Supabase] কনটেন্ট লোড হয়নি, ডিফল্ট কনটেন্ট দেখানো হচ্ছে:',err.message);
    }
  }
  loadSettings();loadContent();
})();
