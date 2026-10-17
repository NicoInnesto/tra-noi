(function(root){
'use strict';
const enc=new TextEncoder(),dec=new TextDecoder(),iterations=310000;
function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);}
const bytes=value=>enc.encode(canonical(value));
const b64=value=>{let s='';for(const b of new Uint8Array(value))s+=String.fromCharCode(b);return btoa(s);};
function unb64(value,max=200000){if(typeof value!=='string'||value.length>max||!/^[A-Za-z0-9+/]*={0,2}$/.test(value))throw Error('Chiave o copia di recupero non valida');return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}
function body(value){const {signature,...rest}=value;return rest;}
async function digest(value){return b64(await crypto.subtle.digest('SHA-256',bytes(value)));}
async function signingKey(jwk){return crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);}
async function publicKey(value){return crypto.subtle.importKey('spki',unb64(value),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);}
async function sign(value,key){return {...value,signature:b64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,bytes(body(value))))};}
async function verify(value,key){try{return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,unb64(value.signature,200),bytes(body(value)));}catch{return false;}}
async function passwordKey(password,salt){const base=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function checkPolicy(policy){
 if(!policy||policy.format!=='tra-noi-access-v1'||policy.admin!=='one'||typeof policy.id!=='string'||policy.id.length>120||!Array.isArray(policy.legacyProfiles)||policy.legacyProfiles.length>10000||!policy.legacyProfiles.every(x=>typeof x.id==='string'&&x.id.length<=120&&typeof x.hash==='string'&&x.hash.length===44))throw Error('Configurazione dei permessi non valida');
 if(!await verify(policy,await publicKey(policy.publicKey)))throw Error('Firma dei permessi non valida');return policy;
}
async function create(password,ops){
 if(typeof password!=='string'||password.length<10)throw Error('Scegli una password di almeno 10 caratteri');
 const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const policy=await sign({format:'tra-noi-access-v1',id:crypto.randomUUID(),admin:'one',publicKey:b64(await crypto.subtle.exportKey('spki',pair.publicKey)),legacyProfiles:await Promise.all(ops.filter(o=>['profile','identity'].includes(o.kind)).map(async o=>({id:o.id,hash:await digest(o)})))},pair.privateKey);
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await passwordKey(password,salt),privateData=enc.encode(JSON.stringify(await crypto.subtle.exportKey('jwk',pair.privateKey)));
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:bytes(policy.id)},key,privateData);
 return {policy,vault:{format:'tra-noi-admin-v1',policyId:policy.id,salt:b64(salt),iv:b64(iv),ciphertext:b64(ciphertext)},key:pair.privateKey};
}
async function unlock(password,vault,policy){
 await checkPolicy(policy);
 try{
  if(vault?.format!=='tra-noi-admin-v1'||vault.policyId!==policy.id)throw Error();
  const salt=unb64(vault.salt,24),iv=unb64(vault.iv,16);if(salt.length!==16||iv.length!==12)throw Error();
  const key=await passwordKey(password,salt),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:bytes(policy.id)},key,unb64(vault.ciphertext)),privateKey=await signingKey(JSON.parse(dec.decode(plain))),proof=await sign({test:policy.id},privateKey);
  if(!await verify(proof,await publicKey(policy.publicKey)))throw Error();return privateKey;
 }catch{throw Error('Password errata o chiave di recupero non valida');}
}
async function changePassword(currentPassword,newPassword,vault,policy){
 if(typeof newPassword!=='string'||newPassword.length<10||newPassword.length>200)throw Error('Scegli una password tra 10 e 200 caratteri');
 await unlock(currentPassword,vault,policy);
 const oldKey=await passwordKey(currentPassword,unb64(vault.salt,24));
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(vault.iv,16),additionalData:bytes(policy.id)},oldKey,unb64(vault.ciphertext));
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await passwordKey(newPassword,salt);
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:bytes(policy.id)},key,plain);
 const next={format:'tra-noi-admin-v1',policyId:policy.id,salt:b64(salt),iv:b64(iv),ciphertext:b64(ciphertext)};
 await unlock(newPassword,next,policy);
 return next;
}
async function authorize(op,policy){
 if(!['profile','identity'].includes(op.kind)||!policy)return;
 if(policy.legacyProfiles.some(x=>x.id===op.id&&x.hash)){
  const allowed=policy.legacyProfiles.find(x=>x.id===op.id);if(allowed.hash===await digest(op))return;
 }
 if(op.kind==='profile'&&op.author==='two'&&(!op.actor||op.actor==='two'))return;
 if(op.actor==='one'&&['one','two'].includes(op.author)&&await verify(op,await publicKey(policy.publicKey)))return;
 throw Error('Questo profilo può essere modificato soltanto dall’amministratore');
}
async function matchPolicy(current,incoming){await checkPolicy(incoming);if(current&&canonical(current)!==canonical(incoming))throw Error('Questo diario appartiene a una coppia diversa. Importazione annullata.');return incoming;}
root.DiaryAccess={canonical,create,unlock,changePassword,sign,authorize,checkPolicy,matchPolicy};
if(typeof module!=='undefined')module.exports=root.DiaryAccess;
})(globalThis);
