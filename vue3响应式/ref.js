function ref(value) {
    return createRef(value)
 }

function shallowRef(value) {
    return createRef(value,true)
}

const convert= val=>isObj(val)?reactive(val):val

class RefImpl{
    constructor(value, isShallow) {
        this._value = isShallow ? value : convert(value)
        this._rawValue = value
        this._isShallow = isShallow
    }

    get value() {
        track(this, TrackOpTypes.GET, 'value')
        return this._value
    }

    set value(newVal) {
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal
            this._value = this._isShallow ? newVal : convert(newVal)
            trigger(this,TriggerType.SET,'value',newVal)
        }
    }
}

function createRef(value, isShallow = false) {
    return new RefImpl(value,isShallow)
}

class ObjectRefImpl{
    constructor(target, key) {
        this.target = target
        this.key = key
    }

    get value() {
        return this.target[this.key]
    }

    set value(newVal) {
        this.target[this.key] = newVal
    }
}

function toRef(target, key) {
    return new ObjectRefImpl(target,key)
}

function toRefs(object) {
    const ret = isArray(object) ? new Array(object.length) : {}
    for (const key in object) {
        ret[key] = toRef(object,key)
    }
    return ret
}