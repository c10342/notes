const arrayProtopty = Array.prototype;
// 需要被改写的数组方法
const methodsNeedChange = ['push', 'shift', 'unshift', 'pop', 'splice', 'sort', 'reverse']
// 创建一个原型指向Array.prototype的对象
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
    // 添加依赖
    addSub(sub){
        this.subs.push(sub)
    }
    depend(){
        if(Dep.target){
            this.addSub(Dep.target)
        }
    }
    // 通知更新
    notify(){
        const subs = this.subs.slice()
        for (let i = 0; i < subs.length; i++) {
            subs[i].update()
        }
    }
}

class Watcher{
    constructor(target,expression,callback){
        // 监听的目标对象
        this.target = target
        // getter是一个方法，用来获取expression(m.n.a)表达式中的值，parsePath返回的是一个方法
        this.getter = parsePath(expression)
        // 回调函数
        this.callback = callback
        // 依赖收集开始
        Dep.target = this
        // 先获取一下值，触发被绑定数据的get函数，然后就会被Dep收集进去
        this.value = this.get()
        Dep.target = null
    }
    // 获取值
    get(){
        const obj = this.target
        let value;
        try {
            value = this.getter(obj)
        } catch (error) {
            
        }
        return value
    }
    // 更新
    update(){
        const value = this.get()
        if(this.value!==value){
            const oldValue = this.value
            this.value = value
            this.callback.call(this.target,value,oldValue)
        }
    }
}

/**
 * @param {*} expression 
 * 获取表达式中的值
 */
function parsePath(expression){
    const arr = expression.split('.')
    return (obj)=>{
        for (let i = 0; i < arr.length; i++) {
            obj = obj[arr[i]]
        }
        return obj
    }
}

/**
 * @param {*} data 绑定的数据
 * @param {*} key 属性名
 * @param {*} value 属性值
 * 创建响应式数据
 */
function defineReactive(data, key, value) {
    // 递归检测对象属性
    let childOb = observe(value)
    // 依赖收集器
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

/**
 * @param {*} data 绑定的对象
 * @param {*} key 属性名
 * @param {*} value 属性值
 * @param {*} enumerable 是否可被枚举，就是遍历
 */
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
        // 每个被劫持的数据都有一个__ob__属性,并且不可被遍历
        def(data, '__ob__', this, false)
        // 依赖收集器
        this.dep = new Dep()
        if (Array.isArray(data)) {
            // 如果是数组，就像对象的原型指向被改写的arrayMethods
            Object.setPrototypeOf(data, arrayMethods)
            // 监听数组里面的每一项有可能也是对象或者数组，所以也需要监听
            this.observeArray(data)
        } else {
            // 遍历数据并进行劫持
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

/**
 * @param {*} obj 
 * 判断是否为对象，{}和[]都行
 */
function isObj(obj) {
    // return Object.prototype.toString.call(obj) === '[object Object]'
    return typeof obj === 'object'
}

/**
 * @param {*} data 需要进行劫持的数据
 * 进行数据劫持
 */
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

const obj = {
    a: 1,
    b: {
        m: {
            n: 555
        }
    },
    c: [1, 2, 3]
}
observe(obj)

// new Watcher(obj,'b.m.n',function(newValue,oldValue){
//     console.log('b.m.n',newValue,oldValue);
    
// })
new Watcher(obj,'c',function(newValue,oldValue){
    console.log('c',newValue,oldValue);
    
})
// new Watcher(obj,'a',function(newValue,oldValue){
//     console.log('a',newValue,oldValue);
    
// })

// obj.b.m.n=obj.b.m.n+obj.b.m.n
// obj.b.m.n=obj.b.m.n+obj.b.m.n
// obj.b.m.n=obj.b.m.n+obj.b.m.n
// obj.c.push(666)
// obj.c=[]
// obj.a=234



