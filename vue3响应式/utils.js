function isObj(data) {
    return typeof data === 'object' && data!==null
}

function extend(...args) {
    return Object.assign(...args);
}
  
function isArray(data) {
    return Array.isArray(data)
}

function isFunction(data) {
    return typeof data ==='function'
}

function isNumber(data) {
    return typeof data ==='number'
}

function isString(data) {
    return typeof data ==='string'
}

function isIntegerKey(data) {
    return parseInt(data)+''===data
}

function hasOwn(target, key) {
    return Object.prototype.hasOwnProperty.call(target,key)
}

function hasChanged(oldVal, newVal) {
    return oldVal!==newVal
}