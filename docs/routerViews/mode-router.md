# 完善 `mode`
[官网介绍](https://router.vuejs.org/zh/guide/essentials/history-mode.html)

完整代码分支 [stage-11](https://github.com/shengrongchun/parse-vue-router)

`mode` 的类型有三种：`hash history abstract`，我们之前一直默认讨论的都是 `history` 模式。`mode` 用户可以通过路由配置信息设置
### index.js
```js{14,17,20}
let mode = options.mode || 'hash' //默认是hash模式，如果没定义的话
// 设置 history默认，在不支持的情况下会回退到hash模式
// this.fallback 表示在浏览器不支持 history.pushState 的情况下，根据传入的 fallback 配置参数，决定是否回退到hash模式
this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
if (this.fallback) {
  mode = 'hash'
}
if (!inBrowser) {//非浏览器环境下的模式 abstract
  mode = 'abstract'
}
this.mode = mode
switch (mode) {
  case 'history':
    this.history = new HTML5History(this, options.base)
    break
  case 'hash':
    this.history = new HashHistory(this, options.base, this.fallback)
    break
  case 'abstract':
    this.history = new AbstractHistory(this, options.base)
    break
  default:
    if (process.env.NODE_ENV !== 'production') {
      assert(false, `invalid mode: ${mode}`)
    }
}
```
根据代码注释很容易看懂，我们之前一直使用的是 `HTML5History`。现在我们要分别解析 `HashHistory` `AbstractHistory`

### HashHistory
```js
```

