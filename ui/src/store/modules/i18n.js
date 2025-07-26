import { saveUserLanguage } from '../../i18n/detector'

const state = () => ({
    // Current language
    locale: 'en',
    // Available languages
    languages: [
        { code: 'en', name: 'English', enabled: true }
    ],
    // Default language
    defaultLanguage: 'en',
    // Auto-detect language
    autoDetectLanguage: true
})

const mutations = {
    SET_LOCALE (state, locale) {
        state.locale = locale
    },
    SET_LANGUAGES (state, languages) {
        state.languages = languages
    },
    SET_DEFAULT_LANGUAGE (state, defaultLanguage) {
        state.defaultLanguage = defaultLanguage
    },
    SET_AUTO_DETECT (state, autoDetect) {
        state.autoDetectLanguage = autoDetect
    }
}

const actions = {
    setLocale ({ commit }, locale) {
        commit('SET_LOCALE', locale)
        saveUserLanguage(locale)
    }
}

const getters = {
    currentLocale: state => state.locale,
    availableLanguages: state => state.languages,
    enabledLanguages: state => state.languages.filter(lang => lang.enabled),
    defaultLanguage: state => state.defaultLanguage,
    autoDetectLanguage: state => state.autoDetectLanguage
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}