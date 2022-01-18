function reactive(target) {
  return createProxyObj(target,false,reactiveHandlers);
}

function shallowReactive(target) {
  return createProxyObj(target,false,shallowReactiveHandlers);
}

function readonly(target) {
  return createProxyObj(target,true,readonlyHandlers);
}

function shallowReadonly(target) {
  return createProxyObj(target,true,shallowReadonlyHandlers);
}

const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()

function createProxyObj(target, isReadonly = false,baseHandlers) {
    if (!isObj(target)) {
        return target
    }
    const proxyMap = isReadonly ? readonlyMap : readonlyMap
    const isExitProxy = proxyMap.get(target)
    if (isExitProxy) {
        return isExitProxy
    }

    const proxy = new Proxy(target, baseHandlers)
    
    proxyMap.set(target,proxy)

    return proxy
}


