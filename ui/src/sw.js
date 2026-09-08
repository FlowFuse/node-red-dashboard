/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

// directoryIndex/cleanURLs off so the precache doesn't serve a /dashboard/ navigation from cache - the route below owns navigations
precacheAndRoute(self.__WB_MANIFEST, {
    directoryIndex: null,
    cleanURLs: false
})

// clean old assets
cleanupOutdatedCaches()

const NETWORK_TIMEOUT_MS = 5000

// Network-first so an auth proxy's login redirect is followed - cached shell as offline fallback
registerRoute(new NavigationRoute(async ({ request }) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS)
    try {
        return await fetch(request, { signal: controller.signal })
    } catch {
        return (await matchPrecache('index.html')) || Response.error()
    } finally {
        clearTimeout(timeout)
    }
}))

self.skipWaiting()
// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
clientsClaim()

// Add custom service worker code here
