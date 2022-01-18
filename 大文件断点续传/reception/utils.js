// 切片大小
const SIZE = 10 * 1024 * 1024;


/**
 * 生成切片
 * @param uploadFile  需要切片的文件
 * @param size  每个切片的大小
 * @returns {[]}
 */
function createFileChunk(uploadFile, size = SIZE) {
    const fileChunkList = [];
    let cur = 0;
    while (cur < uploadFile.size) {
        fileChunkList.push({file: uploadFile.slice(cur, cur + size)});
        cur += size
    }
    return fileChunkList;
}


/**
 * 上传切片
 * @param fileChunkListData  请过处理的切片列表
 * {
        // 切片
        chunk: file,
        hash: hash + '-' + index,
        index,
        fileHash:hash,
        percentage:0
    }
 * @param filename       文件名
 * @param uploadedList   已经上传过的切片列表  [string]
 * @param dom             需要显示进度的dom容器
 * @param uploadFile      文件对象
 * @param requestList      需要上传的切片的xhr列表
 * @param fileHash      文件hash值
 * @returns {Promise<void>}
 */
async function uploadChunks(fileChunkListData, filename, uploadedList = [], dom, uploadFile,requestList,uploadFileHash) {
    let htmlStr = '';
    // 生成html，显示上传进度
    fileChunkListData.forEach(({hash, index, percentage}) => {
        const width = percentage === 100 ? '400px' : 0;
        const num = percentage === 100 ? '100%' : 0;
        htmlStr += `
            <div style="margin-top: 20px;">
                <div>${hash}(<span id="percent-${index}">${num}</span>)</div>
                <div class="progress">
                    <div style="width:${width}" class="inner-progress" id="progress-${index}"></div>
                </div>
            </div>
            `
    });
    dom.innerHTML = htmlStr;
    // 过滤掉已经上传过得切片，并给每一个切片生成一个formData对象
    const requestListData = fileChunkListData
        .filter(({hash}) => !uploadedList.includes(hash))
        .map(({chunk, hash, index, fileHash}) => {
            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('hash', hash);
            formData.append('filename', filename);
            formData.append('fileHash', fileHash);
            return {formData, index}
        }).map(({formData, index}) => {
            return request({
                url: 'http://localhost:3000/uploadFile',
                data: formData,
                onProgress: createProgressHandler(fileChunkListData[index]),
                requestList
            })
        });

    // 等待所有碎片上传完毕
    await Promise.all(requestListData);

    // 之前上传的切片数量+本次上传的数量 = 所有切片数量
    if (uploadedList.length + requestListData.length === fileChunkListData.length) {
        await mergeRequest(uploadFile.name,uploadFileHash)
    }
}

/**
 * 上传进度显示
 * @param item 一个切片对象
 * {
        // 切片
        chunk: file,
        hash: hash + '-' + index,
        index,
        fileHash:hash,
        percentage:0
    }
 * @returns {function(...[*]=)}
 */
function createProgressHandler(chunk) {
    return e => {
        const progress = document.getElementById(`progress-${chunk.index}`);
        const percent = document.getElementById(`percent-${chunk.index}`);
        const percentage = e.loaded / e.total;
        percent.innerHTML = parseInt(percentage * 100) + '%';
        progress.style.width = (400 * percentage) + 'px';
        if (parseInt(percentage * 100) === 100) {
            chunk.percentage = 100
        }
    };
}

/**
 * 请求后台合并切片
 * @param filename   文件名
 * @param size       每个切片的大小
 * @param fileHash   文件hash值
 * @returns {Promise<void>}
 */
async function mergeRequest(filename, fileHash) {
    await request({
        url: 'http://localhost:3000/merge',
        headers: {
            'content-type': 'application/json'
        },
        data: JSON.stringify({
            filename,
            size:SIZE,
            fileHash
        })
    })
}


/**
 * 计算文件hash值
 * @param fileChunkList  切片列表   {file: uploadFile.slice(cur, cur + size)}
 * @param dom1           需要显示百分比的容器
 * @param dom2           需要显示计算进度的容器
 * @returns {Promise<unknown>}
 */
function caculateHash(fileChunkList, dom1,dom2) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('/webwork.js?time=' + Date.now());
        worker.postMessage({fileChunkList});
        worker.onmessage = e => {
            const {percentage, hash} = e.data;
            dom1.innerHTML = `${parseInt(percentage)}%`;
            dom2.style.width = (percentage / 100 * 400) + 'px';
            if (hash) {
                // 关闭webwork
                worker.terminate();
                resolve(hash)
            }
        }
    })
}

/**
 * 检查是否已经上传过文件了
 * @param filename  文件名
 * @param fileHash  文件hash值
 * @returns {Promise<any>}
 */
async function verifyUpload(filename, fileHash) {
    const data = await request({
        url: 'http://localhost:3000/verify',
        headers: {
            'content-type': 'application/json'
        },
        data: JSON.stringify({
            filename,
            fileHash
        })
    });
    return JSON.parse(data)
}

/**
 *
 * @param url    请求路径
 * @param method  请求方法
 * @param data    请求数据
 * @param headers  请求头
 * @param onProgress  上传进度方法
 * @param requestList  切片的上传请求列表  [xhr]
 * @returns {Promise<unknown>}
 */
function request({
                     url,
                     method = 'post',
                     data,
                     headers = {},
                     onProgress = e => e,
                     requestList
                 }) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = onProgress;
        xhr.open(method, url);
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key])
        });
        xhr.send(data);
        xhr.onload = function (e) {
            // 将请求成功的xhr从列表中删除
            if (requestList) {
                const xhrIndex = requestList.findIndex(item => item === xhr);
                requestList.splice(xhrIndex, 1)
            }
            resolve(e.target.response)
        };
        requestList?.push(xhr);
        xhr.onerror = function (e) {
            reject(e)
        }
    })
}
