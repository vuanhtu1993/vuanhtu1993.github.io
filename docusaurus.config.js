// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Anhhtus stories',
  tagline: 'Blog',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://vuanhtu1993.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'vuanhtu1993', // Usually your GitHub org/user name.
  projectName: 'vuanhtu1993.github.io', // Usually your repo name.
  deploymentBranch: "main",
  trailingSlash: false,
  onBrokenLinks: 'throw',

  // Markdown configuration (new location for Docusaurus v4 compatibility)
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        // docs: false,
        blog: {
          showReadingTime: true,
          blogSidebarTitle: 'Các bài viết gần đây',
          blogSidebarCount: 'ALL',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-GQETJJQ2L9',
          anonymizeIP: true,
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social_card.jpg',
      algolia: {
        // App ID do Algolia cung cấp sau khi bạn được duyệt account Docsearch
        appId: 'W95VTU3G1X',

        // Public API key: an toàn khi commit lên Github 
        apiKey: 'ba56a847029d79091a82d46758b7aeae',

        indexName: 'anhtus stories',

        // Tùy chọn: contextualSearch mặc định là true. Cho phép lọc kết quả theo phiên bản docs hoặc ngôn ngữ 
        contextualSearch: true,

        // Tùy chọn: tự động tạo route `search` cho toàn bộ blog
        searchPagePath: 'search',
      },
      navbar: {
        title: "",
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.jpg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tài chính cá nhân',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/vuanhtu1993',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/vuanhtu1993',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Stories. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
