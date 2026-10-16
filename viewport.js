(function(root){
'use strict';
const doc=root.document;
const installed=()=>root.navigator.standalone===true||root.matchMedia('(display-mode: standalone)').matches;
const ios=/iPad|iPhone|iPod/.test(root.navigator.userAgent)||(root.navigator.platform==='MacIntel'&&root.navigator.maxTouchPoints>1);
let pending=false,attempts=0,last='non necessario';
const editing=()=>doc.activeElement?.matches('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
function refresh(){
 if(!pending||doc.hidden||editing()||doc.querySelector('dialog[open]'))return;
 // Keep focus inside the actual touch handler: deferred focus can change
 // activeElement without refreshing iOS's native viewport. This workaround
 // still requires confirmation on the affected physical device.
 const field=doc.createElement('textarea');
 field.readOnly=true;field.tabIndex=-1;field.className='viewport-refresh';
 field.setAttribute('aria-label','Aggiornamento schermata');doc.body.append(field);
 try{field.focus({preventScroll:true});}catch{field.remove();return;}
 if(doc.activeElement!==field){field.remove();last='in attesa del primo tocco';return;}
 pending=false;attempts++;last='focus al tocco eseguito';
 root.requestAnimationFrame(()=>{if(doc.activeElement===field)field.blur();field.remove();});
}
function resume(){if(!ios||!installed()||doc.hidden)return;pending=true;last='in attesa del primo tocco';}
root.DiaryViewport={get status(){return last+' · '+attempts;}};
if(!ios)return;
root.addEventListener('pageshow',resume);
doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)resume();});
root.addEventListener('orientationchange',resume);
// Do not defer to a timer/frame and do not intercept a tap intended for editing.
doc.addEventListener('touchend',e=>{
 if(e.touches?.length||e.target?.closest?.('input,textarea,select,[contenteditable]'))return;
 refresh();
},{passive:true});
resume();
})(window);
