self.addEventListener('install', (evt) => 
{
  console.info("[APIi]",'ServiceWorker ==> install');
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => 
{
  console.info("[APIi]", 'ServiceWorker ==> activate');
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => 
{
});