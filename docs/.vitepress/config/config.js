// load en-US as the backup if amn entry is missing
import en from './locales/en-US.json';

export default {
    lang (lang) {
        // load the relevant local json file
        const locale = require(`./locales/${lang}.json`);
        return {
            lang: lang,
            description: locale.description || en.description,
        
            themeConfig: {
                nav: [
                    { text: locale.nav.docs || en.nav.docs, link: '/getting-started.html' },
                    { text: locale.nav.widgets || en.nav.widgets, link: '/nodes/widgets.html' },
                    { text: locale.nav.contributing || en.nav.contributing, link: '/contributing/' },
                    { text: locale.nav.flowfuse || en.nav.flowfuse, link: 'https://flowfuse.com' }
                ],
        
                sidebar: [
                    { text: locale.sidebar['about'] || en.sidebar['about'], link: '/about' },
                    { text: locale.sidebar['getting-started'] || en.sidebar['getting-started'], link: '/getting-started' },
                    { text: locale.sidebar['widgets'] || en.sidebar['widgets'], link: '/nodes/widgets' },
                    {
                        text: locale.sidebar['user-guides'] || en.sidebar['user-guides'],
                        collapsed: false,
                        items: [
                            { text: locale.sidebar['settings'] || en.sidebar['settings'], link: '/user/settings' },
                            { text: locale.sidebar['sidebar'] || en.sidebar['sidebar'], link: '/user/sidebar' },
                            { text: locale.sidebar['dynamic-properties'] || en.sidebar['dynamic-properties'], link: '/user/dynamic-properties' },
                            { text: locale.sidebar['migration-guide'] || en.sidebar['migration-guide'], link: '/user/migration' },
                            { text: locale.sidebar['ui-template-examples'] || en.sidebar['ui-template-examples'], link: '/user/template-examples' },
                            { text: locale.sidebar['multi-tenancy'] || en.sidebar['multi-tenancy'], link: '/user/multi-tenancy' },
                            { text: locale.sidebar['subflows'] || en.sidebar['subflows'], link: '/user/subflows' },
                            { text: locale.sidebar['installing-on-mobile'] || en.sidebar['installing-on-mobile'], link: '/user/pwa' },
                            { text: locale.sidebar['installing-on-home-assistant'] || en.sidebar['installing-on-home-assistant'], link: '/user/home-assistant' }
                        ]
                    },
                    {
                        text: locale.sidebar['nodes'] || en.sidebar['nodes'],
                        collapsed: false,
                        items: [
                            {
                                text: locale.sidebar['config-nodes'] || en.sidebar['config-nodes'],
                                collapsed: false,
                                items: [
                                    { text: locale.nodes['ui-base'] || en.nodes['ui-base'], link: '/nodes/config/ui-base' },
                                    { text: locale.nodes['ui-page'] || en.nodes['ui-page'], link: '/nodes/config/ui-page' },
                                    { text: locale.nodes['ui-link'] || en.nodes['ui-link'], link: '/nodes/config/ui-link' },
                                    { text: locale.nodes['ui-group'] || en.nodes['ui-group'], link: '/nodes/config/ui-group' },
                                    { text: locale.nodes['ui-theme'] || en.nodes['ui-theme'], link: '/nodes/config/ui-theme' }
                                ]
                            },
                            {
                                text: locale.sidebar['widgets'] || en.sidebar['widgets'],
                                collapsed: false,
                                items: [
                                    { text: locale.nodes['ui-audio'] || en.nodes['ui-audio'], link: '/nodes/widgets/ui-audio' },
                                    { text: locale.nodes['ui-button'] || en.nodes['ui-button'], link: '/nodes/widgets/ui-button' },
                                    { text: locale.nodes['ui-button-group'] || en.nodes['ui-button-group'], link: '/nodes/widgets/ui-button-group' },
                                    { text: locale.nodes['ui-control'] || en.nodes['ui-control'], link: '/nodes/widgets/ui-control' },
                                    { text: locale.nodes['ui-chart'] || en.nodes['ui-chart'], link: '/nodes/widgets/ui-chart' },
                                    { text: locale.nodes['ui-dropdown'] || en.nodes['ui-dropdown'], link: '/nodes/widgets/ui-dropdown' },
                                    { text: locale.nodes['ui-event'] || en.nodes['ui-event'], link: '/nodes/widgets/ui-event' },
                                    { text: locale.nodes['ui-file-input'] || en.nodes['ui-file-input'], link: '/nodes/widgets/ui-file-input' },
                                    { text: locale.nodes['ui-form'] || en.nodes['ui-form'], link: '/nodes/widgets/ui-form' },
                                    { text: locale.nodes['ui-gauge'] || en.nodes['ui-gauge'], link: '/nodes/widgets/ui-gauge' },
                                    { text: locale.nodes['ui-markdown'] || en.nodes['ui-markdown'], link: '/nodes/widgets/ui-markdown' },
                                    { text: locale.nodes['ui-notification'] || en.nodes['ui-notification'], link: '/nodes/widgets/ui-notification' },
                                    { text: locale.nodes['ui-number-input'] || en.nodes['ui-number-input'], link: '/nodes/widgets/ui-number-input' },
                                    { text: locale.nodes['ui-progress'] || en.nodes['ui-progress'], link: '/nodes/widgets/ui-progress' },
                                    { text: locale.nodes['ui-radio-group'] || en.nodes['ui-radio-group'], link: '/nodes/widgets/ui-radio-group' },
                                    { text: locale.nodes['ui-slider'] || en.nodes['ui-slider'], link: '/nodes/widgets/ui-slider' },
                                    { text: locale.nodes['ui-spacer'] || en.nodes['ui-spacer'], link: '/nodes/widgets/ui-spacer' },
                                    { text: locale.nodes['ui-switch'] || en.nodes['ui-switch'], link: '/nodes/widgets/ui-switch' },
                                    { text: locale.nodes['ui-table'] || en.nodes['ui-table'], link: '/nodes/widgets/ui-table' },
                                    { text: locale.nodes['ui-template'] || en.nodes['ui-template'], link: '/nodes/widgets/ui-template' },
                                    { text: locale.nodes['ui-text'] || en.nodes['ui-text'], link: '/nodes/widgets/ui-text' },
                                    { text: locale.nodes['ui-text-input'] || en.nodes['ui-text-input'], link: '/nodes/widgets/ui-text-input' }
                                ]
                            }
                        ]
                    },
                    {
                        text: locale.sidebar['layouts'] || en.sidebar['layouts'],
                        collapsed: false,
                        items: [
                            { text: locale.sidebar['getting-started'] || en.sidebar['getting-started'], link: '/layouts/' },
                            {
                                text: locale.sidebar['types'] || en.sidebar['types'],
                                items: [
                                    { text: locale.layouts['grid'] || en.layouts['grid'], link: '/layouts/types/grid' },
                                    { text: locale.layouts['fixed'] || en.layouts['fixed'], link: '/layouts/types/fixed' },
                                    { text: locale.layouts['notebook'] || en.layouts['notebook'], link: '/layouts/types/notebook' },
                                    { text: locale.layouts['tabs'] || en.layouts['tabs'], link: '/layouts/types/tabs' }
                                ]
                            }
                        ]
                    },
                    {
                        text: locale.sidebar['contributing'] || en.sidebar['contributing'],
                        collapsed: false,
                        items: [
                            { text: locale.sidebar['introduction'] || en.sidebar['introduction'], link: '/contributing/' },
                            {
                                text: locale.sidebar['building-widgets'] || en.sidebar['building-widgets'],
                                collapsed: false,
                                items: [
                                    { text: locale.sidebar['adding-core-widgets'] || en.sidebar['adding-core-widgets'], link: '/contributing/widgets/core-widgets' },
                                    { text: locale.sidebar['third-party-widgets'] || en.sidebar['third-party-widgets'], link: '/contributing/widgets/third-party' },
                                    { text: locale.sidebar['testing'] || en.sidebar['testing'], link: '/contributing/widgets/testing' },
                                    { text: locale.sidebar['debugging'] || en.sidebar['debugging'], link: '/contributing/widgets/debugging' }
                                ]
                            },
                            {
                                text: locale.sidebar['useful-guides'] || en.sidebar['useful-guides'],
                                collapsed: false,
                                items: [
                                    { text: locale.sidebar['repo-structure'] || en.sidebar['repo-structure'], link: '/contributing/guides/repo' },
                                    { text: locale.sidebar['events-architecture'] || en.sidebar['events-architecture'], link: '/contributing/guides/events' },
                                    { text: locale.sidebar['state-management'] || en.sidebar['state-management'], link: '/contributing/guides/state-management' },
                                    { text: locale.sidebar['layout-managers'] || en.sidebar['layout-managers'], link: '/contributing/guides/layouts' },
                                    { text: locale.sidebar['registering-widgets'] || en.sidebar['registering-widgets'], link: '/contributing/guides/registration' }
                                ]
                            },
                            {
                                text: locale.sidebar['plugins'] || en.sidebar['plugins'],
                                collapsed: false,
                                items: [
                                    { text: locale.sidebar['adding-plugins'] || en.sidebar['adding-plugins'], link: '/contributing/plugins/' }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    }
}
