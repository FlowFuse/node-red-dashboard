export default {
    base: '/flowforge-nr-dashboard',
    locales: {
      root: {
        lang: 'en',
        label: 'English',
        title: 'Node-RED Dashboard 2.0',
        description: 'Vue-powered Static Site Generator',
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
                { 
                  text: 'ui-base',
                  link: '/nodes/config/ui-base'
                }
              ]
            },
            {
              text: 'Widgets',
              collapsed: false,
              items: [
                { 
                  text: 'ui-button',
                  link: '/nodes/widgets/ui-button'
                }
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