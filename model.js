(function(root){
'use strict';
const sections={experiences:'Esperienze',dance:'Danza',trips:'Vacanze e weekend',gifts:'Regali',holidays:'Festività'};
const people={one:{id:'one',firstName:'Persona 1',lastName:'',photo:''},two:{id:'two',firstName:'Persona 2',lastName:'',photo:''}};
const defaults=['Cinema','Film a casa','Ristoranti','Concerti','Teatro'];
function ordered(ops){return [...ops].sort((a,b)=>a.time-b.time||a.id.localeCompare(b.id));}
function sectionOf(a){const legacy={Viaggi:'trips',Vacanze:'trips',Danza:'dance',Regali:'gifts','Festività':'holidays'};return a.section||(Object.hasOwn(legacy,a.category)?legacy[a.category]:'experiences');}
function aliases(ops){
 const raw=Object.create(null),map=Object.create(null);
 for(const o of ordered(ops))if(o.kind==='identity'&&!Object.hasOwn(people,o.data.legacy))raw[o.data.legacy]=o.data.person;
 for(const id of Object.keys(raw)){let current=id;const seen=new Set();while(raw[current]&&!seen.has(current)){seen.add(current);current=raw[current];}if(!seen.has(current))map[id]=current;}
 return map;
}
function resolveAuthor(id,ops){return aliases(ops)[id]||id;}
function project(ops){
 const memories=new Map(),mediaStates=new Map(),categories=new Set(defaults),profiles=Object.create(null),settings=Object.create(null),letters=new Map(),games=new Map(),results=[];
 for(const [id,p]of Object.entries(people))profiles[id]={...p};
 const identities=aliases(ops);
 for(const raw of ordered(ops)){
  const mappedAuthor=identities[raw.author]||raw.author,op={...raw,author:mappedAuthor};
  if(op.kind==='category')categories.add(op.data.name);
  if(op.kind==='profile')profiles[op.author]={...op.data,id:op.author};
  if(op.kind==='setting')settings[op.data.key]=op.data.value;
  if(op.kind==='letter')letters.set(op.activity,{id:op.activity,...op.data,author:op.author,name:op.name,time:op.time});
  if(op.kind==='game')games.set(op.activity,{id:op.activity,...op.data,author:op.author,name:op.name,time:op.time});
  if(op.kind==='game-result')results.push({id:op.id,game:op.activity,author:op.author,name:op.name,time:op.time,...op.data});
  if(op.kind==='media-state')mediaStates.set(JSON.stringify([op.activity,op.data.mediaId]),op.data.removed);
  if(op.kind==='create'&&!memories.has(op.activity)){
   const a={id:op.activity,...op.data,author:op.author,ratings:{},media:[]};a.section=sectionOf(a);a.date=a.date||'';memories.set(op.activity,a);
   if(a.section==='experiences')categories.add(a.category);
  }
  const a=memories.get(op.activity);if(!a)continue;
  if(op.kind==='rating')a.ratings[op.author]={...op.data,name:op.name};
  if(op.kind==='media'&&!a.media.some(m=>m.id===op.id))a.media.push({id:op.id,...op.data});
 }
 for(const a of memories.values()){a.removedMedia=a.media.filter(m=>mediaStates.get(JSON.stringify([a.id,m.id]))===true);a.media=a.media.filter(m=>mediaStates.get(JSON.stringify([a.id,m.id]))!==true);}
 return {memories:[...memories.values()].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||a.title.localeCompare(b.title)),categories:[...categories],profiles,settings,identities,letters:[...letters.values()].sort((a,b)=>b.time-a.time),games:[...games.values()].sort((a,b)=>b.time-a.time),results};
}
function validDate(v){if(v==='')return true;if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T12:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===v;}
function text(v,max){return typeof v==='string'&&v.length<=max;}
function image(v){return v===''||typeof v==='string'&&v.length<=40*1024*1024&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v);}
function validateOp(o){
 if(!o||!text(o.id,120)||!o.id||!text(o.activity,120)||!text(o.author,120)||!text(o.name,100)||!Number.isFinite(o.time)||!o.data||typeof o.data!=='object')throw Error('Dati del diario non validi');
 const d=o.data;let ok=false;
 if(o.kind==='create')ok=text(d.title,120)&&!!d.title.trim()&&text(d.category,60)&&!!d.category.trim()&&validDate(d.date)&&(!d.section||Object.hasOwn(sections,d.section))&&(!d.endDate||validDate(d.endDate)&&!!d.date&&d.endDate>=d.date)&&(!d.description||text(d.description,5000))&&(!d.location||text(d.location,160))&&(!d.recipient||text(d.recipient,100));
 if(o.kind==='rating')ok=Number.isInteger(d.score)&&d.score>=1&&d.score<=10&&text(d.comment,2000);
 if(o.kind==='media')ok=text(d.url,40*1024*1024)&&/^data:(image\/(jpeg|png|webp)|video\/(mp4|quicktime|webm));base64,[A-Za-z0-9+/=]+$/.test(d.url)&&text(d.type,80)&&text(d.name,300);
 if(o.kind==='media-state')ok=text(d.mediaId,120)&&!!d.mediaId&&typeof d.removed==='boolean';
 if(o.kind==='category')ok=text(d.name,60)&&!!d.name.trim();
 if(o.kind==='identity')ok=text(d.legacy,120)&&!!d.legacy&&!Object.hasOwn(people,d.legacy)&&text(d.person,120)&&!!d.person&&d.person!==d.legacy&&o.author===d.person;
 if(o.kind==='profile')ok=text(d.firstName,40)&&!!d.firstName.trim()&&text(d.lastName,60)&&image(d.photo);
 if(o.kind==='setting')ok=d.key==='cover'&&image(d.value)||d.key==='anniversary'&&validDate(d.value)&&!!d.value;
 if(o.kind==='letter')ok=text(d.title,120)&&!!d.title.trim()&&text(d.body,20000)&&!!d.body.trim();
 if(o.kind==='game')ok=text(d.title,120)&&!!d.title.trim()&&['quiz','conversation','truefalse','truthdare'].includes(d.type)&&Array.isArray(d.questions)&&d.questions.length>=1&&d.questions.length<=10&&d.questions.every(q=>text(q.text,500)&&!!q.text.trim()&&(d.type!=='quiz'||Array.isArray(q.options)&&q.options.length===4&&q.options.every(x=>text(x,200)&&!!x.trim())&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4));
 if(o.kind==='game-result')ok=Number.isInteger(d.total)&&d.total>=1&&d.total<=10&&Number.isInteger(d.score)&&d.score>=0&&d.score<=d.total;
 if(!ok)throw Error('Contenuto del diario non valido: '+o.kind);
}
function activities(ops){return project(ops).memories;}
function profileChanges(profiles,owner,baseline,draft){
 if(!Object.hasOwn(people,owner))throw Error('Scegli il profilo di questo dispositivo');
 const other=owner==='one'?'two':'one',changes=[];
 for(const [person,part,keys]of [[owner,'own',['firstName','lastName','photo']],[other,'partner',['firstName','lastName']]]){
  const current=profiles[person]||people[person],next={firstName:current.firstName,lastName:current.lastName,photo:current.photo};let changed=false;
  for(const key of keys){const value=key==='photo'?draft[part][key]:draft[part][key].trim();if(value!==baseline[part][key]){next[key]=value;changed=true;}}
  if(!changed)continue;
  if(!next.firstName.trim())throw Error('Inserisci un nome per ciascun profilo che modifichi');
  if(!text(next.firstName,40)||!text(next.lastName,60)||!image(next.photo))throw Error('Profilo non valido');
  if(['firstName','lastName','photo'].some(key=>next[key]!==current[key]))changes.push({person,data:next});
 }
 return changes;
}
root.DiaryModel={project,activities,validateOp,sections,defaults,sectionOf,validDate,people,resolveAuthor,profileChanges};
if(typeof module!=='undefined')module.exports=root.DiaryModel;
})(globalThis);
