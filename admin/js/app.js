/* ==========================================================
   অ্যাডমিন অ্যাপ: লগইন, সাইডবার, রাউটার
   ========================================================== */
/* PAGES ui.js-এ ঘোষিত */
const NAV=[
  {g:'সারসংক্ষেপ',items:['dashboard']},
  {g:'কনটেন্ট',items:['projects','team','faqs','tech']},
  {g:'সাইট এডিটর',items:['texts','design','anim','settings']},
  {g:'ইনবক্স',items:['messages','subscribers']}
];
const App={page:'dashboard',unread:0,dirty:null,/* dirty: ফাংশন, সেভ না করা পরিবর্তন থাকলে true */};

const SETUP_HINT='সম্ভবত supabase/03-cms-upgrade.sql চালানো হয়নি। SETUP-SUPABASE.md-এর ধাপ ৪ দেখুন।';
const errMsg=e=>{
  const m=(e&&e.message)||String(e);
  if(/site_settings|photo_url|images|column|relation/i.test(m)&&/does not exist|schema cache|Could not find/i.test(m))return m+' — '+SETUP_HINT;
  if(e&&e.status===401)return 'সেশনের মেয়াদ শেষ। আবার লগইন করুন।';
  if(/row-level security|permission denied/i.test(m))return 'অনুমতি নেই — আপনি অ্যাডমিন হিসেবে সেট আছেন কি? ('+m+')';
  if(/Failed to fetch|NetworkError/i.test(m))return 'ইন্টারনেট সংযোগ চেক করুন।';
  return m;
};
const fail=(e,title='কাজটি হয়নি')=>{console.error(e);return ui.error(title,esc(errMsg(e)))};

/* ---------- লগইন ---------- */
const loginView=$('#loginView'),appView=$('#appView');
async function checkAdmin(){try{return (await sb.rpc('is_admin'))===true}catch(e){return false}}
async function enter(){
  const ok=await checkAdmin();
  if(!ok){sb.signOut();$('#lerr').textContent='এই অ্যাকাউন্টের অ্যাডমিন অনুমতি নেই। (supabase/02-make-admin.sql চালিয়েছেন?)';loginView.classList.remove('hidden');return false}
  loginView.classList.add('hidden');appView.classList.remove('hidden');
  const em=(sb.user&&sb.user.email)||'admin';$('#who').textContent=em;$('#whoav').textContent=em[0].toUpperCase();
  buildNav();await refreshUnread();route();return true;
}
$('#loginForm').onsubmit=async e=>{
  e.preventDefault();$('#lerr').textContent='';const b=e.target.querySelector('button[type=submit]');b.classList.add('busy');
  try{await sb.signIn($('#le').value.trim(),$('#lp').value);await enter()}
  catch(err){
    $('#lerr').textContent=err.status===400?'ইমেইল বা পাসওয়ার্ড ভুল।':'লগইন ব্যর্থ: '+err.message;
    const bx=$('.lbox');bx.classList.remove('shake');void bx.offsetWidth;bx.classList.add('shake');
  }finally{b.classList.remove('busy')}
};
$('#pwt').onclick=()=>{const i=$('#lp');i.type=i.type==='password'?'text':'password'};
if(sb.session){enter().then(ok=>{if(!ok)loginView.classList.remove('hidden')})}else loginView.classList.remove('hidden');

async function logout(){
  if(App.dirty&&App.dirty()&&!await ui.confirm({title:'সেভ না করা পরিবর্তন আছে',message:'লগআউট করলে পরিবর্তনগুলো হারিয়ে যাবে।',confirmText:'তবুও লগআউট',danger:true}))return;
  if(!await ui.confirm({title:'লগআউট করবেন?',message:'আপনি অ্যাডমিন প্যানেল থেকে বেরিয়ে যাবেন।',confirmText:'লগআউট'}))return;
  sb.signOut();location.hash='';location.reload();
}

/* ---------- সাইডবার ---------- */
function buildNav(){
  $('#nav').innerHTML=NAV.map(g=>`<div class="navg"><h6>${g.g}</h6>${g.items.map(k=>`<a href="#/${k}" data-p="${k}">${ic(PAGES[k].icon)}<span>${PAGES[k].title}</span>${k==='messages'?`<span class="cnt hidden" id="unreadBadge"></span>`:''}</a>`).join('')}</div>`).join('');
  $$('#nav a').forEach(a=>a.onclick=async e=>{e.preventDefault();closeNav();await navigate(a.dataset.p)});
  updateBadge();
}
async function refreshUnread(){try{App.unread=(await sb.select('contact_messages','select=id&is_read=eq.false')).length}catch(e){App.unread=0}updateBadge()}
function updateBadge(){const b=$('#unreadBadge');if(!b)return;b.textContent=App.unread?bnum(App.unread):'';b.classList.toggle('hidden',!App.unread)}
const closeNav=()=>document.body.classList.remove('nav-open');
$('#burger').onclick=()=>document.body.classList.toggle('nav-open');$('.scrim').onclick=closeNav;
$('#logout2').onclick=logout;

/* ---------- রাউটার ---------- */
async function navigate(name,force){
  if(!force&&App.dirty&&App.dirty()){
    const ok=await ui.confirm({title:'সেভ না করা পরিবর্তন আছে',message:'এই পেজ ছেড়ে গেলে আপনার পরিবর্তনগুলো হারিয়ে যাবে।',confirmText:'হ্যাঁ, ছেড়ে যান',cancelText:'এখানেই থাকুন',danger:true});
    if(!ok)return;
  }
  App.dirty=null;
  if(location.hash==='#/'+name)route();else location.hash='#/'+name;
}
addEventListener('hashchange',()=>{if(!appView.classList.contains('hidden')){App.dirty=null;route()}});
addEventListener('beforeunload',e=>{if(App.dirty&&App.dirty()){e.preventDefault();e.returnValue=''}});
async function route(){
  const name=(location.hash.match(/^#\/(\w+)/)||[])[1],pg=PAGES[name]?name:'dashboard';
  App.page=pg;App.dirty=null;
  $$('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.p===pg));
  $('#pageTitle').innerHTML=ic(PAGES[pg].icon)+PAGES[pg].title;document.title=PAGES[pg].title+' · গুঞ্জরণ অ্যাডমিন';
  const el=$('#page');el.innerHTML='<div class="loadingpg"><div class="spin"></div>লোড হচ্ছে...</div>';
  scrollTo({top:0});
  try{await PAGES[pg].render(el)}catch(e){console.error(e);el.innerHTML=`<div class="empty"><div class="ei">${ic('warn')}</div><h3>পেজ লোড হয়নি</h3><p>${esc(errMsg(e))}</p><button class="btn p" style="margin-top:14px" onclick="route()">আবার চেষ্টা করুন</button></div>`}
}
