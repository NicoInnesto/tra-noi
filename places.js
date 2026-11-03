'use strict';
let placesFolder=null,placesMode='explore',placeEditing=null,folderEditing=null,placePhotos=[],placeCommentEditing=null,placeActive=null;
const placeMoney=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'});
function placePost(id){return state.places.posts.find(p=>p.id===id);}
function placeTotal(p){const values=p.kind==='trip'?[p.budget.travel,p.budget.stay,p.budget.extra]:[p.budget.expected];return values.every(v=>v===null)?null:values.reduce((a,b)=>a+(b||0),0);}
function placePrice(p){const total=placeTotal(p);return total===null?'Costo da definire':placeMoney.format(total/100);}
function renderPlaces(){
 const folders=state.places.folders,folder=folders.find(f=>f.id===placesFolder);
 if(placesFolder&&!folder)placesFolder=null;
 const manage=placesMode==='manage',posts=state.places.posts.filter(p=>p.folder===placesFolder);
 const top='<button class="text-button back-link" '+(folder?'data-place-back':'data-view="home"')+'>'+icon('left')+(folder?'Le cartelle':'Home')+'</button><div class="page-heading"><p class="eyebrow">LE PROSSIME COSE BELLE</p><h1>'+(folder?esc(folder.title):'Dove <em>andiamo?</em>')+'</h1><p>'+(folder?'Le nostre alternative, da scegliere insieme':'Un posto nuovo, una piccola idea, qualcosa da vivere insieme')+'</p></div><div class="place-modes"><button data-place-mode="explore" class="'+(!manage?'active':'')+'">Esplora</button><button data-place-mode="manage" class="'+(manage?'active':'')+'">Le nostre proposte</button></div>';
 if(!folder)return '<section class="places-page">'+top+'<button class="secondary" data-place-new-folder>'+icon('plus')+'Nuova cartella</button><div class="place-folders">'+folders.map(f=>{const list=state.places.posts.filter(p=>p.folder===f.id),cover=list.find(p=>p.photos.length)?.photos[0];return '<article class="place-folder"><button class="place-folder-open" data-place-folder="'+esc(f.id)+'">'+(cover?'<img loading="lazy" decoding="async" src="'+esc(cover.url)+'" alt="">':'<span class="place-folder-symbol">'+icon('pin')+'</span>')+'<span><strong>'+esc(f.title)+'</strong><small>'+list.length+' '+(list.length===1?'proposta':'proposte')+'</small></span>'+icon('right')+'</button>'+(manage?'<div class="place-folder-tools"><button class="text-button" data-place-rename-folder="'+esc(f.id)+'">Rinomina</button><button class="text-button danger-button" data-place-delete-folder="'+esc(f.id)+'">Elimina</button></div>':'')+'</article>';}).join('')+'</div>'+(!folders.length?'<p class="muted place-empty">Create una cartella per raccogliere le prime idee</p>':'')+'</section>';
 return '<section class="places-page">'+top+'<button class="primary place-add" data-place-new-post>'+icon('plus')+'Nuova proposta</button>'+(posts.length?'<div class="'+(manage?'place-management':'place-feed')+'" data-places-feed>'+posts.map(p=>manage?'<article class="place-manage-card">'+(p.photos[0]?'<img loading="lazy" src="'+esc(p.photos[0].url)+'" alt="">':'<span>'+icon('pin')+'</span>')+'<div><h2>'+esc(p.title)+'</h2><p>'+esc(placePrice(p))+'</p><small>Proposta di '+esc(displayName(p.author))+'</small><div class="button-row"><button class="text-button" data-place-open="'+esc(p.id)+'">Apri</button>'+(p.author===author?'<button class="text-button" data-place-edit="'+esc(p.id)+'">Modifica</button><button class="text-button danger-button" data-place-delete="'+esc(p.id)+'">Elimina</button>':'')+'</div></div></article>':renderPlaceFeedPost(p)).join('')+'</div>':'<p class="muted place-empty">La prima proposta la scegliete voi</p>')+'</section>';
}
function renderPlaceFeedPost(p){
 const liked=p.likes.includes(author);
 return '<article class="place-feed-card"><button class="place-feed-photo" data-place-open="'+esc(p.id)+'" aria-label="Apri '+esc(p.title)+'">'+(p.photos[0]?'<img loading="lazy" decoding="async" src="'+esc(p.photos[0].url)+'" alt="'+esc(p.title)+'">':'<span>'+icon('pin')+'</span>')+(p.photos.length>1?'<span class="place-photo-count">'+p.photos.length+' foto</span>':'')+'</button><div class="place-feed-copy"><small>Proposta di '+esc(displayName(p.author))+'</small><button class="place-post-title" data-place-open="'+esc(p.id)+'"><h2>'+esc(p.title)+'</h2></button><p class="place-feed-description">'+esc(p.description)+'</p><strong class="place-price">'+esc(placePrice(p))+'<small> totale previsto</small></strong><div class="place-social"><button class="'+(liked?'is-liked':'')+'" data-place-like="'+esc(p.id)+'" aria-pressed="'+liked+'" aria-label="'+(liked?'Togli mi piace':'Mi piace')+' a '+esc(p.title)+'">'+icon('heart')+'<span>'+p.likes.length+'</span></button><button data-place-comments="'+esc(p.id)+'">'+icon('chat')+'<span>'+p.comments.length+'</span><span>'+(p.comments.length===1?'Commento':'Commenti')+'</span></button></div><p class="place-likes">'+(p.likes.length===2?'Piace a entrambi':p.likes.length?'Piace a '+esc(displayName(p.likes[0])):'')+'</p></div></article>';
}
function openPlaceFolder(id=null){
 folderEditing=id;const f=state.places.folders.find(f=>f.id===id);
 $('placeFolderName').value=f?.title||'';$('placeFolderHeading').textContent=f?'Rinomina cartella':'Una nuova cartella';$('placeFolderDialog').showModal();
}
function openPlaceEditor(id=null){
 const p=placePost(id);if(p&&p.author!==author)return;
 placeEditing=p?.id||null;placePhotos=(p?.photos||[]).map(m=>({...m}));
 $('placePostForm').reset();$('placePostHeading').textContent=p?'Modifica proposta':'Una nuova proposta';
 $('placePostTitle').value=p?.title||'';$('placePostDescription').value=p?.description||'';$('placePostKind').value=p?.kind||'restaurant';
 $('placePostFolder').innerHTML=state.places.folders.map(f=>'<option value="'+esc(f.id)+'">'+esc(f.title)+'</option>').join('');
 $('placePostFolder').value=p?.folder||placesFolder||state.places.folders[0]?.id;
 for(const k of ['expected','travel','stay','extra'])$('placeCost-'+k).value=p?.budget[k]===null||p?.budget[k]===undefined?'':String(p.budget[k]/100);
 updatePlaceBudget();renderPlacePhotoDrafts();$('placePostEditor').showModal();
}
function updatePlaceBudget(){
 const trip=$('placePostKind').value==='trip';
 $('placeExpectedCost').hidden=trip;$('placeTripCosts').hidden=!trip;
 const values=(trip?['travel','stay','extra']:['expected']).map(k=>$('placeCost-'+k).value);
 const sum=values.reduce((n,v)=>n+Math.round(Number(v||0)*100),0);
 $('placeBudgetTotal').textContent=values.every(v=>v==='')?'Costo da definire':placeMoney.format(sum/100)+' totali';
}
function renderPlacePhotoDrafts(){
 $('placePhotoDrafts').innerHTML=placePhotos.map((p,i)=>'<figure><img src="'+esc(p.url)+'" alt="Foto '+(i+1)+'"><button type="button" class="text-button danger-button" data-place-remove-draft="'+i+'">Elimina foto</button></figure>').join('');
}
function openPlaceDetail(id,comments=false){
 placeActive=id;placeCommentEditing=null;$('placeCommentBody').value='';refreshPlacesDetail();
 if(!placePost(id))return;
 if(!$('placeDetailDialog').open)$('placeDetailDialog').showModal();
 if(comments)requestAnimationFrame(()=>$('placeComments').scrollIntoView({block:'start',behavior:'smooth'}));
}
function refreshPlacesDetail(){
 if(!placeActive)return;
 const p=placePost(placeActive);
 if(!p){if($('placeDetailDialog').open)$('placeDetailDialog').close();return;}
 const rows=p.kind==='trip'?[['Viaggio',p.budget.travel],['Alloggio',p.budget.stay],['Extra',p.budget.extra]]:[['Costo previsto',p.budget.expected]];
 $('placeDetailContent').innerHTML='<p class="eyebrow">PROPOSTA DI '+esc(displayName(p.author))+'</p><h2>'+esc(p.title)+'</h2>'+(p.photos.length?'<div class="place-gallery" aria-label="Foto della proposta">'+p.photos.map(m=>'<button data-place-photo="'+esc(m.id)+'" aria-label="Apri foto"><img loading="lazy" src="'+esc(m.url)+'" alt="'+esc(m.name)+'"></button>').join('')+'</div>':'')+'<p class="place-detail-description">'+esc(p.description)+'</p><div class="place-costs">'+rows.map(([label,value])=>'<p><span>'+label+'</span><strong>'+(value===null?'Da definire':placeMoney.format(value/100))+'</strong></p>').join('')+'<p class="place-cost-total"><span>Totale previsto</span><strong>'+esc(placePrice(p))+'</strong></p></div><button class="secondary '+(p.likes.includes(author)?'is-liked':'')+'" data-place-like="'+esc(p.id)+'" aria-pressed="'+p.likes.includes(author)+'">'+icon('heart')+(p.likes.includes(author)?'Ti piace':'Mi piace')+'</button>'+(p.author===author?'<button class="text-button place-detail-edit" data-place-edit="'+esc(p.id)+'">Modifica proposta</button>':'');
 $('placeCommentList').innerHTML=p.comments.map(c=>'<article class="place-comment"><strong>'+esc(displayName(c.author))+'</strong><p>'+esc(c.body)+'</p>'+(c.author===author?'<div class="button-row"><button class="text-button" data-place-edit-comment="'+esc(c.id)+'">Modifica</button><button class="text-button danger-button" data-place-delete-comment="'+esc(c.id)+'">Elimina</button></div>':'')+'</article>').join('')||'<p class="muted">Che ne pensi di questa proposta?</p>';
 $('placeCommentSave').textContent=placeCommentEditing?'Salva modifica':'Invia commento';
 $('placeCommentCancel').hidden=!placeCommentEditing;
}
function initPlaces(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-place-new-folder'))return openPlaceFolder();
  if(b.dataset.placeRenameFolder)return openPlaceFolder(b.dataset.placeRenameFolder);
  if(b.dataset.placeFolder){placesFolder=b.dataset.placeFolder;render();$('view').scrollTop=0;return;}
  if(b.hasAttribute('data-place-back')){placesFolder=null;render();$('view').scrollTop=0;return;}
  if(b.dataset.placeMode){placesMode=b.dataset.placeMode;render();return;}
  if(b.hasAttribute('data-place-new-post'))return openPlaceEditor();
  if(b.dataset.placeEdit)return openPlaceEditor(b.dataset.placeEdit);
  if(b.dataset.placePhoto){const p=placePost(placeActive);if(p)openMediaViewer(p.photos.map(m=>({...m,type:'image/jpeg'})),b.dataset.placePhoto);return;}
  if(b.dataset.placeOpen)return openPlaceDetail(b.dataset.placeOpen);
  if(b.dataset.placeComments)return openPlaceDetail(b.dataset.placeComments,true);
  if(b.dataset.placeLike){const p=placePost(b.dataset.placeLike);if(p)withSave(b,()=>addOp('place-like',p.id,{liked:!p.likes.includes(author)}));return;}
  if(b.dataset.placeRemoveDraft!==undefined){placePhotos.splice(Number(b.dataset.placeRemoveDraft),1);renderPlacePhotoDrafts();return;}
  if(b.dataset.placeDelete){const p=placePost(b.dataset.placeDelete);if(p?.author===author)confirmRemoval('Eliminare questa proposta?','Foto, cuori e commenti della proposta saranno eliminati anche dall’altro account al prossimo scambio.',async()=>{await addOp('place-delete-post',p.id,{});});return;}
  if(b.dataset.placeDeleteFolder){const id=b.dataset.placeDeleteFolder;confirmRemoval('Eliminare questa cartella?','Saranno eliminate anche tutte le proposte contenute. La modifica verrà condivisa al prossimo collegamento.',()=>addOp('place-delete-folder',id,{}));return;}
  if(b.dataset.placeEditComment){const c=placePost(placeActive)?.comments.find(c=>c.id===b.dataset.placeEditComment);if(c?.author===author){placeCommentEditing=c.id;$('placeCommentBody').value=c.body;refreshPlacesDetail();$('placeCommentBody').focus();}return;}
  if(b.dataset.placeDeleteComment){const c=placePost(placeActive)?.comments.find(c=>c.id===b.dataset.placeDeleteComment);if(c?.author===author)confirmRemoval('Eliminare il tuo commento?','La modifica verrà condivisa al prossimo scambio.',async()=>{await addOp('place-delete-comment',c.id,{});if(placeCommentEditing===c.id){placeCommentEditing=null;$('placeCommentBody').value='';refreshPlacesDetail();}});}
 });
 $('placeFolderForm').onsubmit=async e=>{e.preventDefault();await withSave(e.submitter,async()=>{const id=folderEditing||uuid();await addOp('place-folder',id,{title:$('placeFolderName').value.trim()});placesFolder=id;$('placeFolderDialog').close();render();});};
 $('placePostKind').onchange=updatePlaceBudget;
 for(const input of document.querySelectorAll('[data-place-cost]'))input.oninput=updatePlaceBudget;
 $('placePhotosInput').onchange=async e=>{const files=[...e.target.files];e.target.value='';await withSave($('placePostSave'),async()=>{for(const file of files){if(!file.type.startsWith('image/')&&!/\.(heic|heif)$/i.test(file.name))throw Error('Scegli un’immagine');if(file.size>20*1024*1024)throw Error('Scegli foto sotto i 20 MB');placePhotos.push({url:await mediaURL(file,1600),name:file.name});renderPlacePhotoDrafts();}});};
 $('placePostForm').onsubmit=async e=>{e.preventDefault();await withSave(e.submitter,async()=>{
  const budget={expected:null,travel:null,stay:null,extra:null},kind=$('placePostKind').value;
  for(const k of kind==='trip'?['travel','stay','extra']:['expected']){const raw=$('placeCost-'+k).value;budget[k]=raw===''?null:Math.round(Number(raw)*100);}
  const id=placeEditing||uuid(),folder=$('placePostFolder').value;
  if(!state.places.folders.some(f=>f.id===folder))throw Error('Questa cartella non esiste più');
  const old=placePost(id);await addOp('place-post',id,{folder,title:$('placePostTitle').value.trim(),description:$('placePostDescription').value.trim(),kind,budget});placeEditing=id;
  for(const photo of old?.photos||[])if(!placePhotos.some(p=>p.id===photo.id))await addOp('place-delete-photo',id,{mediaId:photo.id});
  for(const photo of placePhotos)if(!photo.id){const before=new Set(ops.map(o=>o.id));await addOp('place-photo',id,{url:photo.url,name:photo.name});photo.id=ops.find(o=>o.kind==='place-photo'&&o.activity===id&&!before.has(o.id))?.id;}
  placesFolder=folder;$('placePostEditor').close();render();toast('Proposta salvata');
 });};
 $('placeCommentForm').onsubmit=async e=>{e.preventDefault();await withSave(e.submitter,async()=>{const body=$('placeCommentBody').value.trim();if(!body||!placePost(placeActive))return;await addOp('place-comment',placeCommentEditing||uuid(),{post:placeActive,body});placeCommentEditing=null;$('placeCommentBody').value='';refreshPlacesDetail();});};
 $('placeCommentCancel').onclick=()=>{placeCommentEditing=null;$('placeCommentBody').value='';refreshPlacesDetail();};
 $('placeDetailDialog').addEventListener('close',()=>{placeActive=null;placeCommentEditing=null;$('placeCommentBody').value='';});
}
