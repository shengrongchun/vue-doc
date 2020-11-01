module.exports = [
  {
    title: '前言',
    collapsable: false,
    children: [
      ['', '说明'],
    ]
  },
  {
    title: '基础',
    collapsable: false,
    children: [
      ['store-vuex', '$store'],
      ['moduleStore-vuex', 'module'],
      ['storeReact-vuex', '$store响应式'],
    ]
  },
  {
    title: '构造器选项',
    collapsable: false,
    children: [
      ['storeStrict-vuex', 'strict'],
      ['storePlugins-vuex', 'plugins'],
      ['storeDevtools-vuex', 'devtools'],
    ]
  },
  {
    title: '实例属性',
    collapsable: false,
    children: [
      ['storeState-vuex', 'state'],
      ['storeGetters-vuex', 'getters'],
    ]
  },
  {
    title: '实例方法',
    collapsable: false,
    children: [
      ['storeCommit-vuex', 'commit'],
      ['storeDispatch-vuex', 'dispatch'],
      ['storeSubscribe-vuex', 'subscribe'],
      ['storeSubscribeAction-vuex', 'subscribeAction'],
      ['storeWatch-vuex', 'watch'],
      ['storeReplaceState-vuex', 'replaceState'],
      ['storeRegisterModule-vuex', 'registerModule'],
      ['storeUnregisterModule-vuex', 'unregisterModule'],
      ['storeHasModule-vuex', 'hasModule'],
      ['storeHotUpdate-vuex', 'hotUpdate'],
    ]
  },
  {
    title: '组件绑定的辅助函数',
    collapsable: false,
    children: [
      ['mapState-vuex', 'mapState'],
      ['mapGetters-vuex', 'mapGetters'],
      ['mapActions-vuex', 'mapActions'],
      ['mapMutations-vuex', 'mapMutations'],
      ['createNamespacedHelpers-vuex', 'createNamespacedHelpers'],
    ]
  },
  {
    title: '辅助',
    collapsable: false,
    children: [
      ['ModuleCollection-vuex', 'ModuleCollection'],
      ['assertRawModule-vuex', 'assertRawModule'],
      ['Module-vuex', 'Module'],
      ['installModule-vuex', 'installModule'],
    ]
  },
  {
    title: '工具',
    collapsable: false,
    children: [
      ['util-vuex', '方法'],
    ]
  },
]