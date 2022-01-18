function Animal(type) {
  this.type = type;
}

Animal.prototype.say = function () {
  console.log(this.type);
};

function mockNew() {
  // arguments并不是真正数组
  let Constructor = [].shift.call(arguments);

  let obj = {};

  obj.__proto__ = Constructor.prototype; // 原型上的方法

  // 构造器可能直接return一个对象
  let r = Constructor.apply(obj, arguments);

  return r instanceof Object ? r : obj;
}

let an = mockNew(Animal, "哺乳类");

an.say();
