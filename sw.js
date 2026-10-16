'use strict';
// Release 27: profile sections and shared content management.
const VERSION=27,BASE=new URL('./',self.location.href),CACHE='tra-noi-pages-'+BASE.pathname+'-v27';
const relative=['index.html?v=27','style.css?v=27','boot.js?v=27','model.js?v=27','offline.js?v=27','link.js?v=27','interaction.js?v=27','access.js?v=27','preferences.js?v=27','viewport.js?v=27','app.js?v=27','manifest.json','manifest-one.json','manifest-two.json','icon.svg?v=27','icon-192.png?v=27','icon-512.png?v=27','apple-touch-icon.png?v=27','vendor/qrcode.js','vendor/jsqr.js','installazione.html'];
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
