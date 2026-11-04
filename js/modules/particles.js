/* ==========================================================
   Particle network canvas
   ========================================================== */
/* ---------- PARTICLE NETWORK ---------- */
(function(){
  const cv=$('#net'),x=cv.getContext('2d');let W,H,P=[],mouse={x:-999,y:-999};
  function rs(){W=cv.width=innerWidth*devicePixelRatio;H=cv.height=innerHeight*devicePixelRatio;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';
    const n=Math.min(70,Math.floor(innerWidth/22));P=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3*devicePixelRatio,vy:(Math.random()-.5)*.3*devicePixelRatio}))}
  rs();addEventListener('resize',rs);addEventListener('mousemove',e=>{mouse.x=e.clientX*devicePixelRatio;mouse.y=e.clientY*devicePixelRatio});
  const D=130*devicePixelRatio;
  function f(){x.clearRect(0,0,W,H);
    for(const p of P){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      const dx=p.x-mouse.x,dy=p.y-mouse.y,dd=Math.hypot(dx,dy);if(dd<160*devicePixelRatio){p.x+=dx/dd*.6;p.y+=dy/dd*.6}
      x.fillStyle='rgba(34,229,139,.55)';x.beginPath();x.arc(p.x,p.y,1.4*devicePixelRatio,0,7);x.fill()}
    for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<D){x.strokeStyle=`rgba(61,123,255,${(1-d/D)*.28})`;x.lineWidth=devicePixelRatio*.8;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}
    if(!RM)requestAnimationFrame(f)}
  f();
})();
