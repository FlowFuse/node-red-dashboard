// Language detection utilities

// Get user's preferred language from browser
export function detectUserLanguage () {
    // Try to get from localStorage first
    const savedLang = localStorage.getItem('dashboard-language')
    if (savedLang) {
        return savedLang
    }

    // Get from browser
    const browserLang = navigator.language || navigator.userLanguage

    // Extract base language code (e.g., 'en' from 'en-US')
    const baseLang = browserLang.split('-')[0]

    // Return base language, defaulting to 'en' if not set
    return baseLang || 'en'
}

// Save user's language preference
export function saveUserLanguage (lang) {
    localStorage.setItem('dashboard-language', lang)
}

// Get available languages from loaded translations
export function getAvailableLanguages (i18n) {
    return Object.keys(i18n.global.messages.value).map(code => {
        const names = {
            en: 'English',
            fr: 'Français',
            es: 'Español',
            de: 'Deutsch',
            ja: '日本語'
        }
        return {
            code,
            name: names[code] || code
        }
    })
}
