/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'

// Network-first (keeps 'navigate' mode so an auth proxy's login redirect is followed), cached shell
// on failure. Registered before the precache route so it owns every navigation.
registerRoute(new NavigationRoute(new NetworkOnly({
    networkTimeoutSeconds: 5,
    plugins: [{
        handlerDidError: async () => (await matchPrecache('index.html')) || Response.error()
    }]
})))

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

self.skipWaiting()
// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
clientsClaim()

// Add custom service worker code here
