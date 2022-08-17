const fs = require('fs');
const path = require("path");
// const {resolve} = require('path');

// const readline = require('readline')
// const {coverageLog} = require('./table')
// const {getFirstLine} = require('./utils')
const util = require('util');
// const fs = require('fs');
// const path = require('path');

// var targetPath = './packages/wui-datepicker/src/locale'; // 目录
const sourcePath = './packages/wui-calendar/demo/demo-dev';
const targetPath = './packages/wui-image/demo/demo-bip';
//  遍历目录得到文件信息
function walk(path, callback) {
    var files = fs.readdirSync(path);

    files.forEach(function(file) {
        if (fs.statSync(path + '/' + file).isFile()) {
            callback(path, file);
        } else {
            walk(path + '/' + file, callback)
        }
    });
}

// 修改文件名称
function rename(oldPath, newPath) {
    fs.rename(oldPath, newPath, function(err) {
        if (err) {
            throw err;
        }
    });
}
/**
 * 删除文件或者文件夹
 * @param {String} 文件夹的路径
 */
function delDir(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath); // 递归删除文件夹
            } else {
                fs.unlinkSync(curPath); // 删除文件
            }
        });
        fs.rmdirSync(path);
    }
}
/**
 * 过滤文件或者文件夹
 * @param {String} 需要过滤文件夹的路径
 * @param {String} 过滤后文件夹存放的路径
 * @param {reg[]} 过滤的规则
 */
function filterFile(srcPath, tarPath, regExcludes = []) {

    if (!fs.existsSync(tarPath)) {
        // delDir(tarPath)
        fs.mkdirSync(tarPath)
    }
    const deps = (srcPath, tarPath, regExcludes = []) => {
        let files = fs.readdirSync(srcPath);
        files.forEach(function(filename) {
            let filedir = path.join(srcPath, filename);
            let filterFlag = regExcludes.some(item => filedir.match(item))
            if (!filterFlag) {
                let stats = fs.statSync(filedir)
                let isFile = stats.isFile()
                if (isFile) {// 复制文件
                    const destPath = path.join(tarPath, filename);
                    fs.copyFileSync(filedir, destPath)


                    // fs.unlinkSync(filedir);
                    // const jsFile = path.join(tarPath, filename.split('.tsx')[0] + '.js')
                    // let stats1 = fs.statSync(jsFile);

                    // if (stats1.isFile()) {
                    //     fs.unlinkSync(jsFile);
                    // }

                } else {// 创建文件夹
                    let tarFiledir = path.join(tarPath, filename);
                    fs.mkdirSync(tarFiledir);
                    deps(filedir, tarFiledir, regExcludes)// 递归
                }
            }
        })

    }

    deps(srcPath, tarPath, regExcludes);
}

// filterFile(sourcePath, targetPath, [/\\*\.js/])
// walk(targetPath, function(path, fileName) {
//     // fileName.split('.')[0]  fileName.split('.')[1]
//     var oldPath = path + '/' + fileName, // 源文件路径
//         newPath = path + '/' + (fileName.split('.j')[1] ? fileName.split('.j')[0] + '.tsx' : fileName);
//     console.log(newPath)
//     rename(oldPath, newPath);
// });
// 运行 rename

const dirContentQuery = async(filePath, excludedFolders) => {
    const readdirFn = util.promisify(fs.readdir);
    let files;
    try {
        files = await readdirFn(filePath, 'utf8')
    } catch (error) {
        return console.log(error);
    }
    await files.forEach(async(filename) => {
        // 获取当前文件的绝对路径
        const filedir = path.join(filePath, filename);
        try {
            const statFn = util.promisify(fs.stat);

            const stats = await statFn(filedir);
            const isFile = stats.isFile();// 是文件
            const isDir = stats.isDirectory();// 是文件夹

            if (!excludedFolders.includes(filename)) {

                if (isDir) {
                    dirContentQuery(filedir, excludedFolders);// 递归，如果是文件夹，就继续遍历该文件夹下面的文件
                } else if (isFile && path.extname(filedir) === '.scss') {
                    // console.log(1111, filename);
                    let oldPath = filePath + '/' + filename; // 源文件路径
                    let newPath = filePath + '/' + filename.replace(/^(\w+).scss$/ig, '$1.module.scss');
                    // console.log(newPath)
                    rename(oldPath, newPath);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }
    );
}
const {resolve} = path;
const allFilePath = resolve(__dirname, './');
// const rooConfigDirs = require('../root-config')
// const gFilePath = rooConfigDirs.length === 1 ? rooConfigDirs[0] : allFilePath;
// const gExtension = '.test.js';
const excludedFolders1 = ['node_modules', 'test', 'src1', 'demo', 'docs', 'wui-core']
dirContentQuery(allFilePath, excludedFolders1)
