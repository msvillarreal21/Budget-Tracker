const APP_PREFIX = "Budget";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
        '/',
          'index.html',
          'manifest.json',
          'css/styles.css',
          'js/idb.js',
          'js/index.js',
          'icons/icon-72x72.png',
          'icons/icon-96x96.png',
          'icons/icon-128x128.png',
          'icons/icon-144x144.png',
          'icons/icon-152x152.png',
          'icons/icon-192x192.png',
          'icons/icon-384x384.png',
          'icons/icon-512x512.png',
];

//Instal service worker
self.addEventListener('install', function(event) {
    event.open(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

//activate service worker
self.addEventListener('activate', function(event){
    event.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
            keyList.map(function (key, i) {
                if(cacheKeepList.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keyList[i]);
                    return caches.delete(keyList[i]);
                    }
                })
            );   
        })
    );
});

//Fetching service worker
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            //Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request);
          }
        )
    );
});