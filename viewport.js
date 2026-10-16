(function(root){
'use strict';
const doc=root.document;
const ios=/iPad|iPhone|iPod/.test(root.navigator.userAgent)||(root.navigator.platform==='MacIntel'&&root.navigator.maxTouchPoints>1);
function configure(){
 const installed=root.navigator.standalone===true||root.matchMedia('(display-mode: standalone)').matches;
 doc.documentElement.classList.toggle('ios-home-screen',ios&&installed);
}
root.DiaryViewport={get status(){return doc.documentElement.classList.contains('ios-home-screen')?'layout a tutta altezza · senza focus automatico':'layout browser';}};
root.addEventListener('pageshow',configure);
doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)configure();});
configure();
})(window);
