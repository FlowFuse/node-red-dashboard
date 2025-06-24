import { loadEnv } from 'vite';
import en from './locales/en.json';

export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  return {
    base: '/',
    locales: {
      root: {
        lang: 'en',
        label: 'English',
        title: en['title'],
        description: en['description']
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
        ? en['description']
        : pageData.frontmatter.description

      pageData.frontmatter.head.push([
        'meta',
        { name: 'description', content: metaDescription}
      ])
    },
    themeConfig: {
      logo: { src: '/logo.png', alt: 'FlowFuse Dashboard Logo' },
      nav: [
        { text: en['nav']['docs'], link: '/getting-started.html' },
        { text: en['nav']['widgets'], link: '/nodes/widgets.html' },
        { text: en['nav']['contributing'], link: '/contributing/' },
        { text: en['nav']['flowfuse'], link: 'https://flowfuse.com' },
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
        { text: en['sidebar']['about'], link: '/about'},
        { text: en['sidebar']['getting-started'], link: '/getting-started' },
        { text: en['sidebar']['widgets'], link: '/nodes/widgets' },
        {
          text: en['sidebar']['user-guides'],
          collapsed: false,
          items: [
            { text: en['sidebar']['settings'], link: '/user/settings' },
            { text: en['sidebar']['sidebar'], link: '/user/sidebar' },
            { text: en['sidebar']['dynamic-properties'], link: '/user/dynamic-properties' },
            { text: en['sidebar']['migration-guide'], link: '/user/migration' },
            { text: en['sidebar']['ui-template-examples'], link: '/user/template-examples' },
            { text: en['sidebar']['multi-tenancy'], link: '/user/multi-tenancy' },
            { text: en['sidebar']['subflows'], link: '/user/subflows' },
            { text: en['sidebar']['installing-on-mobile'], link: '/user/pwa' }
          ]
        },
        {
          text: en['sidebar']['nodes'],
          collapsed: false,
          items: [
            {
              text: en['sidebar']['config-nodes'],
              collapsed: false,
              items: [
                { text: en['nodes']['ui-base'], link: '/nodes/config/ui-base' },
                { text: en['nodes']['ui-page'], link: '/nodes/config/ui-page' },
                { text: en['nodes']['ui-link'], link: '/nodes/config/ui-link' },
                { text: en['nodes']['ui-group'], link: '/nodes/config/ui-group' },
                { text: en['nodes']['ui-theme'], link: '/nodes/config/ui-theme' }
              ]
            },
            {
              text: en['sidebar']['widgets'],
              collapsed: false,
              items: [
                { text: en['nodes']['ui-audio'], link: '/nodes/widgets/ui-audio' },
                { text: en['nodes']['ui-button'], link: '/nodes/widgets/ui-button' },
                { text: en['nodes']['ui-button-group'], link: '/nodes/widgets/ui-button-group' },
                { text: en['nodes']['ui-control'], link: '/nodes/widgets/ui-control' },
                { text: en['nodes']['ui-chart'], link: '/nodes/widgets/ui-chart' },
                { text: en['nodes']['ui-dropdown'], link: '/nodes/widgets/ui-dropdown' },
                { text: en['nodes']['ui-event'], link: '/nodes/widgets/ui-event' },
                { text: en['nodes']['ui-file-input'], link: '/nodes/widgets/ui-file-input' },
                { text: en['nodes']['ui-form'], link: '/nodes/widgets/ui-form' },
                { text: en['nodes']['ui-gauge'], link: '/nodes/widgets/ui-gauge' },
                { text: en['nodes']['ui-markdown'], link: '/nodes/widgets/ui-markdown' },
                { text: en['nodes']['ui-notification'], link: '/nodes/widgets/ui-notification' },
                { text: en['nodes']['ui-number-input'], link: '/nodes/widgets/ui-number-input' },
                { text: en['nodes']['ui-progress'], link: '/nodes/widgets/ui-progress' },
                { text: en['nodes']['ui-radio-group'], link: '/nodes/widgets/ui-radio-group' },
                { text: en['nodes']['ui-slider'], link: '/nodes/widgets/ui-slider' },
                { text: en['nodes']['ui-spacer'], link: '/nodes/widgets/ui-spacer' },
                { text: en['nodes']['ui-switch'], link: '/nodes/widgets/ui-switch' },
                { text: en['nodes']['ui-table'], link: '/nodes/widgets/ui-table' },
                { text: en['nodes']['ui-template'], link: '/nodes/widgets/ui-template' },
                { text: en['nodes']['ui-text'], link: '/nodes/widgets/ui-text' },
                { text: en['nodes']['ui-text-input'], link: '/nodes/widgets/ui-text-input' },
              ]
            }
          ]
        },
        {
          text: en['sidebar']['layouts'],
          collapsed: false,
          items: [
            { text: en['sidebar']['getting-started'], link: '/layouts/' },
            { 
              text: en['sidebar']['types'],
              items: [
                { text: en['layouts']['grid'], link: '/layouts/types/grid' },
                { text: en['layouts']['fixed'], link: '/layouts/types/fixed' },
                { text: en['layouts']['notebook'], link: '/layouts/types/notebook' },
                { text: en['layouts']['tabs'], link: '/layouts/types/tabs' }
              ]
            }
          ]
        },
        {
          text: en['sidebar']['contributing'],
          collapsed: false,
          items: [
            { text: en['sidebar']['introduction'], link: '/contributing/' },
            {
              text: en['sidebar']['building-widgets'],
              collapsed: false,
              items: [
                { text: en['sidebar']['adding-core-widgets'], link: '/contributing/widgets/core-widgets' },
                { text: en['sidebar']['third-party-widgets'], link: '/contributing/widgets/third-party' },
                { text: en['sidebar']['testing'], link: '/contributing/widgets/testing' },
                { text: en['sidebar']['debugging'], link: '/contributing/widgets/debugging' }
              ]
            },
            {
              text: en['sidebar']['useful-guides'],
              collapsed: false,
              items: [
                { text: en['sidebar']['repo-structure'], link: '/contributing/guides/repo' },
                { text: en['sidebar']['events-architecture'], link: '/contributing/guides/events' },
                { text: en['sidebar']['state-management'], link: '/contributing/guides/state-management' },
                { text: en['sidebar']['layout-managers'], link: '/contributing/guides/layouts' },
                { text: en['sidebar']['registering-widgets'], link: '/contributing/guides/registration' }
              ]
            },
            {
              text: en['sidebar']['plugins'],
              collapsed: false,
              items: [
                { text: en['sidebar']['adding-plugins'], link: '/contributing/plugins/' }
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
