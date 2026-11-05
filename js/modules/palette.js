/* ==========================================================
   Command palette (Ctrl/Cmd+K)
   ========================================================== */
/* ---------- COMMAND PALETTE ---------- */
const items=[['হোম','#home'],['আমরা কারা','#about'],['সার্ভিস','#services'],['প্রজেক্ট','#projects'],['কাজের ধাপ','#process'],['টিম','#team'],['টার্মিনাল','#terminal'],['জিজ্ঞাসা (FAQ)','#faq'],['যোগাযোগ','#contact'],
  ...projects.map(p=>[p.name+' — '+p.type,'p:'+p.id])];
let sel=0,filt=items;
function drawPal(){$('#palList').innerHTML=filt.map((it,i)=>`<li class="${i===sel?'on':''}" data-i="${i}">${it[0]}<span>${it[1].startsWith('p:')?'project':it[1]}</span></li>`).join('')||'<li>কিছু পাওয়া যায়নি</li>';
  $$('#palList li[data-i]').forEach(li=>li.onclick=()=>go(filt[+li.dataset.i]))}
function openPal(){$('#pal').classList.add('open');$('#palIn').value='';filt=items;sel=0;drawPal();setTimeout(()=>$('#palIn').focus(),50)}
function closePal(){$('#pal').classList.remove('open')}
function go(it){closePal();if(it[1].startsWith('p:')){goTo('#projects');setTimeout(()=>openP(it[1].slice(2)),500)}else goTo(it[1])}
$('#palBtn').onclick=openPal;$('#pal').onclick=e=>{if(e.target.id==='pal')closePal()};
$('#palIn').oninput=e=>{const q=e.target.value.toLowerCase();filt=items.filter(i=>i[0].toLowerCase().includes(q)||i[1].includes(q));sel=0;drawPal()};
$('#palIn').onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(sel+1,filt.length-1);drawPal();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(sel-1,0);drawPal();e.preventDefault()}else if(e.key==='Enter'&&filt[sel])go(filt[sel])};
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#pal').classList.contains('open')?closePal():openPal()}
  if(e.key==='Escape'){closePal();closeP();setM(false)}});
