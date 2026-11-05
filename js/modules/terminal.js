/* ==========================================================
   Interactive terminal
   ========================================================== */
/* ---------- TERMINAL ---------- */
const out=$('#tout'),tin=$('#tin'),tb=$('#tb');let hist=[],hi=0;
const C={
 help:()=>`উপলব্ধ কমান্ড:
  <span class="g">whoami</span>     আমরা কারা
  <span class="g">team</span>       টিম সদস্যদের তালিকা
  <span class="g">projects</span>   আমাদের প্রজেক্ট
  <span class="g">services</span>   আমরা যা করি
  <span class="g">contact</span>    যোগাযোগ সেকশনে যান
  <span class="g">date</span>       আজকের তারিখ
  <span class="g">clear</span>      স্ক্রিন পরিষ্কার`,
 whoami:()=>`<span class="g">Gunjoron IT Team</span> | গুঞ্জরণ আইটি টিম
প্রোগ্রামার, অ্যাপ ও ওয়েবসাইট ডিজাইনারদের একটি দল।`,
 team:()=>team.map((m,i)=>`<span class="b">[0${i+1}]</span> ${m.n}  <span class="m">— ${m.role}</span>`).join('\n'),
 projects:()=>projects.map(p=>`<span class="g">▸</span> ${p.name} <span class="m">(${p.type})</span>`).join('\n'),
 services:()=>'web-development  mobile-apps  ui-ux-design\nbackend-api  deploy-maintenance  branding',
 contact:()=>{setTimeout(()=>goTo('#contact'),600);return 'যোগাযোগ সেকশনে নিয়ে যাচ্ছি... <span class="g">✓</span>'},
 date:()=>new Date().toLocaleDateString('bn-BD',{weekday:'long',year:'numeric',month:'long',day:'numeric'}),
 ls:()=>'<span class="b">projects/</span>  <span class="b">team/</span>  README.md  hire-us.sh',
 'cat readme.md':()=>'# Gunjoron IT Team\nআমরা আইডিয়াকে কোডে রূপ দিই।',
 'sudo hire-us':()=>{setTimeout(()=>goTo('#contact'),1400);return `<span class="g">[sudo]</span> অনুমতি মঞ্জুর ✓
হায়ারিং প্রোটোকল চালু হচ্ছে... <span class="g">██████████ 100%</span>
চলুন একসাথে কিছু অসাধারণ বানাই! 🚀`},
 './hire-us.sh':()=>C['sudo hire-us']()
};
function print(h,cls='o'){const d=document.createElement('div');d.className=cls;d.innerHTML=h;out.appendChild(d);tb.scrollTop=tb.scrollHeight}
function run(cmd){cmd=cmd.trim();print(`<span class="g">guest@gunjoron</span><span class="b">:~$</span> ${cmd.replace(/</g,'&lt;')}`,'');
  if(!cmd)return;hist.push(cmd);hi=hist.length;const k=cmd.toLowerCase();
  if(k==='clear'){out.innerHTML='';return}
  if(C[k])print(C[k]());else print(`command not found: ${cmd.replace(/</g,'&lt;')} — <span class="m">'help' লিখে দেখুন</span>`,'o e')}
print(`স্বাগতম! <span class="g">gunjoron-shell v1.0</span>
শুরু করতে <span class="g">help</span> লিখুন।`);
tin.onkeydown=e=>{if(e.key==='Enter'){run(tin.value);tin.value=''}
  else if(e.key==='ArrowUp'&&hi>0){tin.value=hist[--hi];e.preventDefault()}
  else if(e.key==='ArrowDown'){tin.value=hist[++hi]||'';if(hi>hist.length)hi=hist.length}
  else if(e.key==='Tab'){e.preventDefault();const m=Object.keys(C).find(c=>c.startsWith(tin.value));if(m)tin.value=m}};
tb.onclick=()=>tin.focus({preventScroll:true});
$$('#cmds button').forEach(b=>b.onclick=()=>run(b.textContent));
