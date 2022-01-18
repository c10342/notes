function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key) {
    const result = Reflect.get(target, key);

    if (!isReadonly) {
      //    依赖收集
      track(target, TrackOpTypes.GET, key);
    }
    if (isShallow) {
      return result;
    }

    if (isObj(result)) {
      // vue2一上来就递归代理，vue3是取值的时候代理，也就是懒代理
      return isReadonly ? readonly(result) : reactive(result);
    }
    return result;
  };
}
function createSetter(isShallow = false) {
  return function set(target, key, value) {
    const oldVal = target[key];
    // 判断是新增操作还是修改操作
    // 数组根据下表判断，下表大于原长度，这是新增
    const hasKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
    const result = Reflect.set(target, key, value);
    if (!hasKey) {
      // 新增
      trigger(target, TriggerType.ADD, key, value);
    } else if(hasChanged(oldVal,value)) {
      // 修改
      trigger(target, TriggerType.SET, key, value, oldVal);
    }
    return result;
  };
}
const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowReactiveset = createSetter(true);

const readonlyObj = {
  set(target, key) {
    console.warn(`不能设置，${key}`);
  },
};

const reactiveHandlers = {
  get,
  set,
};
const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowReactiveset,
};
const readonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  readonlyObj
);
const shallowReadonlyHandlers = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlyObj
);
