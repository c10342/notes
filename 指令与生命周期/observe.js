const arrayProtopty = Array.prototype;
const methodsNeedChange = ['push', 'shift', 'unshift', 'pop', 'splice', 'sort', 'reverse']

const arrayMethods = Object.create(arrayProtopty)

methodsNeedChange.forEach(methodName => {
    // 备份原来方法
    const originMethod = arrayProtopty[methodName]
    def(arrayMethods, methodName, function () {
        const args = [...arguments]
        // push unshift splice 这三个方法可能会插入新的数组或者对象，所以也需要监听
        let inserted = []
        switch (methodName) {
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice':
                // splice第三个参数才是插入的
                inserted = args.slice(2)
                break
        }
        const ob = this.__ob__
        if (inserted.length > 0) {
            ob.observeArray(inserted)
        }
        ob.dep.notify()
        const result = originMethod.apply(this, args)
        return result
    }, false)
})

// 依赖收集
class Dep{
    constructor(){
        this.subs = []
    }
    addSub(sub){
        this.subs.push(sub)
    }
    depend(){
        if(Dep.target){
            this.addSub(Dep.target)
        }
    }
    notify(){
        const subs = this.subs.slice()
        for (let i = 0; i < subs.length; i++) {
            subs[i].update()
        }
    }
}

class Watcher{
    constructor(target,expression,callback){
        this.target = target
        this.getter = parsePath(expression)
        this.callback = callback
        // 依赖收集开始
        Dep.target = this
        this.value = this.get()
    }

    get(){
        const obj = this.target
        let value;
        try {
            value = this.getter(obj)
        } catch (error) {
            
        }finally{
            Dep.target = null
        }
        return value
    }
    update(){
        const value = this.get()
        if(this.value!==value){
            const oldValue = this.value
            this.value = value
            this.callback.call(this.target,value,oldValue)
        }
    }
}

function parsePath(expression){
    const arr = expression.split('.')
    return (obj)=>{
        for (let i = 0; i < arr.length; i++) {
            obj = obj[arr[i]]
        }
        return obj
    }
}

function defineReactive(data, key, value) {
    // 递归检测对象属性
    let childOb = observe(value)

    const dep = new Dep()
    

    Object.defineProperty(data, key, {
        get() {
            // 依赖收集
            if(Dep.target){
                dep.depend()
                if(childOb){
                    childOb.dep.depend()
                }
            }
            return value
        },
        set(val) {
            value = val
            // 如果设置了一个对象，也需要监听
            childOb = observe(val)
            // 发布订阅模式
            dep.notify()
        }
    })
}

function def(data, key, value, enumerable) {
    Object.defineProperty(data, key, {
        get() {
            return value
        },
        set(val) {
            value = val
        },
        enumerable
    })
}

class Observer {
    constructor(data) {
        def(data, '__ob__', this, false)
        this.dep = new Dep()
        if (Array.isArray(data)) {
            // 如果是数组，就像对象的原型指向被改写的arrayMethods
            Object.setPrototypeOf(data, arrayMethods)
            // 监听数组里面的每一项有可能也是对象或者数组，所以也需要监听
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }
    walk(data) {
        for (const key in data) {
            defineReactive(data, key, data[key])
        }
    }
    observeArray(arr) {
        for (let i = 0; i < arr.length; i++) {
            observe(arr[i])
        }
    }
}

function isObj(obj) {
    // return Object.prototype.toString.call(obj) === '[object Object]'
    return typeof obj === 'object'
}

function observe(data) {
    if (!isObj(data)) {
        return
    }
    let ob;
    if (data.__ob__) {
        ob = data.__ob__
    } else {
        ob = new Observer(data)
    }
    return ob
}





