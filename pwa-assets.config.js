import {
    defineConfig
} from '@vite-pwa/assets-generator/dist/config'

export default defineConfig({
    headLinkOptions: {
        preset: '2023'
    },
    preset: {
        transparent: {
            sizes: [64, 192, 512],
            favicons: [[48, 'favicon.ico']],
            padding: 0.1
        },
        maskable: {
            sizes: [512],
            padding: 0.1
        },
        apple: {
            sizes: [180],
            padding: 0.15
        }
    },
    images: ['./ui/public/logo-512x512.png']
})
