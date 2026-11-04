/* ==========================================================
   Floating code fragments in background
   ========================================================== */
/* ---------- BACKGROUND CODE FRAGMENTS ---------- */
(function(){
  const root=$('#codebg');if(!root)return;
  const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const KW=new Set('const let var function return async await import from export if else for while class new def self try catch throw yield in of true false null None True False extends override interface type number string void public static final SELECT FROM WHERE AND ORDER BY DESC LIMIT INSERT INTO VALUES git npm ssh sudo echo cd ls'.split(' '));
  function hl(line){
    const out=[];let m=line.match(/^(\s*)(\$|\[\+\]|\[OK\]|\[WARN\]|\[ERR\]|>>)(.*)$/);
    if(m){const c=m[2]==='[WARN]'?'n':m[2]==='[ERR]'?'r':'s';if(m[1])out.push(['',m[1]]);out.push([c,m[2]]);line=m[3]}
    const re=/(\/\/.*$|#(?![0-9a-fA-F]{3,6}\b).*$)|("[^"]*"|'[^']*'|`[^`]*`)|(#[0-9a-fA-F]{3,6}\b|\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?%?)|(@?[A-Za-z_]\w*(?=\s*\())|(@?[A-Za-z_][\w-]*)|(\s+)|([^\sA-Za-z0-9_])/g;let t;
    while((t=re.exec(line))){
      if(t[1])out.push(['c',t[1]]);else if(t[2])out.push(['s',t[2]]);else if(t[3])out.push(['n',t[3]]);
      else if(t[4])out.push(['f',t[4]]);else if(t[5])out.push([KW.has(t[5])?'k':(/^[A-Z]/.test(t[5])?'f':''),t[5]]);
      else if(t[6])out.push(['',t[6]]);else out.push(['p',t[7]]);
    }return out}
  function part(tok,n){let h='';for(const[c,x]of tok){if(n<=0)break;const s=x.slice(0,n);n-=s.length;h+=c?`<span class="${c}">${esc(s)}</span>`:esc(s)}return h}
  const R=a=>a[Math.random()*a.length|0],ri=(a,b)=>a+Math.random()*(b-a)|0,hx=n=>Array.from({length:n},()=>ri(0,256).toString(16).padStart(2,'0')).join(' ');
  const gen={
    hex:()=>Array.from({length:ri(5,9)},(_,i)=>`0x${(0x7ffd3a20+i*16+ri(0,4096)*16).toString(16)}  ${hx(8)}`),
    bin:()=>Array.from({length:ri(4,7)},()=>Array.from({length:4},()=>ri(0,256).toString(2).padStart(8,'0')).join(' ')),
    prog:()=>{const tasks=['fetching assets','bundling modules','optimizing images','running tests','syncing database','compressing build'];const t=R(tasks);return [0,20,40,60,80,100].map(p=>`[${'#'.repeat(p/10)}${'-'.repeat(10-p/10)}] ${p}%  ${t}`).concat(['[OK] '+t+' done'])},
    net:()=>Array.from({length:ri(4,7)},()=>`${R(['[+]','[+]','[OK]','[WARN]'])} ${R(['handshake ok','packet','route','node','socket'])} 10.${ri(0,255)}.${ri(0,255)}.${ri(1,254)}:${R([443,8080,3000,5432,22])}  ${ri(2,180)}ms`)
  };
  const SN=[
`import { build, deploy } from "@gunjoron/core";
const app = await build({ target: "web", minify: true });
for (const route of app.routes) {
  await route.prefetch();
}
deploy(app, { region: "ap-south-1" });
// shipped to production`,
`def analyze(stream):
    buffer = []
    for packet in stream:
        if packet.size > 0x400:
            buffer.append(packet.hash())
    return sorted(buffer)`,
`$ ssh dev@gunjoron.local -p 2222
[+] connection established
[+] tls1.3  aes-256-gcm
$ git pull origin main
[OK] 42 objects received
$ npm run build
[OK] compiled 128 modules in 2.31s`,
`class PatheyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: HomeScreen());
  }
}`,
`SELECT id, name, status FROM projects
WHERE team = 'gunjoron' AND status = 'live'
ORDER BY updated_at DESC LIMIT 5;`,
`interface Project { id: number; name: string }
export const projects: Project[] = await db.query("projects");
projects.forEach(p => render(p));`,
`:root { --green: #22E58B; --blue: #3D7BFF; }
.hero { display: grid; place-items: center; }
.card:hover { transform: translateY(-4px); }`,
`async function fetchUser(id) {
  const res = await fetch("/api/users/" + id);
  if (!res.ok) throw new Error("not found");
  return res.json();
}`,
`$ flutter build apk --release
[+] resolving dependencies...
[WARN] 2 packages have newer versions
[OK] built app-release.apk (18.4MB)`,
`const encrypt = (data, key) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash = (hash ^ data.charCodeAt(i)) * 16777619;
  }
  return (hash >>> 0).toString(16);
};`
  ];
  const next=()=>Math.random()<.32?gen[R(Object.keys(gen))]():R(SN).split('\n');
  const W=innerWidth,count=W<600?3:W<1024?4:6;const frags=[];
  function place(f){
    const vw=innerWidth,vh=innerHeight,fw=f.el.offsetWidth||320,fh=f.max*20;let best=null,bd=-1;
    for(let i=0;i<24;i++){const x=Math.random()*Math.max(10,vw-fw*.8)-fw*.1,y=60+Math.random()*Math.max(10,vh-fh-80);
      const d=Math.min(...frags.filter(o=>o!==f&&o.pos).map(o=>Math.hypot(o.pos.x-x,o.pos.y-y)),1e9);if(d>bd){bd=d;best={x,y}}}
    f.pos=best;f.el.style.left=best.x+'px';f.el.style.top=best.y+'px';shift(f)}
  /* স্ক্রোলের সাথে কোড উপর-নিচ হবে (হালকা প্যারালাক্স), স্ক্রিনের বাইরে গিয়ে ঘুরে আবার ঢুকবে */
  const K=.85;
  function shift(f){if(!f.pos)return;const vh=innerHeight,fh=f.el.offsetHeight||f.max*20,P=vh+fh;
    const y=(((f.pos.y-scrollY*K+fh)%P)+P)%P-fh;f.el.style.transform=`translate3d(0,${(y-f.pos.y).toFixed(1)}px,0)`}
  let tick=false;
  addEventListener('scroll',()=>{if(tick||RM)return;tick=true;requestAnimationFrame(()=>{tick=false;frags.forEach(shift)})},{passive:true});
  function mk(){const el=document.createElement('div');el.className='cf';el.style.setProperty('--o',(Math.random()*.07+.09).toFixed(3));root.appendChild(el);
    const f={el,max:W<600?7:ri(8,13),ln:1,lines:[],tok:null,ch:0,born:0,life:0};frags.push(f);return f}
  function reset(f){f.el.innerHTML='';f.lines=[];f.ln=ri(1,180);f.queue=next();f.tok=null;f.born=performance.now();f.life=ri(14000,26000);place(f);requestAnimationFrame(()=>f.el.classList.add('on'))}
  function newLine(f){const d=document.createElement('span');d.className='cl';d.innerHTML=`<i>${String(f.ln++).padStart(3,' ')}</i><b></b>`;f.el.appendChild(d);f.lines.push(d);
    while(f.lines.length>f.max)f.lines.shift().remove();return d.querySelector('b')}
  function step(f){
    if(document.hidden)return setTimeout(()=>step(f),600);
    if(performance.now()-f.born>f.life&&!f.tok){f.el.classList.remove('on');return setTimeout(()=>{reset(f);step(f)},1700)}
    if(!f.tok){if(!f.queue.length)f.queue=next();const line=f.queue.shift();f.tok=hl(line);f.len=line.length;f.ch=0;f.b=newLine(f);
      f.fast=/^(\[|0x|[01]{8})/.test(line)}
    f.ch+=f.fast?f.len:ri(1,3);
    f.b.innerHTML=part(f.tok,f.ch)+(f.ch<f.len?'<u></u>':'');
    if(f.ch>=f.len){f.b.innerHTML=part(f.tok,f.len);f.tok=null;const last=f.lines[f.lines.length-1];
      setTimeout(()=>step(f),f.fast?ri(90,260):ri(160,520));return}
    setTimeout(()=>step(f),ri(28,70))
  }
  for(let i=0;i<count;i++){const f=mk();
    if(RM){f.queue=next();f.queue.slice(0,f.max).forEach(l=>{const b=newLine(f);b.innerHTML=part(hl(l),l.length)});place(f);f.el.classList.add('on')}
    else setTimeout(()=>{reset(f);step(f)},600+i*900)}
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>frags.forEach(place),300)});
})();
