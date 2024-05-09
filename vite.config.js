import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import manifest from './manifest.json'

/**
 * Vite is used to build the UI for the dashboard,
 * is is not used for the nodes themselves.
 */

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js'
        }
    },
    plugins: [vue(),
        // VitePWA({ registerType: 'autoUpdate', devOptions: {
        //     enabled: true} })
        VitePWA({
            registerType: 'autoUpdate',
            manifest,
            includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'assets/*.png', 'assets/*.woff2', 'assets/*.woff', 'assets/*.ttf', 'assets/*.eot'],
            // switch to "true" to enable sw on development
            devOptions: {
                enabled: false
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 3000000,
                globPatterns: ['**/*.{js,css,html}', '**/*.{svg,png,jpg,gif,ttf,eot,woff,woff2}'],
                cleanupOutdatedCaches: true
            }
        })
    ],
    root: 'ui',
    build: {
        // Generate a source map in dev mode
        sourcemap: process.env.NODE_ENV === 'development',
        outDir: '../dist',
        emptyOutDir: true
    },
    base: './'
})
