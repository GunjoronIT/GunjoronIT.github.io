/* ==========================================================
   Helpers
   ========================================================== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* HTML escape (ডাটাবেজ থেকে আসা লেখা নিরাপদে দেখানোর জন্য) */
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
