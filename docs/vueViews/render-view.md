# 响应式原理
<!-- 我并不想一开始就去跟随源码来一步一步的讲解`vue`,原因有以下几点:
- 读者没有了解vue的整个架构，跟随看源码看会云里雾里
- 对源码的讲解，可能自己表达力不够
- 网上分析源码的文章很多 -->
## template 到 DOM
接触 `vue` 框架的开发者都了解，我们有两种方式写 `'html'`
- 通过 `template` 的方式
- 通过 `render` 函数的方式

如果是通过 `template` 的方式，最终还是要转为 `render` 函数。
小提示: `vue` 的版本有几种，如不带编译的版本（无 `template` 转 `render` 函数功能）。我们平时大多使用这种版本。不是因为我们不写 `template`, 而是我们的 `template` 都会写在`.vue` 的文件中。而 `.vue` 的文件是通过 `vue-loader` 加载器加载的。`vue-loader` 会提取 `template` 给 `vue-template-compiler` 编译成 `render` 函数。

```html
<div id="app"></app>
```
```js
import Vue from 'vue'
new Vue({
  el: '#app', //寻找创建出来的DOM替换的地方
  template:'<span @click="changeName">{{ name }}</span>' //渲染的模板
  data() {
    return {
      name: '哈啰出行,点我试试!'
    }
  },
  methods: {
    changeName() {
      this.name = '哈啰出行，我看行'
    }
  }
});
```
<demo-1 />
`Vue` 中有个叫 `compile` 的编译函数, 此函数会把 `template` 编译成 `render` 函数，如以下的精简版:
````html
template
<span @click="changeName">{{ name }}</span>
````
````js
const { render } = Vue.compile(template)
vm._render = render
render--> () {
  return with(this){//如果直接vm._render()执行的话 this就是vm
    return _c('span',
      {
        on:{"click": changeName}
      },
      [
        _v( _s(name) )
      ]
    )
  }
}
````
执行 `vm._render` 函数的过程中会获取 `name` 的值（如果定义数据劫持，会触发 `get` 方法），返回 `vnode`。`vnode` 会传给 `vm._update` 方法更新 `vm.$el` 而 `vm.$el` 是 `#app` 的引用。
````html
<div id="app"></app>
````
````js
 vm.$el = el = document.querySeletor('#app')
````
所以当我们更改 `vm.$el` 页面就会随之改变, 而 `vm._update` 函数就是改变 `vm.$el`
````js
Vue.prototype._update = function (vnode) {
  const vm = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  vm._vnode = vnode
  // Vue.prototype.__patch__ is injected in entry points
  // based on the rendering backend used.
  if (!prevVnode) {
    // 初始化渲染
    vm.$el = vm.__patch__(vm.$el, vnode, false, false /* removeOnly */)
  } else {
    // 更新渲染
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
}
````
这里的 `vm.__patch__` 函数是通过 `diff` 算法对新旧 `vnode` 比较，更新 `$el`。而初始化阶段只是创建 `$el`。具体详情不在这里讨论
#### 现在我们知道只要执行 `vm._update(vm._render())` 页面就会立即更新渲染
我们可以把其封装在一个名叫 `updateComponent` 的函数中
````js
let updateComponent = () => {
  vm._update( vm._render() )
}
````
当每次需要执行页面更新渲染的时候，执行此函数即可。
## `data` 值改变重新渲染
当 `name` 值改变时，我们需要重新渲染页面，所以我们要对 `name` 进行数据劫持。当触发其 `set` 方法时, 执行 `updateComponent` 函数。如下流程图所示:
![vue-dom](./img/vue-dom.png)
整个初次渲染和更新渲染功能已经完成。不过看如下代码
````html
<span @click="changeName">{{name}}</span>
````
````js
data() {
  return {
    name: '哈啰出行',
    tag: '哈啰前端'
  }
}
````
当去触发 `name` 的 `set` 方法时会更新页面，而当触发 `tag` 的 `set` 方法时也会更新页面。此时的更新页面根本是多余，因为 `template` 模板中没有出现 `tag`。
#### 怎么知道哪些触发 `set` 方法时要更新，哪些不用呢？
在页面第一次初始化渲染的时候执行了 `render` 函数。函数的执行会触发所有在 `template` 模板中定义的变量（ `name` 等）的 `get` 方法。因此可以利用 `get` 方法来设置是否在触发 `set` 方法的时候执行更新。

每个 `data` 里面的数据变量都需要一个标识判断是否在 `set` 方法中执行更新函数。假如这个标识叫 `updateOk`，而仅仅靠是否触发 `get` 函数就判断是否可以执行更新方法似乎不够，如
````js
created() {
  const temp = this.tag;
}
````
在 `created` 方法中触发了 `tag` 的 `get` 方法，然而 `tag` 的改变并不需要更新页面。所以 `updateOk` 的值应该在 `render` 函数的执行前后变化着。`tempOk` 为全局变量，如
````js
let val = data.tag
get() {
  updateOk = tempOk
  return val
}
````
````js
let updateComponent = () => {
  tempOk = true
  vm._update( vm._render() )
  tempOk = false
 }//更新函数
````
改变后的流程图
![vue-dom1](./img/vue-dom1.png)

## watch 监听的实现
如下代码
````js
{
  data() {
    return {
      hello: {
        name: '哈啰前端'
      }
    }
  },
  watch: {
    'hello.name': function handler(newVal, oldVal)=> {
      console.log(newVal)
    }
  }
}
````
`watch` 功能是监听当 `hello.name` 的值发生变化的时候执行对应的 `handler` 方法，方法的参数是新旧值。分析功能有以下几点
- `hello.name` 的值变化要执行 `handler` 函数
- 要保存新旧值在 `handler` 函数执行时当参数传入

以下代码是对 `watch` 的 `key` 如 `hello.name` 获取其值的包装函数
````js
function parsePath (path) {
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
var getter = parsePath(watchKey) //例如 hello.name、a.b、a.b.c……
var oldVal = getter.call(vm, vm) //值的获取
````
`parsePath` 函数的功能是返回一个函数如 `getter`，此函数是获取监听表达式的值，而 `obj` 是执行 `getter` 函数所传的参数如 `vm` 。如果传递的参数是 `vm` 那就是在 `vm` 上获取值, 如：
```js
  watchKey: hello.name
  vm = vm.hello  // 触发 hello 的 get 方法
  vm = vm.name   // 触发 name 的 get 方法
  return vm      // *注 vm是引用但这里是=赋值，所以并不会担心改变传递来的 vm 的值
```

再次包装一下获取值的函数，如 `get`
````js
let get = (vm, watchKey)=> {
  let getter = parsePath(watchKey)
  let value = getter.call(vm, vm) //值的获取
  return value
}
````
仅仅只有获取表达式值得方法还不够，我们还需要执行 `handler` 函数的方法，如 `run`
```js
let run = (vm, watchKey, handler)=> {
  const value = get(vm, watchKey)
  handler.call(vm, value, oldValue)
}
```
我们需要一开始初始化的时候执行 `get` 方法缓存起来 `oldValue`，因此我们需要对其进行改造。通过创建一个对象 `watcher` ，此  `watcher` 对于每个 `watchKey` 来说都是唯一的，而且结构都一样，可以通过 `Watcher` 类来创建：
```js
let uid = 0
class Watcher {
  constructor (vm, watchKey, handler) {
    this.vm = vm
    this.handler = handler
    this.id = ++uid // watcher唯一标识
    this.getter = parsePath(watchKey)
    this.oldVal = this.get() //一开始就获取旧值缓存在watcher对象上
  }
  get() {
    Watcher = this; //全局变量 Watcher
    const vm = this.vm
    let value = this.getter.call(vm, vm) //值的获取
    Watcher = null
    return value
  }
  run() {
    const value = this.get() //新值
    const oldValue = this.oldVal //旧值
    this.oldVal = value //旧值替换，以便下次使用
    this.handler.call(this.vm, value, oldValue)
  }
}
```

当获取 `hello.name` 值触发 `get` 方法时，需要在 `get` 方法中收集 `hello.name` 对应的 `watcher` 对象，以便在触发 `set` 方法中直接 `wacther.run()` 执行。我们要把 `watcher` 对象赋值给一个全局变量 `Watcher` 。值获取结束要立即把 `Watcher` 全局变量设置 `null`，因为`data`里面定义的其他响应式变量触发 `set` 方法如果判断全局 `Watcher` 有值也会执行 `wacther.run()`

`watch` 的流程图如下
![vue-img](./img/vue-img.png)
以下代码输出的结果是什么？

````js
{
  data() {
    return {
      hello: {
        name: '哈啰前端'
      }
    }
  },
  watch: {
    'hello.name': function handler1(newval, oldVal) {
      console.log(newval);
    },
    hello: function handler2(newval, oldVal) {
      console.log(newval);
    }
  },
  mounted() {
    this.hello = '值得改变'
  }
}
````
按照以上所描述的流程图，在解析 `hello.name` 会同时触发 `hello` 的 `get` 方法和 `name` 的 `get` 方法。
此时 `hello` 已经收集了 `watcher1` 对象。当再次解析 `watch.hello` 的时候，又会触发 `hello` 的 `get` 方法，重新赋值 `watcher2` 对象。所以虽然触发了两次 `get` 方法，但只会收集 `wacther2` 对象。最终只执行 `wacther2` 对象的 `run` 方法，结果

`值得改变`

很遗憾的是 `Vue` 保留了两者，结果是

`undefined、值得改变`

`watcher1` 和 `watcher2` 的 `run` 方法都执行了，显然我们需要把 `watcher` 对象放入数组中，而并非替换。 对于每个响应式变量来说，创建一个唯一的 `subs` 数组存放收集的 `watcher`。在值改变触发 `set` 方法时，循环执行 `subs` 里面的 `watcher` `run` 方法，改变后流程图
![vue-img1](./img/vue-img1.png)
### 整合页面渲染 与 watch
再次看下页面渲染流程图
![vue-dom1](./img/vue-dom1.png)
- `watch` 的整个流程是先解析表达式，触发 `get` 收集相关 `watcher` 放入 `subs` 数组中，`set` 方法触发时，循环执行 `watcher`的 `run` 方法-->执行 `handler`
- 页面渲染的整个流程似乎也差不多，触发 `get` 收集是否执行更新方法的标识，`set` 方法触发时，执行更新函数

对于渲染页面而言，也可以创建 `watcher` 对象，触发 `get` 收集渲染 `watcher` 放入 `subs` 数组中。然后 `run` 方法执行-->执行渲染函数

页面渲染的 `watcher`
````js
let uid = 0
class Watcher {
  constructor (vm, updateComponent) {
    this.vm = vm
    this.id = ++uid // watcher唯一标识
    this.getter = updateComponent
    this.get() //一开始就立即执行渲染函数
  }
  get() {
    Watcher = this; //全局变量 Watcher
    const vm = this.vm
    this.getter.call(vm, vm) //执行updateComponent方法
    Watcher = null
  }
  run() {
    const value = this.get() //再次执行updateComponent渲染更新函数
  }
}
````
由于页面渲染没有 `handler` 方法，为了与 `watch` 的 `wather` 对象结构一样，对于页面渲染可以在`new Watcher` 的时候传入空函数作为 `handler` 函数
````js
let uid = 0
const handler = ()=> {}
class Watcher {
  constructor (vm, updateComponent, handler) {
    this.vm = vm
    this.handler = handler
    this.id = ++uid // watcher唯一标识
    this.getter = updateComponent
    this.oldVal = this.get() //一开始就获取旧值缓存在watcher对象上
  }
  get() {
    Watcher = this; //全局变量 Watcher
    const vm = this.vm
    let value = this.getter.call(vm, vm) //值的获取
    Watcher = null
    return value
  }
  run() {
    const value = this.get() //新值
    const oldValue = this.oldVal //旧值
    this.oldVal = value //旧值替换，以便下次使用
    this.handler.call(this.vm, value, oldValue)
  }
}
````
仔细观察发现，`watch` 和 `render` (渲染) 的 `wacther` 只有 `this.getter` 函数的获取是不一样了，可以根据是否为函数来判断，整合之后的 `watcher` 如下
```js
let uid = 0
class Watcher {
  constructor (vm, expOrFn, handler) {
    this.vm = vm
    this.handler = handler
    this.id = ++uid // watcher唯一标识
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
    }
    this.oldVal = this.get() //一开始就获取旧值缓存在watcher对象上
  }
  get() {
    Watcher = this; //全局变量 Watcher
    const vm = this.vm
    let value = this.getter.call(vm, vm) //值的获取
    Watcher = null
    return value
  }
  run() {
    const value = this.get() //新值
    const oldValue = this.oldVal //旧值
    this.oldVal = value //旧值替换，以便下次使用
    this.handler.call(this.vm, value, oldValue)
  }
}
```
渲染函数和 `watch` 共存的流程图
![vue-img2](./img/vue-img2.png)
看如下代码
````js
{
  watch: {
    name: function handler(newVal, oldVal) {
      console.log(newVal)
    }
  },
  created() {
    [1,2,……].forEach((item)=> {
      this.name = item
    })
  }
}
````

- 要是循环给 `name` 值赋值 `n` 次，那么是不是要执行 `n` 次更新
- 如果知道哪次赋值是最后触发 `set` 方法的，直接执行那次的更新函数不就行了？

对于以上问题，可以通过 `微任务` 或者 `宏任务` 的方式来解决，如果不清楚可以搜索浏览器的 `event loop` 来了解原理。大致原理就是 `set` 函数也是 `js` 的主程序。当主程序执行完毕后，会去执行微任务然后再宏任务。当把更新函数放在微任务（ `promise` 等）或者宏任务（ `setTimeout` 等）里面执行, 此时 `js` 的主程序已经执行完毕（所有的 `set` 触发），并且相关值（ `name` ）已经为最新值。此时执行更新函数可以获取最新值并且只执行一次。

假设此时的浏览器支持微任务 `promise` 定义如下函数 `timerFunc`
````js
const p = Promise.resolve()
let timerFunc = () => {
  p.then(updateComponent);
}
````
`set` 函数直接去执行 `timerFunc` 函数，会创建很多个 `promise` 微任务，导致还是会渲染更新很多次（虽然每次更新都是最新值）。所以设置一个中间函数 `renderUpdate`
````js
let waiting = false;
const p = Promise.resolve()
//
let timerFunc = () => {
  p.then(updateComponent);
}
//
function renderUpdate() {
  if(!waiting) {
    waiting = true;
    timerFunc();
  }
}
````
这样就保证了只会执行一次 `timerFunc`。但是新的问题出现了，`n` 次的数据变化已经得到了更新。但是页面更新后再次数据变化，由于 `waiting` 永远都是 `true` 无法再执行 `timerFunc` 函数更新页面。所以在 `updateComponent` 函数执行后，应该重新设置 `waiting`为 `false`。
````js
let waiting = false;
const p = Promise.resolve()
//
let timerFunc = () => {
  p.then(()=> {
    updateComponent();
    waiting = false;
  });
}
//
function renderUpdate() {
  if(!waiting) {
    waiting = true;
    timerFunc();
  }
}
````
改变后的流程图
![vue-dom1](./img/vue-dom1.png)
循环 `n` 次，`handler` 函数就执行 `n` 次，并且页面也会渲染 `n` 次，这并非我们所期望的。相同的 `watcher`，我们只需执行一次。应该为每个 `watcher` 添加唯一的 `id` ， 然后通过 `id` 去重。改变后的流程图
![vue-dom5](./img/vue-dom5.png)



