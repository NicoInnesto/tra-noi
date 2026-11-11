'use strict';
let placesFolder=null,placesMode='explore',placeEditing=null,folderEditing=null,placePhotos=[],placeCommentEditing=null,placeActive=null,placeCommentPost=null,placeCommentReply=null;
const placeCommentDate=new Intl.DateTimeFormat('it-IT',{dateStyle:'medium'});
const placeMoney=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'});
function placePost(id){return state.places.posts.find(p=>p.id===id);}
function placeTotal(p){const values=p.kind==='trip'?[p.budget.travel,p.budget.stay,p.budget.extra]:[p.budget.expected];return values.every(v=>v===null)?null:values.reduce((a,b)=>a+(b||0),0);}
function placePrice(p){const total=placeTotal(p);return total===null?'Costo da definire':placeMoney.format(total/100);}
function placeFolderTitle(id){return state.places.folders.find(f=>f.id===id)?.title||'';}
function placeLikeLabel(p){return p.likes.length===2?'Piace a entrambi':p.likes.length?'Piace a '+displayName(p.likes[0]):'';}
function placeTabs(){
 return '<nav class="place-modes" aria-label="Esplora, sezioni">'+[['explore','compass','Esplora'],['manage','album','Cartelle'],['choices','heart','Preferiti']].map(([mode,ic,label])=>'<button data-place-mode="'+mode+'" class="'+(placesMode===mode?'active':'')+'" aria-pressed="'+(placesMode===mode)+'">'+icon(ic)+label+'</button>').join('')+'</nav>';
}
function renderPlaceFolder(f){
 const list=state.places.posts.filter(p=>p.folder===f.id),cover=list.find(p=>p.photos.length)?.photos[0];
 return '<article class="place-folder"><button class="place-folder-open" data-place-folder="'+esc(f.id)+'">'+(cover?'<img loading="lazy" decoding="async" src="'+esc(cover.url)+'" alt="">':'<span class="place-folder-symbol">'+icon('album')+'</span>')+'<span><strong>'+esc(f.title)+'</strong><small>'+list.length+' '+(list.length===1?'proposta':'proposte')+'</small></span>'+icon('right')+'</button><div class="place-folder-tools"><button class="text-button" data-place-explore-folder="'+esc(f.id)+'">'+icon('compass')+'Esplora</button><button class="text-button" data-place-rename-folder="'+esc(f.id)+'">Rinomina</button><button class="text-button danger-button" data-place-delete-folder="'+esc(f.id)+'">Elimina</button></div></article>';
}
function renderPlaceManagePost(p){
 return '<article class="place-manage-card">'+(p.photos[0]?'<img loading="lazy" src="'+esc(p.photos[0].url)+'" alt="">':'<span>'+icon('pin')+'</span>')+'<div><h2>'+esc(p.title)+'</h2><p>'+esc(placePrice(p))+'</p><small>Proposta di '+esc(displayName(p.author))+'</small><div class="button-row"><button class="text-button" data-place-open="'+esc(p.id)+'">Apri</button>'+(p.author===author?'<button class="text-button" data-place-edit="'+esc(p.id)+'">Modifica</button><button class="text-button danger-button" data-place-delete="'+esc(p.id)+'">Elimina</button>':'')+'</div></div></article>';
}
function renderPlaces(){
 const folders=state.places.folders,folder=folders.find(f=>f.id===placesFolder);
 if(placesFolder&&!folder)placesFolder=null;
 const posts=state.places.posts.filter(p=>!folder||p.folder===folder.id);
 const heading='<div class="place-page-heading"><p class="eyebrow">LE PROSSIME COSE BELLE</p><h1>Dove <em>andiamo?</em></h1></div>';
 if(placesMode==='explore'){
  const filter='<label class="place-feed-filter"><span class="sr-only">Cartella da esplorare</span><select id="placeFeedFilter"><option value="">Tutte le cartelle</option>'+folders.map(f=>'<option value="'+esc(f.id)+'" '+(placesFolder===f.id?'selected':'')+'>'+esc(f.title)+'</option>').join('')+'</select></label>';
  return '<section class="places-page places-explore"><h1 class="sr-only">Dove andiamo?</h1>'+placeTabs()+filter+(posts.length?'<div class="place-feed" data-places-feed data-feed-key="'+esc(placesFolder||'all')+'" aria-label="Proposte da scorrere">'+posts.map(renderPlaceFeedPost).join('')+'<div class="place-feed-end" data-feed-end><p>Sembra non ci sia altro</p></div></div>':'<div class="place-feed-empty">'+icon('compass')+'<h1>Dove andiamo?</h1><p>'+(folder?'Questa cartella aspetta la prima proposta':'Le prossime idee iniziano da una cartella')+'</p><button class="primary" data-place-mode="manage">Crea le nostre proposte</button></div>')+'</section>';
 }
 if(placesMode==='choices'){
  return '<section class="places-page">'+heading+placeTabs()+'<p class="place-choice-intro">Una scelta a testa, per ogni cartella</p><div class="place-choices">'+folders.map(f=>{
   const selected=state.places.posts.filter(p=>p.folder===f.id&&p.likes.length);
   return '<section class="place-choice-folder"><h2>'+esc(f.title)+'</h2>'+(selected.length?selected.map(p=>'<button class="place-choice-card '+(p.likes.length===2?'is-mutual':'')+'" data-place-open="'+esc(p.id)+'">'+(p.photos[0]?'<img loading="lazy" src="'+esc(p.photos[0].url)+'" alt="">':'<span class="place-choice-symbol">'+icon('pin')+'</span>')+'<span><strong>'+esc(p.title)+'</strong><small>'+icon('heart')+esc(placeLikeLabel(p))+'</small></span>'+icon('right')+'</button>').join(''):'<p class="muted">Ancora da scegliere</p>')+'</section>';
  }).join('')+'</div>'+(!folders.length?'<p class="muted place-empty">Qui ritroverete le vostre scelte</p>':'')+'</section>';
 }
 const top=heading+placeTabs();
 if(!folder)return '<section class="places-page">'+top+'<div class="place-section-heading"><h2>Le nostre cartelle</h2><button class="secondary" data-place-new-folder>'+icon('plus')+'Cartella</button></div><div class="place-folders">'+folders.map(renderPlaceFolder).join('')+'</div>'+(!folders.length?'<p class="muted place-empty">Create una cartella per raccogliere le prime idee</p>':'')+'</section>';
 return '<section class="places-page">'+top+'<button class="text-button back-link" data-place-back>'+icon('left')+'Le cartelle</button><div class="place-section-heading"><h2>'+esc(folder.title)+'</h2><button class="primary" data-place-new-post>'+icon('plus')+'Proposta</button></div><button class="text-button" data-place-explore-folder="'+esc(folder.id)+'">'+icon('compass')+'Esplora questa cartella</button><div class="place-management">'+posts.map(renderPlaceManagePost).join('')+'</div>'+(!posts.length?'<p class="muted place-empty">La prima proposta la scegliete voi</p>':'')+'</section>';
}
function renderPlaceFeedPost(p){
 const liked=p.likes.includes(author),title=esc(p.title);
 const media=p.photos.length?p.photos.map((m,i)=>'<button class="place-feed-slide" data-place-photo="'+esc(m.id)+'" data-place-post="'+esc(p.id)+'" aria-label="Apri foto '+(i+1)+' di '+title+'"><img loading="lazy" decoding="async" src="'+esc(m.url)+'" alt="'+title+'"></button>').join(''):'<button class="place-feed-slide place-feed-placeholder" data-place-open="'+esc(p.id)+'" aria-label="Apri '+title+'">'+icon('pin')+'</button>';
 return '<article class="place-feed-card" data-feed-post="'+esc(p.id)+'"><div class="place-feed-media" aria-label="Foto della proposta">'+media+'</div><div class="place-feed-copy"><span class="place-feed-folder">'+esc(placeFolderTitle(p.folder))+'</span><button class="place-post-title" data-place-open="'+esc(p.id)+'"><h2>'+title+'</h2></button><p class="place-feed-description">'+esc(p.description)+'</p><button class="place-price" data-place-open="'+esc(p.id)+'">'+esc(placePrice(p))+'<small> totale previsto · Dettagli</small></button><small class="place-proposed-by">Proposta di '+esc(displayName(p.author))+'</small><p class="place-likes">'+(p.likes.length===2?icon('heart'):'')+esc(placeLikeLabel(p))+'</p></div><div class="place-social"><button class="'+(liked?'is-liked':'')+'" data-place-like="'+esc(p.id)+'" aria-pressed="'+liked+'" aria-label="'+(liked?'Togli la tua scelta':'Scegli')+' '+title+'">'+icon('heart')+'<span>'+p.likes.length+'</span></button><button data-place-comments="'+esc(p.id)+'" aria-label="Commenti su '+title+'">'+icon('chat')+'<span>'+p.comments.length+'</span></button></div>'+(p.photos.length>1?'<span class="place-photo-count">'+p.photos.length+' foto · scorri ↔</span>':'')+'</article>';
}
// Reuse mounted photo strips when only choices or comments change during a connection.
let placesPageFrame=null;
function updatePlacesView(markup){
 const root=$('view'),template=document.createElement('template');template.innerHTML=markup;
 const nextFeed=template.content.querySelector('[data-places-feed]'),feed=root.querySelector('[data-places-feed]');
 if(nextFeed){
  const cards=[...nextFeed.querySelectorAll('[data-feed-post]')];
  for(const card of cards)card.remove();
  const frame=template.innerHTML;
  if(feed&&placesPageFrame===frame){
   const old=new Map([...feed.querySelectorAll('[data-feed-post]')].map(n=>[n.dataset.feedPost,n]));
   const ids=new Set(cards.map(n=>n.dataset.feedPost));
   for(const [id,card]of old)if(!ids.has(id))card.remove();
   for(const [i,next]of cards.entries()){
    const card=old.get(next.dataset.feedPost)||next;
    if(card!==next)for(const selector of ['.place-feed-media','.place-feed-copy','.place-social','.place-photo-count']){
     const a=card.querySelector(selector),b=next.querySelector(selector);
     if(a?.outerHTML!==b?.outerHTML){if(a&&b)a.replaceWith(b);else if(a)a.remove();else if(b)card.append(b);}
    }
    if(feed.children[i]!==card)feed.insertBefore(card,feed.children[i]||null);
   }
   return;
  }
  placesPageFrame=frame;
 }else placesPageFrame=null;
 root.innerHTML=markup;
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
function openPlaceDetail(id){
 placeActive=id;refreshPlacesDetail();
 if(placePost(id)&&!$('placeDetailDialog').open)$('placeDetailDialog').showModal();
}
function refreshPlacesDetail(){
 if(!placeActive)return;
 const p=placePost(placeActive);
 if(!p){if($('placeDetailDialog').open)$('placeDetailDialog').close();return;}
 const rows=p.kind==='trip'?[['Viaggio',p.budget.travel],['Alloggio',p.budget.stay],['Extra',p.budget.extra]]:[['Costo previsto',p.budget.expected]];
 const markup='<p class="eyebrow">'+esc(placeFolderTitle(p.folder))+'</p><h2>'+esc(p.title)+'</h2>'+(p.photos.length?'<div class="place-gallery" aria-label="Foto della proposta">'+p.photos.map(m=>'<button data-place-photo="'+esc(m.id)+'" aria-label="Apri foto"><img loading="lazy" src="'+esc(m.url)+'" alt="'+esc(m.name)+'"></button>').join('')+'</div>':'')+'<p class="place-detail-description">'+esc(p.description)+'</p><div class="place-costs">'+rows.map(([label,value])=>'<p><span>'+label+'</span><strong>'+(value===null?'Da definire':placeMoney.format(value/100))+'</strong></p>').join('')+'<p class="place-cost-total"><span>Totale previsto</span><strong>'+esc(placePrice(p))+'</strong></p></div><div class="place-detail-social"><button class="secondary '+(p.likes.includes(author)?'is-liked':'')+'" data-place-like="'+esc(p.id)+'" aria-pressed="'+p.likes.includes(author)+'">'+icon('heart')+(p.likes.includes(author)?'La tua scelta':'Scegli questa proposta')+'</button><button class="secondary" data-place-comments="'+esc(p.id)+'">'+icon('chat')+'Commenti ('+p.comments.length+')</button></div><p class="place-likes">'+esc(placeLikeLabel(p))+'</p>'+(p.author===author?'<button class="text-button" data-place-edit="'+esc(p.id)+'">'+icon('pencil')+'Modifica proposta</button>':'');
 if($('placeDetailContent').innerHTML!==markup){const x=$('placeDetailContent').querySelector('.place-gallery')?.scrollLeft||0;$('placeDetailContent').innerHTML=markup;const gallery=$('placeDetailContent').querySelector('.place-gallery');if(gallery)gallery.scrollLeft=x;}
}
function resetPlaceCommentDraft(){
 placeCommentEditing=null;
 placeCommentReply=null;
 $('placeCommentBody').value='';
}
function openPlaceComments(id){
 if(!placePost(id))return;
 placeCommentPost=id;
 resetPlaceCommentDraft();
 $('placeCommentList').replaceChildren();
 refreshPlaceComments();
 $('placeCommentsDialog').showModal();
}
function renderPlaceComment(comment,parent){
 const id=esc(comment.id),date=new Date(comment.time);
 const timestamp=Number.isFinite(date.getTime())
  ?'<time datetime="'+date.toISOString()+'">'+esc(placeCommentDate.format(date))+'</time>'
  :'';
 const target=parent?'<span class="place-reply-to">in risposta a '+esc(displayName(parent.author))+'</span>':'';
 const actions=comment.author===author
  ?'<button type="button" class="text-button" data-place-edit-comment="'+id+'">Modifica</button><button type="button" class="text-button danger-button" data-place-delete-comment="'+id+'">Elimina</button>'
  :'';
 return '<article class="place-comment" data-place-comment="'+id+'">'+
  '<span class="place-comment-avatar" aria-hidden="true">'+avatar(state.profiles[comment.author])+'</span>'+
  '<div><strong>'+esc(displayName(comment.author))+'</strong>'+target+'<p>'+esc(comment.body)+'</p>'+
  '<div class="place-comment-actions">'+timestamp+
  '<button type="button" class="text-button" data-place-reply-comment="'+id+'">Rispondi</button>'+actions+
  '</div></div></article>';
}
function renderPlaceCommentThreads(comments,openThreads){
 // A reply follows the comment it references in the chronological list.
 const byId=new Map(),threadByComment=new Map(),threads=[];
 for(const comment of comments){
  const parentThread=threadByComment.get(comment.replyTo);
  if(parentThread){
   parentThread.replies.push({comment,parent:byId.get(comment.replyTo)});
   threadByComment.set(comment.id,parentThread);
  }else{
   const thread={root:comment,replies:[]};
   threads.push(thread);
   threadByComment.set(comment.id,thread);
  }
  byId.set(comment.id,comment);
 }
 return threads.map(({root,replies})=>{
  let markup='<section class="place-comment-thread">'+renderPlaceComment(root);
  if(replies.length){
   const expanded=openThreads.has(root.id)||replies.some(({comment})=>openThreads.has(comment.id));
   const label=replies.length===1?'Vedi 1 risposta':'Vedi '+replies.length+' risposte';
   markup+='<details class="place-comment-replies" data-place-thread="'+esc(root.id)+'"'+(expanded?' open':'')+'>'+
    '<summary><span class="place-replies-show">'+label+'</span><span class="place-replies-hide">Nascondi risposte</span></summary>'+
    replies.map(({comment,parent})=>renderPlaceComment(comment,parent)).join('')+'</details>';
  }
  return markup+'</section>';
 }).join('');
}
function refreshPlaceComments(revealReply){
 if(!placeCommentPost)return;
 const post=placePost(placeCommentPost);
 if(!post){
  if($('placeCommentsDialog').open)$('placeCommentsDialog').close();
  return;
 }
 $('placeCommentsTitle').textContent=post.comments.length+' '+(post.comments.length===1?'commento':'commenti');
 $('placeCommentsPost').textContent=post.title;
 const list=$('placeCommentList');
 const openThreads=new Set([...list.querySelectorAll('details[open][data-place-thread]')].map(node=>node.dataset.placeThread));
 if(revealReply)openThreads.add(revealReply);
 const markup=renderPlaceCommentThreads(post.comments,openThreads)||
  '<div class="place-comments-empty">'+icon('chat')+'<p>Che ne pensi di questa proposta?</p></div>';
 if(list.innerHTML!==markup)list.innerHTML=markup;
 if(revealReply){
  const reply=[...list.querySelectorAll('[data-place-comment]')].find(node=>node.dataset.placeComment===revealReply);
  reply?.scrollIntoView({block:'nearest'});
 }
 if(placeCommentEditing&&!post.comments.some(comment=>comment.id===placeCommentEditing))resetPlaceCommentDraft();
 const replyTarget=post.comments.find(comment=>comment.id===placeCommentReply);
 let context='';
 if(placeCommentEditing)context='Modifica commento';
 else if(placeCommentReply)context=replyTarget?'Rispondi a '+displayName(replyTarget.author):'Il commento originale è stato rimosso';
 $('placeCommentContext').hidden=!context;
 $('placeCommentContextLabel').textContent=context;
 $('placeCommentSave').textContent=placeCommentEditing?'Salva':'Invia';
 $('placeCommentBody').placeholder=placeCommentReply?'Scrivi una risposta…':'Scrivi un commento…';
}
async function togglePlaceChoice(id){
 const p=placePost(id);if(!p)return;
 await addOp('place-choice',p.folder,{post:p.likes.includes(author)?null:p.id});
}
let placeMatchOwner=null,placeMatchesReady=false,placeMatchSeen=new Set(),placeMatchQueue=[];
function placeMatchKey(p){
 if(p.likes.length!==2)return null;
 const votes=state.places.choices.filter(c=>c.post===p.id).sort((a,b)=>a.author.localeCompare(b.author));
 return JSON.stringify([p.id,...votes.map(c=>c.id)]);
}
function savePlaceMatchSeen(){try{settingsStorage.setItem('place-matches-'+author,JSON.stringify([...placeMatchSeen].slice(-1000)));}catch{}}
function observePlaceMatches(){
 const matches=state.places.posts.filter(p=>p.likes.length===2);
 if(!placeMatchesReady||placeMatchOwner!==author){
  placeMatchOwner=author;placeMatchQueue=[];
  try{placeMatchSeen=new Set(JSON.parse(settingsStorage.getItem('place-matches-'+author)||'[]'));}catch{placeMatchSeen=new Set();}
  for(const p of matches)placeMatchSeen.add(placeMatchKey(p));
  placeMatchesReady=true;savePlaceMatchSeen();return;
 }
 for(const p of matches){const key=placeMatchKey(p);if(!placeMatchSeen.has(key)&&!placeMatchQueue.some(q=>q.key===key))placeMatchQueue.push({key,id:p.id});}
 placeMatchQueue=placeMatchQueue.filter(q=>placeMatchKey(placePost(q.id)||{likes:[]})===q.key);
 showNextPlaceMatch();
}
function showNextPlaceMatch(){
 const dialog=document.querySelector('dialog[open]');
 if(view!=='posti'||$('placeMatchDialog').open||dialog&&dialog.id!=='placeDetailDialog'||!placeMatchQueue.length)return;
 const match=placeMatchQueue.shift(),p=placePost(match.id);
 if(!p||placeMatchKey(p)!==match.key)return showNextPlaceMatch();
 placeMatchSeen.add(match.key);savePlaceMatchSeen();
 $('placeMatchNames').textContent=displayName('one')+' e '+displayName('two');
 $('placeMatchPost').textContent=p.title;
 $('placeMatchFolder').textContent=placeFolderTitle(p.folder);
 $('placeMatchDialog').showModal();
}
function initPlaces(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-place-new-folder'))return openPlaceFolder();
  if(b.dataset.placeRenameFolder)return openPlaceFolder(b.dataset.placeRenameFolder);
  if(b.dataset.placeFolder){placesFolder=b.dataset.placeFolder;placesMode='manage';render();$('view').scrollTop=0;return;}
  if(b.dataset.placeExploreFolder){placesFolder=b.dataset.placeExploreFolder;placesMode='explore';render();return;}
  if(b.hasAttribute('data-place-back')){placesFolder=null;render();$('view').scrollTop=0;return;}
  if(b.dataset.placeMode){placesMode=b.dataset.placeMode;render();$('view').scrollTop=0;return;}
  if(b.hasAttribute('data-place-new-post'))return openPlaceEditor();
  if(b.dataset.placeEdit)return openPlaceEditor(b.dataset.placeEdit);
  if(b.dataset.placePhoto){const p=placePost(b.dataset.placePost||placeActive);if(p)openMediaViewer(p.photos.map(m=>({...m,type:'image/jpeg'})),b.dataset.placePhoto);return;}
  if(b.dataset.placeOpen)return openPlaceDetail(b.dataset.placeOpen);
  if(b.dataset.placeComments)return openPlaceComments(b.dataset.placeComments);
  if(b.dataset.placeLike){withSave(b,()=>togglePlaceChoice(b.dataset.placeLike));return;}
  if(b.dataset.placeRemoveDraft!==undefined){placePhotos.splice(Number(b.dataset.placeRemoveDraft),1);renderPlacePhotoDrafts();return;}
  if(b.dataset.placeDelete){const p=placePost(b.dataset.placeDelete);if(p?.author===author)confirmRemoval('Eliminare questa proposta?','Foto, cuori e commenti della proposta saranno eliminati anche dall’altro account al prossimo scambio.',async()=>{await addOp('place-delete-post',p.id,{});});return;}
  if(b.dataset.placeDeleteFolder){const id=b.dataset.placeDeleteFolder;confirmRemoval('Eliminare questa cartella?','Saranno eliminate anche tutte le proposte contenute. La modifica verrà condivisa al prossimo collegamento.',()=>addOp('place-delete-folder',id,{}));return;}
  if(b.dataset.placeReplyComment){
   const target=placePost(placeCommentPost)?.comments.find(comment=>comment.id===b.dataset.placeReplyComment);
   if(!target)return;
   if(placeCommentEditing)resetPlaceCommentDraft();
   placeCommentReply=target.id;
   refreshPlaceComments();
   $('placeCommentBody').focus();
   return;
  }
  if(b.dataset.placeEditComment){
   const comment=placePost(placeCommentPost)?.comments.find(comment=>comment.id===b.dataset.placeEditComment);
   if(comment?.author!==author)return;
   placeCommentReply=null;
   placeCommentEditing=comment.id;
   $('placeCommentBody').value=comment.body;
   refreshPlaceComments();
   $('placeCommentBody').focus();
   return;
  }
  if(b.dataset.placeDeleteComment){const c=placePost(placeCommentPost)?.comments.find(c=>c.id===b.dataset.placeDeleteComment);if(c?.author===author)confirmRemoval('Eliminare il tuo commento?','La modifica verrà condivisa al prossimo scambio.',async()=>{await addOp('place-delete-comment',c.id,{});if(placeCommentEditing===c.id){placeCommentEditing=null;$('placeCommentBody').value='';refreshPlaceComments();}});}
 });
 $('placeFolderForm').onsubmit=async e=>{e.preventDefault();await withSave(e.submitter,async()=>{const id=folderEditing||uuid();await addOp('place-folder',id,{title:$('placeFolderName').value.trim()});placesFolder=id;placesMode='manage';$('placeFolderDialog').close();render();});};
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
 $('placeCommentForm').onsubmit=async e=>{
  e.preventDefault();
  await withSave(e.submitter,async()=>{
   const input=$('placeCommentBody'),body=input.value.trim(),post=placePost(placeCommentPost);
   if(!body||!post)return;
   const editing=placeCommentEditing,replying=placeCommentReply;
   const original=post.comments.find(comment=>comment.id===editing);
   if(editing&&original?.author!==author)throw Error('Il commento non è più disponibile');
   if(replying&&!post.comments.some(comment=>comment.id===replying))throw Error('Il commento originale è stato rimosso');
   const id=editing||uuid(),data={post:post.id,body};
   const replyTo=original?.replyTo||replying;
   if(replyTo)data.replyTo=replyTo;
   await addOp('place-comment',id,data);
   if(placeCommentPost!==post.id)return;
   if(placeCommentEditing===editing&&placeCommentReply===replying&&input.value.trim()===body)resetPlaceCommentDraft();
   refreshPlaceComments(replyTo?id:null);
  });
 };
 $('placeCommentCancel').onclick=()=>{
  if(placeCommentEditing)resetPlaceCommentDraft();
  placeCommentReply=null;
  refreshPlaceComments();
 };
 $('placeDetailDialog').addEventListener('close',()=>{placeActive=null;});
 $('placeCommentsDialog').addEventListener('close',()=>{placeCommentPost=null;resetPlaceCommentDraft();});
 document.addEventListener('close',()=>setTimeout(showNextPlaceMatch,0),true);
 document.addEventListener('change',e=>{if(e.target.id==='placeFeedFilter'){placesFolder=e.target.value||null;render();}});
}
