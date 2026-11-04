/* ==========================================================
   Contact form, newsletter, toast
   ========================================================== */
/* ---------- FORM ---------- */
$('#bud').oninput=e=>{const v=+e.target.value;$('#budv').textContent='৳ '+bn(v.toLocaleString('en-IN'))+(v>=500000?'+':'')};
$('#form').onsubmit=e=>{e.preventDefault();const n=$('#fn').value.trim(),c=$('#fe').value.trim(),m=$('#fm').value.trim();
  if(!n||!c||!m){$('#ferr').textContent='! অনুগ্রহ করে * চিহ্নিত সব ঘর পূরণ করুন';return}
  $('#ferr').textContent='';$('#sname').textContent=n;$('#fwrap').style.display='none';$('#sent').style.display='block'};
$('#again').onclick=()=>{$('#form').reset();$('#budv').textContent='৳ ৫০,০০০';$('#fwrap').style.display='grid';$('#sent').style.display='none'};
$('#nl').onsubmit=e=>{e.preventDefault();const f=e.target,v=f.email.value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){toast('! সঠিক ইমেইল লিখুন');f.email.focus();return}toast('✓ ধন্যবাদ! আপনি যুক্ত হয়েছেন (ডেমো)');f.reset()};
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2600)}
