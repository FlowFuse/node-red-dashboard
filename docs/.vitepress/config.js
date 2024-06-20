import { loadEnv } from 'vite';
const defaultMetaDescription = "Discover the features and benefits of Node-RED Dashboard 2.0, designed to streamline and enhance your Node-RED experience."

export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  return {
    base: '/',
    locales: {
      root: {
        lang: 'en',
        label: 'English',
        title: 'Node-RED Dashboard 2.0',
        description: defaultMetaDescription
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
          if (!window.posthog){!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('${process.env.VITE_POSTHOG_APIKEY}',{api_host:'https://eu.posthog.com', capture_pageview: false, capture_pageleave: false})}
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
      [
        'script',
        {
          id: 'hs-script-loader',
          async: true,
          src: "//js-eu1.hs-scripts.com/26586079.js",
        },
      ]
    ],
    transformPageData(pageData) {
      const canonicalUrl = `https://dashboard.flowfuse.com/${pageData.relativePath}`
        .replace(/index\.md$/, '')
        .replace(/\.md$/, '.html')
  
      pageData.frontmatter.head ??= []
      pageData.frontmatter.head.push([
        'link',
        { rel: 'canonical', href: canonicalUrl }
      ])

      const metaDescription = 
        pageData.frontmatter.description === undefined
        ? defaultMetaDescription
        : pageData.frontmatter.description

      pageData.frontmatter.head.push([
        'meta',
        { name: 'description', content: metaDescription}
      ])
    },
    themeConfig: {
      logo: { src: '/logo.png', alt: 'Node-RED Dashboard 2.0 Logo' },
      nav: [
        { text: 'Docs', link: '/getting-started.html' },
        { text: 'Widgets', link: '/nodes/widgets.html' },
        { text: 'Contributing', link: '/contributing/' },
        { text: 'FlowFuse', link: 'https://flowfuse.com' },
      ],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/FlowFuse/node-red-dashboard' },
        { icon: 'twitter', link: 'https://twitter.com/FlowFuseInc' },
        { icon: 'discord', link: 'https://discord.gg/2RrvW8dkrF' },
        { icon: 'youtube', link: 'https://www.youtube.com/channel/UCbBzP8NZbv3WDtlt4UouA-g' },
        {
          icon: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" role="img"><path d="M12.103 0C18.666 0 24 5.485 24 11.997c0 6.51-5.33 11.99-11.9 11.99L0 24V11.79C0 5.28 5.532 0 12.103 0zm.116 4.563a7.395 7.395 0 0 0-6.337 3.57 7.247 7.247 0 0 0-.148 7.22L4.4 19.61l4.794-1.074a7.424 7.424 0 0 0 8.136-1.39 7.256 7.256 0 0 0 1.737-7.997 7.375 7.375 0 0 0-6.84-4.585h-.008z"/></svg>',
          },
          link: 'https://discourse.nodered.org/tag/dashboard-2',
          ariaLabel: 'Node-RED Forum'
        },
        { icon: 'npm', link: 'https://www.npmjs.com/package/@flowfuse/node-red-dashboard'}
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
            { text: 'Getting Started', link: '/layouts/' },
            { 
              text: 'Types',
              items: [
                { text: 'Grid', link: '/layouts/types/grid' },
                { text: 'Fixed', link: '/layouts/types/fixed' },
                { text: 'Notebook', link: '/layouts/types/notebook' }
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
    },
    sitemap: {
      hostname: 'https://dashboard.flowfuse.com'
    },
    lastUpdated: true
  }
}
