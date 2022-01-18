let obj = {
  name: "张三",
};

function fn(name, age) {
  this.say = "说话";
}

// new fn().say();
// 1、bind可以绑定this，也可以绑定参数
// 2、bind返回一个绑定后的函数
// 3、如果被绑定的函数被new，当前函数this就是函数实例
// 4、new出来的实例可以找到原有类的原型
Function.prototype.bind = function (context) {
  let that = this;
  let bindArgs = Array.prototype.slice.call(arguments, 1);
  function MyFn() {} // Object.create 原理

  function fBound() {
    let args = Array.prototype.slice.call(arguments);
    return that.apply(
      this instanceof fBound ? this : context,
      bindArgs.concat(args)
    );
  }

  MyFn.prototype = this.prototype;
  fBound.prototype = new MyFn();
  return fBound;
};

fn.prototype.flag = "123123";

fn.prototype.spaeck = function () {
  console.log(this.say);
};

let binddFn = fn.bind(obj, "猫");

// fn1(19);

let instance = new binddFn();
// console.log(instance.flag);
// console.log(instance.spaeck);
