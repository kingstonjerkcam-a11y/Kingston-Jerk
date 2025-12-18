<script>
/* ---- simple basket ---- */
const menu=[
  {id:'jc', name:'Jerk Chicken', price:900},
  {id:'jp', name:'Jerk Pork',    price:1000},
  {id:'vj', name:'Vegan Jack',   price:800},
  {id:'ef', name:'Extra Festival',price:200}
];
const $=s=>document.querySelector(s);
const tbody=$('#basket tbody');
let rows=0;

function addRow(){
  const tr=document.createElement('tr');
  tr.innerHTML=`
    <td><select name="item">${menu.map(m=>`<option value="${m.id}">${m.name}</option>`).join('')}</select></td>
    <td data-price>${menu[0].price/100}</td>
    <td><input type="number" min="1" max="10" value="1" name="qty" style="width:60px"></td>
    <td data-line>${menu[0].price/100}</td>
    <td><button type="button" onclick="this.parentElement.parentElement.remove();updateTotals()">✕</button></td>`;
  tbody.appendChild(tr);
  rows++;
  tr.querySelector('select').addEventListener('change',e=>{
    const p=menu.find(x=>x.id===e.target.value).price;
    tr.querySelector('[data-price]').textContent=(p/100).toFixed(2);
    updateTotals();
  });
  tr.querySelector('input').addEventListener('input',updateTotals);
  updateTotals();
}
function updateTotals(){
  let gbp=0;
  tbody.querySelectorAll('tr').forEach(r=>{
    const id=r.querySelector('select').value,
          qty=parseInt(r.querySelector('input').value),
          p=(menu.find(m=>m.id===id).price||0);
    const line=p*qty;
    r.querySelector('[data-line]').textContent='£'+(line/100).toFixed(2);
    gbp+=line;
  });
  $('#total').textContent='Total: £'+(gbp/100).toFixed(2);
  return gbp;
}
$('#addItem').onclick=()=>addRow();
addRow(); // start with one row

/* ---- send to server ---- */
$('#custForm').addEventListener('submit',async(e)=>{
  e.preventDefault();
  const lines=[...tbody.querySelectorAll('tr')].map(r=>({
      id:r.querySelector('select').value,
      qty:parseInt(r.querySelector('input').value)
  })).filter(x=>x.qty);
  if(!lines.length){alert('Add at least one item');return;}
  const total=updateTotals();
  const cust=Object.fromEntries(new FormData(e.target));
  const resp=await fetch('/.netlify/functions/create-checkout',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({lines,total,cust})
  });
  const{url}=await resp.json();
  window.location=url;
});
</script>