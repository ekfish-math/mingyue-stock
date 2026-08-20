const {onCall,HttpsError}=require("firebase-functions/v2/https");
const {initializeApp}=require("firebase-admin/app");
const {getDatabase,ServerValue}=require("firebase-admin/database");
const {randomUUID}=require("crypto");

initializeApp();
const db=getDatabase();

function requireAuth(request){if(!request.auth)throw new HttpsError("unauthenticated","請先登入");return request.auth.uid;}
async function requireAdmin(uid){const snap=await db.ref(`admins/${uid}`).get();if(!snap.exists()||snap.val()!==true)throw new HttpsError("permission-denied","沒有金融後台權限");}
function amountOf(value){const n=Number(value);if(!Number.isFinite(n)||n<=0||n>1e15)throw new HttpsError("invalid-argument","金額必須大於 0 且在允許範圍內");return Math.round(n*100)/100;}
async function audit(action,accountId,requestId,amount,adminId){await db.ref(`adminAudit/${randomUUID()}`).set({action,accountId,requestId,amount,adminId,createdAt:ServerValue.TIMESTAMP});}

exports.createWithdrawal=onCall(async request=>{
 const uid=requireAuth(request);const amount=amountOf(request.data?.amount);const id=`WDR-${Date.now()}-${randomUUID().slice(0,8)}`;
 const userRef=db.ref(`users/${uid}`);let frozen=0;
 const result=await userRef.transaction(user=>{if(user===null)throw new Error("ACCOUNT_NOT_FOUND");const balance=Number(user.balance||0);const oldFrozen=Number(user.frozenBalance||0);if(balance-oldFrozen<amount)throw new Error("INSUFFICIENT_AVAILABLE_BALANCE");frozen=oldFrozen+amount;return {...user,frozenBalance:frozen};});
 if(!result.committed)throw new HttpsError("aborted","帳戶更新失敗");
 try{await db.ref(`withdrawalRequests/${uid}/${id}`).set({id,accountId:uid,amount,status:"pending",createdAt:ServerValue.TIMESTAMP});}
 catch(error){await userRef.transaction(user=>user?({...user,frozenBalance:Math.max(0,Number(user.frozenBalance||0)-amount)}):user);throw new HttpsError("internal","建立提領申請失敗");}
 return {ok:true,id,status:"pending",frozenAmount:frozen};
});

exports.createDepositRequest=onCall(async request=>{
 const uid=requireAuth(request);const amount=amountOf(request.data?.amount);const id=`DEP-${Date.now()}-${randomUUID().slice(0,8)}`;
 await db.ref(`depositRequests/${uid}/${id}`).set({id,accountId:uid,amount,status:"pending",createdAt:ServerValue.TIMESTAMP});
 return {ok:true,id,status:"pending"};
});

exports.reviewFinancialRequest=onCall(async request=>{
 const adminId=requireAuth(request);await requireAdmin(adminId);
 const type=request.data?.type;const accountId=String(request.data?.accountId||"");const id=String(request.data?.id||"");const decision=request.data?.decision;
 if(!["withdrawal","deposit"].includes(type)||!accountId||!id||!["approve","reject"].includes(decision))throw new HttpsError("invalid-argument","審核參數錯誤");
 const requestPath=`${type==="withdrawal"?"withdrawalRequests":"depositRequests"}/${accountId}/${id}`;const requestRef=db.ref(requestPath);const snap=await requestRef.get();if(!snap.exists())throw new HttpsError("not-found","申請不存在");const req=snap.val();if(req.status!=="pending")throw new HttpsError("failed-precondition","這筆申請已經處理");const amount=amountOf(req.amount);
 const userRef=db.ref(`users/${accountId}`);const lockRef=db.ref(`financialLocks/${accountId}`);const lock=await lockRef.transaction(v=>v===null?{adminId,createdAt:Date.now()}:undefined);if(!lock.committed)throw new HttpsError("aborted","帳戶正在被其他金融操作鎖定，請稍後再試");
 try{
  const userSnap=await userRef.get();if(!userSnap.exists())throw new HttpsError("not-found","帳戶不存在");const user=userSnap.val();let balance=Number(user.balance||0),frozen=Number(user.frozenBalance||0);
  if(type==="withdrawal"){
   if(frozen<amount)throw new HttpsError("failed-precondition","凍結金額不足");
   if(decision==="reject")balance+=amount;
   frozen-=amount;
  }else if(decision==="approve")balance+=amount;
  const status=decision==="approve"?"approved":"rejected";
  const updates={};updates[`users/${accountId}/balance`]=balance;updates[`users/${accountId}/frozenBalance`]=frozen;updates[`${requestPath}/status`]=status;updates[`${requestPath}/reviewedAt`]=ServerValue.TIMESTAMP;updates[`${requestPath}/reviewedBy`]=adminId;updates[`fundTransactions/${accountId}/${randomUUID()}`]={type:`${type}_${status}`,amount,balanceAfter:balance,requestId:id,createdAt:ServerValue.TIMESTAMP,adminId};await db.ref().update(updates);await audit(`${type}:${status}`,accountId,id,amount,adminId);return {ok:true,status,balance,frozenBalance:frozen};
 }finally{await lockRef.remove();}
});
