/* 明月證券管理模組 v4.5
   管理員：股票／IPO 審核
   ---------------------------------------------------------
   v4.5 已完全移除遊戲錢包與儲值審核。
*/
(function(){
  'use strict';
  const ADMIN_EMAILS=['edisonkuo1030@gmail.com'];
  const isAdmin=()=>{const u=window.MingyueAuthBridge?.getUser?.()||window.MingyueAuth?.user||window.MingyueCurrentUser||null;return !!u&&ADMIN_EMAILS.includes(String(u.email||'').toLowerCase());};
  const plugin=()=>window.MingyueDataPlugin;
  async function read(key){if(plugin()?.read)return await plugin().read(key);try{return JSON.parse(localStorage.getItem('mingyue_'+key+'_v43')||'null');}catch(e){return null;}}
  async function write(key,value){if(plugin()?.write)return await plugin().write(key,value);localStorage.setItem('mingyue_'+key+'_v43',JSON.stringify(value));}
  async function setStockPrice(code,price){if(!isAdmin())return{ok:false,error:'沒有管理員權限'};const p=Number(price);if(!Number.isFinite(p)||p<=0)return{ok:false,error:'股價必須大於 0'};const stocks=await read('stocks')||[];const s=stocks.find(x=>String(x.id)===String(code));if(!s)return{ok:false,error:'找不到股票'};s.price=Number(p.toFixed(2));await write('stocks',stocks);return{ok:true,stock:s};}
  async function approveIPO(code){if(!isAdmin())return{ok:false,error:'沒有管理員權限'};if(typeof window.approveIPO==='function'){await window.approveIPO(code);return{ok:true};}return{ok:false,error:'IPO 審核模組尚未載入'};}
  window.mingyueAdmin={isAdmin,setStockPrice,approveIPO};
  function ensureAdminButton(){const menu=document.querySelector('#page-profile .profile-menu');if(!menu||document.getElementById('admin-menu-item'))return;const b=document.createElement('button');b.id='admin-menu-item';b.className='profile-menu-item';b.type='button';b.hidden=true;b.innerHTML='<div class="menu-icon">🛠️</div><div class="menu-content"><strong>管理後台</strong><span>股票／IPO 審核</span></div><div>›</div>';b.onclick=()=>window.showPage&&window.showPage('admin');menu.appendChild(b);const refresh=()=>{b.hidden=!isAdmin();if(isAdmin())refreshPanel();};window.addEventListener('mingyue-auth-state',refresh);window.addEventListener('mingyue-user-ready',refresh);window.addEventListener('mingyue-user-logout',refresh);refresh();}
  async function refreshPanel(){const status=document.getElementById('admin-status'),controls=document.getElementById('admin-controls'),list=document.getElementById('admin-ipo-list');if(!status||!controls)return;if(!isAdmin()){status.textContent='沒有管理員權限';controls.hidden=true;return;}status.textContent='管理員已驗證：'+(window.MingyueAuthBridge?.getUser?.()?.email||'');controls.hidden=false;const companies=await read('companies')||[];const pending=(Array.isArray(companies)?companies:[]).filter(c=>c.ipoStatus==='審核中');if(list)list.innerHTML=pending.length?pending.map(c=>`<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0"><span>${c.name||c.shortName||c.code}（${c.code}）</span><button type="button" data-ipo="${String(c.code).replace(/"/g,'&quot;')}">核准上市</button></div>`).join(''):'目前沒有待審核 IPO';list?.querySelectorAll('[data-ipo]').forEach(btn=>btn.onclick=async()=>{const r=await approveIPO(btn.dataset.ipo);alert(r.ok?'IPO 已處理':r.error);refreshPanel();});}
  window.adminSetStockPrice=async()=>{const code=document.getElementById('admin-stock-code')?.value.trim(),price=document.getElementById('admin-stock-price')?.value;const r=await setStockPrice(code,price);alert(r.ok?`${code} 股價已設定為 ¥${r.stock.price}`:r.error);if(r.ok)window.location.reload();};
  document.addEventListener('DOMContentLoaded',()=>{ensureAdminButton();setTimeout(refreshPanel,300);});window.addEventListener('mingyue-user-ready',()=>{ensureAdminButton();refreshPanel();});window.addEventListener('mingyue-auth-state',()=>{ensureAdminButton();refreshPanel();});
})();
