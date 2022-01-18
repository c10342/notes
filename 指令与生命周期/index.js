
// 表达式文本 {{a}}
const textReg = /\{\{(.+)\}\}/
class Compile {
    constructor(el, vue) {
        this.$vue = vue
        this.$el = document.querySelector(el)
        if (this.$el) {
            // 将页面上的DOM存放至Fragment中，方便操作
            const $fragment = this.node2Fragment()
            // 编译
            this.compile($fragment)
            this.$el.appendChild($fragment)
        }

    }
    node2Fragment() {
        const el = this.$el
        const fragment = document.createDocumentFragment()
        let child;
        while (child = el.firstChild) {
            // appendChild的时候会将页面上的元素移除，相当于移动了元素
            fragment.appendChild(child)
        }
        return fragment

    }
    compile(fragment) {
        const childNodes = fragment.childNodes
        childNodes.forEach(node => {
            // 有子节点的情况下进行递归
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
            // 获取文本内容
            const textContent = node.textContent
            if (node.nodeType === 1) {
                // 元素节点
                this.compileElement(node)
            } else if (node.nodeType === 3 && textReg.test(textContent)) {
                // 文本节点
                const name = textContent.match(textReg)[1]
                this.compileText(node, name)
            }
        })
    }
    compileElement(node) {
        // 获取标签上面的所有属性
        const attrsArr = node.attributes
        // 伪元素是不能使用forEach的
        Array.prototype.slice.call(attrsArr).forEach(attr => {
            // 属性名
            const attrName = attr.name;
            // 属性值
            const attrValue = attr.value
            if (attrName.startsWith('v-')) {
                if (attrName === 'v-model') {
                    // 获取绑定的值
                    node.value = this.getVueVal(attrValue)
                    node.addEventListener('input', (e) => {
                        const inputValue = e.target.value
                        this.setVueVal(attrValue, inputValue)
                    })
                    // 用到响应数据的地方需要Watcher一下
                    new Watcher(this.$vue, attrValue, (newValue) => {
                        node.value = newValue
                    })
                }
            }

        })
    }
    compileText(node, expression) {
        const value = this.getVueVal(expression)
        const originTextContent = node.textContent
        node.textContent = originTextContent.replace(textReg, value)
        new Watcher(this.$vue, expression, (newValue) => {
            node.textContent = originTextContent.replace(textReg, newValue)
        })
    }
    // 获取表达式的值
    getVueVal(expression) {
        const arr = expression.split('.')
        let result = this.$vue._data
        arr.forEach(key => {
            result = result[key]
        })
        return result
    }
    // 设置表达式的值
    setVueVal(expression, value) {
        const arr = expression.split('.')
        let result = this.$vue._data
        arr.forEach((key, index) => {
            if (arr.length - 1 === index) {
                result[key] = value
            } else {
                result = result[key]
            }

        })
    }
}
class Vue {
    constructor(options) {
        this.$options = options
        this._data = options.data || {}
        // 劫持数据，初始化响应数据
        observe(this._data)
        // 代理数据到this上面
        this._initData()
        // 初始化watch选项
        this._initWatch()
        // 编译元素
        new Compile(this.$options.el, this)
    }
    _initData() {
        Object.keys(this._data).forEach(key => {
            Object.defineProperty(this, key, {
                get() {
                    return this._data[key]
                },
                set(value) {
                    this._data[key] = value
                }
            })
        })
    }
    _initWatch() {
        const watch = this.$options.watch || {}
        Object.keys(watch).forEach(key => {
            new Watcher(this, key, watch[key])
        })
    }

}