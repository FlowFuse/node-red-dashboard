/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

// Navigation requests (request.mode === 'navigate') are intentionally NOT
// handled by the Service Worker. This lets the browser perform normal network
// navigation, which is critical when the dashboard sits behind an
// authentication proxy (Cloudflare Access, OAuth2 Proxy, Authelia, etc.).
// Without this, the SW would serve a cached index.html, preventing the browser
// from following HTTP redirects to the login page when the auth session expires.
//
// directoryIndex and cleanURLs are disabled so that precacheAndRoute does not
// implicitly serve index.html for navigation requests to '/dashboard/'.
// Static assets (JS, CSS, fonts, images) are still served from the precache
// via exact URL match, so page loads remain fast.
precacheAndRoute(self.__WB_MANIFEST, {
    directoryIndex: null,
    cleanURLs: false
})

// clean old assets
cleanupOutdatedCaches()

self.skipWaiting()
// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
clientsClaim()
