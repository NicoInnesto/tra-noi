'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const Model=require('../model.js'),source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const helpers=source.slice(source.indexOf('let projectedOperations='),source.indexOf('function render(){'));
const seed=[];for(let i=0;i<12;i++){seed.push({id:'m'+i,author:'one',name:'Test',time:i*2,kind:'create',activity:'a'+i,data:{section:'experiences',category:'Cinema',title:'Film '+i,date:''}});seed.push({id:'p'+i,author:'one',name:'Test',time:i*2+1,kind:'media',activity:'a'+i,data:{url:'data:image/jpeg;base64,'+'A'.repeat(1024*1024),type:'image/jpeg',name:'test.jpg'}});}
let projections=0,serialized=0;const storage={textContent:''},c={ops:seed,state:null,DiaryModel:{project(ops){projections++;return Model.project(ops);}},Blob:class extends Blob{constructor(parts){super(parts);serialized++;}},WeakMap,$:()=>storage};
vm.createContext(c);vm.runInContext(helpers,c);
const start=performance.now();for(let i=0;i<50;i++)vm.runInContext('currentState()',c);
assert.equal(projections,1);assert.equal(serialized,0);
console.log('PASS: 50 passaggi con archivio da 12 MB, una sola proiezione e nessuna serializzazione delle foto ('+(performance.now()-start).toFixed(1)+' ms nel test Node)');
vm.runInContext('updateStorageUsage();updateStorageUsage()',c);assert.equal(serialized,seed.length);
c.ops=[...seed,{id:'vote',author:'two',name:'Test',time:100,kind:'rating',activity:'a0',data:{score:8.75,comment:'Nuovo voto'}}];
vm.runInContext('currentState();updateStorageUsage()',c);
assert.equal(projections,2);assert.equal(serialized,seed.length+1);assert.equal(c.state.memories.find(m=>m.id==='a0').ratings.two.score,8.75);
console.log('PASS: dati e dimensioni si aggiornano dopo una modifica senza rileggere le foto già conteggiate');
assert(!source.slice(source.indexOf('function render(){'),source.indexOf('function renderHome(){')).includes('new Blob'));
assert(source.includes('sameCollection||!dragOffset?null:pageSnapshot()'));
assert(source.includes('pageDragFrame=requestAnimationFrame('));
console.log('PASS: nessuna clonazione della pagina sui tocchi del menu e gesti aggiornati una volta per fotogramma');
