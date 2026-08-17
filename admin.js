/* 明月證券管理模組 v4.2.2
   管理員入口／股價／IPO；不改動一般交易流程。 */
(function(){
  'use strict';
  const ADMIN_EMAILS=['edisonkuo1030@gmail.com'];
  const isAdmin=()=>{
    const u=window.MingyueAuthBridge?.getUser?.()||window.MingyueAuth?.user||window.MingyueCurrentUser||null;
    return !!u && ADMIN_EMAILS.includes(String(u.email||'').toLowerCase());
  };
  const getUser=()=>window.MingyueAuthBridge?.getUser?.()||window.MingyueAuth?.user||window.MingyueCurrentUser||null;
  async function readStocks(){
    if(window.MingyueDataPlugin?.read)return await window.MingyueDataPlugin.read('stocks');
    try{return JSON.parse(localStorage.getItem('mingyue_stocks_v43')||'[]');}catch(e){return []}
  }
  async function writeStocks(stocks){
    localStorage.setItem('mingyue_stocks_v43',JSON.stringify(stocks));
    if(window.MingyueDataPlugin?.write)await window.MingyueDataPlugin.write('stocks',stocks);
  }
  async function readCompanies(){
    if(window.MingyueDataPlugin?.read)return await window.MingyueDataPlugin.read('companies');
    try{return JSON.parse(localStorage.getItem('mingyue_companies_v43')||'[]');}catch(e){return []}
  }
  async function setStockPrice(code,price){
    if(!isAdmin())return{ok:false,error:'沒有管理員權限'};
    const p=Number(price);if(!Number.isFinite(p)||p<=0)return{ok:false,error:'股價必須大於 0'};
    const stocks=await readStocks();if(!Array.isArray(stocks))return{ok:false,error:'股票資料尚未載入'};
    const s=stocks.find(x=>String(x.id)===String(code));if(!s)return{ok:false,error:'找不到股票'};
    s.price=Number(p.toFixed(2));
    await writeStocks(stocks);
    return{ok:true,stock:s};
  }
  async function approveIPO(code){
    if(!isAdmin())return{ok:false,error:'沒有管理員權限'};
    if(typeof window.approveIPO==='function'){window.approveIPO(code);return{ok:true};}
    const companies=await readCompanies();
    const c=(Array.isArray(companies)?companies:[]).find(x=>String(x.code)===String(code));
    if(!c)return{ok:false,error:'找不到公司'};
    c.ipoStatus='已上市';c.listed=true;c.status='上市公司';c.listedAt=new Date().toLocaleString('zh-TW');
    if(window.MingyueDataPlugin?.write)await window.MingyueDataPlugin.write('companies',companies);
    return{ok:true,company:c};
  }
  window.mingyueAdmin={isAdmin,setStockPrice,approveIPO};

  function ensureAdminButton(){
    const menu=document.querySelector('#page-profile .profile-menu');if(!menu||document.getElementById('admin-menu-item'))return;
    const b=document.createElement('button');b.id='admin-menu-item';b.className='profile-menu-item';b.type='button';b.hidden=true;
    b.innerHTML='<div class="menu-icon">🛠️</div><div class="menu-content"><strong>管理後台</strong><span>股票／IPO 管理</span></div><div>›</div>';
    b.onclick=()=>window.showPage&&window.showPage('admin');menu.appendChild(b);
    const refresh=()=>{b.hidden=!isAdmin();if(isAdmin())refreshPanel();};
    window.addEventListener('mingyue-auth-state',refresh);window.addEventListener('mingyue-user-ready',refresh);window.addEventListener('mingyue-user-logout',refresh);refresh();
  }
  async function refreshPanel(){
    const status=document.getElementById('admin-status'),controls=document.getElementById('admin-controls'),list=document.getElementById('admin-ipo-list');
    if(!status||!controls)return;
    if(!isAdmin()){status.textContent='沒有管理員權限';controls.hidden=true;return;}
    status.textContent='管理員已驗證：'+(getUser()?.email||'');controls.hidden=false;
    const companies=await readCompanies();
    const pending=(Array.isArray(companies)?companies:[]).filter(c=>c.ipoStatus==='審核中');
    if(list)list.innerHTML=pending.length?pending.map(c=>`<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0"><span>${c.name||c.shortName||c.code}（${c.code}）</span><button type="button" data-ipo="${String(c.code).replace(/"/g,'&quot;')}">核准上市</button></div>`).join(''):'目前沒有待審核 IPO';
    list?.querySelectorAll('[data-ipo]').forEach(btn=>btn.onclick=async()=>{const r=await approveIPO(btn.dataset.ipo);alert(r.ok?'IPO 已處理':r.error);refreshPanel();});
  }
  window.adminSetStockPrice=async()=>{
    const code=document.getElementById('admin-stock-code')?.value.trim(),price=document.getElementById('admin-stock-price')?.value;
    const r=await setStockPrice(code,price);alert(r.ok?`${code} 股價已設定為 ¥${r.stock.price}`:r.error);
    if(r.ok)window.location.reload();
  };
  document.addEventListener('DOMContentLoaded',()=>{ensureAdminButton();setTimeout(refreshPanel,500);});
  window.addEventListener('mingyue-user-ready',()=>{ensureAdminButton();refreshPanel();});
  window.addEventListener('mingyue-auth-state',()=>{ensureAdminButton();refreshPanel();});
})();
