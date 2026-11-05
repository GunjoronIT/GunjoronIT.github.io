/* ==========================================================
   Supabase থেকে কনটেন্ট লোড (প্রজেক্ট, টিম, FAQ, টেক স্ট্যাক)
   ব্যর্থ হলে data.js-এর ডিফল্ট কনটেন্টই থাকবে — সাইট কখনো ফাঁকা হবে না।
   ========================================================== */
(function(){
  const typeOf={web:'ওয়েবসাইট',app:'মোবাইল অ্যাপ'};
  const ord='order=sort_order.asc,created_at.asc';
  const safeImg=u=>/^https:\/\//i.test(u||'')?u:'';

  function observeReveal(){
    $$('.rv').forEach(el=>{io.observe(el);ioOut.observe(el)});
  }

  async function load(){
    if(typeof sb==='undefined')return;
    try{
      const [pr,tm,fq,st]=await Promise.all([
        sb.select('projects','select=*&'+ord),
        sb.select('team_members','select=*&'+ord),
        sb.select('faqs','select=*&'+ord),
        sb.select('tech_stack','select=*&'+ord)
      ]);
      projects=pr.map(r=>({id:r.slug,t:r.category,name:r.name_bn,en:r.name_en,type:typeOf[r.category]||'প্রজেক্ট',
        v:r.visual||'v1',size:r.size||'n',url:r.url||'',d:r.description||'',tech:r.tech||[],img:safeImg(r.image_url)}));
      team=tm.map(r=>({n:r.name,i:r.initial||String(r.name).trim().charAt(0),role:r.role||'',
        sk:(Array.isArray(r.skills)?r.skills:[]).map(s=>[s.name,s.level])}));
      faqs=fq.map(r=>[r.question,r.answer]);
      stack=st.map(r=>r.name);

      renderProjects();renderTeam();renderFaqs();renderStack();
      bindProjectCards();bindTilt();observeReveal();
      /* ফিল্টার "সব" এ রিসেট */
      $$('.flt').forEach(x=>x.classList.toggle('on',x.dataset.f==='all'));
      /* কমান্ড প্যালেটের প্রজেক্ট তালিকা হালনাগাদ */
      if(typeof items!=='undefined'){
        for(let i=items.length-1;i>=0;i--)if(String(items[i][1]).startsWith('p:'))items.splice(i,1);
        projects.forEach(p=>items.push([p.name+' — '+p.type,'p:'+p.id]));
        if(typeof filt!=='undefined')filt=items;
      }
    }catch(err){
      console.warn('[Supabase] কনটেন্ট লোড হয়নি, ডিফল্ট কনটেন্ট দেখানো হচ্ছে:',err.message);
    }
  }
  load();
})();
