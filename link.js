(function(root){
'use strict';
const prefix='TN1:';
function validate(p){
 if(!p||p.format!=='tra-noi-link-v1'||typeof p.ticket!=='string'||!/^[-a-zA-Z0-9]{20,100}$/.test(p.ticket)||!Number.isFinite(p.expires)||p.expires<Date.now()||p.expires>Date.now()+310000||!p.description||!['offer','answer'].includes(p.description.type)||typeof p.description.sdp!=='string'||p.description.sdp.length>20000)throw Error('Codice non valido o scaduto. Crea un nuovo collegamento.');
 return p;
}
async function encode(payload){
 validate(payload);const text=JSON.stringify(payload);
 const input=new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
 const bytes=new Uint8Array(await new Response(input).arrayBuffer());
 return prefix+btoa(String.fromCharCode(...bytes));
}
async function decode(text){
 if(typeof text!=='string'||!text.startsWith(prefix)||text.length>16000)throw Error('Questo QR non è un codice del diario.');
 let bytes;try{bytes=Uint8Array.from(atob(text.slice(prefix.length)),c=>c.charCodeAt(0));}catch{throw Error('Codice del diario non leggibile');}
 const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();let size=0;const chunks=[];
 try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>24000)throw Error('Codice troppo grande');chunks.push(part.value);}}finally{await reader.cancel().catch(()=>{});}
 return validate(JSON.parse(await new Blob(chunks).text()));
}
root.DiaryLink={encode,decode,validate};
if(typeof module!=='undefined')module.exports=root.DiaryLink;
})(globalThis);
