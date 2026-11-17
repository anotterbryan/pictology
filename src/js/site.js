
const btns=[...document.querySelectorAll('.filters button')];
const figs=[...document.querySelectorAll('#grid figure')];
function filter(f){
  btns.forEach(b=>b.classList.toggle('on',b.dataset.f===f));
  figs.forEach(x=>x.classList.toggle('hide',f!=='all'&&!x.dataset.c.split(' ').includes(f)));
}
btns.forEach(b=>b.onclick=()=>filter(b.dataset.f));
document.querySelectorAll('.cat,[data-go]').forEach(c=>c.onclick=()=>{filter(c.dataset.go);document.getElementById('gallery').scrollIntoView({behavior:'smooth'});});
const lb=document.getElementById('lb');
figs.forEach(f=>f.onclick=()=>{
  document.getElementById('lbimg').src=f.querySelector('img').src;
  document.getElementById('lbcap').innerHTML=f.querySelector('figcaption').innerHTML;
  lb.classList.add('open');
});
document.getElementById('lbx').onclick=()=>lb.classList.remove('open');
lb.onclick=e=>{if(e.target===lb)lb.classList.remove('open')};
document.addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('open')});
