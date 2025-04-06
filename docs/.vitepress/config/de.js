const localeBasePath = '/de'

export default {
    lang: 'de-DE',
    description: 'Entdecken Sie die Funktionen und Vorteile des Node-RED Dashboards 2.0, das entwickelt wurde, um Ihr Node-RED-Erlebnis zu optimieren und zu verbessern.',

    themeConfig: {
        nav: [
            { text: 'Dokumentation', link: `${localeBasePath}/getting-started.html` },
            { text: 'Widgets', link: `${localeBasePath}/nodes/widgets.html` },
            { text: 'Mitwirken', link: `${localeBasePath}/contributing/` },
            { text: 'FlowFuse', link: 'https://flowfuse.com' }
        ],

        sidebar: [
            { text: 'Über', link: `${localeBasePath}/about` },
            { text: 'Erste Schritte', link: `${localeBasePath}/getting-started` },
            { text: 'Widgets', link: `${localeBasePath}/nodes/widgets` },
            {
                text: 'Benutzerhandbücher',
                base: `${localeBasePath}/user/`,
                collapsed: false,
                items: [
                    { text: 'Einstellungen', link: 'settings' },
                    { text: 'Seitenleiste', link: 'sidebar' },
                    { text: 'Dynamische Eigenschaften', link: 'dynamic-properties' },
                    { text: 'Migrationsanleitung', link: 'migration' },
                    { text: 'UI-Vorlagenbeispiele', link: 'template-examples' },
                    { text: 'Multi-Tenancy', link: 'multi-tenancy' },
                    { text: 'Subflows', link: 'subflows' },
                    { text: 'Installation auf Mobilgeräten', link: 'pwa' }
                ]
            },
            {
                text: 'Knoten',
                collapsed: false,
                items: [
                    {
                        text: 'Konfigurationsknoten',
                        base: `${localeBasePath}/nodes/config/`,
                        collapsed: false,
                        items: [
                            { text: 'ui-base', link: 'ui-base' },
                            { text: 'ui-page', link: 'ui-page' },
                            { text: 'ui-link', link: 'ui-link' },
                            { text: 'ui-group', link: 'ui-group' },
                            { text: 'ui-theme', link: 'ui-theme' }
                        ]
                    },
                    {
                        text: 'Widgets',
                        base: `${localeBasePath}/nodes/widgets/`,
                        collapsed: false,
                        items: [
                            { text: 'ui-audio', link: 'ui-audio' },
                            { text: 'ui-button', link: 'ui-button' },
                            { text: 'ui-button-group', link: 'ui-button-group' },
                            { text: 'ui-control', link: 'ui-control' },
                            { text: 'ui-chart', link: 'ui-chart' },
                            { text: 'ui-dropdown', link: 'ui-dropdown' },
                            { text: 'ui-event', link: 'ui-event' },
                            { text: 'ui-file-input', link: 'ui-file-input' },
                            { text: 'ui-form', link: 'ui-form' },
                            { text: 'ui-gauge', link: 'ui-gauge' },
                            { text: 'ui-markdown', link: 'ui-markdown' },
                            { text: 'ui-notification', link: 'ui-notification' },
                            { text: 'ui-number-input', link: 'ui-number-input' },
                            { text: 'ui-radio-group', link: 'ui-radio-group' },
                            { text: 'ui-slider', link: 'ui-slider' },
                            { text: 'ui-spacer', link: 'ui-spacer' },
                            { text: 'ui-switch', link: 'ui-switch' },
                            { text: 'ui-table', link: 'ui-table' },
                            { text: 'ui-template', link: 'ui-template' },
                            { text: 'ui-text', link: 'ui-text' },
                            { text: 'ui-text-input', link: 'ui-text-input' }
                        ]
                    }
                ]
            },
            {
                text: 'Layouts',
                collapsed: false,
                items: [
                    { text: 'Erste Schritte', link: `${localeBasePath}/layouts/` },
                    {
                        text: 'Typen',
                        base: `${localeBasePath}/layouts/types/`,
                        items: [
                            { text: 'Raster', link: 'grid' },
                            { text: 'Fest', link: 'fixed' },
                            { text: 'Notizbuch', link: 'notebook' },
                            { text: 'Tabs', link: 'tabs' }
                        ]
                    }
                ]
            },
            {
                text: 'Mitwirken',
                collapsed: false,
                items: [
                    { text: 'Einführung', link: `${localeBasePath}/contributing/` },
                    {
                        text: 'Widgets Erstellen',
                        base: `${localeBasePath}/contributing/widgets/`,
                        collapsed: false,
                        items: [
                            { text: 'Kern-Widgets Hinzufügen', link: 'core-widgets' },
                            { text: 'Drittanbieter-Widgets', link: 'third-party' },
                            { text: 'Testen', link: 'testing' },
                            { text: 'Debugging', link: 'debugging' }
                        ]
                    },
                    {
                        text: 'Nützliche Anleitungen',
                        base: `${localeBasePath}/contributing/guides/`,
                        collapsed: false,
                        items: [
                            { text: 'Repo-Struktur', link: 'repo' },
                            { text: 'Ereignisarchitektur', link: 'events' },
                            { text: 'Zustandsverwaltung', link: 'state-management' },
                            { text: 'Layout-Manager', link: 'layouts' },
                            { text: 'Widgets Registrieren', link: 'registration' }
                        ]
                    },
                    {
                        text: 'Plugins',
                        collapsed: false,
                        items: [
                            { text: 'Plugins Hinzufügen', link: `${localeBasePath}/contributing/plugins/` }
                        ]
                    }
                ]
            }
        ]
    }
}
