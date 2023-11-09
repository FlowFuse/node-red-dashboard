import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    root: 'ui',
    build: {
        outDir: '../dist'
    },
    base: '/dashboard/'
})
