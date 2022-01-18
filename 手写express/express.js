const http = require('http')
const url = require('url')

function createApplication() {
    let app = (req, res) => {
        const m = req.method.toLocaleLowerCase()
        let { pathname } = url.parse(req.url, true)
        let index = 0
        // next函数
        function next(err) {
            if (index === app.routes.length) {
                // 找不到对应的路由
                return res.end(`Cannot ${m} ${pathname}`)
            }
            const { method, path, handler } = app.routes[index++]
            if (err) {
                // next函数有参数的时候，直接调用错误中间件
                // handler.length  函数的参数长度
                if (handler.length === 4) {
                    handler(err, req, res, next)
                } else {
                    next(err)
                }
            } else {
                if (method === 'middle') {
                    // 处理中间件
                    if (path === '/' || path === pathname || pathname.startsWith(path + '/')) {
                        if (handler.length !== 4) {
                            // 一定要是非错误中间件，不然少一个参数，会报错
                            handler(req, res, next)
                        } else {
                            next()
                        }
                    } else {
                        next()
                    }
                } else {
                    // 处理路由
                    if ((method === m || method === 'all') && (path === pathname || path === '*')) {
                        handler(req, res)
                    } else {
                        next()
                    }
                }
            }
        }
        next()
    }
    // 存储路由
    app.routes = []
    app.use = function (path, handler) {
        if (typeof handler !== 'function') {
            handler = path
            path = '/'
        }
        const layer = {
            method: 'middle', //中间件
            path,
            handler
        }
        app.routes.push(layer)
    }
    // 内置一个中间件，用来解析扩展额外的功能
    app.use(function(req,res,next){
        const {pathname,query} = url.parse(req.url,true)
        const hostname = req.headers.host.split(":")
        req.pathname = pathname
        req.query = query
        req.hostname = hostname[0]
        next()
    })
    app.all = function (path, handler) {
        const layer = {
            method: 'all',
            path,
            handler
        }
        app.routes.push(layer)
    }
    http.METHODS.forEach(method => {
        method = method.toLocaleLowerCase()
        app[method] = function (path, handler) {
            const layer = {
                method,
                path,
                handler
            }
            app.routes.push(layer)
        }
    })

    app.listen = function (...reset) {
        const server = http.createServer(app)
        server.listen(...reset)
    }
    return app
}


module.exports = createApplication
