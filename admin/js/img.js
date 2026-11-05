/* ==========================================================
   ছবি কমপ্রেশন ইঞ্জিন (ব্রাউজারেই চলে — সার্ভারে যাওয়ার আগে)
   যত বড় ছবিই দিন (৩০ MB+ ও চলবে), ফল হবে সীমার ভেতরে:
     প্রোফাইল ছবি  → সর্বোচ্চ ১০০ KB (বর্গাকার, WebP)
     প্রজেক্ট ছবি  → সর্বোচ্চ ৩০০ KB (WebP)
   কৌশল: আগে আকার কমানো → তারপর কোয়ালিটি বাইনারি-সার্চ → এখনও বড় হলে আকার আরও কমিয়ে আবার চেষ্টা।
   ========================================================== */
const IMG_LIMITS={
  profile:{maxBytes:100*1024,maxDim:640,minDim:200,square:true,label:'প্রোফাইল ছবি'},
  project:{maxBytes:300*1024,maxDim:1920,minDim:480,square:false,label:'প্রজেক্ট ছবি'}
};
const SAFETY=0.96; /* সীমার ৪% নিচে লক্ষ্য রাখি, যাতে সার্ভারের সীমা কখনো না ছাড়ায় */

function canvasBlob(c,type,q){return new Promise(res=>c.toBlob(b=>res(b),type,q))}

/* ফাইল → সর্বোচ্চ maxDim আকারের ক্যানভাস (বিশাল ছবিতেও মেমোরি-বান্ধব) */
async function fileToCanvas(file,maxDim){
  if(!/^image\//.test(file.type)&&!/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name))
    throw new Error('এটি ছবির ফাইল নয়। JPG, PNG, WEBP বা GIF দিন।');
  let bmp=null,w=0,h=0,img=null;
  try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'});w=bmp.width;h=bmp.height}
  catch(e){
    try{bmp=await createImageBitmap(file,{resizeWidth:Math.min(maxDim*1.5,3000),resizeQuality:'high'});w=bmp.width;h=bmp.height}
    catch(e2){
      img=await new Promise((ok,no)=>{const i=new Image(),u=URL.createObjectURL(file);i.onload=()=>{ok(i)};i.onerror=()=>no(new Error('ছবিটি খোলা যায়নি (ফরম্যাট সমর্থিত নয়, যেমন HEIC)। JPG বা PNG দিন।'));i.src=u});
      w=img.naturalWidth;h=img.naturalHeight;
    }
  }
  const src=bmp||img,s=Math.min(1,maxDim/Math.max(w,h));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*s));c.height=Math.max(1,Math.round(h*s));
  const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(src,0,0,c.width,c.height);
  if(bmp&&bmp.close)bmp.close();
  return c;
}
function scaleCanvas(c,f){
  const n=document.createElement('canvas');n.width=Math.max(1,Math.round(c.width*f));n.height=Math.max(1,Math.round(c.height*f));
  const x=n.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(c,0,0,n.width,n.height);return n;
}
function centerSquare(c){
  const s=Math.min(c.width,c.height),n=document.createElement('canvas');n.width=n.height=s;
  n.getContext('2d').drawImage(c,(c.width-s)/2,(c.height-s)/2,s,s,0,0,s,s);return n;
}

/* ক্যানভাস → সীমার ভেতরের Blob */
async function compressCanvas(canvas,{maxBytes,minDim,onStep}){
  const target=maxBytes*SAFETY;
  /* WebP সমর্থন যাচাই (পুরোনো Safari PNG ফেরত দেয়) */
  let type='image/webp';const probe=await canvasBlob(scaleCanvas(canvas,.05),type,.8);
  if(!probe||probe.type!=='image/webp')type='image/jpeg';
  let cur=canvas,best=null;
  for(let round=0;round<14;round++){
    let work=cur;
    if(type==='image/jpeg'){ /* স্বচ্ছতা সাদা করে ফেলি */
      work=document.createElement('canvas');work.width=cur.width;work.height=cur.height;
      const x=work.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,work.width,work.height);x.drawImage(cur,0,0);
    }
    onStep&&onStep(round);
    /* এই আকারে সবচেয়ে ভালো কোয়ালিটি খুঁজি */
    let lo=.35,hi=.92,found=null;
    const top=await canvasBlob(work,type,hi);
    if(top&&top.size<=target)found=top;
    else{
      for(let i=0;i<7;i++){
        const mid=(lo+hi)/2,b=await canvasBlob(work,type,mid);
        if(b&&b.size<=target){found=b;lo=mid}else hi=mid;
      }
    }
    if(found){best=found;break}
    /* এখনও বড় — আকার ১৮% কমাই */
    const low=await canvasBlob(work,type,.35);
    best=low;
    if(Math.min(cur.width,cur.height)*.82<minDim){
      /* ন্যূনতম আকারে পৌঁছেছি; আরও কমাতেই হবে */
      if(low&&low.size<=maxBytes)break;
      cur=scaleCanvas(cur,.8);if(Math.min(cur.width,cur.height)<64)break;continue;
    }
    cur=scaleCanvas(cur,.82);
  }
  return {blob:best,width:cur.width,height:cur.height,type};
}

/* মূল ফাংশন: ফাইল দিন → কমপ্রেসড ফলাফল পান */
async function compressImage(file,kind,{onStep}={}){
  const L=IMG_LIMITS[kind];
  let c=await fileToCanvas(file,L.maxDim);
  if(L.square)c=centerSquare(c);
  const r=await compressCanvas(c,{maxBytes:L.maxBytes,minDim:L.minDim,onStep});
  if(!r.blob||r.blob.size>L.maxBytes)throw new Error('ছবিটি সীমার ভেতরে আনা গেল না। অন্য একটি ছবি চেষ্টা করুন।');
  return {...r,original:file.size,name:file.name,ext:r.type==='image/webp'?'webp':'jpg',preview:URL.createObjectURL(r.blob)};
}
/* ইতিমধ্যে তৈরি ক্যানভাস (ক্রপারের ফল) কমপ্রেস করা */
async function compressFromCanvas(canvas,kind,original){
  const L=IMG_LIMITS[kind];
  const r=await compressCanvas(canvas,{maxBytes:L.maxBytes,minDim:L.minDim});
  if(!r.blob||r.blob.size>L.maxBytes)throw new Error('ছবিটি সীমার ভেতরে আনা গেল না।');
  return {...r,original:original||r.blob.size,ext:r.type==='image/webp'?'webp':'jpg',preview:URL.createObjectURL(r.blob)};
}

/* একাধিক ফাইল কমপ্রেস (প্রজেক্ট গ্যালারি) — প্রগ্রেস পপআপসহ */
async function compressMany(files,kind){
  const out=[],fails=[];const ld=ui.loading('ছবি প্রসেস হচ্ছে...','');
  try{
    for(let i=0;i<files.length;i++){
      const f=files[i];ld.set(`ছবি প্রসেস হচ্ছে (${bnum(i+1)}/${bnum(files.length)})`,`${f.name} — ${fmtBytes(f.size)} থেকে ছোট করা হচ্ছে...`,(i/files.length)*100);
      await sleep(30);
      try{out.push(await compressImage(f,kind))}catch(e){fails.push(f.name+': '+e.message)}
    }
  }finally{ld.close()}
  if(fails.length)await ui.error('কিছু ছবি যোগ করা যায়নি',esc(fails.join('\n')).replace(/\n/g,'<br>'));
  return out;
}

/* ---------- প্রোফাইল ছবির ক্রপার (টেনে সরান + জুম) ---------- */
function openCropper(file){
  return new Promise(async resolve=>{
    let url=URL.createObjectURL(file),imgEl=new Image();
    try{await new Promise((ok,no)=>{imgEl.onload=ok;imgEl.onerror=()=>no(new Error('ছবিটি খোলা যায়নি। JPG বা PNG দিন।'));imgEl.src=url})}
    catch(e){URL.revokeObjectURL(url);await ui.error('ছবি খোলা যায়নি',e.message);return resolve(null)}
    const V=320,W=imgEl.naturalWidth,H=imgEl.naturalHeight,minS=V/Math.min(W,H);
    let s=minS,tx=(V-W*s)/2,ty=(V-H*s)/2;
    const body=document.createElement('div');
    body.innerHTML=`<div class="crop" id="cr"></div><div class="field" style="margin-top:16px"><label>জুম</label><div class="rangef"><input type="range" id="cz" min="1" max="4" step="0.01" value="1"><output id="cz_o">১x</output></div></div><p class="m" style="font-size:12.5px;text-align:center">ছবি টেনে মুখ ঠিক জায়গায় আনুন। ছবি নিজে থেকেই ১০০ KB-র ভেতরে ছোট হয়ে যাবে।</p>`;
    const cr=$('#cr',body);cr.appendChild(imgEl);imgEl.draggable=false;
    const clamp=()=>{tx=Math.min(0,Math.max(V-W*s,tx));ty=Math.min(0,Math.max(V-H*s,ty))};
    const draw=()=>{clamp();imgEl.style.width=W*s+'px';imgEl.style.height=H*s+'px';imgEl.style.transform=`translate(${tx}px,${ty}px)`};
    draw();
    let drag=null;
    cr.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,tx,ty};cr.setPointerCapture(e.pointerId);cr.style.cursor='grabbing'};
    cr.onpointermove=e=>{if(!drag)return;const k=V/cr.clientWidth;tx=drag.tx+(e.clientX-drag.x)*k;ty=drag.ty+(e.clientY-drag.y)*k;draw()};
    cr.onpointerup=cr.onpointercancel=()=>{drag=null;cr.style.cursor=''};
    const zr=$('#cz',body),zo=$('#cz_o',body);
    const setZoom=z=>{const ns=minS*z,cx=(V/2-tx)/s,cy=(V/2-ty)/s;s=ns;tx=V/2-cx*s;ty=V/2-cy*s;zo.textContent=bnum(z.toFixed(1))+'x';draw()};
    zr.oninput=()=>setZoom(+zr.value);
    cr.onwheel=e=>{e.preventDefault();zr.value=Math.min(4,Math.max(1,+zr.value-e.deltaY*.002));setZoom(+zr.value)};
    const h=ui.modal({title:'ছবি ক্রপ করুন',sub:'বর্গাকার প্রোফাইল ছবি',body,dismissValue:null,
      actions:[{label:'বাতিল',value:null},{label:ic('check')+' ছবি ব্যবহার করুন',cls:'p',value:'ok'}],
      onClose:async v=>{
        if(v!=='ok'){URL.revokeObjectURL(url);return resolve(null)}
        const c=document.createElement('canvas');c.width=c.height=720;const x=c.getContext('2d');x.imageSmoothingQuality='high';
        x.drawImage(imgEl,-tx/s,-ty/s,V/s,V/s,0,0,720,720);
        const ld=ui.loading('ছবি ছোট করা হচ্ছে...',`${fmtBytes(file.size)} থেকে ১০০ KB-র ভেতরে আনা হচ্ছে`);
        try{await sleep(50);const r=await compressFromCanvas(c,'profile',file.size);resolve({...r,name:file.name})}
        catch(e){ld.close();await ui.error('ছবি প্রসেস করা যায়নি',esc(e.message));return resolve(null)}
        ld.close();URL.revokeObjectURL(url);
      }});
  });
}

/* ফাইল পিকার */
function pickFiles({multiple=false}={}){
  return new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept='image/*';i.multiple=multiple;i.onchange=()=>res([...i.files]);i.oncancel=()=>res([]);i.click()});
}
/* কমপ্রেসড ব্লব স্টোরেজে আপলোড → পাবলিক URL */
async function uploadBlob(bucket,folder,res){
  const path=`${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${res.ext}`;
  const f=new File([res.blob],'x.'+res.ext,{type:res.type});
  return sb.upload(bucket,path,f);
}
