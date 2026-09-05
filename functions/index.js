const {onCall,HttpsError}=require("firebase-functions/v2/https");
const {setGlobalOptions}=require("firebase-functions/v2");
const {initializeApp}=require("firebase-admin/app");
const {getDatabase,ServerValue}=require("firebase-admin/database");
const {randomUUID}=require("crypto");

setGlobalOptions({region:"asia-southeast1"});
initializeApp();
const db=getDatabase();
const LOCK_TTL_MS=60_000;
const ADMIN_EMAIL="edisonkuo1030@gmail.com";

function requireAuth(request){if(!request.auth)throw new HttpsError("unauthenticated","請先登入");return request.auth.uid;}
async function requireAdmin(request){const uid=requireAuth(request);const email=String(request.auth.token?.email||"").toLowerCase();const verified=request.auth.token?.email_verified===true;if(!verified||email!==ADMIN_EMAIL)throw new HttpsError("permission-denied","沒有金融後台權限");return uid;}
function amountOf(value){const n=Number(value);if(!Number.isFinite(n)||n<=0||n>1e15)throw new HttpsError("invalid-argument","金額必須大於 0 且在允許範圍內");return Math.round(n*100)/100;}

exports.createWithdrawal=onCall(async request=>{
 const uid=requireAuth(request);const amount=amountOf(request.data?.amount);const id=`WDR-${Date.now()}-${randomUUID().slice(0,8)}`;
 const userRef=db.ref(`users/${uid}`);let frozen=0;
 const result=await userRef.transaction(user=>{if(user===null)return;const balance=Number(user.balance||0);const oldFrozen=Number(user.frozenBalance||0);if(balance-oldFrozen<amount)return;frozen=oldFrozen+amount;return {...user,frozenBalance:frozen};});
 if(!result.committed){const user=await userRef.get();if(!user.exists())throw new HttpsError("not-found","帳戶不存在");throw new HttpsError("failed-precondition","可用餘額不足或帳戶更新失敗");}
 try{
  await db.ref(`withdrawalRequests/${uid}/${id}`).set({id,accountId:uid,amount,status:"pending",createdAt:ServerValue.TIMESTAMP});
 }catch(error){await userRef.transaction(user=>user?({...user,frozenBalance:Math.max(0,Number(user.frozenBalance||0)-amount)}):user);throw new HttpsError("internal","建立提領申請失敗");}
 return {ok:true,id,status:"pending",frozenAmount:frozen};
});

exports.createDepositRequest=onCall(async request=>{
 const uid=requireAuth(request);const amount=amountOf(request.data?.amount);const id=`DEP-${Date.now()}-${randomUUID().slice(0,8)}`;
 await db.ref(`depositRequests/${uid}/${id}`).set({id,accountId:uid,amount,status:"pending",createdAt:ServerValue.TIMESTAMP});
 return {ok:true,id,status:"pending"};
});

exports.reviewFinancialRequest=onCall({cors:["https://ekfish-math.github.io"]},async request=>{
 const adminId=await requireAdmin(request);
 const type=request.data?.type;const accountId=String(request.data?.accountId||"");const id=String(request.data?.id||"");const decision=request.data?.decision;
 if(!["withdrawal","deposit"].includes(type)||!accountId||!id||!["approve","reject"].includes(decision))throw new HttpsError("invalid-argument","審核參數錯誤");
 const requestPath=`${type==="withdrawal"?"withdrawalRequests":"depositRequests"}/${accountId}/${id}`;
 const requestRef=db.ref(requestPath);const initial=await requestRef.get();if(!initial.exists())throw new HttpsError("not-found","申請不存在");
 const lockRef=db.ref(`financialLocks/${accountId}`);const now=Date.now();
 const lock=await lockRef.transaction(v=>{if(v&&Number(v.expiresAt||0)>now)return;return {adminId,createdAt:now,expiresAt:now+LOCK_TTL_MS};});
 if(!lock.committed)throw new HttpsError("aborted","帳戶正在被其他金融操作鎖定，請稍後再試");
 try{
  const snap=await requestRef.get();if(!snap.exists())throw new HttpsError("not-found","申請不存在");const req=snap.val();if(req.status!=="pending")throw new HttpsError("failed-precondition","這筆申請已經處理");const amount=amountOf(req.amount);
  const userSnap=await db.ref(`users/${accountId}`).get();if(!userSnap.exists())throw new HttpsError("not-found","帳戶不存在");const user=userSnap.val();let balance=Number(user.balance||0),frozen=Number(user.frozenBalance||0);
  if(type==="withdrawal"){
   if(frozen<amount)throw new HttpsError("failed-precondition","凍結金額不足");
   if(decision==="reject")balance+=amount;
   frozen-=amount;
  }else if(decision==="approve") balance+=amount;
  if(balance<0||frozen<0)throw new HttpsError("failed-precondition","資金狀態無效");
  const status=decision==="approve"?"approved":"rejected";const txId=randomUUID();const auditId=randomUUID();
  const updates={};
  updates[`users/${accountId}/balance`]=balance;
  updates[`users/${accountId}/frozenBalance`]=frozen;
  updates[`${requestPath}/status`]=status;
  updates[`${requestPath}/reviewedAt`]=ServerValue.TIMESTAMP;
  updates[`${requestPath}/reviewedBy`]=adminId;
  updates[`fundTransactions/${accountId}/${txId}`]={type:`${type}_${status}`,amount,balanceAfter:balance,requestId:id,createdAt:ServerValue.TIMESTAMP,adminId};
  updates[`adminAudit/${auditId}`]={action:`${type}:${status}`,accountId,requestId:id,amount,adminId,createdAt:ServerValue.TIMESTAMP};
  await db.ref().update(updates);
  return {ok:true,status,balance,frozenBalance:frozen};
 }finally{await lockRef.remove();}
});
