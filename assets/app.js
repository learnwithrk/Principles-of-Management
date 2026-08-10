
const data = window.POM_DATA;
const toc=document.getElementById('toc'), content=document.getElementById('content');
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function textHtml(lines){
  return lines.map(x=>{
    if(/^[-•]\s/.test(x)) return `<li>${esc(x.replace(/^[-•]\s*/,''))}</li>`;
    return `<p>${esc(x)}</p>`;
  }).join('');
}
function render(){
  toc.innerHTML='<h3>Contents</h3>';
  content.innerHTML='';
  data.forEach((part,pi)=>{
    const id='part-'+part.id;
    toc.insertAdjacentHTML('beforeend',`<a href="#${id}">${esc(part.title)} <small>(${part.slide_count} slides)</small></a>`);
    let cards='';
    part.slides.forEach(s=>{
      cards+=`<article class="slide-card" data-search="${esc((s.text||[]).join(' '))}">
        <div class="slide-head"><span>${esc(part.title)}</span><span class="slide-num">Slide ${s.num}</span></div>
        <img class="slide-img" loading="lazy" src="${esc(s.image)}" alt="${esc(part.title)} — Slide ${s.num}" onclick="openModal(this.src)">
        <div class="slide-text" id="${id}-s${s.num}">${textHtml(s.text||[])}</div>
      </article>`;
    });
    content.insertAdjacentHTML('beforeend',`<section class="part" id="${id}"><h2>${esc(part.title)}</h2><div class="part-desc">${esc(part.file)} • ${part.slide_count} slides</div><div class="slides">${cards}</div></section>`);
  });
}
function openModal(src){document.getElementById('modal-img').src=src;document.getElementById('modal').classList.add('open')}
function closeModal(){document.getElementById('modal').classList.remove('open')}
document.getElementById('search').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase().trim();
  document.querySelectorAll('.slide-card').forEach(c=>{
    const hit=q && c.dataset.search.toLowerCase().includes(q);
    c.style.display=(!q||hit)?'':'none'; c.classList.toggle('search-hit',!!hit);
  });
});
document.getElementById('showText').addEventListener('click',()=>{
  document.querySelectorAll('.slide-text').forEach(x=>x.classList.toggle('show'));
});
document.getElementById('print').addEventListener('click',()=>window.print());
render();
