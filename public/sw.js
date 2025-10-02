// fake sw.js for development – avoids 500 error
self.addEventListener('install', () => {
  self.skipWaiting();
});
