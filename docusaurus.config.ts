import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "ltlyl-web",
  tagline: "Dinosaurs are cool",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://web.ltlyl.fun",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "facebook", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "zh",
    locales: ["zh"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/ltlylfun/ltlyl-web/tree/main",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/ltlylfun/ltlyl-web/tree/main",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/logo.jpg",
    navbar: {
      title: "ltlyl-web",
      logo: {
        alt: "ltlyl-web Logo",
        src: "img/logo.jpg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "JSSidebar",
          position: "left",
          label: "JS",
        },
        {
          type: "docSidebar",
          sidebarId: "TSSidebar",
          position: "left",
          label: "TS",
        },
        {
          type: "docSidebar",
          sidebarId: "CSSSidebar",
          position: "left",
          label: "CSS",
        },
        {
          type: "docSidebar",
          sidebarId: "SMLSidebar",
          position: "left",
          label: "状态管理库",
        },
        {
          type: "docSidebar",
          sidebarId: "FFSidebar",
          position: "left",
          label: "前端框架",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          type: "docSidebar",
          sidebarId: "RLSidebar",
          position: "right",
          label: "推荐链接",
        },
        {
          href: "https://github.com/ltlylfun",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "项目-求star:)",
          items: [
            {
              label: "简历制作网站",
              href: "https://resumetojob.ltlyl.fun/",
            },
          ],
        },
        {
          title: "社交账号",
          items: [
            // {
            //   label: "Stack Overflow",
            //   href: "https://stackoverflow.com/questions/tagged/docusaurus",
            // },
            // {
            //   label: "Discord",
            //   href: "https://discordapp.com/invite/docusaurus",
            // },
            // {
            //   label: "X",
            //   href: "https://x.com/docusaurus",
            // },
          ],
        },
        {
          title: "其他",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/ltlylfun",
            },
            {
              label: "许可证",
              href: "https://creativecommons.org/licenses/by/4.0/",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ltlylfun 本站内容采用 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0 许可证</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
