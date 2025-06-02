const defaultMetaDescription = 'Discover the features and benefits of Node-RED Dashboard 2.0, designed to streamline and enhance your Node-RED experience.'

export default {
    lang: 'en-US',
    description: defaultMetaDescription,

    themeConfig: {
        nav: [
            { text: 'Docs', link: '/getting-started.html' },
            { text: 'Widgets', link: '/nodes/widgets.html' },
            { text: 'Contributing', link: '/contributing/' },
            { text: 'FlowFuse', link: 'https://flowfuse.com' }
        ],

        sidebar: [
            { text: 'About', link: '/about' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Widgets', link: '/nodes/widgets' },
            {
                text: 'User Guides',
                collapsed: false,
                items: [
                    { text: 'Settings', link: '/user/settings' },
                    { text: 'Sidebar', link: '/user/sidebar' },
                    { text: 'Dynamic Properties', link: '/user/dynamic-properties' },
                    { text: 'Migration Guide', link: '/user/migration' },
                    { text: 'UI Template Examples', link: '/user/template-examples' },
                    { text: 'Multi-Tenancy', link: '/user/multi-tenancy' },
                    { text: 'Subflows', link: '/user/subflows' },
                    { text: 'Installing on Mobile', link: '/user/pwa' }
                ]
            },
            {
                text: 'Nodes',
                collapsed: false,
                items: [
                    {
                        text: 'Config Nodes',
                        collapsed: false,
                        items: [
                            { text: 'ui-base', link: '/nodes/config/ui-base' },
                            { text: 'ui-page', link: '/nodes/config/ui-page' },
                            { text: 'ui-link', link: '/nodes/config/ui-link' },
                            { text: 'ui-group', link: '/nodes/config/ui-group' },
                            { text: 'ui-theme', link: '/nodes/config/ui-theme' }
                        ]
                    },
                    {
                        text: 'Widgets',
                        collapsed: false,
                        items: [
                            { text: 'ui-audio', link: '/nodes/widgets/ui-audio' },
                            { text: 'ui-button', link: '/nodes/widgets/ui-button' },
                            { text: 'ui-button-group', link: '/nodes/widgets/ui-button-group' },
                            { text: 'ui-control', link: '/nodes/widgets/ui-control' },
                            { text: 'ui-chart', link: '/nodes/widgets/ui-chart' },
                            { text: 'ui-dropdown', link: '/nodes/widgets/ui-dropdown' },
                            { text: 'ui-event', link: '/nodes/widgets/ui-event' },
                            { text: 'ui-file-input', link: '/nodes/widgets/ui-file-input' },
                            { text: 'ui-form', link: '/nodes/widgets/ui-form' },
                            { text: 'ui-gauge', link: '/nodes/widgets/ui-gauge' },
                            { text: 'ui-markdown', link: '/nodes/widgets/ui-markdown' },
                            { text: 'ui-notification', link: '/nodes/widgets/ui-notification' },
                            { text: 'ui-number-input', link: '/nodes/widgets/ui-number-input' },
                            { text: 'ui-radio-group', link: '/nodes/widgets/ui-radio-group' },
                            { text: 'ui-slider', link: '/nodes/widgets/ui-slider' },
                            { text: 'ui-spacer', link: '/nodes/widgets/ui-spacer' },
                            { text: 'ui-switch', link: '/nodes/widgets/ui-switch' },
                            { text: 'ui-table', link: '/nodes/widgets/ui-table' },
                            { text: 'ui-template', link: '/nodes/widgets/ui-template' },
                            { text: 'ui-text', link: '/nodes/widgets/ui-text' },
                            { text: 'ui-text-input', link: '/nodes/widgets/ui-text-input' }
                        ]
                    }
                ]
            },
            {
                text: 'Layouts',
                collapsed: false,
                items: [
                    { text: 'Getting Started', link: '/layouts/' },
                    {
                        text: 'Types',
                        items: [
                            { text: 'Grid', link: '/layouts/types/grid' },
                            { text: 'Fixed', link: '/layouts/types/fixed' },
                            { text: 'Notebook', link: '/layouts/types/notebook' },
                            { text: 'Tabs', link: '/layouts/types/tabs' }
                        ]
                    }
                ]
            },
            {
                text: 'Contributing',
                collapsed: false,
                items: [
                    { text: 'Introduction', link: '/contributing/' },
                    {
                        text: 'Building Widgets',
                        collapsed: false,
                        items: [
                            { text: 'Adding Core Widgets', link: '/contributing/widgets/core-widgets' },
                            { text: 'Third Party Widgets', link: '/contributing/widgets/third-party' },
                            { text: 'Testing', link: '/contributing/widgets/testing' },
                            { text: 'Debugging', link: '/contributing/widgets/debugging' }
                        ]
                    },
                    {
                        text: 'Useful Guides',
                        collapsed: false,
                        items: [
                            { text: 'Repo Structure', link: '/contributing/guides/repo' },
                            { text: 'Events Architecture', link: '/contributing/guides/events' },
                            { text: 'State Management', link: '/contributing/guides/state-management' },
                            { text: 'Layout Managers', link: '/contributing/guides/layouts' },
                            { text: 'Registering Widgets', link: '/contributing/guides/registration' }
                        ]
                    },
                    {
                        text: 'Plugins',
                        collapsed: false,
                        items: [
                            { text: 'Adding Plugins', link: '/contributing/plugins/' }
                        ]
                    }
                ]
            }
        ]
    }
}
