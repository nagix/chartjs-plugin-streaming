const BRANCH = process.env.BRANCH || (process.env.NODE_ENV === 'development' ? 'local' : '');
const IS_DEV = BRANCH ? !BRANCH.match(/^v\d\.\d\.\d/) : false;
const DOCS_VERSION = "VERSION";
const BASE = IS_DEV ? '/chartjs-plugin-streaming/master/' : `/chartjs-plugin-streaming/${DOCS_VERSION}/`;
const REPO_NAME = 'nagix/chartjs-plugin-streaming';
const REPO_URL = `https://github.com/${REPO_NAME}`;

module.exports = {
  dest: 'dist/docs',
  theme: 'chartjs',
  title: 'chartjs-plugin-streaming',
  description: 'Chart.js plugin for live streaming data',
  base: BASE,
  head: [
    ['link', {rel: 'icon', href: '/logo.png'}]
  ],
  plugins: [
    ['flexsearch'],
    ['@vuepress/html-redirect', {
      countdown: 0
    }],
    ['@vuepress/google-analytics', {
      ga: 'UA-39988758-2'
    }],
    ['redirect', {
      redirectors: [
        {base: '/tutorials', alternative: ['plainjs/scripts']},
        {base: '/samples', alternative: ['charts/line-horizontal']}
      ]
    }],
    ['@simonbrunel/vuepress-plugin-versions', {
      filters: {
        suffix: (tag) => tag ? ` (${tag})` : '',
        title: (v, vars) => window.location.href.includes('master') ? 'Development (master)' : v + (vars.tag ? ` (${tag})` : ''),
        link: (v, vars) => vars.prerelease ? 'next' : v
      },
      menu: {
        text: '{{version|title}}',
        items: [
          {
            text: 'Documentation',
            items: [
              {
                text: 'Development (master)',
                link: '/chartjs-plugin-streaming/master/'
              },
              {
                type: 'versions',
                text: '{{version}}{{tag|suffix}}',
                link: '/chartjs-plugin-streaming/{{version|link}}/',
                exclude: /^0\.|1\.[0-8]\./,
                group: 'minor'
              }
            ]
          },
          {
            text: 'Release notes (5 latest)',
            items: [
              {
                type: 'versions',
                limit: 5,
                group: 'patch',
                link: `${REPO_URL}/releases/tag/v{{version}}`
              }
            ]
          }
        ]
      }
    }]
  ],
  chainWebpack: (config) => {
    config.merge({
      resolve: {
        alias: {
          // Hammerjs requires window, using ng-hammerjs instead
          'hammerjs': 'ng-hammerjs'
        }
      }
    });
  },
  themeConfig: {
    repo: REPO_NAME,
    docsDir: 'docs',
    editLinks: true,
    logo: '/logo.png',
    lastUpdated: 'Last Updated',
    searchPlaceholder: 'Search...',
    chart: {
      imports: [
        ['scripts/chartjs-chart-financial.js'],
        ['scripts/register.js'],
        ['scripts/utils.js', 'Utils']
      ]
    },
    nav: [
      {text: 'Home', link: '/'},
      {text: 'Guide', link: '/guide/'},
      {text: 'Tutorials', link: '/tutorials/'},
      {text: 'Samples', link: '/samples/'}
    ],
    sidebar: {
      '/guide/': [
        '',
        'getting-started',
        'options',
        'data-feed-models',
        'integration',
        'performance',
        'migration'
      ],
      '/tutorials/': [
        {
          title: 'Plain JS',
          children: [
            'plainjs/scripts',
            'plainjs/canvas',
            'plainjs/chart',
            'plainjs/stream',
            'plainjs/delay',
            'plainjs/color'
          ]
        },
        {
          title: 'Angular 2+',
          children: [
            'angular/app',
            'angular/install',
            'angular/import',
            'angular/canvas',
            'angular/chart',
            'angular/stream'
          ]
        },
        {
          title: 'React',
          children: [
            'react/app',
            'react/install',
            'react/chart',
            'react/stream'
          ]
        },
        {
          title: 'Vue',
          children: [
            'vue/app',
            'vue/install',
            'vue/main',
            'vue/chart',
            'vue/stream'
          ]
        }
      ],
      '/samples/': [
        {
          title: 'Charts',
          children: [
            'charts/line-horizontal',
            'charts/line-vertical',
            'charts/bar-horizontal',
            'charts/bar-vertical',
            'charts/mixed-horizontal',
            'charts/mixed-vertical',
            'charts/bubble-horizontal',
            'charts/bubble-vertical'
          ]
        },
        {
          title: 'Integration',
          children: [
            'integration/datalabels',
            'integration/annotation',
            'integration/zoom',
            'integration/financial'
          ]
        },
        {
          title: 'Advanced',
          children: [
            'advanced/interactions',
            'advanced/reverse',
            'advanced/push'
          ]
        }
      ]
    }
  }
};
