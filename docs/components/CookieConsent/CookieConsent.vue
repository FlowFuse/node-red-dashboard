<template>
    This site uses cookies. Click <a href="#" @click="show">here</a> to manage your preferences
</template>

<script>
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

export default {
    data () {
        return {
            CookieConsent
        }
    },
    methods: {
        show () {
            console.log('show')
            this.CookieConsent.showPreferences()
        }
    },
    mounted () {
        console.log('CookieConsent', CookieConsent)
        this.CookieConsent.run({
            categories: {
                necessary: {
                    enabled: true, // this category is enabled by default
                    readOnly: true // this category cannot be disabled
                },
                analytics: {}
            },

            language: {
                default: 'en',
                translations: {
                    en: {
                        consentModal: {
                            title: 'This site uses cookies',
                            description: "We use cookies to ensure this site's proper operation and, if you approve, tracking cookies to understand how you interact with it.",
                            acceptAllBtn: 'Accept all',
                            showPreferencesBtn: 'Settings',
                            footer: '<a href="https://flowfuse.com/privacy-policy/">Privacy Policy</a>\n'
                        },
                        preferencesModal: {
                            title: 'Cookie Options',
                            acceptAllBtn: 'Accept all',
                            acceptNecessaryBtn: 'Reject all',
                            savePreferencesBtn: 'Save preferences',
                            closeIconLabel: 'Close modal',
                            serviceCounterLabel: 'Service|Services',
                            sections: [
                                {
                                    title: 'Cookie Usage',
                                    description: 'We use cookies to ensure the basic functionality of the website and to enhance your online experience. You can opt-in/out of receiving non-essential cookies.'
                                },
                                {
                                    title: 'Strictly Necessary Cookies <span class="pm__badge">Always Enabled</span>',
                                    description: 'Essential cookies are crucial for the basic functionality of our website. Without these cookies, our website could not function properly.',
                                    linkedCategory: 'necessary'
                                },
                                {
                                    title: 'Analytics Cookies',
                                    description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                                    linkedCategory: 'analytics'
                                },
                                {
                                    title: 'More information',
                                    description: 'For any queries in relation to my policy on cookies and your choices, please <a href="https://flowfuse.com/contact-us">contact us</a>'
                                }
                            ]
                        }
                    }
                }
            },
            onChange: function ({ changedCategories }) {
                if (changedCategories.includes('analytics')) {
                    if (CookieConsent.acceptedCategory('analytics')) {
                        if (window.gtag) {
                            // Enable Google Analytics
                            window.gtag('consent', 'update', {
                                analytics_storage: 'granted'
                            })
                            // Send event to Google Analytics
                            window.gtag('event', 'cookie_consent', {
                                event_category: 'analytics',
                                event_label: 'accepted'
                            })
                        }
                        // Enable PostHog
                        window.posthog?.opt_in_capturing()
                    } else {
                        if (window.gtag) {
                            // Disable Google Analytics
                            window.gtag('consent', 'update', {
                                analytics_storage: 'denied'
                            })
                            // Send event to Google Analytics
                            window.gtag('event', 'cookie_consent', {
                                event_category: 'analytics',
                                event_label: 'denied'
                            })
                        }
                        // Disable PostHog
                        window.posthog?.opt_out_capturing()
                    }
                }
            }
        })
    }
}

</script>
