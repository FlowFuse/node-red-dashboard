/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

/** @type {RegExp[] | undefined} */
const denylist = []

// in dev mode, do not precache anything
if (import.meta.env.DEV) {
    // don't precache anything
    console.log('Development mode, not pre-caching anything')
    denylist.push(/.*/)
} else {
    // don't precache anything where the urls pathname ends with a slash (including times when the url has a query string)
    // this permits the request to be handled by the server which will do a redirect as required
    const configPath = self.location.pathname.split('/')[1]
    denylist.push(new RegExp(`/${configPath}/[^?]*/(\\?.*)*$`))
}

// to allow work offline for allowed routes only
registerRoute(new NavigationRoute(
    createHandlerBoundToURL('index.html'),
    { denylist }
))

self.skipWaiting()
// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
clientsClaim()

// Add custom service worker code here
