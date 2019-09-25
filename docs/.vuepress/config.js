module.exports = {
  title: 'Hello Vue',
  description: 'Just playing around',
  markdown: {
    lineNumbers: true
  },
  themeConfig : {
    nav:[ // 导航栏配置
      {text: '组件库', link: 'http://doc-data.hellobike.cn/#/doc/mOne'},
    ],
    sidebar: [
      {
        title: '前言',
        collapsable: false,
        children: [
          ['/', '暂缺'],
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