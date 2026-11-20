
const btns=[...document.querySelectorAll('.filters button')];
const figs=[...document.querySelectorAll('#grid figure')];
let expanded=false; const LIMIT=12; const moreBtn=document.getElementById('moreBtn');
function filter(f){
  btns.forEach(b=>b.classList.toggle('on',b.dataset.f===f));
  let shown=0;
  figs.forEach(x=>{const match=f==='all'||x.dataset.c.split(' ').includes(f); const over=match&&!expanded&&shown>=LIMIT; x.classList.toggle('hide',!match||over); if(match)shown++;});
  if(moreBtn) moreBtn.hidden=expanded||shown<=LIMIT;
}
if(moreBtn) moreBtn.onclick=()=>{expanded=true;const on=btns.find(b=>b.classList.contains('on'));filter(on?on.dataset.f:'all');};
filter('all');
btns.forEach(b=>b.onclick=()=>filter(b.dataset.f));
document.querySelectorAll('[data-go]').forEach(c=>c.onclick=()=>{filter(c.dataset.go);document.getElementById('gallery').scrollIntoView({behavior:'smooth'});});
const lb=document.getElementById('lb');
figs.forEach(f=>f.onclick=()=>{
  const main=f.querySelector('img').src, alt=f.dataset.alt ? f.querySelector('img.alt').src : null;
  document.getElementById('lbimg').src=f.querySelector('img').src;
  document.getElementById('lbcap').innerHTML=f.querySelector('figcaption').innerHTML;
  const old=lb.querySelector('.side'); if(old) old.remove();
  if(alt){ const b=document.createElement('button'); b.className='side'; b.type='button'; b.textContent='↻ See the other side'; let showingAlt=false;
    b.onclick=e=>{e.stopPropagation(); showingAlt=!showingAlt; document.getElementById('lbimg').src=showingAlt?alt:main; b.textContent=showingAlt?'↻ See the front':'↻ See the other side';};
    lb.appendChild(b); }
  lb.classList.add('open');
});
const lbx=document.getElementById('lbx'); if(lbx) lbx.onclick=()=>lb.classList.remove('open');
if(lb) lb.onclick=e=>{if(e.target===lb)lb.classList.remove('open')};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lb)lb.classList.remove('open')});
