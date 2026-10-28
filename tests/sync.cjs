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
function device(author,seed,policy){
 const tables={ops:new Map(seed.map(o=>[o.id,o])),acks:new Map(),meta:new Map()};
 const nodes=new Map(),errors=[],outgoing=[];
 const db={transaction(){
  const writes=[],tx={objectStore(name){return {put(value){writes.push(()=>tables[name].set(value.id,value));},delete(id){writes.push(()=>tables[name].delete(id));}};}};
  queueMicrotask(()=>{for(const write of writes)write();tx.oncomplete?.();});return tx;
 }};
 const context={DiaryModel:Model,DiaryAccess:Access,crypto:webcrypto,console,setTimeout,clearTimeout,clearInterval,db,author,
  $:id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',classList:{toggle(){}},querySelectorAll(){return []}});return nodes.get(id);},
  seed,policy,storeTables:tables,errors,outgoing,
  personName:()=>author,validateOp:Model.validateOp,reportDiagnostic(){},updatePartnerStatus(){},connection(){},closePeer(){},adoptPolicy:async()=>{},
  render(){},scheduleSyncRender(){},refreshSyncIndicators(){},toast(message){errors.push(message);}
 };
 vm.createContext(context);
 vm.runInContext("let ops=seed,acks=new Set(),preparedBackup=null,accessPolicy=policy,peerPerson='',syncStarted=false,channel,pollTimer,sendTail=Promise.resolve(),peerName='';const people=DiaryModel.people,sessionTicket='test-shared-ticket',WIRE_VERSION=39,transfers=new Map(),uuid=()=>crypto.randomUUID();",context);
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
 d.frame({type:'hello-ok',protocol:39,ticket:'test-shared-ticket',person:'two',name:'Test 2'});
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
 await waitUntil(()=>doneA&&doneB&&a.tables.ops.size>=6&&b.tables.ops.size>=6,'scambio bidirezionale incompleto',10000);
 const pa=Model.project([...a.tables.ops.values()]),pb=Model.project([...b.tables.ops.values()]);
 assert.equal(pa.memories[0].ratings.two.score,9.25);assert.equal(pb.memories[0].ratings.one.score,8.75);
 assert.equal(pa.memories[0].media.length,2);assert.equal(pb.memories[0].media.length,2);
 assert.equal(pb.profiles.one.nickname,'T');
 for(const x of [a,b])for(const value of x.tables.ops.values())await Access.authorize(value,created.policy);
 assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
 console.log('PASS: handshake, firme, due foto da 6 MB, voti e persistenza in entrambe le direzioni');
 const live=op('two','memory-title','memory',{title:'Titolo aggiornato'});b.frame({type:'op',op:live}); // local fixture commits to b before broadcasting to a
 await waitUntil(()=>b.tables.ops.has(live.id),'modifica di prova non salvata');
 a.frame({type:'op',op:live});await waitUntil(()=>a.tables.ops.has(live.id),'modifica in diretta non ricevuta');
 assert.equal(Model.project([...a.tables.ops.values()]).memories[0].title,'Titolo aggiornato');
 const before=a.tables.ops.size;a.frame({type:'op',op:live});await pause(30);assert.equal(a.tables.ops.size,before);
 console.log('PASS: modifiche successive e deduplicazione');
 for(const x of [a,b,d]){x.channel.readyState='closed';clearTimeout(x.channel.helloTimer);}
})().catch(error=>{console.error(error);process.exit(1);});
