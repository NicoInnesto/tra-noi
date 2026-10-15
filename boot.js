'use strict';
window.diaryBoot={phase:'Caricamento del diario',ready:false};
function showBootError(message){const node=document.getElementById('bootStatus');if(node){node.hidden=false;node.textContent=message;}}
window.addEventListener('error',e=>showBootError('Errore di avvio: '+(e.message||'risorsa non caricata')));
window.addEventListener('unhandledrejection',e=>showBootError('Avvio non completato: '+(e.reason?.message||String(e.reason))));
setTimeout(()=>{if(!window.diaryBoot.ready)showBootError('Avvio in attesa: '+window.diaryBoot.phase+'. Non cancellare i dati del diario.');},6000);
