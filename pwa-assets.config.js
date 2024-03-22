import {
    defineConfig,
    minimal2023Preset as preset
} from '@vite-pwa/assets-generator/dist/config'

export default defineConfig({
    headLinkOptions: {
        preset: '2023'
    },
    preset,
    images: ['./ui/public/logo-512x512.png']
})
