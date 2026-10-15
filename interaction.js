(function(root){
'use strict';
const pages=['home','ricordi','calendario','lettere','giochi'];
function swipePage(current,start,end){
 const dx=end.x-start.x,dy=end.y-start.y,index=pages.indexOf(current);
 if(index<0||end.time-start.time>750||Math.abs(dx)<75||Math.abs(dx)<Math.abs(dy)*1.8)return null;
 return pages[index+(dx<0?1:-1)]||null;
}
function startInstant(date,time){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Scegli una data e un orario validi');
 const [y,m,d]=date.split('-').map(Number),[h,min]=time.split(':').map(Number),target=Date.UTC(y,m-1,d,h,min);
 const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const local=instant=>{const parts=Object.fromEntries(formatter.formatToParts(new Date(instant)).map(p=>[p.type,p.value]));return Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute));};
 let instant=target;for(let i=0;i<4;i++){const delta=target-local(instant);if(!delta)return new Date(instant).toISOString();instant+=delta;}
 throw Error('Questo orario non esiste nel giorno scelto per il cambio dell’ora');
}
function counterParts(settings,now=Date.now()){
 const saved=settings.anniversaryStart,date=saved?.date||settings.anniversary;if(!date)return null;
 const start=saved?.instant||startInstant(date,'00:00'),elapsed=Math.max(0,Math.floor((now-Date.parse(start))/1000));
 return {days:Math.floor(elapsed/86400),hours:Math.floor(elapsed/3600)%24,minutes:Math.floor(elapsed/60)%60,seconds:elapsed%60};
}
root.DiaryInteraction={pages,swipePage,startInstant,counterParts};
if(typeof module!=='undefined')module.exports=root.DiaryInteraction;
})(globalThis);
