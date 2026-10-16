(function(root){
'use strict';
const doc=root.document;
const installed=()=>root.navigator.standalone===true||root.matchMedia('(display-mode: standalone)').matches;
const ios=/iPad|iPhone|iPod/.test(root.navigator.userAgent)||(root.navigator.platform==='MacIntel'&&root.navigator.maxTouchPoints>1);
let pending=false,frame=0,attempts=0,last='non necessario';
const editing=()=>doc.activeElement?.matches('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
function refresh(){
 frame=0;
 if(!pending||doc.hidden||editing()||doc.querySelector('dialog[open]'))return;
 // On affected Home Screen installations, focusing a readonly field refreshes
 // the native bottom area without opening the keyboard. Do not resize the page
 // using screen.height: those pixels may belong to the system status bar.
 const field=doc.createElement('textarea');
 field.readOnly=true;field.tabIndex=-1;field.className='viewport-refresh';
 field.setAttribute('aria-label','Aggiornamento schermata');doc.body.append(field);
 try{field.focus({preventScroll:true});}catch{field.remove();return;}
 if(doc.activeElement!==field){field.remove();last='in attesa del primo tocco';return;}
 pending=false;attempts++;last='ricalcolo eseguito';
 root.requestAnimationFrame(()=>{if(doc.activeElement===field)field.blur();field.remove();});
}
function schedule(){if(pending&&!frame)frame=root.requestAnimationFrame(refresh);}
function resume(){if(!ios||!installed()||doc.hidden)return;pending=true;last='ricalcolo in attesa';schedule();}
root.DiaryViewport={get status(){return last+' · '+attempts;}};
if(!ios)return;
root.addEventListener('pageshow',resume);
doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)resume();});
root.addEventListener('orientationchange',resume);
// iOS may require a gesture before accepting programmatic focus.
doc.addEventListener('pointerup',schedule,{passive:true});
resume();
})(window);
