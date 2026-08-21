/* =========================================================
   明月證券 v4.6
   CLICK / UI HOTFIX + SECURE FINANCE CLIENT
   ---------------------------------------------------------
   保留手機點擊相容性；遊戲錢包不再使用。
   證券儲值／提領改由 Firebase Callable Functions 處理。
   ========================================================= */
(function(){
  "use strict";
  const VERSION="4.6";
  const originalLog=console.log.bind(console);
  console.log=function(){const args=[...arguments].map(v=>typeof v==="string"?v.replaceAll("v4.2","v4.6").replaceAll("v4.2.1","v4.6").replaceAll("v4.5","v4.6"):v);originalLog(...args);};
  const byId=id=>document.getElementById(id);
  const ready=fn=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fn,{once:true}):fn();
  function fallbackShowPage(page){document.querySelectorAll(".page").forEach(el=>el.classList.toggle("active",el.id==="page-"+page));document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.page===page));window.__mingyueCurrentPage=page;}
  function fallbackToast(message){const toast=byId("toast");if(!toast)return;toast.textContent=String(message||"");toast.classList.add("show");clearTimeout(window.__mingyueToastTimer);window.__mingyueToastTimer=setTimeout(()=>toast.classList.remove("show"),2200);}
  function removeWalletUI(){document.querySelectorAll('[onclick*="openDepositModal"], [onclick*="depositMoney"]').forEach(el=>el.remove());document.querySelectorAll(".wallet,#home-wallet,#deposit-wallet").forEach(el=>(el.closest(".asset-box,.form-group")||el).remove());byId("deposit-modal")?.remove();byId("admin-deposit-list")?.closest(".form-group")?.remove();const admin=byId("page-admin");admin?.querySelectorAll("p,h2,.page-title-row").forEach(el=>{el.textContent=el.textContent.replaceAll("／錢包儲值審核","").replaceAll("與錢包儲值審核","").replaceAll("錢包儲值","資金審核");});}
  function loadFinanceClient(){if(document.getElementById("finance-client-loader"))return;const s=document.createElement("script");s.id="finance-client-loader";s.type="module";s.src="finance-client.js";document.body.appendChild(s);}
  ready(()=>{if(typeof window.showPage!=="function")window.showPage=fallbackShowPage;if(typeof window.showToast!=="function")window.showToast=fallbackToast;if(typeof window.toast!=="function")window.toast=window.showToast;document.querySelectorAll("button,a,input,select,textarea,[onclick]").forEach(el=>{el.style.pointerEvents="auto";el.style.touchAction="manipulation";});document.addEventListener("click",e=>{if(e.target?.classList?.contains("modal"))e.target.classList.remove("show");},true);removeWalletUI();loadFinanceClient();window.addEventListener("error",e=>{const msg=String(e?.message||"");if(/is not defined|undefined/.test(msg))console.warn("明月證券 v"+VERSION+" 相容層：",msg);});console.log("明月證券 v"+VERSION+" click hotfix 已啟用；遊戲錢包停用，金融後端已接入");});
})();
