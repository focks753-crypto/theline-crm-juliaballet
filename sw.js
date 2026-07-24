const C='jb-v7';
const A=['./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./logo-white.png','./icon-white.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A).catch(()=>{})).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;const url=req.url;
  // Firebase / 외부 API는 서비스워커가 절대 건드리지 않음
  if(url.includes('firestore')||url.includes('firebase')||url.includes('googleapis')||url.includes('gstatic')||url.includes('identitytoolkit')){return;}
  // HTML(앱 코드)은 항상 네트워크 우선 → 배포한 최신 코드가 즉시 반영됨
  if(req.mode==='navigate'||req.destination==='document'||url.endsWith('.html')||url.endsWith('/')){
    e.respondWith(fetch(req).catch(()=>caches.match(req)));
    return;
  }
  // 그 외 정적 파일(아이콘/로고 등)만 캐시 우선
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res&&res.status===200){const clone=res.clone();caches.open(C).then(c=>c.put(req,clone));}
    return res;
  }).catch(()=>cached)));
});
