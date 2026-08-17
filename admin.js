/* 明月證券管理模組 v4.2.2
   只負責管理員操作，不介入一般行情計算。 */
(function(){
  const ADMIN_EMAILS=['edisonkuo1030@gmail.com'];
  function currentUser(){return window.firebaseAuth?.currentUser||window.currentFirebaseUser||null;}
  function isAdmin(){const u=currentUser();return !!u&&ADMIN_EMAILS.includes(String(u.email||'').toLowerCase());}
  window.mingyueAdmin={
    isAdmin,
    setStockPrice(code,price){
      if(!isAdmin())return{ok:false,error:'沒有管理員權限'};
      const p=Number(price);if(!Number.isFinite(p)||p<=0)return{ok:false,error:'股價必須大於 0'};
      const list=window.stocks;if(!Array.isArray(list))return{ok:false,error:'股票資料尚未載入'};
      const s=list.find(x=>String(x.id)===String(code));if(!s)return{ok:false,error:'找不到股票'};
      s.price=Number(p.toFixed(2));if(typeof window.saveAll==='function')window.saveAll();
      return{ok:true,stock:s};
    },
    approveIPO(code){
      if(!isAdmin())return{ok:false,error:'沒有管理員權限'};
      if(typeof window.approveIPO==='function'){window.approveIPO(code);return{ok:true};}
      return{ok:false,error:'IPO 審核模組尚未載入'};
    }
  };
})();
