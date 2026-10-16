(function(root){
'use strict';
// Frame JSON values incrementally: a large diary never needs one giant JSON string.
const MAX_RECORD=64*1024*1024;
class Cursor{
 constructor(file,progress){this.reader=file.stream().getReader();this.decoder=new TextDecoder('utf-8',{fatal:true});this.buffer='';this.index=0;this.ended=false;this.loaded=0;this.total=file.size;this.progress=progress;}
 async ready(){
  while(this.index>=this.buffer.length&&!this.ended){
   const part=await this.reader.read();this.index=0;
   if(part.done){this.ended=true;this.buffer=this.decoder.decode();}
   else{this.loaded+=part.value.byteLength;this.buffer=this.decoder.decode(part.value,{stream:true});}
   this.progress?.({loaded:this.loaded,total:this.total});
  }
  return this.index<this.buffer.length;
 }
 async whitespace(){while(await this.ready()){while(this.index<this.buffer.length&&/[\t\n\r ]/.test(this.buffer[this.index]))this.index++;if(this.index<this.buffer.length)return;}}
 async peek(){await this.whitespace();return await this.ready()?this.buffer[this.index]:'';}
 async expect(char){if(await this.peek()!==char)throw Error('Backup incompleto o formato non valido');this.index++;}
 async value(){
  await this.whitespace();if(!await this.ready())throw Error('Backup interrotto');
  const first=this.buffer[this.index],container=first==='{'||first==='[',quoted=first==='"';
  let depth=0,string=false,escape=false,length=0,parts=[];
  while(await this.ready()){
   const start=this.index;let done=false;
   while(this.index<this.buffer.length){
    const c=this.buffer[this.index];
    if(!container&&!quoted&&/[\t\r\n ,}\]]/.test(c)){done=true;break;}
    this.index++;
    if(string){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"'){string=false;if(quoted){done=true;break;}}}
    else if(c==='"')string=true;
    else if(c==='{'||c==='[')depth++;
    else if(c==='}'||c===']'){depth--;if(container&&depth===0){done=true;break;}if(depth<0)throw Error('Backup non valido');}
   }
   const part=this.buffer.slice(start,this.index);length+=part.length;if(length>MAX_RECORD)throw Error('Un elemento del backup supera il limite supportato');parts.push(part);
   if(done){const text=parts.join('');if(!text)throw Error('Valore del backup mancante');return JSON.parse(text);}
  }
  if(!container&&!quoted&&length)return JSON.parse(parts.join(''));
  throw Error('Backup incompleto: nessun dato è stato importato');
 }
 async close(){await this.reader.cancel().catch(()=>{});this.reader.releaseLock();}
}
async function read(file,onProgress){
 const c=new Cursor(file,onProgress),data=Object.create(null),keys=new Set();
 try{
  await c.expect('{');
  if(await c.peek()!=='}')while(true){
   const key=await c.value();if(typeof key!=='string'||keys.has(key))throw Error('Campi del backup non validi');keys.add(key);await c.expect(':');
   if(key==='ops'){
    data.ops=[];await c.expect('[');
    if(await c.peek()!==']')while(true){data.ops.push(await c.value());const sep=await c.peek();if(sep===']')break;await c.expect(',');}
    await c.expect(']');
   }else data[key]=await c.value();
   const sep=await c.peek();if(sep==='}')break;await c.expect(',');
  }
  await c.expect('}');if(await c.peek())throw Error('Contenuto inatteso dopo il backup');
  if(!['tra-noi-v1','tra-noi-v2','tra-noi-v3','tra-noi-v4'].includes(data.format)||!Array.isArray(data.ops))throw Error('Formato di backup non riconosciuto');
  return data;
 }catch(error){if(error instanceof SyntaxError||error instanceof TypeError)throw Error('Backup incompleto o non leggibile: nessun dato è stato importato');throw error;}
 finally{await c.close();}
}
async function create(data,name,onProgress){
 const {ops,...metadata}=data;if(!Array.isArray(ops))throw Error('Archivio non valido');
 const prefix=JSON.stringify(metadata);const parts=[new Blob([prefix.slice(0,-1)+',"ops":['])];
 for(let i=0;i<ops.length;i++){
  parts.push(new Blob([(i?',':'')+JSON.stringify(ops[i])]));
  if(i%20===0){onProgress?.({done:i,total:ops.length});await new Promise(resolve=>setTimeout(resolve,0));}
 }
 parts.push(new Blob([']}']));onProgress?.({done:ops.length,total:ops.length});
 return new File(parts,name,{type:'application/json'});
}
root.DiaryBackup={create,read};
if(typeof module!=='undefined')module.exports=root.DiaryBackup;
})(globalThis);
