/* ==========================================================
   Render projects, team, FAQ, stack, commit graph
   ========================================================== */
/* ---------- RENDER ---------- */
const mk=(p)=>{
  if(p.t==='app') return `<div class="mock" style="display:flex;gap:14px;align-items:flex-end"><div class="phone"><div class="ph-in"><div class="ln" style="width:60%;background:rgba(34,229,139,.5)"></div><div style="height:70px;border-radius:10px;background:linear-gradient(135deg,rgba(61,123,255,.35),rgba(34,229,139,.25))"></div><div class="ln"></div><div class="ln" style="width:80%"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><div style="height:34px;border-radius:8px;background:rgba(120,160,255,.12)"></div><div style="height:34px;border-radius:8px;background:rgba(120,160,255,.12)"></div></div><div class="ln" style="width:50%"></div></div><div style="position:absolute;bottom:12px;left:12px;right:12px;display:flex;justify-content:space-around"><i style="width:6px;height:6px;border-radius:50%;background:var(--green)"></i><i style="width:6px;height:6px;border-radius:50%;background:#2A3A66"></i><i style="width:6px;height:6px;border-radius:50%;background:#2A3A66"></i></div></div>
   <div class="phone" style="transform:scale(.85) translateY(10px);opacity:.75"><div class="ph-in"><div class="ln" style="width:40%"></div><div class="ln"></div><div style="height:90px;border-radius:10px;background:rgba(34,229,139,.15)"></div><div class="ln" style="width:70%"></div></div></div></div>`;
  return `<div class="browser mock"><div class="bt"><i></i><i></i><i></i><u>${p.en.split(' ·')[0]}</u></div><div class="bb"><div style="display:flex;justify-content:space-between"><div class="ln" style="width:22%;background:rgba(34,229,139,.5)"></div><div class="ln" style="width:35%"></div></div>
   <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:10px;margin-top:8px"><div style="display:grid;gap:7px;align-content:start"><div class="ln" style="height:14px;width:90%;background:rgba(230,237,255,.25)"></div><div class="ln" style="height:14px;width:65%;background:rgba(230,237,255,.25)"></div><div class="ln" style="width:80%;margin-top:6px"></div><div class="ln" style="width:60%"></div><div style="width:50px;height:16px;border-radius:5px;background:var(--green);margin-top:6px"></div></div>
   <div style="height:100px;border-radius:10px;background:linear-gradient(135deg,rgba(61,123,255,.4),rgba(34,229,139,.3))"></div></div></div></div>`;
};
$('#proj').innerHTML=projects.map((p,i)=>`<article class="card pj ${p.size} rv d${i%3}" data-t="${p.t}" data-id="${p.id}" tabindex="0"><div class="vis ${p.v}">${mk(p)}</div><div class="inf"><div class="meta"><span>${p.type.toUpperCase?p.type:''} · 0${i+1}</span><span class="arr">↗</span></div><h3>${p.name}</h3><div class="en">${p.en}</div></div></article>`).join('');

$('#teamEl').innerHTML=team.map((m,i)=>`<div class="card tm rv d${i}"><div class="av" style="background:radial-gradient(circle at ${30+i*15}% 30%,rgba(34,229,139,.25),transparent 60%),radial-gradient(circle at 80% 90%,rgba(61,123,255,.3),transparent 60%),#061128"><b>${m.i}</b><span class="cd">dev_0${i+1}.init()</span></div><h4>${m.n}</h4><div class="role">${m.role}</div><div class="sk">${m.sk.map(s=>`<div>${s[0]}<span><i style="--w:${s[1]}%"></i></span></div>`).join('')}</div></div>`).join('');

$('#faqEl').innerHTML=faqs.map((f,i)=>`<div class="fq rv d${i}"><button aria-expanded="false">${f[0]}<i>+</i></button><div class="a"><div><p>${f[1]}</p></div></div></div>`).join('');
$$('.fq button').forEach(b=>b.onclick=()=>{const q=b.parentNode,o=q.classList.contains('open');$$('.fq').forEach(x=>{x.classList.remove('open');x.firstChild.setAttribute('aria-expanded','false')});if(!o){q.classList.add('open');b.setAttribute('aria-expanded','true')}});

const cols=['#22E58B','#3D7BFF','#7AA2FF','#13B86C'];
const tchip=(s,i)=>`<div class="tech"><i style="background:${cols[i%4]}"></i>${s}</div>`;
const half=stack.slice(0,8),half2=stack.slice(8);
$('#m1').innerHTML=[...half,...half,...half,...half].map(tchip).join('');
$('#m2').innerHTML=[...half2,...half2,...half2,...half2].map(tchip).join('');

(function(){
  const g=$('#contrib');if(!g)return;
  let h='';
  for(let c=0;c<26;c++)for(let r=0;r<7;r++){
    const x=Math.sin((c*7+r*13+3)*12.9898)*43758.5453,v=x-Math.floor(x);
    const sc=v*.7+(c/25)*.3-((r===0||r===6)?.22:0);
    let l=sc>.8?4:sc>.62?3:sc>.42?2:sc>.22?1:0;
    const now=c===25&&r===6;if(now)l=4;
    h+=`<i class="l${l}${now?' now':''}" style="--c:${c}"></i>`;
  }
  g.innerHTML=h;
  if(RM||!('IntersectionObserver' in window)){g.classList.add('on');return}
  new IntersectionObserver((e,o)=>{if(e[0].isIntersecting){g.classList.add('on');o.disconnect()}},{threshold:.4}).observe(g);
})();
