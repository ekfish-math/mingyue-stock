/* 明月證券本地資料層：Firebase CDN 無法連線時維持主介面運作 */
const ROOT="mingyue_local_db_v1";
const load=()=>{try{return JSON.parse(localStorage.getItem(ROOT)||"{}")}catch{return {}}};
const save=x=>localStorage.setItem(ROOT,JSON.stringify(x));
export function initializeApp(config){return {config,__local:true};}
export function getDatabase(app){return {app,__local:true};}
export function ref(db,path=""){return {db,path};}
function readAt(root,path){if(!path)return root;return path.split("/").filter(Boolean).reduce((a,k)=>a==null?undefined:a[k],root);}
function writeAt(root,path,value){const ks=path.split("/").filter(Boolean);let o=root;for(let i=0;i<ks.length-1;i++)o=o[ks[i]]||(o[ks[i]]={});if(ks.length)o[ks.at(-1)]=value;else Object.assign(root,value||{});}
export async function get(r){const v=readAt(load(),r.path);return {exists:()=>v!==undefined&&v!==null,val:()=>v};}
export async function set(r,value){const d=load();writeAt(d,r.path,value);save(d);}
export async function update(r,patch){const d=load();if(!r.path)Object.assign(d,patch||{});else{let b=readAt(d,r.path);if(!b||typeof b!=="object")b={};Object.assign(b,patch||{});writeAt(d,r.path,b)}save(d);}
