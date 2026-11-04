/* ==========================================================
   Hero IDE code typing
   ========================================================== */
/* ---------- CODE IN IDE ---------- */
function typeCode(){
  const src=[
   '<span class="c">// গুঞ্জরণ আইটি টিম</span>',
   '<span class="k">const</span> <span class="f">team</span> <span class="p">=</span> <span class="p">{</span>',
   '  name<span class="p">:</span> <span class="s">"Gunjoron IT Team"</span><span class="p">,</span>',
   '  members<span class="p">:</span> <span class="n">4</span><span class="p">,</span>',
   '  skills<span class="p">:</span> <span class="p">[</span><span class="s">"web"</span><span class="p">,</span> <span class="s">"app"</span><span class="p">,</span> <span class="s">"ui/ux"</span><span class="p">],</span>',
   '  projects<span class="p">:</span> <span class="p">[</span>',
   '    <span class="s">"পত্রদ্বীপ"</span><span class="p">,</span> <span class="s">"পাথেয়"</span><span class="p">,</span> <span class="s">"কেয়ারি"</span>',
   '  <span class="p">],</span>',
   '<span class="p">};</span>',
   '',
   '<span class="k">async function</span> <span class="f">build</span><span class="p">(</span>idea<span class="p">) {</span>',
   '  <span class="k">const</span> design <span class="p">=</span> <span class="k">await</span> team.<span class="f">design</span><span class="p">(</span>idea<span class="p">);</span>',
   '  <span class="k">return</span> team.<span class="f">ship</span><span class="p">(</span>design<span class="p">);</span> <span class="c">// 🚀</span>',
   '<span class="p">}</span>'
  ];
  const pre=$('#code');let i=0;
  (function add(){if(i>=src.length)return;const s=document.createElement('span');s.className='l';s.innerHTML=src[i]||' ';s.style.opacity=0;s.style.transform='translateX(-8px)';s.style.transition='.4s';pre.appendChild(s);requestAnimationFrame(()=>{s.style.opacity=1;s.style.transform='none'});i++;setTimeout(add,RM?0:120)})();
}
