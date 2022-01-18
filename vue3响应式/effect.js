function effect(fn, options) {
  const effect = createReactiveEffect(fn, (options = {}));

  if (!options.lazy) {
    // 默认先执行一次
    effect();
  }

  return effect;
}

let uid = 0;
let activeEffect;
// 解决嵌套使用effect的问题
const effectStack = [];
function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    try {
      effectStack.push(effect);
      activeEffect = effect;
      // 函数执行，会进行取值，触发依赖收集
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };

  effect.id = uid++;
  effect._isEffect = true;
  effect.raw = fn;
  effect.options = options;
  return effect;
}

const targetMap = new WeakMap();
function track(target, type, key) {
  if (!activeEffect) {
    return;
  }

  let depMap = targetMap.get(target);
  if (!depMap) {
    depMap = new Map();
    targetMap.set(target, depMap);
  }
  let dep = depMap.get(key);
  if (!dep) {
    dep = new Set();
    depMap.set(key, dep);
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }

}

function trigger(target, type, key, newVal, oldVal) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  // Set可去重，将所有需要执行的effect收集到一个新的集合中，最后一起执行
  const effects = new Set()
  function add(effectToAdd) {
    if (effectToAdd) {
      effectToAdd.forEach(effect=>effects.add(effect))
    }
  }

  // 如果修改的是数组的长度
  // eg:arr.length = 1
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      // key > newVal  修改的长度比原来的小
      // arr[2] arr.length=1，key > newVal=>true
      if (key === 'length' || key > newVal) {
        add(dep)
      }
    })
  } else {
    if (key !== undefined) {
      add(depsMap.get(key))
    }
    // 如果修改的是数组中的某一个索引
    switch (type) {
      case TriggerType.ADD:
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get('length'))
        }
    }
  }

  effects.forEach(effect=>effect(newVal,oldVal))

}

// weakMap  key => { name:'zs',age:12}  value (map)=>{name=>set,age=>set}
