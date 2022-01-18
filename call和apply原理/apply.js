function fn1() {
  console.log(this, arguments);
}

function fn2() {
  console.log(2);
}

Function.prototype.apply = function (context, args) {
  // xxx.fn 谁调用this就指向谁，所以要把方法挂载到context上，但是context可能会是个字符串，字符串不能直接挂在方法，所以需要将字符串变成对象
  context = context ? Object(context) : window;

  context.fn = this;

  if (!args) {
    return context.fn();
  }
  // 利用数组的toString特征 --> context.fn(arguments[1],arguments[2])
  let fnstr = `context.fn(${args})`;
  let r = eval(fnstr);
  delete context.fn;
  return r;
};

// String {"hello", fn: ƒ} Arguments(2) [1, 2, callee: ƒ, Symbol(Symbol.iterator): ƒ]
fn1.apply("hello", [1, 2]);

// 2
fn1.apply.apply(fn2);
