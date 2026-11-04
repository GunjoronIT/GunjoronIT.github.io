/* ==========================================================
   Failsafe
   ========================================================== */
/* failsafe */
setTimeout(()=>{if(!started){$('#pre').classList.add('done');document.body.classList.remove('loading');start()}},4000);
