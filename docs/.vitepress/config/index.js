import { loadEnv } from 'vite'

import de from './de'
import en from './en'
import shared from './shared'

export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
    return{
    ...shared,
    locales: {
        root: { label: 'English', ...en },
       de: { label: 'Deutsch', ...de }
    }
}
}
