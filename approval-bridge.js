/* =========================================================
   明月證券 v4.4
   Approval Bridge
   儲值 + IPO 改為「申請 → 後臺審核 → 生效」
   ========================================================= */
import { getApps } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get, push, set, update } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const app = getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);

function uid(){
  return auth.currentUser?.uid || localStorage.getItem("mingyue_current_google_uid") || localStorage.getItem("mingyue_active_account_id") || null;
}
function toast(msg){
  if(typeof window.showToast === "function") window.showToast(msg);
  else alert(msg);
}
function closeDeposit(){
  const m=document.getElementById("deposit-modal");
  if(m) m.classList.remove("show");
}
function openDeposit(){
  const m=document.getElementById("deposit-modal");
  if(!m){toast("找不到儲值視窗");return;}
  const input=document.getElementById("deposit-amount");
  if(input) input.value="";
  const wallet=document.getElementById("deposit-wallet");
  if(wallet) wallet.textContent="提交後等待管理員審核";
  const title=m.querySelector("h3"); if(title) title.textContent="💰 證券儲值申請";
  const desc=m.querySelector(".modal-header p"); if(desc) desc.textContent="輸入金額後送出申請；管理員核准後才會增加證券餘額。";
  m.classList.add("show");
}
async function submitDeposit(){
  const amount=Number(document.getElementById("deposit-amount")?.value);
  const accountId=uid();
  if(!accountId){toast("請先完成 Google 登入，再申請儲值");return;}
  if(!Number.isFinite(amount)||amount<=0){toast("請輸入有效儲值金額");return;}
  const snap=await get(ref(db,"depositRequests"));
  let duplicate=false;
  if(snap.exists()) snap.forEach(x=>{const r=x.val();if(r?.accountId===accountId&&r?.status==="pending")duplicate=true;});
  if(duplicate){toast("你已有一筆待審核的儲值申請");return;}
  const r=push(ref(db,"depositRequests"));
  await set(r,{accountId,uid:accountId,amount,status:"pending",createdAt:Date.now(),createdBy:accountId});
  closeDeposit();
  toast(`儲值申請 ${amount.toLocaleString()} 已送出，等待後臺審核`);
}
async function submitIPO(code){
  const accountId=uid();
  if(!accountId){toast("請先完成 Google 登入");return;}
  const snap=await get(ref(db,"companies"));
  const companies=snap.exists()&&Array.isArray(snap.val())?snap.val():[];
  const company=companies.find(c=>c.code===code&&c.owner===accountId);
  if(!company){toast("找不到這家公司或你不是公司負責人");return;}
  if(company.listed){toast("這家公司已經上市");return;}
  if(company.ipoStatus==="審核中"){toast("IPO 已在審核中");return;}
  if(Number(company.capital)<10000000){toast("註冊資本不足 ¥10,000,000");return;}
  if(!confirm(`確定申請「${company.name}」IPO？\n\n送出後必須由明月證券管理後臺審核，核准後才會正式上市。`))return;
  company.ipoStatus="審核中";
  company.ipoAppliedAt=new Date().toLocaleString("zh-TW",{hour12:false});
  company.ipoApplicant=accountId;
  const idx=companies.findIndex(c=>c.code===code);
  companies[idx]=company;
  const req=push(ref(db,"ipoRequests"));
  await update(ref(db),{
    companies,
    [`ipoRequests/${req.key}`]:{companyId:company.id,code:company.code,companyName:company.name,shortName:company.shortName||company.name,capital:Number(company.capital||0),owner:accountId,status:"pending",createdAt:Date.now(),createdBy:accountId}
  });
  toast("IPO 申請已送出，等待管理員審核");
  if(typeof window.showPage === "function") window.showPage("company");
}

window.openDepositModal=openDeposit;
window.openDeposit=openDeposit;
window.deposit=submitDeposit;
window.depositMoney=submitDeposit;
window.confirmDeposit=submitDeposit;
window.applyIPO=submitIPO;
window.approveIPO=()=>toast("IPO 必須由管理後臺核准");

onAuthStateChanged(auth, user=>{
  if(user){
    localStorage.setItem("mingyue_current_google_uid",user.uid);
    localStorage.setItem("mingyue_active_account_id",user.uid);
  }
});

console.log("明月證券 v4.4 Approval Bridge 已載入");
