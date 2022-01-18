/**
 * 1、Promise函数里面有异步操作，then里面判断的状态为pending肯定是有异步操作
 * 2、把then里面函数存到数组（onResolvedCallbacks、onRejectedCallbacks）异步结束在调用（发布订阅）
 * 3、在resolve、reject分别获取数组（onResolvedCallbacks、onRejectedCallbacks）中的函数循环调用
 *
 * 1、每次调用then方法都返回一个新的promise
 * 2、执行then方法中的成功和失败的返回值，都走下一个then方法的成功
 * 3、执行then方法中只要报错就走下一个then的reject
 * 4、执行then方法中可能返回一个普通纸或者promise，要判断x类型是不是promise
 *
 * 1、判断resolve返回值是不是promise，递归调用
 * 2、防止同时调用reject和resolve
 * 3、给then添加默认值
 */

// 等待
const PENDING = "PENDING";
// 成功
const RESOLVE = "RESOLVE";
// 失败
const REJECT = "REJECT";

function resolvePromise(promise, x, resolve, reject) {
  // 不能引用同一个对象，有可能造成死循环
  if (promise === x) {
    return reject(new TypeError("不能引用同一个对象"));
  }
  let called;
  // 判断x类型，如果x是对象或者函数，说明是一个promise
  if ((typeof x === "object" && x != null) || typeof x === "function") {
    try {
      const then = x.then;
      if (typeof then === "function") {
        //肯定是promise
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            // 判断resolve(xx) xx是不是promise，是则递归调用
            resolvePromise(promise, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 不是promise对象，就是普通值
    resolve(x);
  }
}
class Promise {
  constructor(executor) {
    this.status = PENDING;
    // 成功的值
    this.value = undefined;
    // 失败的值
    this.reason = undefined;
    // 存放成功的回调函数
    this.onResolvedCallbacks = [];
    // 存放失败的回调函数
    this.onRejectedCallbacks = [];
    const resolve = (value) => {
      if (this.status === PENDING) {
        this.value = value;
        this.status = RESOLVE;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECT;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    try {
      // 默认立即执行executor函数
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  catch(errorCallback) {
    this.then(null, errorCallback);
  }

  then(onfulfilled, onrejected) {
    onfulfilled = typeof onfulfilled === "function" ? onfulfilled : (v) => v;
    onrejected =
      typeof onrejected === "function"
        ? onrejected
        : (err) => {
            throw err;
          };
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === RESOLVE) {
        setTimeout(() => {
          try {
            let x = onfulfilled(this.value);
            // 判断返回值是不是promise
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this.status === REJECT) {
        setTimeout(() => {
          try {
            let x = onrejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onfulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onrejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });

    return promise2;
  }
}

Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
module.exports = Promise;

// const p = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve(1)
//     }, 1000);
// })

// p.then(val1 => {
//     console.log('val1', val1)
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve(2)
//         }, 1000);
//     })
// }).then(val2 => {
//     console.log('val2', val2)
//     return 3
// }).then(val3 => {
//     console.log('val3', val3)
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve(4)
//         }, 1000);
//     })
// }).then(val4 => {
//     console.log('val4', val4)
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve(5)
//         }, 1000);
//     })
// }).then(val5 => {
//     console.log('val5', val5)
// }).catch(e=>{
//     console.log('e========',e);

// })
