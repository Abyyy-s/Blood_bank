/* Compatibility motion layer: subtle, finite, and reduced-motion aware. */
(function(){
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function reveal(){const targets=document.querySelectorAll('.card,.stat-card,.workspace-header,.table-container,.workflow-steps,.alert');if(!targets.length)return;targets.forEach((el,i)=>{if(el.closest('.modal')||el.classList.contains('ll-no-motion'))return;el.classList.add('ll-reveal');el.style.setProperty('--ll-delay',`${Math.min(i*35,220)}ms`);});if(reduce||!('IntersectionObserver'in window)){targets.forEach(el=>el.classList.add('ll-visible'));return;}const obs=new IntersectionObserver((entries,o)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('ll-visible');o.unobserve(e.target);}}),{threshold:.08});targets.forEach(el=>obs.observe(el));}
 function buttons(){if(reduce||!window.matchMedia('(pointer:fine)').matches)return;document.querySelectorAll('.btn,.text-action').forEach(button=>{if(button.dataset.motionReady)return;button.dataset.motionReady='true';button.addEventListener('pointermove',e=>{const r=button.getBoundingClientRect();button.style.setProperty('--mx',`${((e.clientX-r.left)/r.width-.5)*4}px`);button.style.setProperty('--my',`${((e.clientY-r.top)/r.height-.5)*3}px`);});button.addEventListener('pointerleave',()=>{button.style.setProperty('--mx','0px');button.style.setProperty('--my','0px');});});}
 function init(){reveal();buttons();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
