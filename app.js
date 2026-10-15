'use strict';
window.diaryBoot=window.diaryBoot||{phase:'Caricamento del diario',ready:false};
const VERSION=20;
const WIRE_VERSION=18;
const uuid=()=>crypto.randomUUID?crypto.randomUUID():([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
const $=id=>document.getElementById(id);
const storagePrefix='tra-noi:'+new URL('./',location.href).pathname+':';
const settingsStorage={getItem:key=>localStorage.getItem(storagePrefix+key),setItem:(key,value)=>localStorage.setItem(storagePrefix+key,value)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
 heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
 album:'M4 3h13a2 2 0 0 1 2 2v15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 1-2Zm3 4h9M7 11h6M5 20a2 2 0 0 1 0-4h14M21 5v16',
 calendar:'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM7 3v4m10-4v4M3 11h18M8 15h1m6 0h1m-8 3h1',
 letter:'M3 6h18v14H3ZM3 6l9 7 9-7M3 20l6-8m12 8-6-8',
 games:'M6 5h12a3 3 0 0 1 3 3l1 9a2 2 0 0 1-3 2l-4-3H9l-4 3a2 2 0 0 1-3-2l1-9a3 3 0 0 1 3-3ZM6 10h5m-2.5-2.5v5M16 10h.1m3 2h.1',
 film:'M3 3h18v18H3ZM7 3v18M17 3v18M3 8h4m-4 8h4M17 8h4m-4 8h4',
 dance:'M12 4a1.5 1.5 0 1 0 0 .1ZM8 8l4 2 5-3m-5 3-2 5-6 4m6-4 5 1 3 5m-8-6 5-7',
 trips:'M9 6V3h6v3M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2 0v15M17 6v15',
 gifts:'M3 8h18v4H3Zm2 4v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3Zm0 0h4a3 3 0 1 0-3-3Z',
 sparkle:'m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8ZM20 2v4m-2-2h4',
 camera:'M3 7h4l2-3h6l2 3h4v14H3Zm13 6a4 4 0 1 0 0 .1Z',
 plus:'M12 5v14M5 12h14',right:'m9 5 7 7-7 7',left:'m15 5-7 7 7 7',user:'M16 7a4 4 0 1 0 0 .1ZM4 21v-2a8 8 0 0 1 16 0v2',
 link:'m10 13 4-4m-5 6-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m-1 1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
 star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L2 9.6l6.2-.9Z',
 chat:'M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5ZM8 10h8m-8 4h5',
 check:'m5 12 4 4L19 6',clock:'M22 12a10 10 0 1 0 0 .1ZM12 6v6l4 2',lock:'M6 10h12v11H6Zm2 0V6a4 4 0 0 1 8 0v4',
 fork:'M5 3v7m4-7v7M3 3v5a4 4 0 0 0 8 0V3M7 12v9m12 0V3c-5 3-5 9 0 9',music:'M9 18V5l11-2v13M9 18a3 3 0 1 0 0 .1Zm11-2a3 3 0 1 0 0 .1Z'
};
const icon=(name,cls='')=>'<svg class="'+cls+'" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[name]||paths.heart)+'"/></svg>';
const sectionInfo={
 experiences:{title:'Esperienze',subtitle:'Le cose che facciamo insieme.',icon:'film'},
 dance:{title:'Danza',subtitle:'Il tuo posto in prima fila.',icon:'dance'},
 trips:{title:'Vacanze e weekend',subtitle:'Casa, ovunque siamo insieme.',icon:'trips'},
 gifts:{title:'Regali',subtitle:'Ogni pensiero, una piccola storia.',icon:'gifts'},
 holidays:{title:'Festività',subtitle:'I nostri giorni un po’ speciali.',icon:'sparkle'}
};
const gameTypes={
 quiz:{title:'Quanto mi conosci?',subtitle:'Quattro risposte. Una è quella giusta.',icon:'heart'},
 conversation:{title:'Parliamone',subtitle:'Domande per ritrovarsi, senza fretta.',icon:'chat'},
 truthdare:{title:'Obbligo o verità',subtitle:'Qualcosa da dire. Qualcosa da fare.',icon:'sparkle'},
 truefalse:{title:'Vero o falso',subtitle:'A te la parola, poi ne parliamo.',icon:'check'}
};
let diagnosticTimer,connectionBusy=false,localIceServers=[];
let accessPolicy=null,adminVault=null,adminKey=null;
let author=settingsStorage.getItem('diary-author');
if(!author){author=uuid();settingsStorage.setItem('diary-author',author);}
let myName=settingsStorage.getItem('diary-name')||'Io';
let ops=[],acks=new Set(),active=null,db,pc,channel,role,pairId,pollTimer,sendTail=Promise.resolve(),peerName='',renderedActivity=null;
let state,view='home',collection=null,selected='Tutti',calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1),calendarDay=localDay(),profileDraft='',gameDraft=null,playSession=null;
const transfers=new Map();
function localDay(date=new Date()){return new Date(date-date.getTimezoneOffset()*60000).toISOString().slice(0,10);}
function formatDate(date,options={day:'numeric',month:'long',year:'numeric'}){return date?new Date(date+'T12:00:00').toLocaleDateString('it-IT',options):'Prima del diario · senza data';}
function nameOf(id,fallback='Il tuo amore'){return state.profiles[id]?.firstName||ops.findLast(o=>o.author===id&&o.name&&o.name!=='Io')?.name||fallback;}
function avatar(profile,fallback=''){return profile?.photo?'<img src="'+esc(profile.photo)+'" alt="">':profile?.firstName?esc(profile.firstName.slice(0,1).toUpperCase()):fallback||icon('user');}
function toast(s){const host=document.querySelector('dialog[open]')||document.body;host.append($('toast'));$('toast').textContent=s;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',4500);}
function store(name,value){return new Promise((resolve,reject)=>{const tx=db.transaction(name,'readwrite');tx.objectStore(name).put(value);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
async function init(){
 window.diaryBoot.phase='Apertura della memoria locale';
 db=await new Promise((resolve,reject)=>{const r=indexedDB.open(storagePrefix+'archive',2);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('ops'))r.result.createObjectStore('ops',{keyPath:'id'});if(!r.result.objectStoreNames.contains('acks'))r.result.createObjectStore('acks',{keyPath:'id'});if(!r.result.objectStoreNames.contains('meta'))r.result.createObjectStore('meta',{keyPath:'id'});};r.onblocked=()=>{window.diaryBoot.phase='Chiudi le altre schede del diario e riprova';$('bootStatus').hidden=false;$('bootStatus').textContent=window.diaryBoot.phase;};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const accessRow=await new Promise((resolve,reject)=>{const r=db.transaction('meta').objectStore('meta').get('administration');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 if(accessRow?.policy){accessPolicy=await DiaryAccess.checkPolicy(accessRow.policy);adminVault=accessRow.vault||null;}
 for(const name of ['ops','acks']){const rows=await new Promise((resolve,reject)=>{const r=db.transaction(name).objectStore(name).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});if(name==='ops')ops=rows;else acks=new Set(rows.map(x=>x.id));}
 for(const op of ops){validateOp(op);await DiaryAccess.authorize(op,accessPolicy);}
 db.onversionchange=()=>{db.close();toast('È disponibile un aggiornamento. Riapri il diario.');};
 const storedIdentity=await new Promise((resolve,reject)=>{const r=db.transaction('meta').objectStore('meta').get('identity');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const savedPerson=storedIdentity?.person||settingsStorage.getItem('diary-person');
 const request=requestedPerson();
 if(Object.hasOwn(people,savedPerson)){author=savedPerson;myName=personName();profileMismatch=!!request&&request!==author;setInstallManifest();}
 else if(request)await choosePerson(request);
 state=DiaryModel.project(ops);view=['home','ricordi','calendario','lettere','giochi'].includes(location.hash.slice(1))?location.hash.slice(1):'home';
 window.diaryBoot.phase='Diario pronto';window.diaryBoot.ready=true;$('bootStatus').hidden=true;render();reportDiagnostic('page-ready',{version:VERSION});
 if(!window.isSecureContext)$('trialNote').hidden=false;
 DiaryOffline.start();updateInstallUI();

 if(!Object.hasOwn(people,author))openIdentityPicker();
}
function getActivities(){return DiaryModel.activities(ops);}
function pending(id){return ops.some(o=>o.activity===id&&(state?.identities?.[o.author]||o.author)===author&&!acks.has(o.id));}
function photoOf(a){return a.media.find(m=>m.type.startsWith('image/'));}
function categoryIcon(name){return {Cinema:'film','Film a casa':'home',Ristoranti:'fork',Concerti:'music',Teatro:'sparkle'}[name]||'heart';}
function empty(title,body,button,action,ic='heart'){return '<div class="empty"><span class="tile-icon">'+icon(ic)+'</span><h2>'+title+'</h2><p>'+body+'</p>'+(button?'<button class="primary" data-action="'+action+'">'+icon('plus')+button+'</button>':'')+'</div>';}
function collectionTile(key,wide=false){const s=sectionInfo[key],n=state.memories.filter(a=>a.section===key).length;return '<button class="collection-card tone-'+key+(wide?' wide-tile':'')+'" data-collection="'+key+'"><span class="tile-icon">'+icon(s.icon)+'</span><strong>'+s.title+'</strong><small>'+n+' '+(n===1?'ricordo':'ricordi')+'</small>'+icon('right','chevron')+'</button>';}
function memoryCard(a){const photo=photoOf(a),ratings=Object.values(a.ratings),average=ratings.length?ratings.reduce((n,r)=>n+r.score,0)/ratings.length:null;return '<button class="memory-card" data-open="'+esc(a.id)+'"><div class="memory-cover tone-'+a.section+'">'+(photo?'<img src="'+esc(photo.url)+'" alt="" loading="lazy">':icon(a.section==='experiences'?categoryIcon(a.category):sectionInfo[a.section].icon))+'</div><div class="memory-body"><span class="badge">'+esc(a.category)+'</span><h3>'+esc(a.title)+'</h3><p>'+esc(formatDate(a.date))+'</p><div class="memory-meta"><span>'+(average!==null?icon('star')+average.toLocaleString('it-IT',{maximumFractionDigits:1})+'/10':icon('heart')+'Da raccontare')+'</span><span>'+a.media.length+' foto/video'+'</span></div>'+(pending(a.id)?'<div class="sync-pending">Da condividere con l’altro diario</div>':'')+'</div></button>';}
function render(){
 state=DiaryModel.project(ops);
 $('profileButton').innerHTML=avatar(state.profiles[author]);
 renderNavigation();
 $('view').innerHTML=({home:renderHome,ricordi:renderMemories,calendario:renderCalendar,lettere:renderLetters,giochi:renderGames}[view])();
 $('storage').textContent='Archivio locale: circa '+(ops.reduce((n,o)=>n+new Blob([JSON.stringify(o)]).size,0)/1024/1024).toFixed(1)+' MB. Gli originali in Foto occupano spazio separatamente.';
 tickCounter();
 if(active)renderDetail();
 updateAdministrationUI();
 updateInstallUI();
}
function renderHome(){
 const date=state.settings.anniversaryStart?.date||state.settings.anniversary||'',mediaCount=state.memories.reduce((n,a)=>n+a.media.length,0);
 return '<div class="home-topline"><span>'+esc(new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'}))+'</span><span>'+icon('lock')+'Il nostro spazio</span></div><div class="home-layout"><div><section class="hero">'+(state.settings.cover?'<img class="hero-image" src="'+esc(state.settings.cover)+'" alt="La nostra foto">':'<div class="hero-orbit"></div><div class="hero-orbit second"></div><div class="hero-heart">'+icon('heart')+'</div>')+'<button class="photo-edit" data-action="cover">'+icon('camera')+(state.settings.cover?'Cambia foto':'La nostra foto')+'</button><div class="hero-content"><div><span class="hero-kicker">LA NOSTRA STORIA</span><h1>Tu, io.<br><em>Tutto il resto.</em></h1></div><div class="together"><div class="together-title">Insieme da</div><div class="counter" aria-label="Tempo trascorso insieme"><div><strong id="days">—</strong><span>giorni</span></div><div><strong id="hours">—</strong><span>ore</span></div><div><strong id="minutes">—</strong><span>minuti</span></div><div><strong id="seconds">—</strong><span>secondi</span></div></div><p class="together-since">'+(date?'Dal '+esc(formatDate(date))+(state.settings.anniversaryStart?' · ore '+esc(state.settings.anniversaryStart.time):''):'Scegli la vostra data nel profilo')+'</p></div></div></section><div class="stat-strip"><div><strong>'+state.memories.length+'</strong><span>ricordi</span></div><div><strong>'+mediaCount+'</strong><span>foto e video</span></div><div><strong>'+state.letters.length+'</strong><span>lettere</span></div></div></div><div class="home-side"><div class="section-heading"><h2>Le nostre cose.</h2><button class="text-button" data-view="ricordi">Esplora '+icon('right')+'</button></div><div class="collection-grid">'+Object.keys(sectionInfo).map(key=>collectionTile(key)).join('')+'</div></div></div><button class="quick-letter" data-action="write-letter"><span class="tile-icon">'+icon('letter')+'</span><div><strong>Ti lascio un pensiero.</strong><p>Ci sono cose che è bello scriversi.</p></div>'+icon('right','chevron')+'</button>';
}
function tickCounter(){
 if(!$('days'))return;
 const parts=DiaryInteraction.counterParts(state?.settings||{});
 for(const id of ['days','hours','minutes','seconds'])$(id).textContent=parts?(id==='days'?parts[id]:String(parts[id]).padStart(2,'0')):'—';
}
function renderMemories(){
 if(!collection)return '<div class="heading-row"><div class="page-heading"><p class="eyebrow">IL NOSTRO ALBUM</p><h1>Ricordi da <em>tenere.</em></h1><p>Ogni cosa bella trova il suo posto.</p></div><button class="primary" data-action="new">'+icon('plus')+'Aggiungi</button></div><div class="collection-grid all-collections">'+Object.keys(sectionInfo).map(key=>collectionTile(key)).join('')+'</div><div class="section-heading"><h2>Tutti i nostri ricordi</h2><p>'+state.memories.length+' in tutto</p></div><div class="memory-grid">'+(state.memories.length?state.memories.map(memoryCard).join(''):empty('Abbiamo un sacco di pagine davanti.','Puoi aggiungere anche ricordi passati. La data non è obbligatoria.','Aggiungi un ricordo','new','album'))+'</div>';
 const s=sectionInfo[collection],list=state.memories.filter(a=>a.section===collection&&(selected==='Tutti'||collection!=='experiences'||a.category===selected));
 return '<button class="text-button back-link" data-action="all-collections">'+icon('left')+'Tutte le raccolte</button><div class="heading-row"><div class="page-heading"><p class="eyebrow">IL NOSTRO ALBUM</p><h1>'+s.title+'</h1><p>'+s.subtitle+'</p></div><button class="primary" data-action="new">'+icon('plus')+'Aggiungi</button></div><div class="collection-tabs">'+Object.keys(sectionInfo).map(key=>'<button data-collection="'+key+'" class="'+(key===collection?'active':'')+'">'+icon(sectionInfo[key].icon)+sectionInfo[key].title+'</button>').join('')+'</div>'+(collection==='experiences'?'<div class="chips">'+['Tutti',...state.categories].map(c=>'<button data-cat="'+esc(c)+'" class="'+(selected===c?'active':'')+'">'+esc(c)+'</button>').join('')+'<button class="add-chip" data-action="category">'+icon('plus')+'Categoria</button></div>':'')+(collection==='holidays'?'<p class="section-intro">Halloween, Natale, un anniversario. Una pagina per le foto e le parole di ogni festa vissuta insieme.</p>':'')+'<div class="memory-grid">'+(list.length?list.map(memoryCard).join(''):empty('Il prossimo capitolo è nostro.','Aggiungi un ricordo a questa raccolta. Foto e contributi potranno arrivare anche dopo.','Aggiungi un ricordo','new',s.icon))+'</div>';
}
function onDay(a,date){return !!a.date&&a.date<=date&&(a.endDate||a.date)>=date;}
function renderCalendar(){
 const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),first=new Date(year,month,1),offset=(first.getDay()+6)%7,today=localDay();
 const days=Array.from({length:42},(_,i)=>{const d=new Date(year,month,1-offset+i),key=localDay(d),items=state.memories.filter(a=>onDay(a,key)),photo=items.map(photoOf).find(Boolean);return '<button class="calendar-day'+(d.getMonth()!==month?' outside':'')+(items.length?' has-event':'')+(key===today?' today':'')+(key===calendarDay?' selected':'')+'" data-day="'+key+'" aria-label="'+esc(formatDate(key))+', '+items.length+' '+(items.length===1?'ricordo':'ricordi')+'" aria-pressed="'+(key===calendarDay)+'">'+(photo?'<img src="'+esc(photo.url)+'" alt="" loading="lazy">':'')+d.getDate()+'</button>';}).join('');
 const list=state.memories.filter(a=>onDay(a,calendarDay)),undated=state.memories.filter(a=>!a.date).length;
 return '<div class="heading-row"><div class="page-heading"><p class="eyebrow">GIORNO DOPO GIORNO</p><h1>Il nostro <em>tempo.</em></h1><p>Ci sono giorni che meritano un posto qui.</p></div><button class="primary" data-action="new">'+icon('plus')+'Ricordo</button></div><div class="calendar-layout"><div><section class="calendar"><div class="month-heading"><button class="icon-button" data-month="-1" aria-label="Mese precedente">'+icon('left')+'</button><h2>'+esc(first.toLocaleDateString('it-IT',{month:'long',year:'numeric'}))+'</h2><button class="icon-button" data-month="1" aria-label="Mese successivo">'+icon('right')+'</button></div><div class="weekdays">'+['L','M','M','G','V','S','D'].map(x=>'<span>'+x+'</span>').join('')+'</div><div class="calendar-grid">'+days+'</div><p class="calendar-legend"><i></i>Un puntino, un nostro ricordo.</p></section>'+(undated?'<p class="undated-note">'+undated+' ricordi senza data ti aspettano nelle loro raccolte.</p>':'')+'</div><section class="day-summary"><div class="section-heading"><h2>'+esc(formatDate(calendarDay,{day:'numeric',month:'long'}))+'</h2><button class="text-button" data-action="today">Oggi</button></div><div class="memory-grid">'+(list.length?list.map(memoryCard).join(''):empty('Una pagina ancora da scrivere.','Qui appariranno i ricordi di questa giornata.','Aggiungi un ricordo','new','calendar'))+'</div></section></div>';
}
function renderLetters(){
 return '<div class="heading-row"><div class="page-heading"><p class="eyebrow">TRA ME E TE</p><h1>Le parole <em>restano.</em></h1><p>Un pensiero da aprire, leggere e rileggere.</p></div><button class="primary" data-action="write-letter">'+icon('plus')+'Scrivi</button></div><div class="letter-grid">'+(state.letters.length?state.letters.map(l=>'<button class="letter-card" data-letter="'+esc(l.id)+'"><span class="letter-symbol">'+icon('letter')+'</span><span class="badge">'+(l.author===author?'Da te, con amore':'Da '+esc(nameOf(l.author,l.name)))+'</span><h2>'+esc(l.title)+'</h2><p>'+esc(l.body)+'</p><small>'+new Date(l.time).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})+'</small></button>').join(''):empty('Ci sono cose che è bello scriversi.','Una lettera lunga o due righe al volo. Il diario conserverà le vostre parole.','Scrivi la prima lettera','write-letter','letter'))+'</div>';
}
function renderGames(){
 return '<div class="page-heading"><p class="eyebrow">ANCORA QUALCOSA DA SCOPRIRE</p><h1>Un po’ di noi.<br><em>Per gioco.</em></h1><p>Domande, piccole sfide e tempo da passare insieme.</p></div><div class="game-types">'+Object.entries(gameTypes).map(([key,g])=>'<button class="game-type" data-game-type="'+key+'">'+icon(g.icon)+'<strong>'+g.title+'</strong><small>'+g.subtitle+'</small></button>').join('')+'</div><div class="section-heading"><h2>Creati da noi</h2><p>'+state.games.length+' '+(state.games.length===1?'gioco':'giochi')+'</p></div><div class="game-list">'+(state.games.length?state.games.map(g=>{const r=state.results.filter(r=>r.game===g.id&&r.author===author).at(-1);return '<button class="saved-game" data-play="'+esc(g.id)+'"><span class="tile-icon">'+icon(gameTypes[g.type].icon)+'</span><div><strong>'+esc(g.title)+'</strong><small>'+esc(gameTypes[g.type].title)+' · '+g.questions.length+' domande</small><small>'+(r?'Ultimo risultato: '+r.score+'/'+r.total:g.author===author?'Creato da te':'Da '+esc(nameOf(g.author,g.name)))+'</small></div>'+icon('right','chevron')+'</button>';}).join(''):empty('Le regole le inventiamo noi.','Scegli un tipo di gioco qui sopra e prepara le tue domande. I contenuti li decideremo insieme.','','','games'))+'</div>';
}
let pageAnimations=[],pageGhost=null,motionToken=0;
const pageRenderers={home:renderHome,ricordi:renderMemories,calendario:renderCalendar,lettere:renderLetters,giochi:renderGames};
function reducedMotion(){return matchMedia('(prefers-reduced-motion: reduce)').matches;}
function clearPageMotion(){
 motionToken++;for(const animation of pageAnimations)animation.cancel();pageAnimations=[];pageGhost?.remove();pageGhost=null;$('view').style.transform='';
}
function pageSnapshot(next=null){
 const node=$('view').cloneNode(next===null);node.removeAttribute('id');node.removeAttribute('tabindex');node.className='page-snapshot';node.setAttribute('inert','');node.setAttribute('aria-hidden','true');node.style.transform='';
 if(next!==null){node.innerHTML=pageRenderers[next]();if(next==='home'){const parts=DiaryInteraction.counterParts(state.settings);for(const id of ['days','hours','minutes','seconds']){const item=node.querySelector('#'+id);if(item)item.textContent=parts?(id==='days'?parts[id]:String(parts[id]).padStart(2,'0')):'—';}}}
 for(const child of node.querySelectorAll('[id]'))child.removeAttribute('id');
 $('pageStage').append(node);node.scrollTop=next===null?$('view').scrollTop:0;return node;
}
function navigate(next,{fromHash=false,dragOffset=0}={}){
 if(!DiaryInteraction.pages.includes(next))return;
 if(next===view){clearPageMotion();positionNavigationBubble();return;}
 const previous=view,direction=DiaryInteraction.pages.indexOf(next)>DiaryInteraction.pages.indexOf(previous)?1:-1;
 clearPageMotion();const token=motionToken,width=$('pageStage').clientWidth;
 const snapshot=reducedMotion()?null:pageSnapshot();pageGhost=snapshot;
 view=next;if(!fromHash)location.hash=next;render();$('view').scrollTo({top:0,behavior:'instant'});
 if(!snapshot)return;
 const timing={duration:300,easing:'cubic-bezier(.22,.72,.16,1)',fill:'both'};
 pageAnimations=[snapshot.animate([{transform:'translate3d('+dragOffset+'px,0,0)'},{transform:'translate3d('+(-direction*width)+'px,0,0)'}],timing),$('view').animate([{transform:'translate3d('+(direction*width+dragOffset)+'px,0,0)'},{transform:'translate3d(0,0,0)'}],timing)];
 Promise.all(pageAnimations.map(a=>a.finished)).then(()=>{if(token===motionToken)clearPageMotion();}).catch(()=>{});
}
window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(DiaryInteraction.pages.includes(next)&&next!==view)navigate(next,{fromHash:true});});
let navPointer=null,blockNavClickUntil=0;
function renderNavigation(){
 const nav=$('bottomNav');
 if(!nav.querySelector('.nav-bubble'))nav.innerHTML='<span class="nav-bubble" aria-hidden="true"></span>'+[['home','home','Home'],['ricordi','album','Ricordi'],['calendario','calendar','Calendario'],['lettere','letter','Lettere'],['giochi','games','Giochi']].map(([id,ic,label])=>'<a href="#'+id+'" data-page="'+id+'">'+icon(ic)+'<span>'+label+'</span></a>').join('');
 for(const link of nav.querySelectorAll('a')){const selected=link.dataset.page===view;link.classList.toggle('active',selected);if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
 if(!navPointer)positionNavigationBubble();
}
function positionNavigationBubble(clientX=null){
 const nav=$('bottomNav'),links=[...nav.querySelectorAll('a')];if(!links.length)return;
 const box=nav.getBoundingClientRect(),first=links[0].getBoundingClientRect(),last=links.at(-1).getBoundingClientRect();
 const index=clientX===null?Math.max(0,DiaryInteraction.pages.indexOf(view)):DiaryInteraction.navIndex(clientX,first.left,last.right,links.length),target=links[index].getBoundingClientRect();
 const left=clientX===null?target.left:Math.max(first.left,Math.min(last.left,clientX-first.width/2));
 nav.style.setProperty('--bubble-x',(left-box.left-nav.clientLeft)+'px');nav.style.setProperty('--bubble-width',target.width+'px');
 for(let i=0;i<links.length;i++)links[i].classList.toggle('nav-preview',clientX!==null&&i===index);
 return DiaryInteraction.pages[index];
}
$('bottomNav').addEventListener('pointerdown',e=>{
 if(e.button!==0||!e.isPrimary)return;
 navPointer={id:e.pointerId};$('bottomNav').setPointerCapture(e.pointerId);$('bottomNav').classList.add('nav-dragging');positionNavigationBubble(e.clientX);e.preventDefault();
});
$('bottomNav').addEventListener('pointermove',e=>{if(navPointer?.id===e.pointerId)positionNavigationBubble(e.clientX);});
function finishNavigationPointer(e,cancel=false){
 if(navPointer?.id!==e.pointerId)return;
 const next=cancel?null:positionNavigationBubble(e.clientX);navPointer=null;
 $('bottomNav').classList.remove('nav-dragging');blockNavClickUntil=performance.now()+400;
 if($('bottomNav').hasPointerCapture(e.pointerId))$('bottomNav').releasePointerCapture(e.pointerId);
 if(next)navigate(next);positionNavigationBubble();
}
$('bottomNav').addEventListener('pointerup',e=>finishNavigationPointer(e));
$('bottomNav').addEventListener('pointercancel',e=>finishNavigationPointer(e,true));
$('bottomNav').addEventListener('lostpointercapture',e=>{if(navPointer?.id===e.pointerId)finishNavigationPointer(e,true);});
$('bottomNav').addEventListener('click',e=>{const link=e.target.closest('a[data-page]');if(!link)return;e.preventDefault();if(performance.now()>=blockNavClickUntil)navigate(link.dataset.page);});
if('ResizeObserver'in window)new ResizeObserver(()=>{if(!navPointer)positionNavigationBubble();}).observe($('bottomNav'));
$('view').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.view)return navigate(b.dataset.view);
 if(b.dataset.collection){collection=b.dataset.collection;selected='Tutti';if(view!=='ricordi')navigate('ricordi');else render();return;}
 if(b.dataset.cat){selected=b.dataset.cat;render();return;}
 if(b.dataset.open){active=b.dataset.open;renderDetail();$('detailDialog').showModal();return;}
 if(b.dataset.day){calendarDay=b.dataset.day;render();return;}
 if(b.dataset.month){calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+Number(b.dataset.month),1);calendarDay=localDay(calendarMonth);render();return;}
 if(b.dataset.letter){openLetter(b.dataset.letter);return;}
 if(b.dataset.gameType){openGameBuilder(b.dataset.gameType);return;}
 if(b.dataset.play){startGame(b.dataset.play);return;}
 const action=b.dataset.action;
 if(action==='new')openNew();
 if(action==='cover')$('coverInput').click();
 if(action==='all-collections'){collection=null;selected='Tutti';render();}
 if(action==='category'){$('categoryForm').reset();$('categoryDialog').showModal();}
 if(action==='write-letter')openLetter();
 if(action==='today'){calendarDay=localDay();calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);render();}
});
function openNew(){
 $('createForm').reset();$('sectionInput').value=collection||'experiences';$('categoryInput').innerHTML=state.categories.map(c=>'<option>'+esc(c)+'</option>').join('');
 if(selected!=='Tutti'&&state.categories.includes(selected))$('categoryInput').value=selected;
 $('dateInput').value=view==='calendario'?calendarDay:localDay();updateNewFields();$('newDialog').showModal();
}
function updateNewFields(){
 const s=$('sectionInput').value,undated=$('undatedInput').checked;
 $('categoryLabel').hidden=s!=='experiences';$('recipientLabel').hidden=s!=='gifts';$('endDateLabel').hidden=s!=='trips';
 $('dateInput').disabled=undated;$('dateInput').required=!undated;$('endDateInput').disabled=undated;
 $('dateHelp').textContent=undated?'Ce lo ricordiamo anche senza una data. Resterà nella sua raccolta, fuori dal calendario.':'Con una data, questo ricordo apparirà anche nel calendario.';
 $('newTitle').textContent={experiences:'Una nuova esperienza',dance:'Un posto in prima fila',trips:'Un’altra piccola fuga',gifts:'Un pensiero da custodire',holidays:'Un giorno speciale'}[s];
 $('titleInput').placeholder={experiences:'Per esempio, il titolo del film',dance:'Il nome dello spettacolo',trips:'Dove andiamo questa volta?',gifts:'Che cosa ci siamo regalati?',holidays:'Per esempio, Halloween insieme'}[s];
}
$('sectionInput').innerHTML=Object.entries(DiaryModel.sections).map(([key,label])=>'<option value="'+key+'">'+label+'</option>').join('');
$('sectionInput').onchange=updateNewFields;$('undatedInput').onchange=updateNewFields;
$('createForm').onsubmit=async e=>{e.preventDefault();const s=$('sectionInput').value,date=$('undatedInput').checked?'':$('dateInput').value,endDate=s==='trips'&&date?$('endDateInput').value:'';if(endDate&&endDate<date)return toast('La data finale deve essere successiva a quella iniziale');await withSave(e.submitter,async()=>{await addOp('create',uuid(),{section:s,category:s==='experiences'?$('categoryInput').value:sectionInfo[s].title,title:$('titleInput').value.trim(),description:$('descriptionInput').value.trim(),location:$('locationInput').value.trim(),recipient:s==='gifts'?$('recipientInput').value.trim():'',date,endDate});$('newDialog').close();collection=s;selected='Tutti';navigate('ricordi');toast('Un altro ricordo, custodito qui.');});};
$('categoryForm').onsubmit=async e=>{e.preventDefault();const name=$('categoryName').value.trim();if(!name)return;if(state.categories.some(c=>c.toLocaleLowerCase()===name.toLocaleLowerCase()))return toast('Questa categoria esiste già');await withSave(e.submitter,async()=>{await addOp('category',uuid(),{name});$('categoryDialog').close();selected=name;render();toast('La vostra nuova categoria è pronta');});};
async function withSave(button,fn){if(button?.disabled)return;if(button)button.disabled=true;try{await fn();}catch(e){toast(e.message||'Salvataggio non riuscito');}finally{if(button)button.disabled=false;}}
function renderMediaGallery(a){
 const visible=a.media.map(m=>'<figure class="media-item">'+(m.type.startsWith('image/')?'<button class="photo-open" data-photo-open="'+esc(m.id)+'" aria-label="Apri foto: '+esc(m.name)+'"><img src="'+esc(m.url)+'" alt="'+esc(m.name)+'" loading="lazy"></button>':'<video controls playsinline preload="metadata" src="'+esc(m.url)+'"></video>')+'<button class="text-button" data-media-id="'+esc(m.id)+'" data-media-removed="true">Rimuovi dal ricordo</button></figure>').join('');
 const removed=a.removedMedia||[];
 return '<div class="gallery">'+visible+'</div>'+(removed.length?'<details class="removed-media"><summary>Foto e video rimossi ('+removed.length+')</summary><p class="field-help">Puoi ripristinarli. La rimozione non libera spazio e non modifica la galleria Foto dell’iPhone.</p>'+removed.map(m=>'<div class="removed-media-row"><span>'+esc(m.name)+'</span><button class="text-button" data-media-id="'+esc(m.id)+'" data-media-removed="false">Ripristina</button></div>').join('')+'</details>':'');
}
$('detail').addEventListener('click',async e=>{
 const photo=e.target.closest('[data-photo-open]');if(photo){openPhotoViewer(photo.dataset.photoOpen);return;}
 const button=e.target.closest('button[data-media-id]');if(!button)return;
 const target=active,mediaId=button.dataset.mediaId,removed=button.dataset.mediaRemoved==='true';
 await withSave(button,async()=>{await addOp('media-state',target,{mediaId,removed});toast(removed?'Rimosso dal ricordo. Puoi ripristinarlo in “Foto e video rimossi”.':'Di nuovo nel vostro ricordo');});
});
function renderDetail(){
 const draft=renderedActivity===active&&$('comment')?{comment:$('comment').value,score:$('score').value}:null;
 const a=state.memories.find(a=>a.id===active);if(!a)return;const mine=a.ratings[author];
 const canRate=['experiences','dance'].includes(a.section);
 $('detail').innerHTML='<p class="eyebrow">'+esc(a.category)+'</p><h2>'+esc(a.title)+'</h2><div class="detail-meta"><span>'+esc(formatDate(a.date))+(a.endDate?' — '+esc(formatDate(a.endDate)):'')+'</span>'+(a.location?'<span>'+esc(a.location)+'</span>':'')+(a.recipient?'<span>Ricevuto da '+esc(a.recipient)+'</span>':'')+'</div>'+(a.description?'<p class="detail-description">'+esc(a.description)+'</p>':'')+'<p class="field-help">'+(pending(a.id)?'Custodito su questo dispositivo. Collegate i diari per condividerlo.':'I tuoi contributi sono stati ricevuti anche dall’altro diario.')+'</p>'+(canRate?'<div class="ratings">'+Object.entries(a.ratings).map(([id,r])=>'<div class="rating"><div class="rating-name">'+esc(nameOf(id,r.name))+'</div><strong>'+r.score+'<small> / 10</small></strong>'+(r.comment?'<p>'+esc(r.comment)+'</p>':'')+'</div>').join('')+'</div><form id="ratingForm"><div class="form-row"><label>Il tuo voto<select id="score">'+Array.from({length:10},(_,i)=>'<option '+((mine?.score||8)===i+1?'selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label></div><label>Il tuo commento<textarea id="comment" maxlength="2000" placeholder="Che cosa ti è rimasto di questo momento?">'+esc(mine?.comment||'')+'</textarea></label><button class="primary" type="submit">Salva il tuo contributo</button></form>':'')+renderMediaGallery(a);
 renderedActivity=active;if(draft&&$('comment')){$('comment').value=draft.comment;$('score').value=draft.score;}
 if($('ratingForm'))$('ratingForm').onsubmit=async e=>{e.preventDefault();const data={score:Number($('score').value),comment:$('comment').value};await withSave(e.submitter,async()=>{await addOp('rating',a.id,data);toast('Il tuo contributo è salvato');});};
}
$('mediaInput').onchange=async e=>{
 const files=[...e.target.files],target=active;e.target.value='';if(!target)return;
 await withSave(e.target,async()=>{for(const f of files){if(!f.type.startsWith('image/')&&!f.type.startsWith('video/')&&!/\.(heic|heif)$/i.test(f.name)){toast('Scegli una foto o un video');continue;}if(f.size>20*1024*1024){toast('Questo file supera il limite di 20 MB');continue;}const url=await mediaURL(f);await addOp('media',target,{url,type:url.startsWith('data:image/jpeg')?'image/jpeg':f.type,name:f.name});toast('Un altro momento nell’album');}});
};
async function mediaURL(f,maxDimension=0){
 const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('File non leggibile'));r.readAsDataURL(f);});
 if(!f.type.startsWith('image/')&&!/\.(heic|heif)$/i.test(f.name))return url;
 const image=new Image();try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});}catch{throw Error('Immagine non leggibile: scegli una copia JPEG');}
 const ratio=maxDimension?Math.min(1,maxDimension/Math.max(image.naturalWidth,image.naturalHeight)):1,canvas=document.createElement('canvas');
 canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.94);
}
async function addOp(kind,activity,data,opAuthor=author){
 if(!Object.hasOwn(people,author))throw Error('Scegli prima il profilo di questo dispositivo');
 const time=ops.reduce((n,o)=>Math.max(n,o.time+1),Date.now()),op={id:uuid(),kind,activity,data,author:opAuthor,name:personName(opAuthor),time};validateOp(op);
 if(['profile','identity'].includes(kind)){op.actor=author;if(author==='one'&&accessPolicy){if(!adminKey)throw Error('Sblocca prima l’amministrazione');Object.assign(op,await DiaryAccess.sign(op,adminKey));}if(author==='two'&&(opAuthor!=='two'||kind==='identity'))throw Error('Puoi modificare soltanto il tuo profilo');}
 await DiaryAccess.authorize(op,accessPolicy);
 try{await store('ops',op);ops.push(op);render();if(channel?.readyState==='open'&&peerPerson&&syncStarted)send({type:'op',op}).catch(()=>toast('Trasferimento interrotto: il contenuto resta qui'));}catch(e){throw Error('Salvataggio non riuscito. Controlla lo spazio disponibile.');}
}
function validateOp(op){return DiaryModel.validateOp(op);}
function connection(status,online=false){$('connection').textContent=status;$('dot').classList.toggle('online',online);$('pairStatus').textContent=status;}
function closePeer(){peerPerson='';syncStarted=false;clearTimeout(channel?.helloTimer);clearInterval(pollTimer);clearInterval(diagnosticTimer);pollTimer=null;const oldChannel=channel,oldPeer=pc;pc=null;channel=null;pairId=null;peerName='';$('pairCode').textContent='';if(oldChannel){oldChannel.onopen=null;oldChannel.onclose=null;oldChannel.onmessage=null;oldChannel.close();}if(oldPeer){oldPeer.ondatachannel=null;oldPeer.onconnectionstatechange=null;oldPeer.oniceconnectionstatechange=null;oldPeer.close();}transfers.clear();connection('Diario locale · non collegato');}
function reportDiagnostic(stage){
 const node=$('connectionDebug');if(!node)return;
 const count=s=>(s||'').split('\n').filter(line=>line.startsWith('a=candidate:')).length;
 node.textContent=['Ultimo passaggio: '+stage,'Connessione: '+(pc?.connectionState||'non avviata'),'Rete: '+(pc?.iceConnectionState||'non avviata'),'Raccolta rete: '+(pc?.iceGatheringState||'non avviata'),'Percorsi locali: '+count(pc?.localDescription?.sdp),'Percorsi ricevuti: '+count(pc?.remoteDescription?.sdp),'Canale: '+(channel?.readyState||'non aperto')].join('\n');
}
function reportStats(){reportDiagnostic('controllo locale');}
function makePeer(){closePeer();if(!window.RTCPeerConnection)throw Error('Questo browser non supporta il collegamento. Usa Safari aggiornato.');const created=new RTCPeerConnection({iceServers:localIceServers});pc=created;created.ondatachannel=e=>{if(pc===created)bindChannel(e.channel);};created.onconnectionstatechange=()=>{if(pc!==created)return;reportDiagnostic('connection');if(created.connectionState==='failed')connection('Connessione diretta non riuscita · i ricordi restano qui');else if(created.connectionState==='disconnected')connection('Connessione in pausa · tentativo di ripresa…');};created.oniceconnectionstatechange=()=>{if(pc===created)reportDiagnostic('ice');};created.onicecandidateerror=e=>{if(pc===created)reportDiagnostic('candidate-error',{code:e.errorCode,message:e.errorText});};diagnosticTimer=setInterval(reportStats,5000);reportDiagnostic('start');return created;}
function bindChannel(c){
 channel=c;peerPerson='';syncStarted=false;c.bufferedAmountLowThreshold=65536;
 c.onopen=async()=>{if(channel!==c)return;reportDiagnostic('channel-open');clearInterval(pollTimer);connection('Verifica dei due profili…',true);try{await send({type:'hello',protocol:WIRE_VERSION,person:author,name:personName(),ticket:sessionTicket,policy:accessPolicy});c.helloTimer=setTimeout(()=>{if(channel===c&&!peerPerson){closePeer();connection('Aggiorna il diario su entrambi i dispositivi e riprova');}},10000);}catch{connection('Trasferimento interrotto');}};
 c.onclose=()=>{clearTimeout(c.helloTimer);if(channel===c){reportDiagnostic('channel-closed');connection('Diario locale · non collegato');}};
 let receive=Promise.resolve();c.onmessage=e=>{receive=receive.then(()=>{if(channel===c)return receiveFrame(e.data);}).catch(err=>toast('Ricezione non completata: '+err.message));};
}
async function syncSnapshot(){
 if(syncStarted||!peerPerson)return;syncStarted=true;
 for(const op of ops)await send({type:'op',op});
 await send({type:'sync-done'});
}
async function send(payload){const current=channel;const task=async()=>{const value=JSON.stringify(payload),id=uuid(),count=Math.ceil(value.length/12000);for(let i=0;i<count;i++){if(current?.readyState!=='open')throw Error('Collegamento chiuso');while(current.bufferedAmount>262144){await new Promise(r=>setTimeout(r,20));if(current.readyState!=='open')throw Error('Collegamento chiuso');}current.send(JSON.stringify({id,i,count,chunk:value.slice(i*12000,(i+1)*12000)}));}};const result=sendTail.then(task);sendTail=result.catch(()=>{});return result;}
async function receiveFrame(raw){
 const f=JSON.parse(raw);if(typeof f.id!=='string'||!Number.isInteger(f.count)||f.count<1||f.count>6000||!Number.isInteger(f.i)||f.i<0||f.i>=f.count||typeof f.chunk!=='string'||f.chunk.length>12000)throw Error('Dati non validi');
 let t=transfers.get(f.id);if(!t){if(transfers.size>8)throw Error('Troppi trasferimenti');t={parts:new Array(f.count),received:0};transfers.set(f.id,t);}
 if(t.parts.length!==f.count)throw Error('Trasferimento non valido');if(t.parts[f.i]===undefined){t.parts[f.i]=f.chunk;t.received++;}if(t.received!==f.count)return;
 transfers.delete(f.id);const message=JSON.parse(t.parts.join(''));
 if(message.type==='hello'||message.type==='hello-ok'){
  if(message.protocol!==WIRE_VERSION||message.ticket!==sessionTicket||!sessionTicket||!Object.hasOwn(people,message.person)){closePeer();connection('Aggiorna il diario su entrambi i dispositivi prima di collegarli');return;}
  if(message.person===author){closePeer();connection('Entrambi i dispositivi sono di '+personName()+'. Assegna Persona 1 a un dispositivo e Persona 2 all’altro.');return;}
  if(message.policy)await adoptPolicy(message.policy);
  peerPerson=message.person;peerName=message.name||personName(peerPerson);clearTimeout(channel.helloTimer);
  await store('meta',{id:'partner',person:peerPerson});connection('Collegato con '+peerName,true);
  if(message.type==='hello')await send({type:'hello-ok',protocol:WIRE_VERSION,person:author,ticket:sessionTicket,policy:accessPolicy});
  else await syncSnapshot();
  return;
 }
 if(!peerPerson)throw Error('I profili non sono ancora stati verificati');
 if(message.type==='op'){const op=message.op;validateOp(op);await DiaryAccess.authorize(op,accessPolicy);if(!ops.some(o=>o.id===op.id)){await store('ops',op);ops.push(op);render();}await send({type:'ack',id:op.id});}
 if(message.type==='ack'&&ops.some(o=>o.id===message.id)){await store('acks',{id:message.id});acks.add(message.id);render();}
 if(message.type==='sync-done')connection('Collegato con '+peerName+' · ricordi ricevuti',true);
}
async function description(current=pc){if(!current||current!==pc)throw Error('Tentativo annullato');if(current.iceGatheringState!=='complete')await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('La rete non consente di preparare il collegamento')),12000);const listener=()=>{if(current!==pc){clearTimeout(timer);current.removeEventListener('icegatheringstatechange',listener);reject(Error('Tentativo annullato'));}else if(current.iceGatheringState==='complete'){clearTimeout(timer);current.removeEventListener('icegatheringstatechange',listener);resolve();}};current.addEventListener('icegatheringstatechange',listener);listener();});if(current!==pc)throw Error('Tentativo annullato');return current.localDescription.toJSON();}
function saveName(){if(!Object.hasOwn(people,author))throw Error('Scegli prima il profilo del dispositivo');myName=personName();}
function guarded(fn){return async()=>{if(connectionBusy)return;connectionBusy=true;const buttons=['manualOffer','manualAccept','scanCode'];buttons.forEach(id=>$(id).disabled=true);try{await fn();}catch(e){connection(e.message);toast(e.message);}finally{connectionBusy=false;buttons.forEach(id=>$(id).disabled=false);}};}
let sessionTicket='';
$('connectButton').onclick=()=>{$('name').value=personName();$('connectDialog').showModal();};
$('disconnect').onclick=()=>{stopScanner();closePeer();$('signalOut').value='';$('signalQR').replaceChildren();$('signalIn').value='';};
$('manualOffer').onclick=guarded(async()=>{
 saveName();makePeer();role='offer';sessionTicket=uuid();
 bindChannel(pc.createDataChannel('diary'));await pc.setLocalDescription(await pc.createOffer());
 await showSignal({format:'tra-noi-link-v1',ticket:sessionTicket,description:await description(),expires:Date.now()+300000});
 connection('Mostra questo QR all’altro dispositivo. Quando compare il suo QR di risposta, premi qui “Scansiona il QR dell’altro” e inquadralo.');
});
async function acceptSignal(value){
 saveName();const payload=await DiaryLink.decode(value);
 if(payload.description.type==='offer'){
  makePeer();role='answer';sessionTicket=payload.ticket;
  await pc.setRemoteDescription(payload.description);await pc.setLocalDescription(await pc.createAnswer());
  await showSignal({format:'tra-noi-link-v1',ticket:sessionTicket,description:await description(),expires:payload.expires});
  connection('Risposta pronta. Sul dispositivo che ti ha mostrato il QR iniziale premi “Scansiona il QR dell’altro” e inquadra questo codice. Il tuo profilo resta lo stesso.');
 }else if(pc&&role==='offer'&&payload.ticket===sessionTicket){
  await pc.setRemoteDescription(payload.description);connection('Connessione diretta in corso…');
 }else throw Error('Questa risposta non appartiene al collegamento aperto. Crea un nuovo QR.');
}
$('manualAccept').onclick=guarded(()=>acceptSignal($('signalIn').value.trim()));
async function showSignal(payload){
 const value=await DiaryLink.encode(payload);$('signalOut').value=value;
 try{const code=qrcode(0,'M');code.addData(value);code.make();$('signalQR').innerHTML=code.createSvgTag({scalable:true,margin:4});$('signalQR').setAttribute('aria-label','QR per il collegamento diretto');}
 catch{$('signalQR').textContent='Il codice è troppo grande per un QR: usa il testo qui sotto.';}
 reportDiagnostic('QR pronto');
}
$('copySignal').onclick=async()=>{try{await navigator.clipboard.writeText($('signalOut').value);toast('Codice copiato');}catch{toast('Seleziona e copia il testo del codice');}};
let cameraStream=null,scanFrame=null;
function stopScanner(){if(scanFrame)cancelAnimationFrame(scanFrame);scanFrame=null;cameraStream?.getTracks().forEach(t=>t.stop());cameraStream=null;$('scanner').hidden=true;$('scanVideo').srcObject=null;}
$('stopScanner').onclick=stopScanner;
$('connectDialog').addEventListener('close',stopScanner);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopScanner();});
$('scanCode').onclick=guarded(async()=>{
 stopScanner();const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});
 if(!$('connectDialog').open){stream.getTracks().forEach(t=>t.stop());return;}
 cameraStream=stream;$('scanner').hidden=false;const video=$('scanVideo');video.srcObject=stream;await video.play();
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
 const scan=()=>{
  if(!cameraStream)return;
  if(video.readyState>=2){canvas.width=Math.min(video.videoWidth,960);canvas.height=Math.round(canvas.width*video.videoHeight/video.videoWidth);ctx.drawImage(video,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),found=jsQR(pixels.data,canvas.width,canvas.height,{inversionAttempts:'dontInvert'});if(found){stopScanner();$('signalIn').value=found.data;guarded(()=>acceptSignal(found.data))();return;}}
  scanFrame=requestAnimationFrame(scan);
 };scan();
});

let profileBaseline=null,partnerPhotoDraft='';
function openProfile(){
 const profile=state.profiles[author];profileDraft=profile?.photo||'';
 $('firstNameInput').value=profile?.firstName||(myName==='Io'?'':myName);$('lastNameInput').value=profile?.lastName||'';
 $('profilePreview').innerHTML='<span class="avatar">'+avatar(profile)+'</span>';
 const partner=state.profiles[author==='one'?'two':'one'];partnerPhotoDraft=partner?.photo||'';
 $('partnerProfile').innerHTML='<span class="avatar">'+avatar(partner,icon('heart'))+'</span><div><p>'+esc(partner?[partner.firstName,partner.lastName].filter(Boolean).join(' '):'Il suo angolino')+'</p><small>'+(partner?'Il profilo dell’altro diario':'Nome e foto da preparare per la sorpresa')+'</small></div>';
 $('partnerFirstName').value=partner?.firstName||'';$('partnerLastName').value=partner?.lastName||'';
 profileBaseline={own:{firstName:$('firstNameInput').value,lastName:$('lastNameInput').value,photo:profileDraft},partner:{firstName:$('partnerFirstName').value,lastName:$('partnerLastName').value,photo:partnerPhotoDraft}};
 $('otherDeviceHelp').textContent='Puoi preparare entrambi i nomi da qui. Sull’altro iPhone scegli '+(author==='one'?'Persona 2':'Persona 1')+': al primo collegamento riceverà i profili che avete preparato. I nomi non sono pubblicati sul sito.';
 $('anniversaryInput').value=state.settings.anniversaryStart?.date||state.settings.anniversary||'';$('anniversaryTime').value=state.settings.anniversaryStart?.time||'00:00';renderLegacyProfiles();updateInstallUI();updateAdministrationUI();$('profileDialog').showModal();
}
$('profileButton').onclick=openProfile;$('installNotice').onclick=openProfile;
$('partnerPhoto').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;await withSave(e.target,async()=>{if(author!=='one'||!adminKey)throw Error('Sblocca l’amministrazione');if(f.size>20*1024*1024)throw Error('Scegli una foto sotto i 20 MB');partnerPhotoDraft=await mediaURL(f,600);$('partnerProfile').querySelector('.avatar').innerHTML='<img src="'+esc(partnerPhotoDraft)+'" alt="Nuova foto dell’altra persona">';});};
$('accessDialog').addEventListener('close',()=>{$('accessPassword').value='';$('accessPasswordAgain').value='';});
$('profilePhoto').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;await withSave(e.target,async()=>{if(f.size>20*1024*1024)throw Error('Scegli una foto sotto i 20 MB');profileDraft=await mediaURL(f,600);$('profilePreview').innerHTML='<span class="avatar"><img src="'+esc(profileDraft)+'" alt="La tua nuova foto"></span>';});};
$('profileForm').onsubmit=async e=>{e.preventDefault();await withSave(e.submitter,async()=>{const draft={own:{firstName:$('firstNameInput').value,lastName:$('lastNameInput').value,photo:profileDraft},partner:{firstName:$('partnerFirstName').value,lastName:$('partnerLastName').value,photo:partnerPhotoDraft}};const changes=DiaryModel.profileChanges(state.profiles,author,profileBaseline,draft,author==='one'&&!!adminKey);if(changes.some(change=>change.person!==author)&&!(author==='one'&&adminKey))throw Error('Soltanto l’amministratore può modificare l’altro profilo');for(const change of changes)await addOp('profile',change.person,change.data,change.person);myName=personName();$('profileDialog').close();toast(changes.length?'Profili salvati soltanto nel diario':'I profili sono già aggiornati');});};
$('saveAnniversary').onclick=async()=>{
 const date=$('anniversaryInput').value,time=$('anniversaryTime').value;
 if(!date||!time)return toast('Scegli la data e l’orario del vostro inizio');
 await withSave($('saveAnniversary'),async()=>{await addOp('setting','our-story',{key:'anniversaryStart',value:{date,time,instant:DiaryInteraction.startInstant(date,time)}});toast('Data e ora del vostro inizio aggiornate');});
};
$('coverInput').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;await withSave(e.target,async()=>{if(f.size>20*1024*1024)throw Error('Scegli una foto sotto i 20 MB');const value=await mediaURL(f,2048);await addOp('setting','our-story',{key:'cover',value});toast('Adesso questa Home parla di voi');});};
function openLetter(id){
 const l=state.letters.find(l=>l.id===id);
 $('letterContent').innerHTML=l?'<p class="letter-date">'+new Date(l.time).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})+'</p><h2>'+esc(l.title)+'</h2><div class="letter-body">'+esc(l.body)+'</div><p class="letter-signature">'+esc(nameOf(l.author,l.name))+'</p><p class="field-help">'+(pending(l.id)?'La lettera arriverà nell’altro diario quando vi collegherete.':'La lettera è stata ricevuta anche dall’altro diario.')+'</p>':'<h2>Una lettera per te.</h2><p class="muted">Scrivi quello che ti va di lasciare all’altro. Lo ritroverete qui, anche fra tanto tempo.</p><form id="letterForm"><label>Titolo<input id="letterTitle" required maxlength="120" placeholder="Una cosa che volevo dirti…"></label><label>Le tue parole<textarea id="letterBody" required maxlength="20000" rows="9" placeholder="Caro amore,"></textarea></label><p class="field-help">Si salva qui. Arriverà anche nell’altro diario al prossimo collegamento.</p><button class="primary" type="submit">Lascia la tua lettera</button></form>';
 if(!l)$('letterForm').onsubmit=async e=>{e.preventDefault();const title=$('letterTitle').value.trim(),body=$('letterBody').value.trim();if(!title||!body)return;await withSave(e.submitter,async()=>{await addOp('letter',uuid(),{title,body});$('letterDialog').close();navigate('lettere');toast('Le tue parole sono al sicuro qui');});};
 $('letterDialog').showModal();
}
function openGameBuilder(type){
 gameDraft={type,title:'',questions:[{text:'',options:['','','',''],correct:0}]};renderGameBuilder();$('gameDialog').showModal();
}
function captureGameDraft(){
 gameDraft.title=$('gameTitle').value;
 document.querySelectorAll('[data-question]').forEach(node=>{const i=Number(node.dataset.question);gameDraft.questions[i].text=node.querySelector('textarea').value;if(gameDraft.type==='quiz'){gameDraft.questions[i].options=[...node.querySelectorAll('input[type=text]')].map(n=>n.value);gameDraft.questions[i].correct=Number(node.querySelector('input[type=radio]:checked')?.value||0);}});
}
function renderGameBuilder(){
 const g=gameDraft,isQuiz=g.type==='quiz';
 $('gameContent').innerHTML='<h2>'+gameTypes[g.type].title+'</h2><p class="muted">'+(isQuiz?'Prepara da 1 a 10 domande. Per ogni domanda scrivi quattro risposte e seleziona il cerchietto di quella corretta.':'Prepara da 1 a 10 domande o piccole sfide da leggere insieme. Le risposte orali non vengono registrate.')+'</p><form id="gameForm"><label>Nome del gioco<input id="gameTitle" maxlength="120" required placeholder="Come lo chiamiamo?" value="'+esc(g.title)+'"></label><div id="questions">'+g.questions.map((q,i)=>'<section class="question-card" data-question="'+i+'"><h3>Domanda '+(i+1)+'</h3><label>La tua domanda<textarea maxlength="500" required placeholder="'+(g.type==='truthdare'?'Scrivi una verità da raccontare o un obbligo da scegliere…':'Che cosa vorresti chiedere?')+'">'+esc(q.text)+'</textarea></label>'+(isQuiz?'<p class="field-help">Seleziona la risposta corretta.</p>'+q.options.map((option,j)=>'<label class="quiz-option-row"><input type="radio" name="correct-'+i+'" value="'+j+'" '+(q.correct===j?'checked':'')+' aria-label="La risposta '+String.fromCharCode(65+j)+' è corretta"><input type="text" required maxlength="200" placeholder="Risposta '+String.fromCharCode(65+j)+'" value="'+esc(option)+'" aria-label="Risposta '+String.fromCharCode(65+j)+' della domanda '+(i+1)+'"></label>').join(''):'')+'</section>').join('')+'</div><div class="button-row"><button class="text-button" type="button" id="addQuestion" '+(g.questions.length===10?'disabled':'')+'>'+icon('plus')+'Un’altra domanda</button>'+(g.questions.length>1?'<button class="text-button" type="button" id="removeQuestion">Rimuovi l’ultima</button>':'')+'</div><button class="primary" type="submit">Salva il gioco</button></form>';
 $('addQuestion').onclick=()=>{captureGameDraft();gameDraft.questions.push({text:'',options:['','','',''],correct:0});renderGameBuilder();$('gameDialog').scrollTop=$('gameDialog').scrollHeight;};
 if($('removeQuestion'))$('removeQuestion').onclick=()=>{captureGameDraft();gameDraft.questions.pop();renderGameBuilder();};
 $('gameForm').onsubmit=async e=>{e.preventDefault();captureGameDraft();await withSave(e.submitter,async()=>{await addOp('game',uuid(),{title:gameDraft.title.trim(),type:gameDraft.type,questions:gameDraft.questions.map(q=>gameDraft.type==='quiz'?{text:q.text.trim(),options:q.options.map(v=>v.trim()),correct:q.correct}:{text:q.text.trim()})});$('gameDialog').close();navigate('giochi');toast('Il vostro gioco è pronto');});};
}
function startGame(id){const g=state.games.find(g=>g.id===id);if(!g)return;playSession={game:g,index:0,score:0,chosen:null,revealed:false,saved:false};renderGamePlay();$('gameDialog').showModal();}
function renderGamePlay(){
 const p=playSession,g=p.game;
 if(p.index>=g.questions.length){
  $('gameContent').innerHTML='<p class="eyebrow">'+esc(g.title)+'</p><h2>'+(g.type==='quiz'?'Ecco quanto ci conosciamo.':'Un po’ più vicini.')+'</h2>'+(g.type==='quiz'?'<div class="result-score">'+p.score+'<small> / '+g.questions.length+'</small></div><p class="game-note">Il risultato è stato salvato nel tuo diario.</p>':'<p class="muted">Le risposte restano nella vostra conversazione. Le domande vi aspettano qui, per un’altra volta.</p>')+'<button class="primary" id="finishGame">Torna ai nostri giochi</button>';
  $('finishGame').onclick=()=>$('gameDialog').close();return;
 }
 const q=g.questions[p.index],quiz=g.type==='quiz';
 $('gameContent').innerHTML='<p class="eyebrow">'+esc(g.title)+'</p><div class="game-progress"><span id="gameProgress"></span></div><p class="field-help">Domanda '+(p.index+1)+' di '+g.questions.length+'</p><h2 class="game-question">'+esc(q.text)+'</h2>'+((quiz||g.type==='truefalse')?'<div class="answer-options">'+(quiz?q.options:['Vero','Falso']).map((option,i)=>'<button class="answer-option'+(p.chosen===i?' selected':'')+(quiz&&p.revealed&&q.correct===i?' correct':'')+(quiz&&p.revealed&&p.chosen===i&&i!==q.correct?' wrong':'')+'" data-answer="'+i+'" '+(p.revealed?'disabled':'')+'><span>'+String.fromCharCode(65+i)+'</span>'+esc(option)+'</button>').join('')+'</div>':'<p class="muted">'+(g.type==='truthdare'?'Scegliete insieme se raccontarvi una verità o mettervi alla prova.':'Prendetevi il tempo di parlarne insieme.')+'</p>')+(quiz&&p.revealed?'<p class="notice">'+(p.chosen===q.correct?'Esatto!':'La risposta corretta è: '+esc(q.options[q.correct]))+'</p>':'')+'<button class="primary" id="nextQuestion" '+((quiz||g.type==='truefalse')&&p.chosen===null?'disabled':'')+'>'+(quiz&&!p.revealed?'Conferma risposta':p.index===g.questions.length-1?'Concludi':'Prossima domanda')+'</button>';
 $('gameProgress').style.width=((p.index+1)/g.questions.length*100)+'%';
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{p.chosen=Number(b.dataset.answer);renderGamePlay();});
 $('nextQuestion').onclick=async e=>{if(quiz&&!p.revealed){p.revealed=true;if(p.chosen===q.correct)p.score++;renderGamePlay();return;}
  await withSave(e.currentTarget,async()=>{if(quiz&&p.index===g.questions.length-1&&!p.saved){await addOp('game-result',g.id,{score:p.score,total:g.questions.length});p.saved=true;}p.index++;p.chosen=null;p.revealed=false;renderGamePlay();});
 };
}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('detailDialog').addEventListener('close',()=>{active=null;renderedActivity=null;});
$('linkIcon').innerHTML=icon('link');$('uploadIcon').innerHTML=icon('camera');
function completeBackup(){
 if(!accessPolicy||author!=='one'||!adminKey||!adminVault)throw Error('Configura e sblocca l’amministrazione per creare il backup completo');
 return new File([JSON.stringify({format:'tra-noi-v4',exportedAt:new Date().toISOString(),identity:{person:author},access:{policy:accessPolicy,vault:adminVault},ops})],'tra-noi-backup-'+localDay()+'-'+new Date().toISOString().slice(11,19).replaceAll(':','')+'.json',{type:'application/json'});
}
function downloadBackup(file){const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
$('export').onclick=async()=>withSave($('export'),async()=>{downloadBackup(completeBackup());toast('Copia preparata: salvala nella cartella dei backup sul Mac');});
$('shareBackup').onclick=async()=>withSave($('shareBackup'),async()=>{
 const file=completeBackup();
 if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Backup del diario'});}catch(e){if(e.name!=='AbortError')throw e;}}
 else{downloadBackup(file);toast('Copia preparata: puoi trasferire il file al Mac');}
});
$('importButton').onclick=()=>$('importFile').click();
$('importFile').onchange=async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 await withSave(e.target,async()=>{
  if(file.size>150*1024*1024)throw Error('Questa copia supera il limite di importazione di 150 MB');
  const data=JSON.parse(await file.text());if(!['tra-noi-v1','tra-noi-v2','tra-noi-v3','tra-noi-v4'].includes(data.format)||!Array.isArray(data.ops))throw Error('Formato di backup non riconosciuto');
  const policy=data.access?.policy?await DiaryAccess.matchPolicy(accessPolicy,data.access.policy):accessPolicy;
  for(const op of data.ops){validateOp(op);await DiaryAccess.authorize(op,policy);}
  for(const op of ops)await DiaryAccess.authorize(op,policy);
  const ids=new Set(ops.map(o=>o.id)),fresh=[];for(const op of data.ops){if(!ids.has(op.id)){ids.add(op.id);fresh.push(op);}}
  const vault=author==='one'?(adminVault||data.access?.vault||null):null;
  await new Promise((resolve,reject)=>{const tx=db.transaction(['ops','meta'],'readwrite');for(const op of fresh)tx.objectStore('ops').put(op);if(policy)tx.objectStore('meta').put({id:'administration',policy,vault});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
  accessPolicy=policy;adminVault=vault;ops.push(...fresh);render();renderLegacyProfiles();closePeer();if($('profileDialog').open)openProfile();
  toast('Backup recuperato. Il profilo di questo dispositivo resta '+personName()+'. Ricollega i diari per condividere il recupero.');
 });
};
document.addEventListener('visibilitychange',()=>{reportDiagnostic('visibility');if(!document.hidden)tickCounter();});
setInterval(tickCounter,1000);

const people=DiaryModel.people;
let profileMismatch=false,peerPerson='',syncStarted=false;
function personName(person=author){const p=state?.profiles?.[person]||people[person];return p?[p.firstName,p.lastName].filter(Boolean).join(' '):myName;}
function requestedPerson(){const p=new URL(location.href).searchParams.get('profilo');return Object.hasOwn(people,p)?p:null;}
function setInstallManifest(){
 if(!Object.hasOwn(people,author))return;
 const href='manifest-'+author+'.json';document.querySelector('link[rel="manifest"]').href=href;
 const url=new URL(location.href);url.searchParams.set('profilo',author);url.searchParams.delete('struttura');url.searchParams.delete('prova');history.replaceState(null,'',url);
}
async function choosePerson(person){
 if(!Object.hasOwn(people,person))throw Error('Scegli Persona 1 oppure Persona 2');
 if(accessPolicy&&person==='one'&&person!==author&&!adminKey)throw Error('Il profilo amministratore richiede la chiave protetta. Ripristina il backup su un dispositivo dedicato e sbloccalo con la password.');
 const legacy=author,alias=legacy&&!Object.hasOwn(people,legacy)&&ops.some(o=>o.author===legacy)&&!Object.hasOwn(people,DiaryModel.resolveAuthor(legacy,ops))?{id:uuid(),kind:'identity',activity:'our-people',data:{legacy,person},author:person,name:personName(person),time:ops.reduce((n,o)=>Math.max(n,o.time+1),Date.now())}:null;
 if(alias){validateOp(alias);await DiaryAccess.authorize(alias,accessPolicy);}
 await new Promise((resolve,reject)=>{const tx=db.transaction(['meta','ops'],'readwrite');tx.objectStore('meta').put({id:'identity',person});if(alias)tx.objectStore('ops').put(alias);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
 if(alias)ops.push(alias);closePeer();if(person!=='one')adminKey=null;author=person;myName=personName(person);
 settingsStorage.setItem('diary-author',author);settingsStorage.setItem('diary-person',author);settingsStorage.setItem('diary-name',myName);
 profileMismatch=false;setInstallManifest();render();updateInstallUI();
 if($('identityDialog').open)$('identityDialog').close();
}
function openIdentityPicker(){
 $('identityCancel').hidden=!Object.hasOwn(people,author);
 $('identityOptions').innerHTML=Object.values(people).map(base=>{const p=state.profiles[base.id]||base;return '<button class="person-choice" data-person="'+p.id+'"><span class="avatar">'+esc(p.firstName[0])+'</span><span><strong>'+esc(p.firstName+' '+p.lastName)+'</strong><small>Il diario su questo dispositivo sarà suo.</small></span>'+icon('right','chevron')+'</button>';}).join('');
 $('identityDialog').showModal();
}
$('identityOptions').onclick=async e=>{const button=e.target.closest('[data-person]');if(button)await withSave(button,()=>choosePerson(button.dataset.person));};
$('identityDialog').addEventListener('cancel',e=>{if(!Object.hasOwn(people,author))e.preventDefault();});
function updateInstallUI(){
 const offline=DiaryOffline.status,p=people[author],installed=DiaryOffline.isInstalled(),label=p?personName():'Profilo da scegliere';
 $('offlineStatus').textContent=offline.message;
 $('offlineStatus').dataset.ready=String(offline.ready);
 $('offlineSummary').textContent=offline.ready?(installed?'Disponibile offline':'Copia locale pronta'):offline.phase==='insecure'?'Installazione da completare':'Preparazione offline';
 $('deviceOwner').textContent=label+(accessPolicy?(author==='one'?' · Amministratore':' · Utente'):'');
 $('installExplanation').textContent=profileMismatch?'Questo diario appartiene a '+label+'. Il link dell’altro profilo non cambia l’identità già assegnata.':installed?'Questa è l’app sulla Home. Puoi consultare ciò che è già salvato anche senza Mac e senza rete.':'Per installarlo sull’iPhone, aggiungilo alla schermata Home, aprilo dall’icona con Internet disponibile e attendi “Pronto offline su questo iPhone”.';
 $('retryOffline').hidden=offline.ready;$('reloadDiary').hidden=offline.phase!=='error';
 $('setupLink').href='installazione.html';
 $('installGuideLink').href='installazione.html';
 if(p)$('profileButton').setAttribute('aria-label','Profilo di '+personName());
}
window.addEventListener('diary-offline',event=>{updateInstallUI();if(window.diaryBoot.ready)reportDiagnostic('offline-state',{phase:event.detail.phase});});
$('retryOffline').onclick=()=>DiaryOffline.start();
$('reloadDiary').onclick=()=>location.reload();
$('changePerson').onclick=()=>{$('profileDialog').close();openIdentityPicker();};
async function adoptPolicy(policy){
 const checked=await DiaryAccess.matchPolicy(accessPolicy,policy);
 if(accessPolicy)return;
 for(const op of ops)await DiaryAccess.authorize(op,checked);
 await store('meta',{id:'administration',policy:checked,vault:null});accessPolicy=checked;adminVault=null;updateAdministrationUI();
}
function updateAdministrationUI(){
 const ownAdmin=author==='one',unlocked=ownAdmin&&!!adminKey,configured=!!accessPolicy;
 $('administrationStatus').textContent=!configured?'Amministrazione da configurare sul telefono principale.':ownAdmin?(unlocked?'Amministratore sbloccato su questo dispositivo.':'Amministratore bloccato. La password serve per modificare i profili ed esportare il backup.'):'Profilo utente. Puoi modificare il tuo profilo; quello dell’amministratore è protetto.';
 $('setupAdministration').hidden=configured||!ownAdmin;
 $('unlockAdministration').hidden=!configured||!ownAdmin||unlocked||!adminVault;
 $('lockAdministration').hidden=!unlocked;
 $('recoverAdminNote').hidden=!configured||!ownAdmin||!!adminVault;
 $('partnerPhotoLabel').hidden=!unlocked;
 $('changePerson').disabled=configured;
 const ownLocked=ownAdmin&&configured&&!unlocked;
 for(const id of ['firstNameInput','lastNameInput','profilePhoto'])$(id).disabled=ownLocked;
 for(const id of ['partnerFirstName','partnerLastName'])$(id).disabled=!unlocked;
 $('otherDeviceHelp').textContent=unlocked?'Puoi modificare entrambi i nomi. I profili saranno trasferiti al collegamento successivo e non vengono pubblicati sul sito.':'Puoi modificare soltanto il tuo profilo. Il telefono dell’altra persona mantiene i propri dati e permessi.';
 $('export').hidden=!unlocked;$('shareBackup').hidden=!unlocked;
 $('backupHelp').textContent='Il backup completo comprende i contributi di entrambi presenti su questo iPhone e la chiave amministratore protetta dalla password. Sincronizza prima i diari, poi salva il file sul Mac. I contenuti del backup sono leggibili: conservalo come le tue foto private. Il Mac non deve restare collegato.';
 $('deviceOwner').textContent=personName()+(configured?(ownAdmin?' · Amministratore':' · Utente'):'');
}
$('setupAdministration').onclick=()=>{ $('accessPassword').value='';$('accessPasswordAgain').value='';$('accessConfirmLabel').hidden=false;$('accessPasswordAgain').required=true;$('accessTitle').textContent='Proteggi l’amministrazione';$('accessExplanation').textContent='Scegli una password di almeno 10 caratteri. Resterà su questo dispositivo soltanto la chiave cifrata. Conserva la password: non esiste un servizio che possa recuperarla.';$('accessForm').dataset.mode='setup';$('accessDialog').showModal();};
$('unlockAdministration').onclick=()=>{ $('accessPassword').value='';$('accessConfirmLabel').hidden=true;$('accessPasswordAgain').required=false;$('accessTitle').textContent='Sblocca amministrazione';$('accessExplanation').textContent='Lo sblocco vale per questa apertura del diario. La password non viene inviata ad altri dispositivi.';$('accessForm').dataset.mode='unlock';$('accessDialog').showModal();};
$('lockAdministration').onclick=()=>{adminKey=null;updateAdministrationUI();toast('Amministrazione bloccata');};
$('accessForm').onsubmit=async e=>{e.preventDefault();await withSave(e.submitter,async()=>{
 const password=$('accessPassword').value;
 if($('accessForm').dataset.mode==='setup'){
  if(accessPolicy||author!=='one')throw Error('Configurazione non disponibile');
  if(password!==$('accessPasswordAgain').value)throw Error('Le password non coincidono');
  const created=await DiaryAccess.create(password,ops);
  await store('meta',{id:'administration',policy:created.policy,vault:created.vault});
  accessPolicy=created.policy;adminVault=created.vault;adminKey=created.key;closePeer();
 }else adminKey=await DiaryAccess.unlock(password,adminVault,accessPolicy);
 $('accessPassword').value='';$('accessPasswordAgain').value='';$('accessDialog').close();updateAdministrationUI();toast('Amministrazione sbloccata. Ora puoi preparare i due profili.');
});};
function renderLegacyProfiles(){
 const unresolved=[...new Set(ops.map(o=>o.author))].filter(id=>!Object.hasOwn(people,id)&&DiaryModel.resolveAuthor(id,ops)===id);
 $('legacyProfiles').hidden=!unresolved.length;
 $('legacyOptions').innerHTML=unresolved.map((id,i)=>'<label>'+esc(ops.findLast(o=>o.author===id)?.name||'Profilo precedente')+'<select data-legacy="'+esc(id)+'"><option value="">Lascia separato</option><option value="one">Persona 1</option><option value="two">Persona 2</option></select></label>').join('');
}
$('saveLegacy').onclick=async()=>withSave($('saveLegacy'),async()=>{for(const node of document.querySelectorAll('[data-legacy]'))if(node.value)await addOp('identity','our-people',{legacy:node.dataset.legacy,person:node.value},node.value);renderLegacyProfiles();toast('Contributi associati ai profili scelti');});

let photoViewerItems=[],photoViewerIndex=0;
function openPhotoViewer(id){
 const memory=state.memories.find(m=>m.id===active);photoViewerItems=(memory?.media||[]).filter(m=>m.type.startsWith('image/'));
 photoViewerIndex=photoViewerItems.findIndex(m=>m.id===id);if(photoViewerIndex<0)return;
 $('photoStrip').innerHTML=photoViewerItems.map(m=>'<figure class="photo-slide"><img src="'+esc(m.url)+'" alt="'+esc(m.name)+'" draggable="false"></figure>').join('');
 $('photoViewer').showModal();$('photoStrip').scrollTo({left:photoViewerIndex*$('photoStrip').clientWidth,behavior:'instant'});updatePhotoPosition();
}
function updatePhotoPosition(){
 photoViewerIndex=Math.max(0,Math.min(photoViewerItems.length-1,Math.round($('photoStrip').scrollLeft/Math.max(1,$('photoStrip').clientWidth))));
 $('photoPosition').textContent=(photoViewerIndex+1)+' / '+photoViewerItems.length;
 $('previousPhoto').disabled=photoViewerIndex<=0;$('nextPhoto').disabled=photoViewerIndex>=photoViewerItems.length-1;
}
function movePhoto(delta){const index=Math.max(0,Math.min(photoViewerItems.length-1,photoViewerIndex+delta));$('photoStrip').scrollTo({left:index*$('photoStrip').clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('photoStrip').addEventListener('scroll',updatePhotoPosition,{passive:true});
$('previousPhoto').onclick=()=>movePhoto(-1);$('nextPhoto').onclick=()=>movePhoto(1);
$('photoViewer').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();movePhoto(e.key==='ArrowLeft'?-1:1);}});
$('photoViewer').addEventListener('close',()=>{$('photoStrip').replaceChildren();photoViewerItems=[];});
let pageTouch=null;
$('view').addEventListener('touchstart',e=>{
 pageTouch=null;
 if(e.touches.length!==1||document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,a,[contenteditable],.chips,.collection-tabs,.calendar,.gallery,.answer-options'))return;
 const touch=e.touches[0];if(touch.clientX<24||touch.clientX>innerWidth-24)return;
 clearPageMotion();pageTouch={x:touch.clientX,y:touch.clientY,time:performance.now(),view,top:$('view').scrollTop,dx:0,next:null};
},{passive:true});
$('view').addEventListener('touchmove',e=>{
 const start=pageTouch;if(!start)return;
 if(e.touches.length!==1){pageTouch=null;clearPageMotion();return;}
 const touch=e.touches[0],dx=touch.clientX-start.x,dy=touch.clientY-start.y;
 if(Math.abs(dy)>Math.abs(dx)&&!start.next){pageTouch=null;return;}
 if(Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy)*1.3||Math.abs($('view').scrollTop-start.top)>12)return;
 const index=DiaryInteraction.pages.indexOf(view),next=DiaryInteraction.pages[index+(dx<0?1:-1)];
 if(!next)return;
 if(start.next!==next){pageGhost?.remove();pageGhost=reducedMotion()?null:pageSnapshot(next);start.next=next;}
 start.dx=Math.max(-$('pageStage').clientWidth,Math.min($('pageStage').clientWidth,dx));
 if(!reducedMotion()){$('view').style.transform='translate3d('+start.dx+'px,0,0)';if(pageGhost)pageGhost.style.transform='translate3d('+((dx<0?1:-1)*$('pageStage').clientWidth+start.dx)+'px,0,0)';}
 if(e.cancelable)e.preventDefault();
},{passive:false});
function resetPageDrag(start){
 if(!start?.next||reducedMotion()){clearPageMotion();return;}
 const token=motionToken,width=$('pageStage').clientWidth,direction=start.dx<0?1:-1,timing={duration:180,easing:'ease-out',fill:'both'};
 pageAnimations=[$('view').animate([{transform:'translate3d('+start.dx+'px,0,0)'},{transform:'translate3d(0,0,0)'}],timing)];
 if(pageGhost)pageAnimations.push(pageGhost.animate([{transform:'translate3d('+(direction*width+start.dx)+'px,0,0)'},{transform:'translate3d('+(direction*width)+'px,0,0)'}],timing));
 Promise.all(pageAnimations.map(a=>a.finished)).then(()=>{if(token===motionToken)clearPageMotion();}).catch(()=>{});
}
$('view').addEventListener('touchcancel',()=>{const start=pageTouch;pageTouch=null;resetPageDrag(start);},{passive:true});
$('view').addEventListener('touchend',e=>{
 const start=pageTouch;pageTouch=null;
 if(!start||!e.changedTouches.length||view!==start.view)return;
 const touch=e.changedTouches[0],next=DiaryInteraction.swipePage(view,start,{x:touch.clientX,y:touch.clientY,time:performance.now()});
 if(next&&Math.abs($('view').scrollTop-start.top)<=12){if(e.cancelable)e.preventDefault();navigate(next,{dragOffset:reducedMotion()?0:start.dx});}
 else{if(start.next&&e.cancelable)e.preventDefault();resetPageDrag(start);}
},{passive:false});
for(const event of ['gesturestart','gesturechange'])document.addEventListener(event,e=>e.preventDefault(),{passive:false});
document.addEventListener('touchmove',e=>{if(e.touches.length>1&&e.cancelable)e.preventDefault();},{passive:false});
init().catch(e=>{const node=$('bootStatus');node.hidden=false;node.textContent='Archivio non disponibile: '+e.message;toast('Archivio non disponibile: '+e.message);});
