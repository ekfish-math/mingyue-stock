/* 明月證券管理模組 v4.3.0
   管理員：股票／IPO／錢包儲值審核 */
(function(){
  'use strict';
  const ADMIN_EMAILS=['edisonkuo1030@gmail.com'];
  const isAdmin=()=>{const u=window.MingyueAuthBridge?.getUser?.()||window.MingyueAuth?.user||window.MingyueCurrentUser||null;return !!u&&ADMIN_EMAILS.includes(String(u.email||'').toLowerCase());};
  const plugin=()=>window.MingyueDataPlugin;
  async function read(key){if(plugin()?.read)return await plugin().read(key);try{return JSON.parse(localStorage.getItem('mingyue_'+key+'_v43')||'null');}catch(e){return null;}}
  async function write(key,value){if(plugin()?.write)return await plugin().write(key,value);localStorage.setItem('mingyue_'+key+'_v43',JSON.stringify(value));}
  async function setStockPrice(code,price){if(!isAdmin())return{ok:false,error:'沒有管理員權限'};const p=Number(price);if(!Number.isFinite(p)||p<=0)return{ok:false,error:'股價必須大於 0'};const stocks=await read('stocks')||[];const s=stocks.find(x=>String(x.id)===String(code));if(!s)return{ok:false,error:'找不到股票'};s.price=Number(p.toFixed(2));await write('stocks',stocks);return{ok:true,stock:s};}
  async function approveIPO(code){if(!isAdmin())return{ok:false,error:'沒有管理員權限'};if(typeof window.approveIPO==='function'){window.approveIPO(code);return{ok:true};}return{ok:false,error:'IPO 審核模組尚未載入'};}
  async function readDeposits(){const d=await read('depositRequests');return d&&typeof d==='object'?d:{};}
  async function writeDeposits(d){await write('depositRequests',d);}
  async function approveDeposit(id,approved){
    if(!isAdmin())return{ok:false,error:'沒有管理員權限'};
    const all=await readDeposits();const r=all[id];if(!r)return{ok:false,error:'找不到儲值申請'};
    if(r.status&&r.status!=='pending')return{ok:false,error:'這筆申請已處理'};
    r.status=approved?'approved':'rejected';r.reviewedAt=Date.now();r.reviewedBy=window.MingyueAuthBridge?.getUser?.()?.email||'';
    if(approved){
      const uid=String(r.uid||r.googleUid||'');if(!uid)return{ok:false,error:'申請缺少 Google UID'};
      const users=await read('users')||{};const u=users[uid]||{};u.balance=Number(u.balance)||0;u.balance+=Number(r.amount)||0;u.lastDepositAt=Date.now();users[uid]=u;await write('users',users);
    }
    all[id]=r;await writeDeposits(all);return{ok:true,request:r};
  }
  window.mingyueAdmin={isAdmin,setStockPrice,approveIPO,readDeposits,approveDeposit};
  function ensureAdminButton(){const menu=document.querySelector('#page-profile .profile-menu');if(!menu||document.getElementById('admin-menu-item'))return;const b=document.createElement('button');b.id='admin-menu-item';b.className='profile-menu-item';b.type='button';b.hidden=true;b.innerHTML='<div class="menu-icon">🛠️</div><div class="menu-content"><strong>管理後台</strong><span>股票／IPO／錢包審核</span></div><div>›</div>';b.onclick=()=>window.showPage&&window.showPage('admin');menu.appendChild(b);const refresh=()=>{b.hidden=!isAdmin();if(isAdmin())refreshPanel();};window.addEventListener('mingyue-auth-state',refresh);window.addEventListener('mingyue-user-ready',refresh);window.addEventListener('mingyue-user-logout',refresh);refresh();}
  async function refreshPanel(){const status=document.getElementById('admin-status'),controls=document.getElementById('admin-controls'),list=document.getElementById('admin-ipo-list'),deposits=document.getElementById('admin-deposit-list');if(!status||!controls)return;if(!isAdmin()){status.textContent='沒有管理員權限';controls.hidden=true;return;}status.textContent='管理員已驗證：'+(window.MingyueAuthBridge?.getUser?.()?.email||'');controls.hidden=false;const companies=await read('companies')||[];const pending=(Array.isArray(companies)?companies:[]).filter(c=>c.ipoStatus==='審核中');if(list)list.innerHTML=pending.length?pending.map(c=>`<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0"><span>${c.name||c.shortName||c.code}（${c.code}）</span><button type="button" data-ipo="${String(c.code).replace(/"/g,'&quot;')}">核准上市</button></div>`).join(''):'目前沒有待審核 IPO';list?.querySelectorAll('[data-ipo]').forEach(btn=>btn.onclick=async()=>{const r=await approveIPO(btn.dataset.ipo);alert(r.ok?'IPO 已處理':r.error);refreshPanel();});
    const ds=await readDeposits();const pendingD=Object.entries(ds).filter(([id,r])=>r&&(!r.status||r.status==='pending'));if(deposits)deposits.innerHTML=pendingD.length?pendingD.map(([id,r])=>`<div style="padding:10px 0;border-top:1px solid #eee"><div><b>${Number(r.amount||0).toLocaleString()}</b>　UID：${String(r.uid||r.googleUid||'')}</div><small>${r.createdAt?new Date(r.createdAt).toLocaleString('zh-TW'):''}</small><div style="margin-top:6px"><button type="button" data-deposit-ok="${id}">核准</button> <button type="button" data-deposit-no="${id}">拒絕</button></div></div>`).join(''):'目前沒有待審核儲值';deposits?.querySelectorAll('[data-deposit-ok]').forEach(b=>b.onclick=async()=>{const r=await approveDeposit(b.dataset.depositOk,true);alert(r.ok?'儲值已核准':r.error);refreshPanel();});deposits?.querySelectorAll('[data-deposit-no]').forEach(b=>b.onclick=async()=>{const r=await approveDeposit(b.dataset.depositNo,false);alert(r.ok?'儲值已拒絕':r.error);refreshPanel();});}
  window.adminSetStockPrice=async()=>{const code=document.getElementById('admin-stock-code')?.value.trim(),price=document.getElementById('admin-stock-price')?.value;const r=await setStockPrice(code,price);alert(r.ok?`${code} 股價已設定為 ¥${r.stock.price}`:r.error);if(r.ok)window.location.reload();};
  document.addEventListener('DOMContentLoaded',()=>{ensureAdminButton();setTimeout(refreshPanel,500);});window.addEventListener('mingyue-user-ready',()=>{ensureAdminButton();refreshPanel();});window.addEventListener('mingyue-auth-state',()=>{ensureAdminButton();refreshPanel();});
})();
