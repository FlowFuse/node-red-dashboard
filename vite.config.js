import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
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
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    },
    plugins: [vue(),
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.js',
            registerType: 'autoUpdate',
            injectRegister: false,

            manifest: false,

            injectManifest: {
                maximumFileSizeToCacheInBytes: process.env.NODE_ENV === 'development' ? 6000000 : 3350000,
                globPatterns: ['**/*.{js,css,html,svg,png,ico,ttf,eot,woff,woff2}']
            },

            devOptions: {
                enabled: false,
                navigateFallback: 'index.html',
                suppressWarnings: true,
                type: 'module'
            }
        })
    ],
    root: 'ui',
    build: {
        minify: process.env.NODE_ENV === 'development' ? false : undefined,
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Create a separate chunk the following libraries to reduce .index.js size
                    mermaid: ['mermaid'],
                    'vue-vendor': ['vue', 'vuex', 'vue-router'],
                    echarts: ['echarts']
                }
            }
        }
    },
    base: './'
})
