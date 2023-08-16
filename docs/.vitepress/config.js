export default {
    base: '/flowforge-nr-dashboard',
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
                { text: 'ui-radio-group', link: '/nodes/widgets/ui-radio-group' },
                { text: 'ui-form', link: '/nodes/widgets/ui-form' },
                { text: 'ui-slider', link: '/nodes/widgets/ui-slider' },
                { text: 'ui-switch', link: '/nodes/widgets/ui-switch' },
                { text: 'ui-template', link: '/nodes/widgets/ui-template' },
                { text: 'ui-text', link: '/nodes/widgets/ui-text' },
                { text: 'ui-text-input', link: '/nodes/widgets/ui-text-input' },
                { text: 'ui-markdown', link: '/nodes/widgets/ui-markdown' },
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
    }
  }