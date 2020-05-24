module.exports = {
  title: 'Vue Parse',
  description: '图文并茂解析vue主要原理',
  markdown: {
    lineNumbers: true
  },
  themeConfig : {
    nav:[ // 导航栏配置github
      {text: 'github', link: 'https://github.com/shengrongchun/vue-doc'},
    ],
    sidebar: [
      {
        title: '前言',
        collapsable: false,
        children: [
          ['/', '说明'],
        ]
      },
      {
        title: 'Vue',
        collapsable: false,
        children: [
          ['/vueViews/start-vue', 'template'],
        ]
      },
      {
        title: '原理',
        collapsable: false,
        children: [
          ['/vueViews/import-vue', 'Vue是什么'],
          ['/vueViews/render-view', '响应式原理'],          
        ]
      },
    ],
    displayAllHeaders: true,
    lastUpdated: 'Last Updated',
  },
}