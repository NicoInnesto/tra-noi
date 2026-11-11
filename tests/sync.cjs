'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {webcrypto}=require('node:crypto');
const Model=require(path.join(root,'model.js')),Access=require(path.join(root,'access.js'));
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const merge=source.slice(source.indexOf('function store(name,value)'),source.indexOf('async function init(){'));
const network=source.slice(source.indexOf('function transferError('),source.indexOf('async function description('));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let sequence=0;
function op(author,kind,activity,data){return {id:'test-'+(++sequence),author,name:'Test',time:Date.now()+sequence,kind,activity,data};}
function device(author,seed,policy,options={}){
 const tables={ops:new Map(seed.map(o=>[o.id,o])),acks:new Map(),meta:new Map()};
 const nodes=new Map(),errors=[],outgoing=[];
 const db={transaction(){
  const writes=[],tx={objectStore(name){return {put(value){if(name==='ops'&&options.failId===value.id)throw Error('Salvataggio fallito nella prova');writes.push(()=>tables[name].set(value.id,value));},delete(id){writes.push(()=>tables[name].delete(id));}};}};
  queueMicrotask(()=>{for(const write of writes)write();tx.oncomplete?.();});return tx;
 }};
 const context={DiaryModel:Model,DiaryAccess:Access,crypto:webcrypto,console,setTimeout:(fn,ms)=>setTimeout(fn,options.fastTimers&&ms===15000?200:ms),clearTimeout,clearInterval,db,author,
  $:id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',classList:{toggle(){}},querySelectorAll(){return []}});return nodes.get(id);},
  seed,policy,storeTables:tables,errors,outgoing,
  personName:()=>author,validateOp:Model.validateOp,reportDiagnostic(){},updatePartnerStatus(){},connection(){},closePeer(){},adoptPolicy:async()=>{},
  render(){},scheduleSyncRender(){},refreshSyncIndicators(){},toast(message){errors.push(message);}
 };
 vm.createContext(context);
 vm.runInContext("let ops=seed,acks=new Set(),preparedBackup=null,accessPolicy=policy,peerPerson='',syncStarted=false,channel,pollTimer,sendTail=Promise.resolve(),peerName='';const people=DiaryModel.people,sessionTicket='test-shared-ticket',WIRE_VERSION=43,transfers=new Map(),uuid=()=>crypto.randomUUID();",context);
 vm.runInContext(merge+network,context);
 const channel={readyState:'open',bufferedAmount:0,send(raw){outgoing.push(raw);}};
 context.testChannel=channel;vm.runInContext('bindChannel(testChannel);',context);
 return {context,channel,tables,errors,outgoing,
   frame(message){const value=JSON.stringify(message);for(let i=0;i<value.length;i+=12000)channel.onmessage({data:JSON.stringify({id:'frame-'+sequence+'-'+value.length,i:i/12000,count:Math.ceil(value.length/12000),chunk:value.slice(i,i+12000)})});sequence++;},
   state(){return vm.runInContext('({ops,acks:[...acks],peerPerson,syncStarted})',context);}
 };
}
async function waitUntil(test,label,timeout=2500){const start=Date.now();while(!test()){if(Date.now()-start>timeout)throw Error(label);await pause(5);}}
(async()=>{
 const common=op('one','create','memory',{section:'experiences',category:'Cinema',title:'Film di prova',date:''});
 const d=device('one',[common],null);d.channel.bufferedAmount=300000;
 d.frame({type:'hello-ok',protocol:43,inventory:[],ticket:'test-shared-ticket',person:'two',name:'Test 2'});
 await pause(20);
 const rating=op('two','rating','memory',{score:9.25,comment:'Voto ricevuto'});
 d.frame({type:'op',op:rating});
 d.frame({type:'ack',id:common.id});
 await pause(40);
 const receivedWhileBlocked=d.tables.ops.has(rating.id)&&d.tables.acks.has(common.id);
 d.channel.bufferedAmount=0;
 await waitUntil(()=>d.tables.ops.has(rating.id),'ricezione non ripresa');
 assert(receivedWhileBlocked,'La ricezione deve continuare anche quando il buffer di invio è pieno');
 await waitUntil(()=>d.outgoing.some(raw=>JSON.parse(raw).chunk.includes('sync-done')),'scambio iniziale non completato');
 assert.equal(Model.project(d.state().ops).memories[0].ratings.two.score,9.25);
 assert.equal(d.errors.length,0);
 console.log('PASS: ricezione e persistenza continuano con invio bloccato');
 const oldChannel=d.channel;oldChannel.bufferedAmount=300000;
 const stalled=vm.runInContext("send({type:'old-probe'}).then(()=>false,()=>true)",d.context);
 await pause(5);
 const newFrames=[],replacement={readyState:'open',bufferedAmount:0,send(raw){newFrames.push(raw);}};
 d.context.replacement=replacement;vm.runInContext('bindChannel(replacement);',d.context);
 await vm.runInContext("send({type:'new-probe'})",d.context);
 assert.equal(await stalled,true);assert.equal(newFrames.length,1);
 assert(JSON.parse(newFrames[0]).chunk.includes('new-probe'));
 console.log('PASS: ricollegamento indipendente dalla vecchia coda bloccata');
 const created=await Access.create('test-only-password',[]);
 const signed=await Access.sign({...op('one','profile','one',{firstName:'Test',lastName:'',photo:'',nickname:'T'}),actor:'one'},created.key);
 const left=[common,signed,op('one','media','memory',{url:'data:image/jpeg;base64,'+'A'.repeat(6*1024*1024),type:'image/jpeg',name:'a.jpg'}),op('one','rating','memory',{score:8.75,comment:'A'})];
 const right=[common,op('two','media','memory',{url:'data:image/jpeg;base64,'+'B'.repeat(6*1024*1024),type:'image/jpeg',name:'b.jpg'}),op('two','rating','memory',{score:9.25,comment:'B'})];
 const a=device('one',left,created.policy),b=device('two',right,created.policy);
 let doneA=false,doneB=false;
 const deliver=(from,to)=>{while(from.outgoing.length){const raw=from.outgoing.shift();const chunk=JSON.parse(raw).chunk;if(chunk.includes('"type":"sync-done"')){if(to===a)doneA=true;else doneB=true;}to.channel.onmessage({data:raw});}};
 a.context.deliver=()=>deliver(a,b);b.context.deliver=()=>deliver(b,a);
 // In-memory transport exercises the real framing, handshake, validation and storage code.
 a.channel.send=raw=>{a.outgoing.push(raw);setTimeout(a.context.deliver,0);};
 b.channel.send=raw=>{b.outgoing.push(raw);setTimeout(b.context.deliver,0);};
 await Promise.all([a.channel.onopen(),b.channel.onopen()]);
 await waitUntil(()=>doneA&&doneB&&a.channel.verified&&b.channel.verified&&a.tables.ops.size>=6&&b.tables.ops.size>=6,'scambio bidirezionale incompleto',10000);
 const pa=Model.project([...a.tables.ops.values()]),pb=Model.project([...b.tables.ops.values()]);
 assert.equal(pa.memories[0].ratings.two.score,9.25);assert.equal(pb.memories[0].ratings.one.score,8.75);
 assert.equal(pa.memories[0].media.length,2);assert.equal(pb.memories[0].media.length,2);
 for(const projected of [pa,pb])assert.deepEqual(new Set(projected.memories[0].media.map(m=>m.url)),new Set([left[2].data.url,right[1].data.url]));
 assert.equal(pb.profiles.one.nickname,'T');
 for(const x of [a,b])for(const value of x.tables.ops.values())await Access.authorize(value,created.policy);
 assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
 console.log('PASS: handshake, firme, due foto da 6 MB, voti e persistenza in entrambe le direzioni');
 // Simulate a previous incomplete exchange: stale local ACKs must not hide
 // a missing photo or vote in the other device's actual inventory.
 const partial=[common,signed,right[1],right[2]];
 const c=device('one',left,created.policy,{fastTimers:true}),e=device('two',partial,created.policy,{fastTimers:true});
 for(const value of left){c.tables.acks.set(value.id,{id:value.id});c.context.ackId=value.id;vm.runInContext('acks.add(ackId)',c.context);}
 let droppedVote=false,droppedAck=false,mediaSent=0;
 const wire=(from,to)=>raw=>{
  const frame=JSON.parse(raw);
  if(from===c&&frame.i===0&&frame.chunk.includes('"kind":"media"'))mediaSent++;
  if(from===c&&!droppedVote&&frame.count===1&&frame.chunk.includes('"kind":"rating"')){droppedVote=true;return;}
  if(from===e&&!droppedAck&&frame.count===1&&frame.chunk.includes('"type":"ack"')&&frame.chunk.includes(left[2].id)){droppedAck=true;return;}
  setTimeout(()=>to.channel.onmessage({data:raw}),0);
 };
 c.channel.send=wire(c,e);e.channel.send=wire(e,c);
 await Promise.all([c.channel.onopen(),e.channel.onopen()]);
 await waitUntil(()=>c.channel.verified&&e.channel.verified,'riparazione dello scambio parziale non completata',8000);
 const recovered=Model.project([...e.tables.ops.values()]).memories[0];
 assert.equal(recovered.ratings.one.score,8.75);assert.equal(recovered.media.length,2);
 assert(droppedVote&&droppedAck);assert.equal(mediaSent,2,'foto ritrasmessa dopo conferma persa');
 assert.deepEqual(c.errors,[]);assert.deepEqual(e.errors,[]);
 const beforeReconnect=c.tables.ops.size;
 console.log('PASS: voto mancante, foto mancante, ACK vecchi, messaggio perso e conferma persa recuperati');
 // A fresh connection uses the saved inventory, so unchanged photos are not resent.
 const f=device('one',[...c.tables.ops.values()],created.policy),g=device('two',[...e.tables.ops.values()],created.policy);
 let resentPhotos=0;
 const reconnectWire=(to)=>raw=>{if(JSON.parse(raw).chunk.includes('"kind":"media"'))resentPhotos++;setTimeout(()=>to.channel.onmessage({data:raw}),0);};
 f.channel.send=reconnectWire(g);g.channel.send=reconnectWire(f);
 await Promise.all([f.channel.onopen(),g.channel.onopen()]);
 await waitUntil(()=>f.channel.verified&&g.channel.verified,'verifica dopo riapertura incompleta');
 assert.equal(resentPhotos,0);assert.equal(g.tables.ops.size,beforeReconnect);
 console.log('PASS: riapertura e confronto completo senza reinviare foto già presenti');
 for(const x of [c,e,f,g]){x.channel.readyState='closed';x.channel.onclose?.();clearTimeout(x.channel.helloTimer);}
 const tiny='data:image/png;base64,aGVsbG8=';
 const extras=person=>{
  const own=(kind,activity,data)=>op(person,kind,person+'-'+activity,data);
  const memory=person+'-experience',game=person+'-game',goal=person+'-goal';
  return [
   own('place-folder','folder',{title:'Idee '+person}),
   own('place-post','post',{folder:person+'-folder',title:'Ristorante',description:'Da provare',kind:'restaurant',budget:{expected:7500,travel:null,stay:null,extra:null}}),
   own('place-photo','post',{url:tiny,name:'copertina.png'}),
   own('place-like','post',{liked:true}),
   own('place-choice','folder',{post:person+'-post'}),
   own('place-comment','comment',{post:person+'-post',body:'Mi piace questa idea'}),
   own('place-comment','reply',{post:person+'-post',body:'Ci sto!',replyTo:person+'-comment'}),
   own('category','category',{name:'Categoria '+person}),
   own('create','experience',{section:'experiences',category:'Categoria '+person,title:'Esperienza',date:'2026-10-29'}),
   own('rating','experience',{score:6.5,comment:'Commento personale'}),
   own('memory-title','experience',{title:'Titolo corretto'}),
   own('memory-location','experience',{location:'Luogo aggiornato'}),
   own('media','experience',{url:tiny,type:'image/png',name:'foto.png'}),
   own('media','experience',{url:'data:video/mp4;base64,aGVsbG8=',type:'video/mp4',name:'video.mp4'}),
   own('letter','letter',{title:'Pensiero',body:'Le nostre parole'}),
   own('countdown','event',{title:'Evento',date:'2026-12-31',photo:tiny}),
   own('goal','goal',{group:'dreams',title:'Sogno'}),
   own('goal-state','goal',{completed:true}),
   own('game','game',{title:'Preferiresti?',type:'wouldrather',questions:[{text:'Domanda',options:['A','B']}]}),
   op(person,'game-played',game,{total:1}),
   op(person,'country-state','visited-'+(person==='one'?'IT':'FR'),{code:person==='one'?'IT':'FR',visited:true}),
   ...['trips','holidays','gifts','dance'].map(section=>own('create',section,{section,category:section,title:'Ricordo '+section,date:''}))
  ];
 };
 const sharedPlaces=[op('one','place-folder','shared-folder',{title:'Scelta condivisa'}),op('one','place-post','shared-post',{folder:'shared-folder',title:'La stessa idea',description:'',kind:'other',budget:{expected:0,travel:null,stay:null,extra:null}})];
 const allA=[...left.slice(0,2),...extras('one'),...sharedPlaces,op('one','place-choice','shared-folder',{post:'shared-post'})],allB=[common,...extras('two'),op('two','place-choice','shared-folder',{post:'shared-post'})];
 const h=device('one',allA,created.policy),i=device('two',allB,created.policy);
 h.channel.send=raw=>setTimeout(()=>i.channel.onmessage({data:raw}),0);
 i.channel.send=raw=>setTimeout(()=>h.channel.onmessage({data:raw}),0);
 await Promise.all([h.channel.onopen(),i.channel.onopen()]);
 await waitUntil(()=>h.channel.verified&&i.channel.verified,'scambio delle altre sezioni incompleto',10000);
 const expected=Access.canonical(Model.project([...allA,...allB]));
 assert.equal(Access.canonical(Model.project([...h.tables.ops.values()])),expected);
 assert.equal(Access.canonical(Model.project([...i.tables.ops.values()])),expected);
 for(const device of [h,i])assert.deepEqual(Model.project([...device.tables.ops.values()]).places.posts.find(p=>p.id==='shared-post').likes,['one','two']);
 console.log('PASS: scelte condivise per cartella ricevute e conservate su entrambi i dispositivi');
 console.log('PASS: tutte le raccolte, categorie, commenti, luoghi, pensieri, countdown, obiettivi, giochi, risultati, video e paesi');
 // Concurrent offline edits and deletions converge without resurrecting deleted content.
 const goalBase=op('one','goal','old-goal',{group:'films',title:'Film da eliminare'});
 const deleted=op('one','delete-memory','memory',{}),goalDeleted=op('two','delete-goal','old-goal',{});
 const offlineA=[common,goalBase,deleted],offlineB=[common,goalBase,op('two','rating','memory',{score:7,comment:'Scritto offline'}),goalDeleted];
 const k=device('one',offlineA,null),l=device('two',offlineB,null);
 k.channel.send=raw=>setTimeout(()=>l.channel.onmessage({data:raw}),0);
 l.channel.send=raw=>setTimeout(()=>k.channel.onmessage({data:raw}),0);
 await Promise.all([k.channel.onopen(),l.channel.onopen()]);
 await waitUntil(()=>k.channel.verified&&l.channel.verified,'modifiche offline non convergenti');
 const offlineExpected=Access.canonical(Model.project([...offlineA,...offlineB]));
 for(const x of [k,l])assert.equal(Access.canonical(Model.project([...x.tables.ops.values()])),offlineExpected);
 console.log('PASS: modifiche offline e cancellazioni convergono senza ripristinare contenuti eliminati');
 for(const x of [k,l]){x.channel.readyState='closed';x.channel.onclose?.();clearTimeout(x.channel.helloTimer);}
 // A failed transaction must never be acknowledged or called a completed sync.
 const refused=op('one','rating','memory',{score:5,comment:'Prova salvataggio'});
 const j=device('two',[common],null,{failId:refused.id});
 j.frame({type:'hello',protocol:43,inventory:[common.id],ticket:'test-shared-ticket',person:'one',name:'Test 1'});
 await pause(10);j.frame({type:'op',op:refused});await pause(30);
 assert(!j.tables.ops.has(refused.id));assert(j.channel.transferFailed);assert(!j.channel.verified);
 assert(!j.outgoing.some(raw=>{try{const value=JSON.parse(JSON.parse(raw).chunk);return value.type==='ack'&&value.id===refused.id;}catch{return false;}}));
 console.log('PASS: nessuna conferma e nessun successo quando il salvataggio fallisce');
 for(const x of [h,i,j]){x.channel.readyState='closed';x.channel.onclose?.();clearTimeout(x.channel.helloTimer);}
 const live=op('two','memory-title','memory',{title:'Titolo aggiornato'});b.frame({type:'op',op:live}); // local fixture commits to b before broadcasting to a
 await waitUntil(()=>b.tables.ops.has(live.id),'modifica di prova non salvata');
 a.frame({type:'op',op:live});await waitUntil(()=>a.tables.ops.has(live.id),'modifica in diretta non ricevuta');
 assert.equal(Model.project([...a.tables.ops.values()]).memories[0].title,'Titolo aggiornato');
 const before=a.tables.ops.size;a.frame({type:'op',op:live});await pause(30);assert.equal(a.tables.ops.size,before);
 console.log('PASS: modifiche successive e deduplicazione');
 for(const x of [a,b,d]){x.channel.readyState='closed';x.channel.onclose?.();clearTimeout(x.channel.helloTimer);}
})().catch(error=>{console.error(error);process.exit(1);});
