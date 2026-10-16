(function(root){
'use strict';
const key='tra-noi:'+new URL('./',root.location.href).pathname+':appearance',system=root.matchMedia('(prefers-color-scheme: dark)');
let choice='dark';
try{const saved=root.localStorage.getItem(key);if(['dark','light','system'].includes(saved))choice=saved;}catch{}
function apply(){
 const theme=choice==='system'?(system.matches?'dark':'light'):choice;
 root.document.documentElement.dataset.theme=theme;
 const meta=root.document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='light'?'#f8f3fa':'#170e1d';
}
root.DiaryPreferences={get theme(){return choice;},setTheme(value){if(!['dark','light','system'].includes(value))throw Error('Tema non valido');choice=value;try{root.localStorage.setItem(key,value);}catch{}apply();}};
system.addEventListener('change',()=>{if(choice==='system')apply();});apply();
})(window);
