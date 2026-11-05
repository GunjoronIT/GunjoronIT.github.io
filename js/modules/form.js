/* ==========================================================
   Contact form + newsletter  →  Supabase
   ========================================================== */
/* ---------- FORM ---------- */
$('#bud').oninput=e=>{const v=+e.target.value;$('#budv').textContent='৳ '+bn(v.toLocaleString('en-IN'))+(v>=500000?'+':'')};

$('#form').onsubmit=async e=>{
  e.preventDefault();
  const n=$('#fn').value.trim(),c=$('#fe').value.trim(),m=$('#fm').value.trim();
  if(!n||!c||!m){$('#ferr').textContent='! অনুগ্রহ করে * চিহ্নিত সব ঘর পূরণ করুন';return}
  if(c.length<3){$('#ferr').textContent='! সঠিক ইমেইল বা ফোন নম্বর দিন';return}
  $('#ferr').textContent='';
  const btn=e.target.querySelector('button[type=submit]');
  const label=btn.innerHTML;btn.disabled=true;btn.textContent='পাঠানো হচ্ছে...';
  const svc=[['o1','website'],['o2','mobile_app'],['o3','ui_ux'],['o4','other']].filter(x=>$('#'+x[0]).checked).map(x=>x[1]);
  try{
    await sb.insert('contact_messages',{name:n,contact:c,services:svc,budget:+$('#bud').value,message:m});
    $('#sname').textContent=n;$('#fwrap').style.display='none';$('#sent').style.display='block';
  }catch(err){
    console.warn('[Supabase] ফর্ম জমা হয়নি:',err);
    $('#ferr').textContent='! বার্তা পাঠানো যায়নি। ইন্টারনেট চেক করে আবার চেষ্টা করুন।';
  }finally{btn.disabled=false;btn.innerHTML=label}
};
$('#again').onclick=()=>{$('#form').reset();$('#budv').textContent='৳ ৫০,০০০';$('#fwrap').style.display='grid';$('#sent').style.display='none'};

$('#nl').onsubmit=async e=>{
  e.preventDefault();const f=e.target,v=f.email.value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){toast('! সঠিক ইমেইল লিখুন');f.email.focus();return}
  const b=f.querySelector('button');b.disabled=true;
  try{
    await sb.insert('newsletter_subscribers',{email:v});
    toast('✓ ধন্যবাদ! আপনি যুক্ত হয়েছেন');f.reset();
  }catch(err){
    if(err.status===409||err.code==='23505'){toast('✓ আপনি আগেই যুক্ত আছেন');f.reset()}
    else toast('! এখন যুক্ত করা যায়নি, পরে চেষ্টা করুন');
  }finally{b.disabled=false}
};
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2600)}
