/* 明月證券 v4.4 Approval Bridge：儲值與 IPO 均需後臺審核 */
import { getApps } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get, push, set, onValue } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
const app=getApps()[0],auth=getAuth(app),db=getDatabase(app);
function uid(){return auth.currentUser?.uid||localStorage.getItem("mingyue_current_google_uid")||localStorage.getItem("mingyue_active_account_id")||null}
function toast(m){typeof window.showToast==="function"?window.showToast(m):alert(m)}
function closeDeposit(){document.getElementById("deposit-modal")?.classList.remove("show")}
function openDeposit(){const m=document.getElementById("deposit-modal");if(!m)return toast("找不到儲值視窗");const i=document.getElementById("deposit-amount");if(i)i.value="";const w=document.getElementById("deposit-wallet");if(w)w.textContent="提交後等待管理員審核";const t=m.querySelector("h3");if(t)t.textContent="💰 證券儲值申請";const d=m.querySelector(".modal-header p");if(d)d.textContent="送出後不會立即增加餘額，必須由管理員核准。";m.classList.add("show")}
async function submitDeposit(){const amount=Number(document.getElementById("deposit-amount")?.value),accountId=uid();if(!accountId)return toast("請先完成 Google 登入，再申請儲值");if(!Number.isFinite(amount)||amount<=0)return toast("請輸入有效儲值金額");const snap=await get(ref(db,"depositRequests"));let duplicate=false;if(snap.exists())snap.forEach(x=>{const r=x.val();if(r?.accountId===accountId&&r?.status==="pending")duplicate=true});if(duplicate)return toast("你已有一筆待審核的儲值申請");const r=push(ref(db,"depositRequests"));await set(r,{accountId,uid:accountId,amount,status:"pending",createdAt:Date.now(),createdBy:accountId});closeDeposit();toast(`儲值申請 ${amount.toLocaleString()} 已送出，等待後臺審核`)}
async function submitIPO(code){const accountId=uid();if(!accountId)return toast("請先完成 Google 登入");const snap=await get(ref(db,"companies"));const companies=snap.exists()&&Array.isArray(snap.val())?snap.val():[];const company=companies.find(c=>c.code===code&&c.owner===accountId);if(!company)return toast("找不到這家公司或你不是公司負責人");if(company.listed)return toast("這家公司已經上市");if(company.ipoStatus==="審核中")return toast("IPO 已在審核中");if(Number(company.capital)<10000000)return toast("註冊資本不足 ¥10,000,000");const pending=await get(ref(db,"ipoRequests"));let duplicate=false;if(pending.exists())pending.forEach(x=>{const r=x.val();if(r?.code===code&&r?.owner===accountId&&r?.status==="pending")duplicate=true});if(duplicate)return toast("這家公司已有待審核的 IPO 申請");if(!confirm(`確定申請「${company.name}」IPO？\n\n送出後必須由明月證券管理後臺核准，核准後才會正式上市。`))return;const req=push(ref(db,"ipoRequests"));await set(req,{companyId:company.id,code:company.code,companyName:company.name,shortName:company.shortName||company.name,capital:Number(company.capital||0),owner:accountId,status:"pending",createdAt:Date.now(),createdBy:accountId});toast("IPO 申請已送出，等待管理員審核");if(typeof window.showPage==="function")window.showPage("company")}
async function publishApprovedIPO(req){
    if(!req?.code||req.status!=="approved")return;
    const companiesSnap=await get(ref(db,"companies"));
    const companies=companiesSnap.exists()&&Array.isArray(companiesSnap.val())?[...companiesSnap.val()]:[];
    const index=companies.findIndex(c=>String(c.code).toUpperCase()===String(req.code).toUpperCase());
    if(index<0)return;
    const company={...companies[index]};
    if(company.listed&&company.ipoStatus==="已上市")return;
    company.listed=true;
    company.ipoStatus="已上市";
    company.status="上市公司";
    company.listedAt=company.listedAt||new Date().toLocaleString("zh-TW");
    companies[index]=company;
    const stocksSnap=await get(ref(db,"stocks"));
    const stocks=stocksSnap.exists()&&Array.isArray(stocksSnap.val())?[...stocksSnap.val()]:[];
    const exists=stocks.some(s=>String(s?.id).toUpperCase()===String(company.code).toUpperCase());
    if(!exists){
        const capital=Number(company.capital||0);
        const shares=Math.max(1000000,Math.floor(capital/10));
        const price=Number((capital/shares).toFixed(2));
        stocks.push({id:company.code,name:company.shortName||company.name,company:company.name,companyCode:company.code,companyId:company.id,industry:company.industry||"其他",type:"上市公司",price,previous:price,volume:0,capital,shares,listed:true,listedAt:company.listedAt,createdAt:Date.now()});
    }
    await set(ref(db,"companies"),companies);
    await set(ref(db,"stocks"),stocks);
    localStorage.setItem("mingyue_companies_v42",JSON.stringify(companies));
    localStorage.setItem("mingyue_stocks_v42",JSON.stringify(stocks));
    toast(`🎉 ${company.shortName||company.name} 已正式上市，股票 ${company.code} 已加入行情`);
    if(typeof window.renderCompanies==="function")window.renderCompanies();
    if(typeof window.renderMarket==="function")window.renderMarket();
    if(typeof window.updateAllVisible==="function")window.updateAllVisible();
}
function watchApprovedIPO(){
    onValue(ref(db,"ipoRequests"),snapshot=>{
        if(!snapshot.exists())return;
        snapshot.forEach(child=>{const req=child.val();if(req?.status==="approved")publishApprovedIPO(req).catch(e=>console.error("核准 IPO 發布失敗",e));});
    },e=>console.error("IPO 審核同步失敗",e));
}
function install(){window.openDepositModal=openDeposit;window.openDeposit=openDeposit;window.deposit=submitDeposit;window.depositMoney=submitDeposit;window.confirmDeposit=submitDeposit;window.applyIPO=submitIPO;window.approveIPO=()=>toast("IPO 必須由管理後臺核准")}
install();window.addEventListener("load",install);setTimeout(install,500);setTimeout(install,1500);
onAuthStateChanged(auth,u=>{if(u){localStorage.setItem("mingyue_current_google_uid",u.uid);localStorage.setItem("mingyue_active_account_id",u.uid)}});
watchApprovedIPO();
console.log("明月證券 v4.4 Approval Bridge 已載入");
