const vueSideBar = require('./sidebar/vue')
const routerSideBar = require('./sidebar/router')

//
module.exports = {
  title: 'Vue 全家桶源码解析系列',
  base: '/vue-doc/',
  dest: 'dist',
  description: '图文并茂解析Vue全家桶',
  markdown: {
    lineNumbers: true
  },
  plugins: ['@vuepress/back-to-top'],//回到顶部
  themeConfig: {
    nav: [
      { text: 'Vue', link: '/vueViews/' },
      { text: 'Vue-Router', link: '/routerViews/' },
      { text: 'github', link: 'https://github.com/shengrongchun/vue-doc' },// 导航栏配置github
    ],
    sidebar: {
      '/vueViews/': vueSideBar,
      '/routerViews/': routerSideBar,
    },
    //displayAllHeaders: true,
    sidebarDepth: 3,
    lastUpdated: 'Last Updated',
  },
}