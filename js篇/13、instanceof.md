```javascript
// 判断 f 是否是 Foo 类的实例 , 并且是否是其⽗类型的实例
function Aoo(){}
function Foo(){}
//JavaScript 原型继承
Foo.prototype = new Aoo();
var foo = new Foo();
console.log(foo instanceof Foo) // true
console.log(foo instanceof Aoo) // true
```
f instanceof Foo 的判断逻辑是：
- f 的 __proto__ ⼀层⼀层往上，是否对应到 Foo.prototype
- 再往上，看是否对应着 Aoo.prototype
- 再试着判断 f instanceof Object


## instanceof 的内部实现原理
通过判断对象的原型链上面是否能找到对象的`prototype`
```javascript
function instance_of(l,r){
    let protortpe = r.prototype
    l = l.__proto__

    while(true){
        if(l===null){
            return false
        }
        if(prototype===l){
            return true
        }
        l = l.__proto__
    }
}
```

按照 `instanceof` 的逻辑，真正决定类型的是 `prototype` ，⽽不是构造函数。