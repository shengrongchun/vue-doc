# 重定向和别名
[官网介绍](https://router.vuejs.org/zh/guide/essentials/redirect-and-alias.html)

完整代码分支 [stage-6](https://github.com/shengrongchun/parse-vue-router)

## 重定向

重定向也是通过 `routes` 配置来完成，下面例子是从 `/a` 重定向到 `/b`：
```js
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: '/b' }
  ]
})
```
重定向的目标也可以是一个命名的路由：
```js
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: { name: 'foo' }}
  ]
})
```
甚至是一个方法，动态返回重定向目标：
```js
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: to => {
      // 方法接收 目标路由 作为参数
      // return 重定向的 字符串路径/路径对象
    }}
  ]
})
```
首先我们需要解析我们从 `routes` 传来的 `redirect` 参数
#### create-route-map
```js{37}
import Regexp from 'path-to-regexp'
import { cleanPath } from './util/path'
import { assert, warn } from './util/warn'
//
export function createRouteMap(
  routes
) {
  const pathList = [] //创建空数组
  const pathMap = Object.create(null)//创建空对象
  const nameMap = Object.create(null)//创建空对象
  //遍历 routes 把 route 相关信息放入 pathList, pathMap, nameMap
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })
  …………
  //
  return {
    pathList,
    pathMap,
    nameMap
  }
}
function addRouteRecord(
  pathList,
  pathMap,
  nameMap,
  route,
  parent,
) {
  …………
  const record = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    name,
    parent,
    redirect: route.redirect, // 有重定向参数
    meta: route.meta || {},
    props: //路由组件传参 有了这个功能，组件可以不再和$route耦合
      route.props == null
        ? {}
        : route.components
          ? route.props
          : { default: route.props } //非多组件的情况下，就是对默认组件的设置
  }
  …………
}
```
代码很简单，就是在 `record` 上加了重定向的标示，在看创建路由阶段是怎么处理的

### create-matcher
```js
/* eslint-disable no-prototype-builtins */
import { resolvePath } from './util/path'
import { assert, warn } from './util/warn'
import { createRoute } from './util/route'
import { fillParams } from './util/params'
import { normalizeLocation } from './util/location'
import { createRouteMap } from './create-route-map'

export function createMatcher(
  routes,
  router
) {
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
  function match(
    raw,
    currentRoute,
    redirectedFrom
  ) {
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location
    if (name) {
      const record = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {//警告 没有发现此name的record
        warn(record, `Route with name '${name}' does not exist`)
      }
      if (!record) return _createRoute(null, location) //没有，直接创建一个默认的route
      //通过正则来收集动态path参数名 如： /a/:username/:userid   paramNames: [username, userid]
      const paramNames = record.regex.keys
        .filter(key => !key.optional)
        .map(key => key.name)
      //
      if (typeof location.params !== 'object') {// params 不是对象就设置成空对象
        location.params = {}
      }
      //如果location的params里面没有如username, userid，那么看看当前路由上的params有没有，有就加进来。
      if (currentRoute && typeof currentRoute.params === 'object') {
        for (const key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }
      // 把params填充到path，如record.path: /a/:username/:userid; params: {username:vue,userid:router};
      //那么最终的path: /a/vue/router
      location.path = fillParams(record.path, location.params, `named route "${name}"`)
      return _createRoute(record, location, redirectedFrom)
    } else if (location.path) {
      location.params = {} // 这句代码，让在有path的时候无视了params
      // 动态路由这里需要改造 直接的pathMap[location.path]是获取不到 record的
      // 如：pathMap:{ '/man/:id': record } location.path: /man/123
      // 我们可以轮询pathMap里的record ,通过record.regex来匹配 location.path，如果匹配上就获取到了匹配的record
      // 当然这里是会获取最先匹配上的 即使：pathMap: { '/man/:id': record1, '/man/:user': record2 } 
      // location.path: /man/123 只会匹配到 record1
      for (let i = 0; i < pathList.length; i++) {
        const path = pathList[i]
        const record = pathMap[path]
        if (matchRoute(record.regex, location.path, location.params)) {
          return _createRoute(record, location, redirectedFrom)
        }
      }
    }
    // no match
    return _createRoute(null, location, redirectedFrom)
  }
  //重定向方法
  function redirect(
    record,
    location
  ) {
    const originalRedirect = record.redirect//参数会有三种类型
    let redirect = typeof originalRedirect === 'function'//函数
      ? originalRedirect(createRoute(record, location, null, router)) // createRoute(record, location, null, router)--> to
      : originalRedirect

    if (typeof redirect === 'string') {//字符串
      redirect = { path: redirect }
    }

    if (!redirect || typeof redirect !== 'object') {//非三种类型警告
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false, `invalid redirect option: ${JSON.stringify(redirect)}`
        )
      }
      return _createRoute(null, location)
    }

    const re = redirect
    const { name, path } = re//解析 name path
    let { query, hash, params } = location
    // 如果重定向路由没有 query hash params。就把原跳转路由上的相关加入
    // eslint-disable-next-line no-prototype-builtins
    query = re.hasOwnProperty('query') ? re.query : query
    // eslint-disable-next-line no-prototype-builtins
    hash = re.hasOwnProperty('hash') ? re.hash : hash
    // eslint-disable-next-line no-prototype-builtins
    params = re.hasOwnProperty('params') ? re.params : params

    if (name) {
      // resolved named direct
      const targetRecord = nameMap[name]
      if (process.env.NODE_ENV !== 'production') {
        assert(targetRecord, `redirect failed: named route "${name}" not found.`)
      }
      return match({//因为是重定向，所以原跳转路由
        _normalized: true,
        name,
        query,
        hash,
        params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect 解析相对跳转path
      const rawPath = resolveRecordPath(path, record)
      // 2. resolve params 再追加上params
      const resolvedPath = fillParams(rawPath, params, `redirect route with path "${rawPath}"`)
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query,
        hash
      }, undefined, location)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        warn(false, `invalid redirect option: ${JSON.stringify(redirect)}`)
      }
      return _createRoute(null, location)
    }
  }
  //
  function _createRoute(
    record,
    location,
    redirectedFrom
  ) {
    if (record && record.redirect) { // 如果有重定向
      return redirect(record, redirectedFrom || location)
    }
    return createRoute(record, location, redirectedFrom)
  }
  //
  return {
    match
  }
}
…………
function resolveRecordPath(path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}
```


