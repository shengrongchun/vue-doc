// .vuepress/enhanceApp.js
// 全局注册 Element 组件库
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

export default ({
  Vue,
}) => {
  Vue.use(Element)
}