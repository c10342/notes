const http = require('http')

const path = require('path')

const multiparty = require('multiparty')

const fse = require('fs-extra')

const server = http.createServer()

const UPLOAD_DIR = path.resolve(__dirname, './files')

// 解析post请求体
const resolvePost = req => {
    return new Promise((resolve, reject) => {
        let chunk = ''
        req.on('data', data => {
            chunk += data
        })
        req.on('end', () => {
            resolve(JSON.parse(chunk))
        })
    })
}

const pipeStream = (pathStr, writeStream) => {
    return new Promise((resolve) => {
        const readStream = fse.createReadStream(pathStr)
        readStream.on('end', () => {
            // 删除文件
            fse.unlinkSync(pathStr)
            resolve()
        })
        readStream.pipe(writeStream)
    })
}

// 合并切片
const mergeFileChunk = async (filePath, filename, size) => {
    const chunkDir = path.resolve(UPLOAD_DIR, 'chunk-'+filename)

    const chunkPaths = await fse.readdir(chunkDir)
    // 根据切片下标进行排序
    chunkPaths.sort((a, b) => {
        const aa = a.split('-')
        const bb = b.split('-')
        return aa[aa.length - 1] - bb[bb.length - 1]
    })
    await Promise.all(chunkPaths.map((chunkpath, index) => {
        return pipeStream(
            path.resolve(chunkDir, chunkpath),
            // 指定位置创建可写流
            fse.createWriteStream(filePath, {
                start: index * size,
                end: (index + 1) * size
            })
        )
    }))
    // 删除文件夹
    fse.rmdirSync(chunkDir)
}

server.on('request', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === 'OPTIONS') {
        res.status = 200
        res.end();
        return
    }
    if (req.url === '/uploadFile') {
        const multipart = new multiparty.Form({ uploadDir: path.join(__dirname, './chunks') })

        multipart.parse(req, async (err, fields, files) => {
            if (err) {
                console.log('err');
                return
            }
            // 获取上传的文件
            const chunk = files.chunk[0]
            // 获取前端传过来的hash
            const hash = fields.hash[0]
            // 获取前端传过来的文件名
            const filename = fields.filename[0]
            const chunkDir = path.resolve(UPLOAD_DIR, 'chunk-'+filename)

            if (!fse.existsSync(chunkDir)) {
                await fse.mkdirSync(chunkDir)
            }

            // 修改文件名
            await fse.move(chunk.path, `${chunkDir}/${hash}`)
            res.end('received file chunk')
        })
    }

    if (req.url === '/merge') {
        const data = await resolvePost(req)
        const { filename, size } = data
        const filePath = path.resolve(UPLOAD_DIR, filename)
        await mergeFileChunk(filePath, filename, size)
        res.end(JSON.stringify({
            code: 200,
            message: 'file merage success'
        }))
    }
})


server.listen(3000, function () {
    console.log('正在监听3000端口');
})