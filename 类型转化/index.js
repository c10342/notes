// js 类型转化规则

// if() false=>false undefined null ''  0 NaN

// ! 可以值转化为bollean类型

// 运算 字符串拼接
// 1) 数字和非字符串相加
// 1、true->1  false->2
console.log(1 + true); // 2
//2、 null->0
console.log(1 + null); // 1
// 3、undefined -> NaN
console.log(1 + undefined); // NaN
// 4、{} -> {}.toString
console.log(1 + {}); // 1[object Object]

// 2) 非数字相加
console.log(true + true); // 2
console.log(true + {}); // true[object Object]

// 对象中有2个方法 valueOf  toString
let obj = {
  [Symbol.toPrimitive]() {
    return 500;
  },
  valueOf() {
    return {};
  },
  toString() {
    return 200;
  },
};
// 先调用obj.valueOf,如果返回的是一个对象（不能进行相加的），则在调用obj.toString。但是如果存在[Symbol.toPrimitive]这个方法，则直接调用该方法，不在调用valueOf和toString
console.log(true + obj);

// + -
console.log(typeof +"a"); // number
console.log(typeof -"a"); // number
console.log(1 + +"111"); // 112

// 比较运算符 > = <

// 字符与字符,比较第一个字符的ascii
console.log("a" < "b"); // true

// 数字和字符, 如果字符串可以转化为数字，则可以比较，如果不能则返回false
console.log(1 < "123"); // true
console.log(1 < "aa"); // false

// undefined,NaN和任何数字比较都返回false
console.log(undefined < 1); // false
console.log(NaN < 1); // false

// null会转化为0
console.log(null < 1); // true

console.log(undefined == null); // true
// null，undefined和其他类型比较返回的都是false
console.log(undefined == 0);
console.log(null == 0);

// NaN和任何类型比较都不相等，包括她自己
console.log(NaN === NaN); //false
console.log(NaN === 1); //false

// 字符串和数字比较，将字符串转化成数字
console.log(1 == "1"); // true
// 如果是boolean类型，boolean会转化为数字
console.log(1 == true); // true

// 对象和字符串，数字，symbol比较时，会把对象转化为原始数据类型，即调用对象的toString方法
console.log({} == "[object Object]"); // true

// [] == ![]   ![] =>false
// [] == false  false=>0
// []==0  [].valueOf() => []  不是原始类型
// [] == 0 [].toString() => ''
// ''==0   Number('') =>0
// 0==0
