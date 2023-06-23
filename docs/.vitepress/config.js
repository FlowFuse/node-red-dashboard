export default {
    locales: {
      root: {
        lang: 'en',
        label: 'English',
        title: 'Node-RED Dashboard 2.0',
        description: 'Vue-powered Static Site Generator',
      }
    },
    themeConfig: {
      nav: [
        { text: 'GitHub', link: 'https://github.com/flowforge/flowforge-nr-dashboard' }
      ],
      search: {
        provider: 'local'
      },
      sidebar: [
        {
          text: 'Introduction',
          collapsed: false,
          items: [
            { text: 'Getting Started', link: '/getting-started' }
          ]
        },
        {
          text: 'Widgets',
          collapsed: false,
          items: [
            { text: 'ui-button', link: '/widgets/ui-button' }
          ]
        },
        {
          text: 'Contributing',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/contributing/' },
            { text: 'Architecture', link: '/contributing/architecture' }
          ]
        }
      ]
    }
  }