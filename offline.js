(function(root){
'use strict';
const VERSION=15;let current={phase:'waiting',ready:false,version:VERSION,message:'Preparazione della copia offline…'},running=null,registration;
function emit(next){current={...current,...next};root.dispatchEvent(new CustomEvent('diary-offline',{detail:current}));return current;}
function limit(promise,ms,message){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(message)),ms);promise.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});}
function isInstalled(){return navigator.standalone===true||root.matchMedia('(display-mode: standalone)').matches;}
async function workerStatus(){
 const worker=navigator.serviceWorker.controller;if(!worker)throw Error('La copia non controlla ancora questa apertura. Premi Riprova.');
 const result=await limit(new Promise((resolve,reject)=>{const pipe=new MessageChannel();pipe.port1.onmessage=e=>{pipe.port1.close();resolve(e.data);};pipe.port1.onmessageerror=()=>reject(Error('Verifica offline non riuscita'));worker.postMessage({type:'OFFLINE_STATUS'},[pipe.port2]);}),3000,'La copia offline deve essere aggiornata. Ricarica con Internet disponibile.');
 if(result.version!==VERSION)throw Error('È pronta una nuova versione. Ricarica il diario con Internet disponibile.');
 if(!result.ready)throw Error('Mancano alcuni file per l’apertura offline. Riprova con Internet disponibile.');
 return result;
}
async function prepare(){
 if(!root.isSecureContext||!('serviceWorker'in navigator))return emit({phase:'insecure',ready:false,message:'Questa è la prova nel browser. Per installare sull’iPhone usa l’indirizzo HTTPS del diario.'});
 try{
  await workerStatus();
  emit({phase:'ready',ready:true,installed:isInstalled(),message:isInstalled()?'Pronto offline su questo iPhone.':'Copia offline pronta in questo browser.'});
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});
  navigator.storage?.persist?.().catch(()=>{});
  return current;
 }catch{}
 emit({phase:'preparing',ready:false,message:'Salvataggio del diario su questo dispositivo…'});
 try{
  registration=await limit(navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}),12000,'Serve Internet per la prima apertura. Ricollegati e riprova.');
  const installing=registration.installing||registration.waiting;
  if(installing&&installing.state!=='activated')await limit(new Promise((resolve,reject)=>{const changed=()=>{if(installing.state==='activated'){installing.removeEventListener('statechange',changed);resolve();}if(installing.state==='redundant'){installing.removeEventListener('statechange',changed);reject(Error('Preparazione offline non completata: riprova con Internet disponibile.'));}};installing.addEventListener('statechange',changed);changed();}),15000,'La preparazione sta impiegando più del previsto. Riprova con Internet disponibile.');
  await limit(navigator.serviceWorker.ready,10000,'La copia offline non è ancora pronta.');
  if(!navigator.serviceWorker.controller)await limit(new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})),5000,'Riapri il diario per completare la copia offline.');
  await workerStatus();
  let persistent=false;try{persistent=!!(await navigator.storage?.persist?.());}catch{}
  emit({phase:'ready',ready:true,persistent,installed:isInstalled(),message:isInstalled()?'Pronto offline su questo iPhone.':'Copia offline pronta in questo browser.'});
 }catch(error){
  // A failed update while the Mac is absent must not invalidate an already complete offline copy.
  try{await workerStatus();return emit({phase:'ready',ready:true,installed:isInstalled(),message:isInstalled()?'Pronto offline su questo iPhone.':'Copia offline pronta in questo browser.'});}catch{}
  emit({phase:'error',ready:false,message:error.message||'Non è stato possibile preparare l’apertura offline.'});
 }
 return current;
}
root.DiaryOffline={start(){if(!running)running=prepare().finally(()=>running=null);return running;},check:workerStatus,isInstalled,get status(){return {...current};}};
})(window);
