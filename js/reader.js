(function(){
'use strict';
const params=new URLSearchParams(location.search);
const deck=(params.get('deck')||'').trim().replace(/[^a-z0-9-]/gi,'');
const title=params.get('title')||'Presentation';
const config={
  'principles-of-management':22,
  'principles-of-management-part2':62,
  'principles-of-management-part3':40,
  'principles-of-management-part4':63,
  'principles-of-management-part5':83,
  'module-iv-staffing-and-leadership':33,
  'module-v-motivation-and-controlling':32
};
const count=config[deck]||0;
const $=id=>document.getElementById(id);
$('deckTitle').textContent=title;
document.title=title+' — Learn with RK';
const loading=$('loading'), stage=$('slideStage'), img=$('slideImage'), counter=$('counter');
const prevs=[$('prevBtn'),$('prevControl')], nexts=[$('nextBtn'),$('nextControl')];
let current=1, touchStartX=0;
function path(n){return 'slides/'+deck+'/slide-'+n+'.jpg'}
function show(n){
 if(!count)return;
 current=Math.max(1,Math.min(count,n));
 img.src=path(current);
 img.alt=title+' — Slide '+current;
 counter.textContent=current+' / '+count;
 prevs.forEach(b=>b.disabled=current===1); nexts.forEach(b=>b.disabled=current===count);
}
function fail(){loading.textContent='This presentation could not be loaded. Please return to Home and try again.';stage.hidden=true;}
if(!count){fail();return;}
img.onload=()=>{loading.classList.add('hidden');stage.hidden=false;show(1)};
img.onerror=fail;
prevs.forEach(b=>b.addEventListener('click',()=>show(current-1)));
nexts.forEach(b=>b.addEventListener('click',()=>show(current+1)));
document.addEventListener('keydown',e=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
 if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}
 if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();show(current+1)}
 if(e.key==='Escape'&&document.fullscreenElement)document.exitFullscreen();
});
$('fullscreenBtn').addEventListener('click',async()=>{
 try{if(!document.fullscreenElement)await $('viewer').requestFullscreen();else await document.exitFullscreen();}catch(e){}}
);
stage.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX},{passive:true});
stage.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>45)show(current+(dx<0?1:-1))},{passive:true});
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('selectstart',e=>e.preventDefault());
document.addEventListener('dragstart',e=>e.preventDefault());
document.addEventListener('copy',e=>e.preventDefault());
document.addEventListener('cut',e=>e.preventDefault());
document.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&['c','u','s','p','a'].includes(e.key.toLowerCase()))e.preventDefault();
});
show(1);
})();
