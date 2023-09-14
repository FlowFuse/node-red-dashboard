export default {
    base: '/',
    locales: {
      root: {
        lang: 'en',
        label: 'English',
        title: 'Node-RED Dashboard 2.0',
        description: 'Documentation for Node-RED Dashboard 2.0, a collection of nodes to build out data visualisations and dashboards in Node-RED',
      }
    },
    themeConfig: {
      // logo: '/logo.png',
      nav: [
        { text: 'FlowFuse', link: 'https://flowfuse.com' },
        { text: 'GitHub', link: 'https://github.com/flowforge/flowforge-nr-dashboard' }
      ],
      outline: [2, 3],
      search: {
        provider: 'local'
      },
      sidebar: [
        {
          text: 'Introduction',
          collapsed: false,
          items: [
            { text: 'About', link: '/' },
            { text: 'Getting Started', link: '/getting-started' }
          ]
        },
        {
          text: 'User Guides',
          collapsed: false,
          items: [
            { text: 'Settings', link: '/user/settings' },
            { text: 'Dynamic Properties', link: '/user/dynamic-properties' }
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
                { text: 'ui-theme', link: '/nodes/config/ui-theme' }
              ]
            },
            {
              text: 'Widgets',
              collapsed: false,
              items: [
                { text: 'ui-button', link: '/nodes/widgets/ui-button' },
                { text: 'ui-dropdown', link: '/nodes/widgets/ui-dropdown' },
                { text: 'ui-form', link: '/nodes/widgets/ui-form' },
                { text: 'ui-markdown', link: '/nodes/widgets/ui-markdown' },
                { text: 'ui-notification', link: '/nodes/widgets/ui-notification' },
                { text: 'ui-radio-group', link: '/nodes/widgets/ui-radio-group' },
                { text: 'ui-slider', link: '/nodes/widgets/ui-slider' },
                { text: 'ui-switch', link: '/nodes/widgets/ui-switch' },
                { text: 'ui-table', link: '/nodes/widgets/ui-table' },
                { text: 'ui-template', link: '/nodes/widgets/ui-template' },
                { text: 'ui-text', link: '/nodes/widgets/ui-text' },
                { text: 'ui-text-input', link: '/nodes/widgets/ui-text-input' },
              ]
            }
          ]
        },
        {
          text: 'Layouts',
          collapsed: false,
          items: [
            { text: 'Flex', link: '/layouts/flex' },
            { text: 'Grid', link: '/layouts/grid' },
            { text: 'Notebook', link: '/layouts/notebook' }
          ]
        },
        {
          text: 'Contributing',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/contributing/' },
            {
              text: 'Guides',
              collapsed: false,
              items: [
                { text: 'Repo Structure', link: '/contributing/guides/repo' },
                { text: 'Events Architecture', link: '/contributing/guides/events' },
                { text: 'Layout Managers', link: '/contributing/guides/layouts' },
                { text: 'Adding Widgets', link: '/contributing/guides/adding-widgets' }
              ]
            }
          ]
        }
      ]
    },
    sitemap: {
      hostname: 'https://dashboard.flowfuse.com'
    },
    lastUpdated: true
  }