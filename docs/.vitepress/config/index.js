import { loadEnv } from 'vite'

import shared from './shared'
import config from './config'

export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
    return{
    ...shared,
    locales: {
        root: { label: 'English', ...config.lang('en-US') },
        de: { label: 'Deutsch', ...config.lang('de-DE') }
    }
}
}
