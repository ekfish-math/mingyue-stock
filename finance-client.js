import {initializeApp,getApps,getApp} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {getDatabase,ref,get,set,runTransaction,serverTimestamp,onValue} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const config={apiKey:"AIzaSyDWDaEZoZPwBe7wZX0aiDAGqs4b_EAkfgM",authDomain:"mingyue-stock.firebaseapp.com",databaseURL:"https://mingyue-stock-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"mingyue-stock",storageBucket:"mingyue-stock.firebasestorage.app",messagingSenderId:"774198660845",appId:"1:774198660845:web:93f4a725b6303aae9f86e4"};
const app=getApps().length?getApp():initializeApp(config);const auth=getAuth(app);const db=getDatabase(app);
const toast=m=>window.showToast?window.showToast(m):alert(m);
const money=n=>"¥"+Number(n||0).toLocaleString("zh-TW",{minimumFractionDigits:2,maximumFractionDigits:2});
const makeId=(prefix)=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;

function refreshPlayerBalance(balance){
  const value=Number(balance||0);
  ["top-balance","home-balance","home-wallet","deposit-wallet","portfolio-balance"].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=money(value);});
  try{localStorage.setItem("mingyue_user_v42",JSON.stringify({...JSON.parse(localStorage.getItem("mingyue_user_v42")||"{}"),balance:value}));}catch{}
  window.dispatchEvent(new CustomEvent("mingyue-finance-balance-updated",{detail:{balance:value}}));
}

let balanceListenerStarted=false;
function startBalanceListener(){
  if(balanceListenerStarted||!auth.currentUser)return;
  balanceListenerStarted=true;
  const userRef=ref(db,`users/${auth.currentUser.uid}`);
  onValue(userRef,snap=>{if(!snap.exists())return;refreshPlayerBalance((snap.val()||{}).balance);},err=>console.error("玩家資產即時同步失敗",err));
}

onAuthStateChanged(auth,user=>{if(user)startBalanceListener();});
async function currentUser(){if(!auth.currentUser)throw new Error("請先完成 Google 登入");startBalanceListener();return auth.currentUser;}

async function ensureFinanceUI(){
  document.querySelectorAll('[onclick*="openDepositModal"]').forEach(b=>{b.removeAttribute("onclick");b.addEventListener("click",openDepositModal);});
  if(!document.getElementById("finance-actions")){
    const card=document.createElement("div");card.id="finance-actions";card.className="section-card";card.innerHTML='<div class="section-title">💰 證券資金</div><div class="section-subtitle">儲值與提領均需金融後台審核</div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="primary-button" id="finance-deposit">＋ 儲值申請</button><button class="primary-button" id="finance-withdraw">－ 提領申請</button></div><div id="finance-status" class="section-subtitle" style="margin-top:10px"></div>';
    const p=document.getElementById("page-portfolio");if(p)p.insertBefore(card,p.firstChild);
    document.getElementById("finance-deposit").onclick=openDepositModal;document.getElementById("finance-withdraw").onclick=openWithdrawalModal;
  }
}

function modal(id,title,desc,submit){
  document.getElementById(id)?.remove();
  const m=document.createElement("div");m.id=id;m.className="modal show";m.innerHTML=`<div class="modal-box"><div class="modal-header"><div><h3>${title}</h3><p>${desc}</p></div><button class="modal-close" type="button">×</button></div><div class="form-group"><label>金額</label><input id="${id}-amount" type="number" min="1" step="0.01" placeholder="例如 10000"></div><button id="${id}-submit" class="primary-button full" type="button">送出申請</button></div>`;
  document.body.appendChild(m);m.querySelector(".modal-close").onclick=()=>m.remove();m.addEventListener("click",e=>{if(e.target===m)m.remove();});m.querySelector("#"+id+"-submit").onclick=()=>submit(Number(m.querySelector("input").value),m);setTimeout(()=>m.querySelector("input")?.focus(),30);
}

async function openDepositModal(){
  modal("finance-deposit-modal","💰 證券帳戶儲值","送出後進入金融後台審核，核准後才增加餘額。",async(amount,m)=>{
    if(!Number.isFinite(amount)||amount<=0)return toast("請輸入有效金額");
    try{const u=await currentUser();const id=makeId("DEP");await set(ref(db,`depositRequests/${u.uid}/${id}`),{id,accountId:u.uid,amount,status:"pending",createdAt:serverTimestamp()});m.remove();toast(`儲值申請已送出：${money(amount)}\n等待金融後台審核。`);}catch(e){console.error("建立儲值申請失敗",e);toast(e?.message||"儲值申請失敗");}
  });
}

async function openWithdrawalModal(){
  modal("finance-withdraw-modal","－ 證券帳戶提領","提領金額會先凍結；只有後台核准後才完成提領。",async(amount,m)=>{
    if(!Number.isFinite(amount)||amount<=0)return toast("請輸入有效金額");
    try{
      const u=await currentUser(),userRef=ref(db,`users/${u.uid}`);
      const tx=await runTransaction(userRef,user=>{if(!user)return user;const balance=Number(user.balance||0),frozen=Number(user.frozenBalance||0);if(balance-frozen<amount)return;return {...user,frozenBalance:frozen+amount};});
      if(!tx.committed){const snap=await get(userRef);if(!snap.exists())throw new Error("帳戶不存在");throw new Error("可用餘額不足");}
      const id=makeId("WDR");
      try{await set(ref(db,`withdrawalRequests/${u.uid}/${id}`),{id,accountId:u.uid,amount,status:"pending",createdAt:serverTimestamp()});}
      catch(e){await runTransaction(userRef,user=>{if(!user)return user;return {...user,frozenBalance:Math.max(0,Number(user.frozenBalance||0)-amount)};});throw e;}
      m.remove();toast(`提領申請已送出：${money(amount)}\n金額已凍結，等待金融後台審核。`);
    }catch(e){console.error("建立提領申請失敗",e);toast(e?.message||"提領申請失敗");}
  });
}

window.openDepositModal=openDepositModal;window.openWithdrawalModal=openWithdrawalModal;window.depositMoney=()=>openDepositModal();window.withdrawMoney=()=>openWithdrawalModal();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(ensureFinanceUI,350),{once:true});else setTimeout(ensureFinanceUI,350);
setTimeout(ensureFinanceUI,1500);
console.log("明月證券 v4.6 RTDB 玩家金融模組已載入");