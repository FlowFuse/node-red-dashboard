import { loadEnv } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

import shared from './shared'
import config from './config'

export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
    return{
    ...shared,
    vite: {
        plugins: [
            ViteImageOptimizer({
                // Image optimization options
                png: { quality: 80 },
                jpeg: { quality: 80 },
                jpg: { quality: 80 },
                svg: {
                    plugins: [
                        { name: 'removeViewBox', active: false },
                        { name: 'addAttributesToSVGElement', params: { attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }] } }
                    ]
                },
                webp: { quality: 80 },
                avif: { quality: 80 },
                logStats: true,
                includePublic: true
            })
        ]
    },
    locales: {
        root: { label: 'English', ...config.lang('en-US') },
        de: { label: 'Deutsch', ...config.lang('de-DE') }
    }
}
}
