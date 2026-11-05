/* ==========================================================
   Preloader & app start
   ========================================================== */
/* ---------- PRELOADER ---------- */
(function(){
  const lines=GJ.list('list.boot');
  if(!GJ.A('preloader')){$('#pre').classList.add('done');document.body.classList.remove('loading');document.addEventListener('DOMContentLoaded',()=>start());return}
  const box=$('#preBox');let i=0;
  const bar=document.createElement('div');bar.className='bar';bar.innerHTML='<i></i>';
  function next(){
    if(i<lines.length){const d=document.createElement('div');d.textContent=lines[i];if(i===lines.length-1)d.style.color='var(--green)';box.appendChild(d);i++;bar.firstChild.style.width=(i/lines.length*100)+'%';setTimeout(next,RM?0:230)}
    else setTimeout(()=>{$('#pre').classList.add('done');document.body.classList.remove('loading');start()},RM?0:300);
  }
  box.parentNode.appendChild(bar); next();
})();

let started=false;
function start(){if(started)return;started=true;typeLoop();typeCode();counters(document)}
