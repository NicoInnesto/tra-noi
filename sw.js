'use strict';
// Release 1.0 (build 32): compact version label, thought count and distinct game icons.
const VERSION=34,BASE=new URL('./',self.location.href),CACHE='tra-noi-pages-'+BASE.pathname+'-v34';
const relative=['index.html?v=34','style.css?v=34','boot.js?v=34','model.js?v=34','offline.js?v=34','link.js?v=34','interaction.js?v=34','access.js?v=34','preferences.js?v=34','viewport.js?v=34','app.js?v=34','backup.js?v=34','manifest.json','manifest-one.json','manifest-two.json','icon.svg?v=34','icon-192.png?v=34','icon-512.png?v=34','apple-touch-icon.png?v=34','vendor/qrcode.js','vendor/jsqr.js','installazione.html','nuova-icona.html','manifest-icon.json'];
const ASSETS=relative.map(p=>new URL(p,BASE).href),SHELL=ASSETS[0];
self.addEventListener('install',e=>e.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS);await self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const key of await caches.keys())if(key!==CACHE&&key.startsWith('tra-noi-pages-'+BASE.pathname+'-v'))await caches.delete(key);await self.clients.claim();})()));
async function status(){const cache=await caches.open(CACHE),missing=[];for(const asset of ASSETS)if(!(await cache.match(asset)))missing.push(asset);return {version:VERSION,ready:missing.length===0,missing};}
self.addEventListener('message',e=>{if(e.data?.type==='OFFLINE_STATUS')e.waitUntil(status().then(s=>e.ports[0]?.postMessage(s)));});
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==BASE.origin)return;
 const nav=e.request.mode==='navigate'&&(url.pathname===BASE.pathname||url.pathname===new URL('index.html',BASE).pathname);
 if(!nav&&!ASSETS.includes(url.href))return;
 e.respondWith((async()=>{const cache=await caches.open(CACHE),key=nav?SHELL:e.request;const saved=await cache.match(key);if(saved)return saved;const response=await fetch(e.request);if(response.ok)await cache.put(key,response.clone());return response;})());
});
