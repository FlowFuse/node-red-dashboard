const defaultMetaDescription = 'Discover the features and benefits of Node-RED Dashboard 2.0, designed to streamline and enhance your Node-RED experience.'

export default {
        
        title: 'Node-RED Dashboard 2.0',

        rewrites: {
            'en/:rest*': ':rest*'
        },
        cleanUrls: true,

       
        head: [
            ['link', { rel: 'icon', href: '/favicon.ico' }],
            ['meta', { property: 'og:image', content: 'https://dashboard.flowfuse.com/dashboard_og.jpg' }],
            ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
            ['meta', { property: 'og:locale', content: 'en' }],
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
                    src: 'https://www.googletagmanager.com/gtag/js?id=G-MNGVF5NCF7'
                }
            ],
            [
                'script',
                {},
                "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-MNGVF5NCF7');"
            ],
            [
                'script',
                {
                    id: 'hs-script-loader',
                    async: true,
                    src: '//js-eu1.hs-scripts.com/26586079.js'
                }
            ]
        ],
        transformPageData (pageData) {
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
                { name: 'description', content: metaDescription }
            ])
        },
        themeConfig: {
            logo: { src: '/logo.png', alt: 'Node-RED Dashboard 2.0 Logo' },
            socialLinks: [
                { icon: 'github', link: 'https://github.com/FlowFuse/node-red-dashboard' },
                { icon: 'twitter', link: 'https://twitter.com/FlowFuseInc' },
                { icon: 'discord', link: 'https://discord.gg/2RrvW8dkrF' },
                { icon: 'youtube', link: 'https://www.youtube.com/channel/UCbBzP8NZbv3WDtlt4UouA-g' },
                {
                    icon: {
                        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" role="img"><path d="M12.103 0C18.666 0 24 5.485 24 11.997c0 6.51-5.33 11.99-11.9 11.99L0 24V11.79C0 5.28 5.532 0 12.103 0zm.116 4.563a7.395 7.395 0 0 0-6.337 3.57 7.247 7.247 0 0 0-.148 7.22L4.4 19.61l4.794-1.074a7.424 7.424 0 0 0 8.136-1.39 7.256 7.256 0 0 0 1.737-7.997 7.375 7.375 0 0 0-6.84-4.585h-.008z"/></svg>'
                    },
                    link: 'https://discourse.nodered.org/tag/dashboard-2',
                    ariaLabel: 'Node-RED Forum'
                },
                { icon: 'npm', link: 'https://www.npmjs.com/package/@flowfuse/node-red-dashboard' }
            ],
            outline: [2, 3],
            search: {
                provider: 'local'
            }
        },
        sitemap: {
            hostname: 'https://dashboard.flowfuse.com'
        },
        lastUpdated: true
    }
