import { createI18n } from 'vue-i18n'
import { detectUserLanguage } from './detector'

// Default messages - will be overridden by dynamic content
const messages = {
    en: {
        // Default English translations
    },
    fr: {
        // Default French translations
    },
    es: {
        // Default Spanish translations
    },
    de: {
        // Default German translations
    }
}

// Create i18n instance
const i18n = createI18n({
    legacy: false, // Use Composition API
    globalInjection: true, // Make $t available in all components
    locale: detectUserLanguage(), // Set initial locale based on browser
    fallbackLocale: 'en',
    messages,
    // Allow missing translations (since we'll load them dynamically)
    missingWarn: false,
    fallbackWarn: false
})

// Function to update widget translations dynamically
export function updateWidgetTranslations (widgetId, translations) {
    if (!translations || typeof translations !== 'object') {
        return
    }

    // Add translations for each language
    Object.keys(translations).forEach(lang => {
        if (!i18n.global.messages.value[lang]) {
            i18n.global.messages.value[lang] = {}
        }
        i18n.global.messages.value[lang][`widget_${widgetId}`] = translations[lang]
    })
}

// Function to get translated widget text
export function getWidgetText (widgetId, locale = null) {
    const currentLocale = locale || i18n.global.locale.value
    const key = `widget_${widgetId}`
    
    // Try to get translation for current locale
    if (i18n.global.messages.value[currentLocale]?.[key]) {
        return i18n.global.messages.value[currentLocale][key]
    }
    
    // Fallback to default locale
    if (i18n.global.messages.value[i18n.global.fallbackLocale.value]?.[key]) {
        return i18n.global.messages.value[i18n.global.fallbackLocale.value][key]
    }
    
    // Return the key if no translation found
    return key
}

export default i18n