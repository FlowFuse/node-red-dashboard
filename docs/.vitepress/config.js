import { loadEnv } from 'vite';

export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  return {
    base: '/',
    locales: {
      root: {
        lang: 'en',
        label: 'English',
        title: 'Node-RED Dashboard 2.0',
        description: 'Documentation for Node-RED Dashboard 2.0, a collection of nodes to build out data visualisations and dashboards in Node-RED',
      }
    },
    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }],
      ['meta', { property: 'og:image', content: 'https://dashboard.flowfuse.com/dashboard_og.jpg' }],
      ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
      [
        'script',
        {},
        `
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('${process.env.VITE_POSTHOG_APIKEY}',{api_host:'https://eu.posthog.com'})
        `
      ],
      [
        'script',
        {
          async: true,
          src: 'https://www.googletagmanager.com/gtag/js?id=G-MNGVF5NCF7',
        },
      ],
      [
        'script',
        {},
        "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-MNGVF5NCF7');",
      ],
    ],
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
        { text: 'About', link: '/about'},
        { text: 'Getting Started', link: '/getting-started' },
        { text: 'Widgets', link: '/nodes/widgets' },
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
                { text: 'ui-chart', link: '/nodes/widgets/ui-chart' },
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
}