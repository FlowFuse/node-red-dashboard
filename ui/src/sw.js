/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') { self.skipWaiting() }
})

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
self.addEventListener('install', function (event) {
    self.skipWaiting()
})

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

/** @type {RegExp[] | undefined} */
let allowlist
// in dev mode, we disable precaching to avoid caching issues
if (import.meta.env.DEV) { allowlist = [/^\/$/] }

// to allow work offline
registerRoute(new NavigationRoute(
    createHandlerBoundToURL('index.html'),
    { allowlist }
))

// Add custom service worker code here
